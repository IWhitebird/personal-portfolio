"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean | null>;
  children: ReactNode;
};

/** Anchor that reports the click to Vercel Analytics. Internal hrefs stay client-routed. */
export function TrackedLink({ href, event, properties, children, ...rest }: Props) {
  const report = () => track(event, properties);
  const internal = href.startsWith("/") && !href.startsWith("//");

  if (internal) {
    return (
      <Link href={href} onClick={report} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={report} {...rest}>
      {children}
    </a>
  );
}
