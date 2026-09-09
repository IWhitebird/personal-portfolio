import { track as vercelTrack } from "@vercel/analytics";

/**
 * Custom events for the Vercel Analytics dashboard. The `<Analytics />` script
 * only loads on Vercel, so off-platform these calls are deliberate no-ops
 * rather than console noise.
 */
export type AnalyticsEvent =
  | "resume_view"
  | "resume_download"
  | "chat_open"
  | "chat_question"
  | "chat_message"
  | "project_open"
  | "social_open"
  | "contact_submit"
  | "theme_change"
  | "post_open";

type Properties = Record<string, string | number | boolean | null>;

export function track(event: AnalyticsEvent, properties?: Properties): void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_VERCEL_ENV) return;
  vercelTrack(event, properties);
}
