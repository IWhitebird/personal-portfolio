import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getContent } from "./content";

/**
 * Google Drive share links open an HTML viewer, not the file. Rewrite the usual
 * forms (/file/d/<id>/view, open?id=, uc?id=) to the direct-download endpoint.
 * Anything that is not a Drive link is returned untouched.
 */
export function directDownloadUrl(url: string): string {
  if (!/drive\.google\.com/.test(url)) return url;
  const id = /\/d\/([A-Za-z0-9_-]+)/.exec(url)?.[1] ?? /[?&]id=([A-Za-z0-9_-]+)/.exec(url)?.[1];
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

/**
 * The PDF itself lives in the owner's public Drive folder and its link lives in
 * Notion, so replacing the file there is the whole update. The site holds the
 * bytes in the cache and serves them from its own origin, which keeps Drive out
 * of a visitor's request path and lets react-pdf load the file without CORS.
 */
export async function getResumePdf(): Promise<ArrayBuffer> {
  "use cache: remote";
  cacheLife("cms");
  cacheTag("cms");

  const { profile } = await getContent();
  const res = await fetch(directDownloadUrl(profile.resume.sourceUrl), { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`résumé download failed (${res.status})`);

  const bytes = await res.arrayBuffer();
  // Drive answers an unshared file with an HTML page rather than a 404.
  if (new TextDecoder().decode(new Uint8Array(bytes, 0, 5)) !== "%PDF-") {
    throw new Error("the résumé URL did not return a PDF. Is the Drive file shared with anyone who has the link?");
  }
  return bytes;
}
