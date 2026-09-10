import { InlineMd } from "@/components/ui/InlineMd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatRange } from "@/lib/format";
import type { Achievement, Education, Profile, Skill } from "@/lib/cms/schema";

type Props = {
  profile: Profile;
  education: Education[];
  achievements: Achievement[];
  skillGroups: { category: string; skills: Skill[] }[];
};

export function About({ profile, education, achievements, skillGroups }: Props) {
  return (
    <section id="about" className="container-x py-24 md:py-32">
      <SectionHeading title="About" lede="How I got here and what I reach for." />

      <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-12">
        <div className="prose-md max-w-[62ch] text-[17px] leading-[1.7] text-fg-soft md:col-span-7">
          {profile.bio.map((paragraph, i) => (
            <p key={i} className={i === 0 ? "text-fg" : undefined}>
              <InlineMd text={paragraph} />
            </p>
          ))}
        </div>

        <dl className="grid content-start gap-8 md:col-span-5 md:pl-4">
          {education.map((edu) => (
            <div key={edu.institution} className="border-t border-line pt-5">
              <dt className="text-[13px] text-muted">Education</dt>
              <dd className="mt-2">
                <p className="text-[16px] font-medium text-fg">{edu.institution}</p>
                <p className="mt-1 text-[15px] text-fg-soft">{edu.degree}</p>
                <p className="mt-1 text-[14px] text-muted">
                  {formatRange(edu.start, edu.end)}
                  {edu.gpa ? <span className="ml-3">GPA {edu.gpa}</span> : null}
                </p>
              </dd>
            </div>
          ))}

          {achievements.length > 0 ? (
            <div className="border-t border-line pt-5">
              <dt className="text-[13px] text-muted">Competitive programming</dt>
              {achievements.map((a, i) => (
                <dd key={i} className="prose-md mt-2 text-[15px] leading-relaxed text-fg-soft">
                  <InlineMd text={a.text} />
                  {a.url ? (
                    <>
                      {" "}
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="link">
                        Profile
                      </a>
                    </>
                  ) : null}
                </dd>
              ))}
            </div>
          ) : null}

          {profile.location ? (
            <div className="border-t border-line pt-5">
              <dt className="text-[13px] text-muted">Based in</dt>
              <dd className="mt-2 text-[15px] text-fg-soft">{profile.location}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="mt-24">
        <h3 className="text-[1.25rem] font-semibold tracking-[-0.01em] text-fg">Skills</h3>
        <p className="mt-2 max-w-[60ch] text-[15px] text-muted">
          Brighter tags are the tools I reach for most weeks.
        </p>

        <div className="mt-6 divide-y divide-line border-y border-line">
          {skillGroups.map(({ category, skills }) => (
            <div key={category} className="grid gap-3 py-4 md:grid-cols-[200px_1fr] md:gap-8">
              <p className="text-[14px] text-muted md:pt-[3px]">{category}</p>
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <li key={skill.name} className={skill.highlight ? "chip chip--strong" : "chip"}>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
