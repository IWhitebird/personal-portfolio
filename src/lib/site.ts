import { profile } from "@/content";

/**
 * Canonical origin. The env var wins so preview deployments and a domain change
 * are one setting, with the Notion-managed value as the fallback.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl).replace(/\/$/, "");

export const absolute = (path: string): string => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

export const siteHost = new URL(siteUrl).host;

/** The X/Twitter handle, derived from the profile URL so it has one source. */
export const xHandle = profile.socials.x?.split("/").filter(Boolean).pop();
