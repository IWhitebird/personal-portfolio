import { ImageResponse } from "next/og";
import { postBySlug, posts, profile } from "@/content";
import { siteHost } from "@/lib/site";
import { formatPostDate } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts().map(({ slug }) => ({ slug }));
}

export default async function PostOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const post = postBySlug((await params).slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0f14",
          color: "#e6edf3",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#8b98a5" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#00ddff" }} />
          {post ? formatPostDate(post.date) : "Blog"}
        </div>

        <div style={{ display: "flex", fontSize: 68, lineHeight: 1.1, letterSpacing: -2, maxWidth: 980 }}>
          {post?.title ?? "Blog"}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#8b98a5" }}>
          <span>{profile.name}</span>
          <span>{siteHost}/blog</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
