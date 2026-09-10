import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { getContent } from "@/lib/cms/content";
import { posts } from "@/lib/cms/select";
import { formatPostDate } from "@/lib/format";
import { blogGraph } from "@/lib/seo";

const describe = (name: string) => `Notes on distributed systems, real-time video, and agentic AI by ${name}.`;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const description = describe(profile.name);

  return {
    title: "Blog",
    description,
    alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: { type: "website", url: "/blog", title: `Blog | ${profile.name}`, description },
  };
}

export default async function BlogPage() {
  const content = await getContent();
  const all = posts(content);

  return (
    <main id="main" className="container-x pb-24 pt-32 md:pb-32 md:pt-36">
      <SectionHeading title="Blog" />

      {all.length === 0 ? null : (
        <ul className="mt-14 divide-y divide-line border-y border-line">
          {all.map((post) => (
            <li key={post.slug}>
              <TrackedLink
                href={`/blog/${post.slug}`}
                event="post_open"
                properties={{ slug: post.slug }}
                className="group grid gap-2 py-7 md:grid-cols-[160px_1fr] md:gap-8"
              >
                <p className="font-mono text-[13px] text-muted md:pt-[7px]">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                </p>
                <div>
                  <h2 className="display text-[1.5rem] leading-tight tracking-[-0.005em] text-fg transition-colors duration-200 group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-fg-soft">{post.summary}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-muted">
                    <span>{post.readingMinutes} min read</span>
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </p>
                </div>
              </TrackedLink>
            </li>
          ))}
        </ul>
      )}

      <JsonLd data={blogGraph(content.profile, all, describe(content.profile.name))} />
    </main>
  );
}
