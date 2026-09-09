import { createHash } from "node:crypto";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const CMS_DIR = path.resolve("public/cms");
export const RESUME_PATH = path.resolve("public/resume.pdf");
const MAX_WIDTH = 1600;

/** Notion file URLs expire hourly but their S3 path is stable, so hash the path (query string excluded). */
export function stableKey(url: string): string {
  const { pathname } = new URL(url);
  return createHash("sha1").update(pathname).digest("hex").slice(0, 12);
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`download failed (${res.status}) for ${new URL(url).pathname}`);
  return Buffer.from(await res.arrayBuffer());
}

export type StoredImage = { src: string; width: number; height: number };

/** Downloads (once) and converts an image to a capped-width webp under public/cms. Idempotent by URL path. */
export async function storeImage(url: string): Promise<StoredImage> {
  await mkdir(CMS_DIR, { recursive: true });
  const file = path.join(CMS_DIR, `${stableKey(url)}.webp`);

  if (!(await exists(file))) {
    const input = await download(url);
    await sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
    console.log(`  + ${path.basename(file)}`);
  }

  const meta = await sharp(file).metadata();
  return { src: `/cms/${path.basename(file)}`, width: meta.width ?? MAX_WIDTH, height: meta.height ?? Math.round(MAX_WIDTH * 0.5) };
}

/** Always refreshes the résumé PDF: it is small and the filename is fixed. */
export async function storeResume(url: string): Promise<string> {
  const pdf = await download(url);
  await writeFile(RESUME_PATH, pdf);
  console.log(`  + resume.pdf (${Math.round(pdf.length / 1024)} KB)`);
  return "/resume.pdf";
}

/** Deletes files in public/cms that the new content no longer references. */
export async function pruneUnreferenced(referenced: Set<string>): Promise<number> {
  if (!(await exists(CMS_DIR))) return 0;
  let removed = 0;
  for (const name of await readdir(CMS_DIR)) {
    if (!referenced.has(`/cms/${name}`)) {
      await rm(path.join(CMS_DIR, name));
      removed += 1;
    }
  }
  return removed;
}
