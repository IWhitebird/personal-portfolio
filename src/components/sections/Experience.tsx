import { InlineMd } from "@/components/ui/InlineMd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDuration, formatRange } from "@/lib/format";
import type { Experience as ExperienceItem } from "@/lib/cms/schema";

type Props = { items: ExperienceItem[]; now: Date };

export function Experience({ items, now }: Props) {
  return (
    <section id="experience" className="container-x py-24 md:py-32">
      <SectionHeading
        title="Experience"
        lede="Real-time video infrastructure, agentic systems, and the platform work that keeps both running."
      />

      <ol className="timeline mt-14 pl-0">
        {items.map((exp) => {
          const current = exp.end === null;
          return (
            <li key={exp.id} className="relative pb-16 pl-8 last:pb-0 md:pl-12">
              <span
                aria-hidden
                className={`absolute -left-[5px] top-[7px] h-[9px] w-[9px] rounded-full border-2 ${
                  current
                    ? "live-dot border-accent bg-accent"
                    : "border-line-strong bg-bg"
                }`}
              />

              <div className="md:grid md:grid-cols-[200px_1fr] md:gap-10">
                <div className="text-[14px] leading-6 text-muted">
                  <p className="text-fg-soft">{formatRange(exp.start, exp.end)}</p>
                  <p>{formatDuration(exp.start, exp.end, now)}</p>
                  {exp.location ? <p>{exp.location}</p> : null}
                </div>

                <div className="mt-3 md:mt-0">
                  <h3 className="display text-[1.5rem] leading-tight tracking-[-0.005em] text-fg">
                    {exp.companyUrl ? (
                      <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer" className="link no-underline hover:underline">
                        {exp.company}
                      </a>
                    ) : (
                      exp.company
                    )}
                  </h3>
                  <p className="mt-1 text-[16px] text-fg-soft">
                    {exp.role}
                    {current ? <span className="ml-2 text-[13px] text-accent">now</span> : null}
                  </p>

                  <ul className="prose-md mt-6 max-w-[68ch] space-y-3 text-[15px] leading-[1.65] text-fg-soft">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="relative pl-5 before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-2.5 before:bg-line-strong">
                        <InlineMd text={bullet} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
