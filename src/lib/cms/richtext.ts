/**
 * Notion rich text <-> the inline-markdown subset used in site.json
 * (**bold**, `code`, [text](url)). Italic is dropped on the way in; nothing else is supported on purpose.
 */

export type RichTextItem = {
  plain_text: string;
  href?: string | null;
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
};

export function toPlain(rich: RichTextItem[] | undefined): string {
  return (rich ?? []).map((r) => r.plain_text).join("");
}

export function toMd(rich: RichTextItem[] | undefined): string {
  return (rich ?? [])
    .map((r) => {
      let text = r.plain_text;
      if (!text) return "";
      if (r.annotations?.code) text = `\`${text}\``;
      else if (r.annotations?.bold) text = `**${text}**`;
      if (r.href) text = `[${text}](${r.href})`;
      return text;
    })
    .join("")
    .trim();
}

export type RichTextRequest = {
  type: "text";
  text: { content: string; link?: { url: string } | null };
  annotations?: { bold?: boolean; code?: boolean };
};

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\))/g;
const NOTION_TEXT_LIMIT = 2000;

/** Inverse of toMd: build Notion rich-text request objects from inline markdown. */
export function mdToRichText(md: string): RichTextRequest[] {
  const out: RichTextRequest[] = [];
  const push = (content: string, extra: Partial<RichTextRequest> = {}) => {
    for (let i = 0; i < content.length; i += NOTION_TEXT_LIMIT) {
      out.push({ type: "text", text: { content: content.slice(i, i + NOTION_TEXT_LIMIT), ...(extra.text ?? {}) }, ...(extra.annotations ? { annotations: extra.annotations } : {}) });
    }
  };

  let last = 0;
  for (const m of md.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) push(md.slice(last, start));
    const tok = m[0];
    if (tok.startsWith("**")) push(tok.slice(2, -2), { annotations: { bold: true } });
    else if (tok.startsWith("`")) push(tok.slice(1, -1), { annotations: { code: true } });
    else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok) ?? [];
      if (label && href) push(label, { text: { content: label, link: { url: href } } });
      else push(tok);
    }
    last = start + tok.length;
  }
  if (last < md.length) push(md.slice(last));
  return out.length ? out : [{ type: "text", text: { content: "" } }];
}
