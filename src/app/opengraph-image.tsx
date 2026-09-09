import { ImageResponse } from "next/og";
import { experience, profile } from "@/content";
import { siteHost } from "@/lib/site";

export const alt = `${profile.name}: ${profile.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const current = experience.find((e) => e.end === null);

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
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#8b98a5" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#00ddff" }} />
          {current ? `${current.role} at ${current.company}` : profile.headline}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ fontSize: 34, color: "#c3cdd6", lineHeight: 1.3, maxWidth: 900 }}>{profile.headline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#8b98a5" }}>
          <span>{siteHost}</span>
          <span style={{ color: "#00ddff" }}>{">"} ask the assistant</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
