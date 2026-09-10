import "server-only";
import { createHash } from "node:crypto";
import { list, put } from "@vercel/blob";
import { imageSize } from "image-size";

/**
 * Notion's file URLs expire after about an hour, so they cannot be rendered
 * directly. Every screenshot is copied once into Vercel Blob under a name
 * derived from its content, then served through next/image, which handles
 * resizing and format conversion.
 *
 * Blobs are immutable: a different image in Notion gets a different name, so
 * nothing is ever overwritten and the CDN can cache them for a year.
 */

const PREFIX = "cms/";
const NAME = /^cms\/([0-9a-f]{12})_(\d+)x(\d+)\.([a-z0-9]+)$/;
const ONE_YEAR = 31_536_000;

export type StoredImage = { src: string; width: number; height: number };

/** Notion file URLs carry a signature; the S3 path is stable, so hash only that. */
export function stableKey(url: string): string {
  return createHash("sha1").update(new URL(url).pathname).digest("hex").slice(0, 12);
}

export function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * Deployments must have a store: rendering Notion's own URLs would break within
 * the hour when their signature expires. `bun dev` is allowed to do exactly
 * that, so the site runs from a clone with only the Notion keys.
 */
function requireBlob(): void {
  if (hasBlob()) return;
  if (process.env.NODE_ENV === "development") return;
  throw new Error(
    "Vercel Blob is not connected: no BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID. Connect a Blob store to the project, then run `vercel env pull .env.local` locally.",
  );
}

/** Notion's URLs expire, so this is dev-only. Dimensions are measured when reachable. */
function passthroughMirror(): (url: string) => Promise<StoredImage> {
  console.warn("[cms] no Blob store: serving Notion's temporary image URLs. Development only.");
  return async (url) => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const { width, height } = imageSize(Buffer.from(await res.arrayBuffer()));
      if (width && height) return { src: url, width, height };
    } catch {
      // Unreachable image host: fall through to a 16:9 guess. `h-auto` on every
      // call site means a wrong ratio costs layout shift, not a broken image.
    }
    return { src: url, width: 1600, height: 900 };
  };
}

/**
 * Reads the store once and returns a mirror function closed over the result, so
 * a regeneration costs one list call however many images it touches.
 */
export async function imageMirror(): Promise<(url: string) => Promise<StoredImage>> {
  requireBlob();
  if (!hasBlob()) return passthroughMirror();

  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });

  const known = new Map<string, Promise<StoredImage>>();
  for (const blob of blobs) {
    const match = NAME.exec(blob.pathname);
    if (!match) continue;
    const [, key, width, height] = match;
    if (key && width && height) {
      known.set(key, Promise.resolve({ src: blob.url, width: Number(width), height: Number(height) }));
    }
  }

  // Promises rather than values, so the same image referenced twice in one
  // regeneration is uploaded once.
  return function mirror(url: string): Promise<StoredImage> {
    const key = stableKey(url);
    let pending = known.get(key);
    if (!pending) {
      pending = upload(key, url);
      known.set(key, pending);
    }
    return pending;
  };
}

async function upload(key: string, url: string): Promise<StoredImage> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`image download failed (${res.status}) for ${new URL(url).pathname}`);
  const bytes = Buffer.from(await res.arrayBuffer());

  const { width, height, type } = imageSize(bytes);
  if (!width || !height) throw new Error(`could not read the dimensions of ${new URL(url).pathname}`);

  const extension = type === "jpg" ? "jpg" : (type ?? "bin");
  const blob = await put(`${PREFIX}${key}_${width}x${height}.${extension}`, bytes, {
    access: "public",
    addRandomSuffix: false,
    // The name is a content hash, so two regenerations racing write the same
    // bytes. Overwriting is cheaper than treating the collision as an error.
    allowOverwrite: true,
    contentType: res.headers.get("content-type") ?? `image/${extension}`,
    cacheControlMaxAge: ONE_YEAR,
  });

  return { src: blob.url, width, height };
}
