/**
 * Canonical origin. Required, and deliberately not read from the CMS: these are
 * module constants that metadata, JSON-LD and the sitemap use synchronously,
 * and a preview deployment or a domain change is one environment variable.
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL;
if (!configured) throw new Error("NEXT_PUBLIC_SITE_URL is not set (for example https://iwhitebird.com)");

export const siteUrl = configured.replace(/\/$/, "");

export const siteHost = new URL(siteUrl).host;

/** Already-absolute URLs pass through: image sources are Blob URLs, not site paths. */
export const absolute = (path: string): string =>
  /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
