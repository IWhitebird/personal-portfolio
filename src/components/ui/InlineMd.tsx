import { Fragment, type ReactNode } from "react";

/**
 * Renders the inline-markdown subset used across the content:
 * **bold**, `code`, and [text](https://url). No block syntax, no raw HTML.
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\))/g;

export function renderInlineMd(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const tok = match[0];
    if (tok.startsWith("**")) {
      out.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      out.push(<code key={key++}>{tok.slice(1, -1)}</code>);
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok) ?? [];
      if (label && href) {
        const external = /^https?:/.test(href);
        out.push(
          <a
            key={key++}
            href={href}
            className="link"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>,
        );
      } else {
        out.push(tok);
      }
    }
    last = start + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function InlineMd({ text, as: Tag = Fragment, className }: { text: string; as?: React.ElementType; className?: string }) {
  const nodes = renderInlineMd(text);
  if (Tag === Fragment) return <>{nodes}</>;
  return <Tag className={className}>{nodes}</Tag>;
}

/** Strip the inline markup for plain-text contexts (meta tags, AI tool output). */
export function stripInlineMd(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
