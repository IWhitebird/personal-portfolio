import Image from "next/image";
import Link from "next/link";
import { InlineMd } from "@/components/ui/InlineMd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectStatus } from "@/components/ui/ProjectStatus";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Project } from "@/lib/cms/schema";

type Props = { featured: Project[]; others: Project[] };

function ProjectLinks({ project, size = "md" }: { project: Project; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "text-[13px]" : "text-[14px]";
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${cls}`}>
      <Link href={`/projects/${project.id}`} className="link">
        Case study
      </Link>
      {project.liveUrl ? (
        <TrackedLink
          href={project.liveUrl}
          event="project_open"
          properties={{ name: project.name, target: "live" }}
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Live demo
        </TrackedLink>
      ) : null}
      {project.githubUrl ? (
        <TrackedLink
          href={project.githubUrl}
          event="project_open"
          properties={{ name: project.name, target: "source" }}
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Source
        </TrackedLink>
      ) : null}
    </div>
  );
}

export function Projects({ featured, others }: Props) {
  return (
    <section id="projects" className="container-x py-24 md:py-32">
      <SectionHeading
        title="Projects"
        lede="Side projects that go deeper than a weekend: a language with its own interpreter, and a multiplayer game with real consistency problems."
      />

      <div className="mt-14 space-y-20 md:space-y-28">
        {featured.map((project, index) => {
          const image = project.images[0];
          const flip = index % 2 === 1;
          return (
            <article key={project.id} className="grid items-start gap-8 md:grid-cols-12 md:gap-12">
              {image ? (
                <Link
                  href={`/projects/${project.id}`}
                  className={`group block overflow-hidden rounded-lg border border-line bg-surface shadow-panel transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-accent md:col-span-7 ${flip ? "md:order-2" : ""}`}
                  aria-label={`${project.name} case study`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="h-auto w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.015]"
                    loading="eager"
                  />
                </Link>
              ) : null}

              <div className={`md:col-span-5 ${flip ? "md:order-1" : ""}`}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="display text-[1.875rem] leading-tight tracking-[-0.01em] text-fg">
                    <Link href={`/projects/${project.id}`} className="transition-colors duration-200 hover:text-accent">
                      {project.name}
                    </Link>
                  </h3>
                  <ProjectStatus status={project.status} />
                </div>
                <p className="mt-2 text-[17px] leading-snug text-fg-soft">{project.summary}</p>
                <p className="prose-md mt-4 text-[15px] leading-[1.65] text-muted">
                  <InlineMd text={project.description} />
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <ProjectLinks project={project} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {others.length > 0 ? (
        <div className="mt-24">
          <h3 className="text-[15px] font-medium text-muted">Earlier projects</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {others.map((project) => (
              <li key={project.id} className="grid gap-2 py-5 transition-colors duration-300 hover:bg-surface-2/40 md:grid-cols-[200px_1fr_auto] md:gap-8">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[16px] font-medium text-fg">
                  <Link href={`/projects/${project.id}`} className="transition-colors duration-200 hover:text-accent">
                    {project.name}
                  </Link>
                  <ProjectStatus status={project.status} />
                </p>
                <div>
                  <p className="text-[15px] leading-relaxed text-fg-soft">{project.summary}</p>
                  <p className="mt-1.5 font-mono text-[12px] text-muted">{project.tech.join(", ")}</p>
                </div>
                <div className="md:pt-0.5">
                  <ProjectLinks project={project} size="sm" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
