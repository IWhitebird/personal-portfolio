import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Content is fetched from Notion at render time and held in a cache that
  // revalidates hourly, so pages stay prerendered without a deploy.
  cacheComponents: true,
  cacheLife: {
    cms: {
      stale: 300,
      revalidate: 3600,
      // A month: if Notion is unreachable at regeneration the last good
      // snapshot keeps serving instead of the site going blank.
      expire: 2_592_000,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Screenshots are mirrored into Vercel Blob under cms/ by src/lib/cms/blob.ts.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/cms/**" },
      // Without a Blob store, dev serves Notion's own URLs (see passthroughMirror).
      ...(process.env.NODE_ENV === "development"
        ? [{ protocol: "https" as const, hostname: "**" }]
        : []),
    ],
  },
  turbopack: {
    // pdfjs-dist optionally requires the Node "canvas" package; the browser build never needs it.
    resolveAlias: {
      canvas: "./src/lib/empty-module.ts",
    },
  },
};

export default config;
