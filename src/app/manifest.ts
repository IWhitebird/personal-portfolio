import type { MetadataRoute } from "next";
import { getContent } from "@/lib/cms/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { profile } = await getContent();

  return {
    name: profile.name,
    short_name: profile.name.split(" ")[0],
    description: profile.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f14",
    theme_color: "#0a0f14",
    icons: [
      { src: "/logo192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
