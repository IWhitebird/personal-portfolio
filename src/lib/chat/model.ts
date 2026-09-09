import { createGroq } from "@ai-sdk/groq";
import { APICallError, wrapLanguageModel, type LanguageModel } from "ai";

export const PRIMARY_MODEL = "openai/gpt-oss-120b";
/** Set CHAT_FALLBACK_MODEL="" to disable the in-Groq fallback. */
const FALLBACK_MODEL = process.env.CHAT_FALLBACK_MODEL ?? "openai/gpt-oss-20b";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export type ModelUsage = { id: string; fellBack: boolean };

export function isQuotaError(err: unknown): boolean {
  if (!APICallError.isInstance(err)) return false;
  const status = err.statusCode ?? 0;
  return status === 429 || status >= 500;
}

/** Seconds suggested by the provider's Retry-After header, if any. */
export function retryAfterSeconds(err: unknown): number | undefined {
  if (!APICallError.isInstance(err)) return undefined;
  const raw = err.responseHeaders?.["retry-after"];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.ceil(n) : undefined;
}

/**
 * Groq only. The primary model streams normally; if Groq rejects the request
 * before the first chunk with a quota or server error, retry once on a smaller
 * model that has its own free-tier bucket. Mid-stream failures are not retried.
 */
export function chatModel(usage: ModelUsage): LanguageModel {
  const primary = groq(PRIMARY_MODEL);
  usage.id = PRIMARY_MODEL;
  if (!FALLBACK_MODEL) return primary;

  const fallback = groq(FALLBACK_MODEL);
  return wrapLanguageModel({
    model: primary,
    middleware: {
      specificationVersion: "v4",
      async wrapStream({ doStream, params }) {
        try {
          return await doStream();
        } catch (err) {
          if (!isQuotaError(err) || params.abortSignal?.aborted) throw err;
          console.warn(`[chat] ${PRIMARY_MODEL} unavailable (${(err as APICallError).statusCode}); falling back to ${FALLBACK_MODEL}`);
          usage.id = FALLBACK_MODEL;
          usage.fellBack = true;
          return fallback.doStream(params);
        }
      },
    },
  });
}
