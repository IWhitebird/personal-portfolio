import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/content";
import { projectBySlug, slugParams } from "@/lib/cms/select";
import { siteHost } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const content = await getContent();
  return slugParams(content.projects.map((p) => p.id));
}

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const content = await getContent();
  const project = projectBySlug(content, (await params).slug);
  if (!project) notFound();

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
          {project.tech.slice(0, 4).join("  ·  ")}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, lineHeight: 1, letterSpacing: -3 }}>{project.name}</div>
          <div style={{ fontSize: 32, color: "#c3cdd6", lineHeight: 1.3, maxWidth: 940, fontFamily: "sans-serif" }}>
            {project.summary}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#8b98a5", fontFamily: "sans-serif" }}>
          <span>{content.profile.name}</span>
          <span>{siteHost}/projects</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
