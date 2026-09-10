import { getContent } from "@/lib/cms/content";
import { directDownloadUrl, getResumePdf } from "@/lib/cms/resume";
import { RESUME_FILENAME } from "@/lib/resume";

/**
 * Serves the résumé from the site's own origin. The bytes come from the owner's
 * Google Drive through a cached fetch, so replacing the file there is the whole
 * update, and the in-page viewer loads it without needing CORS.
 *
 * `s-maxage` lets Vercel's CDN answer repeat requests without running this at all.
 */
export async function GET(): Promise<Response> {
  try {
    const pdf = await getResumePdf();

    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${RESUME_FILENAME}"`,
        "content-length": String(pdf.byteLength),
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    // Drive unreachable or the link no longer shared. Hand the visitor straight
    // to the source rather than failing: a download still works, and a build is
    // never blocked by someone else's outage. The viewer falls back to its
    // open-directly link because the redirect is cross-origin.
    const { profile } = await getContent();
    console.error("[resume] serving the Drive link directly:", err instanceof Error ? err.message : err);

    return Response.redirect(directDownloadUrl(profile.resume.sourceUrl), 307);
  }
}
