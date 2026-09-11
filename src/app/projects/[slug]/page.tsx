import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/blog/PostBody";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel";
import { SphereBackground } from "@/components/sphere/SphereBackground";
import { TableOfContents, hasOutline } from "@/components/blog/TableOfContents";
import { InlineMd } from "@/components/ui/InlineMd";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProjectStatus } from "@/components/ui/ProjectStatus";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { getContent } from "@/lib/cms/content";
import { allProjects, projectBySlug, slugParams } from "@/lib/cms/select";
import { projectGraph } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const content = await getContent();
  return slugParams(content.projects.map((p) => p.id));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = projectBySlug(await getContent(), (await params).slug);
  if (!project) return {};
  const path = `/projects/${project.id}`;

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: path },
    keywords: project.tech,
    openGraph: { type: "article", url: path, title: project.name, description: project.summary, tags: project.tech },
    twitter: { card: "summary_large_image", title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const project = projectBySlug(content, slug);
  if (!project) notFound();

  const all = allProjects(content);
  const index = all.findIndex((p) => p.id === slug);
  const previous = index > 0 ? all[index - 1] : undefined;
  const next = index < all.length - 1 ? all[index + 1] : undefined;
  return (
    <main id="main" className="container-x pb-24 pt-32 md:pb-32 md:pt-36">
      <SphereBackground />
      <div
        className={
          hasOutline(project.body)
            ? "grid gap-16 xl:grid-cols-[minmax(0,1fr)_200px]"
            : "mx-auto max-w-[760px]"
        }
      >
        <article>
          <p className="font-mono text-[13px] text-muted">
            <Link href="/#projects" className="link no-underline hover:underline">
              Projects
            </Link>
          </p>

          <h1 className="display mt-6 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.03] tracking-[-0.02em] text-fg">
            {project.name}
          </h1>
          <p className="mt-5 max-w-[40ch] text-[clamp(1.125rem,2vw,1.375rem)] leading-snug text-fg-soft">{project.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px]">
            <ProjectStatus status={project.status} />
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

          <ul className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>

          {project.images.length > 0 ? <ProjectCarousel images={project.images} name={project.name} /> : null}

          <div className="mt-12">
            {project.body.length > 0 ? (
              <PostBody blocks={project.body} />
            ) : (
              <p className="prose-md max-w-[68ch] text-[17px] leading-[1.75] text-fg-soft">
                <InlineMd text={project.description} />
              </p>
            )}
          </div>

          {previous || next ? (
            <nav aria-label="More projects" className="mt-20 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              {previous ? (
                <Link href={`/projects/${previous.id}`} className="group">
                  <span className="font-mono text-[12px] text-muted">Previous</span>
                  <span className="mt-1 block text-[16px] text-fg transition-colors duration-200 group-hover:text-accent">
                    {previous.name}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/projects/${next.id}`} className="group sm:text-right">
                  <span className="font-mono text-[12px] text-muted">Next</span>
                  <span className="mt-1 block text-[16px] text-fg transition-colors duration-200 group-hover:text-accent">
                    {next.name}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </article>

        <aside>
          <TableOfContents blocks={project.body} />
        </aside>
      </div>

      <JsonLd data={projectGraph(content.profile, project)} />
    </main>
  );
}
