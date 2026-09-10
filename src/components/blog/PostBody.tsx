import Image from "next/image";
import { InlineMd } from "@/components/ui/InlineMd";
import type { ListItem, PostBlock } from "@/lib/cms/schema";

const INDENT = ["", "ml-6", "ml-12"] as const;

function ListRows({ items }: { items: ListItem[] }) {
  return items.map((item, i) => (
    <li key={i} className={INDENT[item.depth]}>
      <InlineMd text={item.text} />
    </li>
  ));
}

/** Renders the block subset `sync-content.ts` writes. Inline markup goes through InlineMd. */
export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="max-w-[68ch] text-[17px] leading-[1.75] text-fg-soft">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="prose-md mt-6 first:mt-0">
                <InlineMd text={block.text} />
              </p>
            );

          case "h2":
            return (
              <h2
                key={i}
                id={block.slug}
                className="display mt-14 scroll-mt-24 text-[1.75rem] leading-tight tracking-[-0.01em] text-fg"
              >
                {block.text}
              </h2>
            );

          case "h3":
            return (
              <h3 key={i} id={block.slug} className="mt-10 scroll-mt-24 text-[1.125rem] font-semibold text-fg">
                {block.text}
              </h3>
            );

          case "ul":
            return (
              <ul key={i} className="prose-md mt-6 list-disc space-y-2 pl-6 marker:text-muted">
                <ListRows items={block.items} />
              </ul>
            );

          case "ol":
            return (
              <ol key={i} className="prose-md mt-6 list-decimal space-y-2 pl-6 marker:text-muted">
                <ListRows items={block.items} />
              </ol>
            );

          case "todo":
            return (
              <ul key={i} className="prose-md mt-6 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className={`flex gap-3 ${INDENT[item.depth]}`}>
                    <span
                      aria-hidden
                      className={`mt-[7px] grid h-[14px] w-[14px] shrink-0 place-items-center rounded-sm border text-[10px] leading-none ${
                        item.done ? "border-accent bg-accent text-accent-fg" : "border-line-strong"
                      }`}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span className={item.done ? "text-muted line-through" : undefined}>
                      <InlineMd text={item.text} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <blockquote key={i} className="prose-md mt-8 border-l-2 border-accent pl-5 text-fg">
                <InlineMd text={block.text} />
              </blockquote>
            );

          case "callout":
            return (
              <aside key={i} className="prose-md mt-8 flex gap-3 rounded-md border border-line bg-surface-2 p-4 text-[16px]">
                {block.emoji ? (
                  <span aria-hidden className="shrink-0 leading-relaxed">
                    {block.emoji}
                  </span>
                ) : null}
                <div>
                  <InlineMd text={block.text} />
                </div>
              </aside>
            );

          case "code":
            return (
              <figure key={i} className="mt-8 overflow-hidden rounded-md border border-line">
                <figcaption className="border-b border-line bg-surface-2 px-4 py-1.5 font-mono text-[11px] text-muted">
                  {block.language}
                </figcaption>
                <div className="shiki-block" dangerouslySetInnerHTML={{ __html: block.html }} />
              </figure>
            );

          case "image":
            return (
              <figure key={i} className="mt-10">
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  width={block.image.width}
                  height={block.image.height}
                  sizes="(min-width: 768px) 68ch, 100vw"
                  className="h-auto w-full rounded-md border border-line"
                />
                {block.caption ? <figcaption className="mt-3 text-[14px] text-muted">{block.caption}</figcaption> : null}
              </figure>
            );

          case "bookmark":
            return (
              <p key={i} className="mt-8">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md border border-line p-4 text-[15px] transition-colors duration-200 hover:border-accent"
                >
                  <span className="block text-fg">{block.caption || new URL(block.url).hostname}</span>
                  <span className="mt-1 block truncate font-mono text-[12px] text-muted">{block.url}</span>
                </a>
              </p>
            );

          case "hr":
            return <hr key={i} className="mt-12 border-line" />;
        }
      })}
    </div>
  );
}
