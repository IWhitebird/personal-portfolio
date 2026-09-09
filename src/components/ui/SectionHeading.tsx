import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
};

/** Section title with an optional one-sentence lede. Sentence case, no labels above it. */
export function SectionHeading({ title, lede, id }: Props) {
  return (
    <header className="max-w-[60ch]">
      <h2 id={id} className="display text-[2.125rem] leading-[1.05] tracking-[-0.015em] text-fg md:text-[2.875rem]">
        {title}
      </h2>
      {lede ? <p className="mt-4 text-[17px] leading-relaxed text-muted">{lede}</p> : null}
    </header>
  );
}
