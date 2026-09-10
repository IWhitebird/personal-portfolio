import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/blog/PostBody";
import { TableOfContents, hasOutline } from "@/components/blog/TableOfContents";
import { JsonLd } from "@/components/ui/JsonLd";
import { getContent } from "@/lib/cms/content";
import { postBySlug, posts, slugParams } from "@/lib/cms/select";
import { formatPostDate } from "@/lib/format";
import { postGraph } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const content = await getContent();
  return slugParams(content.posts.map((p) => p.slug));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = postBySlug(await getContent(), (await params).slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: path },
    keywords: post.tags.length ? post.tags : undefined,
    openGraph: {
      type: "article",
      url: path,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [siteUrl],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const post = postBySlug(content, slug);
  if (!post) notFound();

  const all = posts(content);
  const index = all.findIndex((p) => p.slug === slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index < all.length - 1 ? all[index + 1] : undefined;

  return (
    <main id="main" className="container-x pb-24 pt-32 md:pb-32 md:pt-36">
      <div
        className={
          hasOutline(post.body)
            ? "grid gap-16 xl:grid-cols-[minmax(0,1fr)_200px]"
            : "mx-auto max-w-[760px]"
        }
      >
        <article>
          <p className="font-mono text-[13px] text-muted">
            <Link href="/blog" className="link no-underline hover:underline">
              Blog
            </Link>
          </p>

          <h1 className="display mt-6 max-w-[24ch] text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.03] tracking-[-0.02em] text-fg">
            {post.title}
          </h1>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden>/</span>
            <span>{post.readingMinutes} min read</span>
            {post.updated && post.updated !== post.date ? (
              <>
                <span aria-hidden>/</span>
                <span>
                  updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
                </span>
              </>
            ) : null}
          </p>

          {post.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li key={tag} className="chip">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          {post.cover ? (
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              width={post.cover.width}
              height={post.cover.height}
              sizes="(min-width: 1120px) 860px, 100vw"
              priority
              className="mt-12 h-auto w-full rounded-lg border border-line"
            />
          ) : null}

          <div className="mt-12">
            <PostBody blocks={post.body} />
          </div>

          {newer || older ? (
            <nav aria-label="More posts" className="mt-20 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              {older ? (
                <Link href={`/blog/${older.slug}`} className="group">
                  <span className="font-mono text-[12px] text-muted">Older</span>
                  <span className="mt-1 block text-[16px] text-fg transition-colors duration-200 group-hover:text-accent">
                    {older.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link href={`/blog/${newer.slug}`} className="group sm:text-right">
                  <span className="font-mono text-[12px] text-muted">Newer</span>
                  <span className="mt-1 block text-[16px] text-fg transition-colors duration-200 group-hover:text-accent">
                    {newer.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </article>

        <aside>
          <TableOfContents blocks={post.body} />
        </aside>
      </div>

      <JsonLd data={postGraph(content.profile, post)} />
    </main>
  );
}
