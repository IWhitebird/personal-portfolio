import type { PostBlock } from "@/lib/cms/schema";

const MIN_HEADINGS = 3;

const headingsOf = (blocks: PostBlock[]) =>
  blocks.filter((b): b is Extract<PostBlock, { type: "h2" | "h3" }> => b.type === "h2" || b.type === "h3");

/** True when a body is long enough to earn a sidebar outline; pages use it to pick their layout. */
export const hasOutline = (blocks: PostBlock[]): boolean => headingsOf(blocks).length >= MIN_HEADINGS;

/** Sticky outline beside a post. Hidden below `xl` and for posts too short to need it. */
export function TableOfContents({ blocks }: { blocks: PostBlock[] }) {
  const headings = headingsOf(blocks);
  if (headings.length < MIN_HEADINGS) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden xl:block">
      <p className="text-[13px] text-muted">On this page</p>
      <ul className="mt-3 space-y-2 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.slug} className={heading.type === "h3" ? "pl-7" : "pl-4"}>
            <a
              href={`#${heading.slug}`}
              className="block text-[13px] leading-snug text-muted transition-colors duration-200 hover:text-accent"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
