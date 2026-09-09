import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // pdfjs-dist optionally requires the Node "canvas" package; the browser build never needs it.
    resolveAlias: {
      canvas: "./src/lib/empty-module.ts",
    },
  },
};

export default config;
