import { z } from "zod";

/** Request hardening for /api/chat: body shape and size, origin allowlist, per-IP rate limits. */

const MAX_MESSAGES = 20;
const MAX_PART_CHARS = 2000;
const MAX_TOTAL_CHARS = 8000;

const PartSchema = z.looseObject({ type: z.string() });

export const BodySchema = z
  .object({
    messages: z
      .array(
        z.looseObject({
          id: z.string().min(1).max(128),
          role: z.enum(["user", "assistant", "system"]),
          parts: z.array(PartSchema).max(40),
        }),
      )
      .min(1)
      .max(MAX_MESSAGES),
    theme: z.enum(["light", "dark"]).optional(),
  })
  .superRefine((body, ctx) => {
    let total = 0;
    for (const m of body.messages) {
      for (const p of m.parts) {
        if (p.type === "text") {
          const text = typeof p.text === "string" ? p.text : "";
          if (text.length > MAX_PART_CHARS) ctx.addIssue({ code: "custom", message: `A message exceeds ${MAX_PART_CHARS} characters` });
          total += text.length;
        }
      }
    }
    if (total > MAX_TOTAL_CHARS) ctx.addIssue({ code: "custom", message: `Conversation exceeds ${MAX_TOTAL_CHARS} characters` });
    // The last message is normally the visitor's. The one exception is a tool round trip: after a page
    // tool runs in the browser, the SDK resends with the assistant message (now holding tool outputs) last.
    const last = body.messages[body.messages.length - 1];
    const continuesTools = last?.role === "assistant" && last.parts.some((p) => p.type.startsWith("tool-") && "output" in p);
    if (last?.role !== "user" && !continuesTools) ctx.addIssue({ code: "custom", message: "Last message must be from the user" });
  });

export type ChatBody = z.infer<typeof BodySchema>;

function allowedHosts(): Set<string> {
  const hosts = new Set<string>(["localhost:3000", "localhost:3100", "127.0.0.1:3000"]);
  for (const raw of [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL]) {
    if (!raw) continue;
    try {
      hosts.add(new URL(raw.startsWith("http") ? raw : `https://${raw}`).host);
    } catch {
      /* ignore malformed env */
    }
  }
  return hosts;
}

/** Browsers always send Origin on cross-site and same-site POSTs; a missing header means a non-browser client. */
export function checkOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return allowedHosts().has(new URL(origin).host);
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

type Verdict = { ok: true } | { ok: false; retryAfterSec: number };

const PER_MINUTE = 10;
const PER_DAY = 60;

/** Best-effort in-memory sliding windows. Per serverless instance; good enough to blunt bursts. */
const minuteHits = new Map<string, number[]>();
const dayHits = new Map<string, number[]>();

function slide(map: Map<string, number[]>, key: string, windowMs: number, limit: number, now: number): Verdict {
  const arr = (map.get(key) ?? []).filter((t) => now - t < windowMs);
  const oldest = arr[0];
  if (oldest !== undefined && arr.length >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    map.set(key, arr);
    return { ok: false, retryAfterSec };
  }
  arr.push(now);
  map.set(key, arr);
  if (map.size > 5000) map.delete(map.keys().next().value as string);
  return { ok: true };
}

async function upstashLimit(ip: string): Promise<Verdict | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const [{ Ratelimit }, { Redis }] = await Promise.all([import("@upstash/ratelimit"), import("@upstash/redis")]);
  const redis = new Redis({ url, token });
  const minute = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(PER_MINUTE, "1 m"), prefix: "chat:m" });
  const day = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(PER_DAY, "1 d"), prefix: "chat:d" });
  const [m, d] = await Promise.all([minute.limit(ip), day.limit(ip)]);
  if (m.success && d.success) return { ok: true };
  const reset = Math.min(...[m.success ? Infinity : m.reset, d.success ? Infinity : d.reset]);
  return { ok: false, retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}

export async function rateLimit(ip: string): Promise<Verdict> {
  try {
    const durable = await upstashLimit(ip);
    if (durable) return durable;
  } catch (err) {
    console.warn("[chat] upstash rate limit unavailable, falling back to memory:", (err as Error).message);
  }
  const now = Date.now();
  const m = slide(minuteHits, ip, 60_000, PER_MINUTE, now);
  if (!m.ok) return m;
  return slide(dayHits, ip, 86_400_000, PER_DAY, now);
}
