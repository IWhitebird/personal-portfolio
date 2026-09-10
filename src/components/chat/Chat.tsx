"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { FiSquare, FiTrash2, FiX } from "react-icons/fi";
import { track } from "@/lib/analytics";
import type { ChatMessage } from "@/lib/chat/tools";
import type { SocialKey } from "@/lib/cms/schema";
import { MessageParts } from "./MessageParts";
import { clearMessages, loadMessages, saveMessages } from "./persist";
import { useClientTools, type ProjectLink } from "./useClientTools";

export type ChatProps = {
  suggestions: string[];
  socials: { key: SocialKey; href: string }[];
  projects: ProjectLink[];
  resumePath: string;
  onClose: () => void;
};

/** Resend after page tools only when the model acted silently; if it already spoke, one round trip is enough. */
function sendWhenSilent({ messages }: { messages: ChatMessage[] }): boolean {
  if (!lastAssistantMessageIsCompleteWithToolCalls({ messages })) return false;
  const last = messages[messages.length - 1];
  if (!last) return false;
  return !last.parts.some((p) => p.type === "text" && p.text.trim().length > 0);
}

// Whatever went wrong on the wire, the visitor sees one of these, never a status code or a JSON body.
const HICCUPS = [
  "The terminal seems to have dozed off. Poke it?",
  "Lost the thread for a second. Once more?",
  "The assistant stepped out for chai. Try again?",
  "Packets went sideways. Give it another go?",
] as const;

function friendlyMessage(error: Error, cooldown: number): string {
  if (cooldown > 0 || /seconds?/i.test(error.message)) return "Catching my breath. Back in";
  const index = Math.abs([...error.message].reduce((h, c) => h + c.charCodeAt(0), 0)) % HICCUPS.length;
  return HICCUPS[index] ?? HICCUPS[0];
}

function retrySecondsFrom(message?: string): number {
  const m = message?.match(/(\d+)\s*seconds?/i);
  return m ? Number(m[1]) : 0;
}

/** next-themes mirrors the resolved theme onto <html class="dark">; read it at request time. */
function currentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function Chat({ suggestions, socials, projects, resumePath, onClose }: ChatProps) {
  const [initialMessages] = useState<ChatMessage[]>(() => (typeof window === "undefined" ? [] : loadMessages()));
  const runClientTool = useClientTools({ socials, projects, resumePath });

  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, theme: currentTheme() },
        }),
      }),
    [],
  );

  // Cooldown after a "try again in N seconds" error: set from the onError callback, ticked by an interval.
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);
  const cooldown = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const { messages, sendMessage, status, stop, regenerate, error, clearError, setMessages, addToolOutput } = useChat<ChatMessage>({
    id: "portfolio-assistant",
    messages: initialMessages,
    transport,
    sendAutomaticallyWhen: sendWhenSilent,
    onError: (err) => {
      const secs = retrySecondsFrom(err.message);
      if (secs) {
        const t = Date.now();
        setNow(t);
        setCooldownUntil(t + secs * 1000);
      }
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return;
      const result = runClientTool(toolCall.toolName, toolCall.input);
      if (result.kind === "not-client") return;
      // Never await inside onToolCall (deadlock with sendAutomaticallyWhen).
      if (result.kind === "ok") {
        addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output: result.output });
      } else {
        addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, state: "output-error", errorText: result.errorText });
      }
    },
    onFinish: ({ message }) => {
      const usedTools = message.parts.filter((p) => typeof p.type === "string" && p.type.startsWith("tool-")).map((p) => p.type.slice(5));
      track("chat_message", { tools: usedTools.join(",") || "none" });
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready") saveMessages(messages);
  }, [messages, status]);

  useEffect(() => {
    if (cooldownUntil <= now) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [cooldownUntil, now]);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy || cooldown > 0) return;
      clearError();
      track("chat_question", { length: trimmed.length });
      void sendMessage({ text: trimmed });
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    },
    [busy, cooldown, clearError, sendMessage],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const reset = () => {
    stop();
    setMessages([]);
    clearError();
    clearMessages();
  };

  const lastIndex = messages.length - 1;

  return (
    <div className="flex h-full flex-col font-mono text-[13.5px] leading-[1.7]">
      {/* Title bar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
        <button type="button" className="icon-btn h-8 w-8" onClick={onClose} aria-label="Close assistant">
          <FiX size={16} />
        </button>
        <span className="flex-1 text-center text-[12px] tracking-wide text-muted">shreyas.terminal</span>
        {busy ? (
          <button type="button" className="icon-btn h-8 w-8" onClick={() => stop()} aria-label="Stop generating" title="Stop">
            <FiSquare size={13} />
          </button>
        ) : null}
        {messages.length > 0 ? (
          <button type="button" className="icon-btn h-8 w-8" onClick={reset} aria-label="Clear conversation" title="Clear">
            <FiTrash2 size={14} />
          </button>
        ) : (
          <span className="w-8" />
        )}
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" onClick={() => inputRef.current?.focus()}>
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted">Ask about Shreyas, or tell me where to take you on the page.</p>
            <ul className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="chip cursor-pointer py-1.5 text-[12px] text-muted transition-colors hover:border-accent hover:text-accent"
                    onClick={() => submit(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {messages.map((m, i) => (
          <MessageParts key={m.id} message={m} streaming={busy && i === lastIndex && m.role === "assistant"} />
        ))}

        {status === "submitted" && messages[lastIndex]?.role === "user" ? (
          <div className="text-fg-soft">
            <span aria-hidden className="select-none text-emerald-500/70">{"$ "}</span>
            <span aria-hidden className="block-cursor" />
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-wrap items-baseline gap-x-3 text-[12px] text-muted" role="alert">
            <span>{friendlyMessage(error, cooldown)}</span>
            {cooldown > 0 ? (
              <span className="tabular-nums">{cooldown}s.</span>
            ) : (
              <button type="button" className="link" onClick={() => void regenerate()}>
                retry
              </button>
            )}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="flex shrink-0 items-start gap-2 border-t border-line px-4 py-3" onClick={() => inputRef.current?.focus()}>
        <span aria-hidden className="select-none pt-[1px] text-accent/70">{">"}</span>
        <textarea
          ref={inputRef}
          value={input}
          rows={1}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={onKeyDown}
          placeholder={cooldown > 0 ? `wait ${cooldown}s…` : busy ? "…" : "ask anything"}
          disabled={cooldown > 0}
          aria-label="Message the assistant"
          autoComplete="off"
          spellCheck={false}
          className="max-h-[120px] flex-1 resize-none bg-transparent text-fg caret-accent outline-none placeholder:text-muted/50 disabled:opacity-50"
        />
        <kbd className="hidden select-none pt-[2px] text-[11px] text-muted/60 md:inline">↵</kbd>
      </form>
    </div>
  );
}
