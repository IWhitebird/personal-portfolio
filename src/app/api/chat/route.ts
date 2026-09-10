import {
  InvalidToolInputError,
  NoSuchToolError,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { z } from "zod";
import { getContent } from "@/lib/cms/content";
import { BodySchema, checkOrigin, clientIp, rateLimit } from "@/lib/chat/guard";
import { PRIMARY_MODEL, chatModel, isQuotaError, retryAfterSeconds } from "@/lib/chat/model";
import { buildInstructions } from "@/lib/chat/prompt";
import { buildTools, type ChatMessage } from "@/lib/chat/tools";

export const maxDuration = 30;

const HISTORY_LIMIT = 10;
const MAX_STEPS = 3;

function json(body: unknown, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers });
}

/** A normal assistant message so the chat UI stays interactive when we cannot call the model. */
function assistantTextResponse(text: string, headers?: Record<string, string>) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = "notice";
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
  });
  return createUIMessageStreamResponse({ stream, headers });
}

/** Keep the last N UI messages, starting at a user turn so tool calls stay paired with their results. */
function trimHistory(messages: ChatMessage[], limit: number): ChatMessage[] {
  const slice = messages.slice(-limit);
  const firstUser = slice.findIndex((m) => m.role === "user");
  return firstUser > 0 ? slice.slice(firstUser) : slice;
}

function friendlyError(err: unknown): string {
  if (isQuotaError(err)) {
    const wait = retryAfterSeconds(err) ?? 20;
    return `The assistant is busy right now. Try again in ${wait} seconds.`;
  }
  if (NoSuchToolError.isInstance(err) || InvalidToolInputError.isInstance(err)) {
    return "I tried to do something the page does not support. Ask me again in different words.";
  }
  if (err instanceof Error && err.name === "AbortError") return "Stopped.";
  console.error("[chat] stream error:", err);
  return "Something went wrong on my side. Try again in a moment.";
}

export async function POST(req: Request) {
  if (!checkOrigin(req)) return json({ error: "Forbidden" }, 403);

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    const details = err instanceof z.ZodError ? err.issues.map((i) => i.message) : undefined;
    return json({ error: "Invalid request", details }, 400);
  }

  if (!process.env.GROQ_API_KEY) {
    return assistantTextResponse("The assistant is not configured on this deployment yet. You can still reach Shreyas through the contact form.");
  }

  const verdict = await rateLimit(clientIp(req));
  if (!verdict.ok) {
    return assistantTextResponse(
      `I'm getting a lot of requests right now. Try again in ${verdict.retryAfterSec} seconds.`,
      { "Retry-After": String(verdict.retryAfterSec) },
    );
  }

  const uiMessages = trimHistory(body.messages as ChatMessage[], HISTORY_LIMIT);
  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(uiMessages);
  } catch {
    return json({ error: "The conversation history is malformed. Clear the chat and try again." }, 400);
  }

  const content = await getContent();
  const started = Date.now();

  const result = streamText({
    model: chatModel(),
    instructions: buildInstructions(content, body.theme ?? "dark"),
    messages: modelMessages,
    tools: buildTools(content),
    stopWhen: isStepCount(MAX_STEPS),
    maxOutputTokens: 500,
    maxRetries: 0,
    abortSignal: req.signal,
    providerOptions: {
      // Low effort keeps hidden reasoning tokens (which count toward Groq's TPM cap) small.
      groq: { reasoningEffort: "low", parallelToolCalls: true },
    },
    onFinish: ({ steps, totalUsage }) => {
      console.info(
        "[chat]",
        JSON.stringify({
          model: PRIMARY_MODEL,
          steps: steps.length,
          tools: steps.flatMap((s) => s.toolCalls.map((t) => t.toolName)),
          tokens: totalUsage.totalTokens,
          ms: Date.now() - started,
        }),
      );
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, onError: friendlyError }),
  });
}
