/* eslint-disable @typescript-eslint/no-explicit-any -- Notion block unions are deep; a handful of types are read */
import type { PostBlock } from "../../src/content/schema";
import { highlight } from "./highlight";
import { toMd, toPlain } from "./richtext";

const WORDS_PER_MINUTE = 220;
const MAX_LIST_DEPTH = 2;

type StoreImage = (url: string, alt: string) => Promise<{ src: string; width: number; height: number; alt: string }>;
type FetchChildren = (blockId: string) => Promise<any[]>;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Flattens a Notion page body into the block subset `PostBlockSchema` allows.
 * Consecutive list items are grouped and nested items keep a depth; anything
 * unsupported is skipped so an exotic block in Notion cannot break the build.
 */
export async function toPostBlocks(
  blocks: any[],
  storeImage: StoreImage,
  fetchChildren: FetchChildren,
): Promise<PostBlock[]> {
  const out: PostBlock[] = [];
  const usedSlugs = new Set<string>();

  const uniqueSlug = (text: string) => {
    const base = slugify(text) || "section";
    let slug = base;
    for (let n = 2; usedSlugs.has(slug); n += 1) slug = `${base}-${n}`;
    usedSlugs.add(slug);
    return slug;
  };

  const openList = <K extends "ul" | "ol" | "todo">(kind: K): Extract<PostBlock, { type: K }> | null => {
    const last = out[out.length - 1];
    return last?.type === kind ? (last as Extract<PostBlock, { type: K }>) : null;
  };

  const walk = async (nodes: any[], depth: number): Promise<void> => {
    for (const block of nodes) {
      switch (block.type) {
        case "paragraph": {
          const text = toMd(block.paragraph.rich_text);
          if (text) out.push({ type: "p", text });
          break;
        }
        case "heading_1":
        case "heading_2": {
          const text = toPlain(block[block.type].rich_text).trim();
          if (text) out.push({ type: "h2", text, slug: uniqueSlug(text) });
          break;
        }
        case "heading_3": {
          const text = toPlain(block.heading_3.rich_text).trim();
          if (text) out.push({ type: "h3", text, slug: uniqueSlug(text) });
          break;
        }
        case "bulleted_list_item":
        case "numbered_list_item": {
          const kind = block.type === "bulleted_list_item" ? "ul" : "ol";
          const text = toMd(block[block.type].rich_text);
          if (!text) break;
          const item = { text, depth };
          const list = openList(kind);
          if (list) list.items.push(item);
          else out.push({ type: kind, items: [item] });
          break;
        }
        case "to_do": {
          const text = toMd(block.to_do.rich_text);
          if (!text) break;
          const item = { text, depth, done: Boolean(block.to_do.checked) };
          const list = openList("todo");
          if (list) list.items.push(item);
          else out.push({ type: "todo", items: [item] });
          break;
        }
        case "quote": {
          const text = toMd(block.quote.rich_text);
          if (text) out.push({ type: "quote", text });
          break;
        }
        case "callout": {
          const text = toMd(block.callout.rich_text);
          if (!text) break;
          const emoji = block.callout.icon?.type === "emoji" ? String(block.callout.icon.emoji) : undefined;
          out.push({ type: "callout", text, ...(emoji ? { emoji } : {}) });
          break;
        }
        case "code": {
          const code = toPlain(block.code.rich_text);
          if (!code) break;
          const language = String(block.code.language ?? "text");
          out.push({ type: "code", language, code, html: await highlight(code, language) });
          break;
        }
        case "image": {
          const url = block.image.type === "external" ? block.image.external?.url : block.image.file?.url;
          if (!url) break;
          const caption = toPlain(block.image.caption).trim();
          const stored = await storeImage(url, caption);
          out.push({ type: "image", image: stored, ...(caption ? { caption } : {}) });
          break;
        }
        case "bookmark":
        case "link_preview": {
          const url = block[block.type]?.url;
          if (!url) break;
          const caption = toPlain(block.bookmark?.caption).trim();
          out.push({ type: "bookmark", url, ...(caption ? { caption } : {}) });
          break;
        }
        case "divider":
          out.push({ type: "hr" });
          break;
        default:
          break;
      }

      // Nested list items and toggle bodies live one level down.
      if (block.has_children && depth < MAX_LIST_DEPTH) {
        await walk(await fetchChildren(block.id), depth + 1);
      }
    }
  };

  await walk(blocks, 0);
  return out;
}

export function readingMinutes(body: PostBlock[]): number {
  const words = body
    .map((block) => {
      switch (block.type) {
        case "p":
        case "h2":
        case "h3":
        case "quote":
        case "callout":
          return block.text;
        case "ul":
        case "ol":
        case "todo":
          return block.items.map((i) => i.text).join(" ");
        default:
          return "";
      }
    })
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
