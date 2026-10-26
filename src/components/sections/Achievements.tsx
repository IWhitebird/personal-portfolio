import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { InlineMd } from "@/components/ui/InlineMd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Achievement } from "@/lib/cms/schema";
import { siteUrl } from "@/lib/site";

type Props = { items: Achievement[] };

/** The title is the link when the row has one: the profile to check, or the project a program accepted. */
function Title({ item }: { item: Achievement }) {
  const hover = "transition-colors duration-200 hover:text-accent";
  let inner: React.ReactNode = item.title;
  if (item.url?.startsWith(`${siteUrl}/`)) {
    inner = (
      <Link href={item.url.slice(siteUrl.length)} className={hover}>
        {item.title}
      </Link>
    );
  } else if (item.url) {
    inner = (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 ${hover}`}>
        {item.title}
        <FiArrowUpRight aria-hidden size={14} className="text-muted" />
      </a>
    );
  }
  return <h3 className="text-[17px] font-medium text-fg">{inner}</h3>;
}

/** A short list, each row verifiable: it sits between Projects and About so it is not skimmed past. */
export function Achievements({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <section id="achievements" className="container-x py-24 md:py-32">
      <SectionHeading title="Achievements" />
      <ul className="mt-14 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.title} className="grid gap-2 py-6 md:grid-cols-[240px_1fr] md:gap-8">
            <Title item={item} />
            {item.detail ? (
              <p className="prose-md text-[15px] leading-relaxed text-fg-soft">
                <InlineMd text={item.detail} />
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
