"use client";

import { renderInlineMd } from "@/components/ui/InlineMd";
import type { ChatMessage } from "@/lib/chat/tools";

type ToolPart = {
  type: string;
  toolCallId: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const ACTION_LABELS: Record<string, (input: Record<string, string>) => string> = {
  navigate_to_section: (i) => `scrolled to ${i.section ?? "the section"}`,
  set_theme: (i) => `switched to ${i.theme ?? ""} mode`,
  show_resume: () => "opened the résumé",
  download_resume: () => "started the résumé download",
  open_link: (i) => `opened ${i.platform ?? "the link"}`,
  open_project: (i) => `opened ${i.name ?? "the project"} ${i.target === "source" ? "source" : "demo"}`,
  focus_contact_form: () => "opened the contact form",
  get_experience: (i) => (i.company ? `looked up experience at ${i.company}` : "looked up experience"),
  get_projects: (i) => (i.name ? `looked up ${i.name}` : "looked up projects"),
  get_skills: (i) => (i.category && i.category !== "all" ? `looked up ${i.category.toLowerCase()} skills` : "looked up skills"),
  get_contact_info: () => "looked up contact details",
  search_content: (i) => (i.query ? `searched for ${i.query}` : "searched the content"),
};

function actionLabel(part: ToolPart): string {
  const name = part.type.replace(/^tool-/, "");
  const input = (part.input ?? {}) as Record<string, string>;
  const label = ACTION_LABELS[name]?.(input) ?? name.replace(/_/g, " ");
  if (part.state === "output-error") return `couldn't ${label.replace(/^(scrolled|switched|opened|started|looked up|checked|searched)/, (v) => ({ scrolled: "scroll", switched: "switch", opened: "open", started: "start", "looked up": "look up", checked: "check", searched: "search" })[v] ?? v)}`;
  if (part.state === "input-streaming" || part.state === "input-available") return `${label.replace(/^(scrolled|switched|opened|started|looked up|checked|searched)/, (v) => ({ scrolled: "scrolling", switched: "switching", opened: "opening", started: "starting", "looked up": "looking up", checked: "checking", searched: "searching" })[v] ?? v)}…`;
  return label;
}

export function MessageParts({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  if (message.role === "user") {
    const text = message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    return (
      <div className="whitespace-pre-wrap break-words text-accent">
        <span aria-hidden className="select-none opacity-70">{"> "}</span>
        {text}
      </div>
    );
  }

  const lastTextIndex = message.parts.map((p) => p.type).lastIndexOf("text");

  return (
    <div className="space-y-1.5">
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          if (!part.text && !streaming) return null;
          const isLast = i === lastTextIndex;
          return (
            <div key={i} className="whitespace-pre-wrap break-words text-fg-soft">
              <span aria-hidden className="select-none text-emerald-500/70">{"$ "}</span>
              {renderInlineMd(part.text)}
              {streaming && isLast ? <span aria-hidden className="block-cursor" /> : null}
            </div>
          );
        }
        if (typeof part.type === "string" && part.type.startsWith("tool-")) {
          const tp = part as unknown as ToolPart;
          const failed = tp.state === "output-error";
          return (
            <div key={tp.toolCallId ?? i} className={`flex items-baseline gap-1.5 text-[12px] ${failed ? "text-muted" : "text-accent/70"}`}>
              <span aria-hidden className="select-none">→</span>
              <span>{actionLabel(tp)}</span>
            </div>
          );
        }
        return null;
      })}
      {streaming && lastTextIndex === -1 ? (
        <div className="text-fg-soft">
          <span aria-hidden className="select-none text-emerald-500/70">{"$ "}</span>
          <span aria-hidden className="block-cursor" />
        </div>
      ) : null}
    </div>
  );
}
