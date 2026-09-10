import type { ChatMessage } from "@/lib/chat/tools";

const KEY = "portfolio-assistant:v2";
const MAX_MESSAGES = 30;

export function loadMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? sanitize(parsed) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  } catch {
    /* quota or private mode: persistence is a convenience only */
  }
}

export function clearMessages(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/**
 * A reload mid-tool-call leaves a tool part without an output, which makes
 * `convertToModelMessages` throw on the next request. Mark those as errored.
 */
function sanitize(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m && typeof m.id === "string" && Array.isArray(m.parts) && m.parts.length > 0)
    .map((m) => ({
      ...m,
      parts: m.parts.map((p) => {
        if (typeof p.type === "string" && p.type.startsWith("tool-") && "state" in p) {
          const state = (p as { state: string }).state;
          if (state === "input-streaming" || state === "input-available") {
            return { ...p, state: "output-error", errorText: "Interrupted by a page reload." } as typeof p;
          }
        }
        return p;
      }),
    }));
}
