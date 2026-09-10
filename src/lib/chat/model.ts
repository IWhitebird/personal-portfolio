import { createGroq } from "@ai-sdk/groq";
import { APICallError, type LanguageModel } from "ai";

export const PRIMARY_MODEL = "openai/gpt-oss-120b";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

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

/** One model, no fallback. A quota error surfaces as the friendly "busy" message with a countdown. */
export function chatModel(): LanguageModel {
  return groq(PRIMARY_MODEL);
}
