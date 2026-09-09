"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { scrollToSection } from "@/lib/scroll";

type Props = {
  id: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  "aria-current"?: "location";
};

/**
 * Anchor to a section of the home page. The router jumps straight to a hash, so
 * on the home page the scroll is done here instead and the hash pushed after.
 * From any other route it stays a normal client-side navigation.
 */
export function SectionLink({ id, children, className, onNavigate, ...rest }: Props) {
  const onHome = usePathname() === "/";

  if (!onHome) {
    return (
      <Link href={`/#${id}`} className={className} onClick={onNavigate} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!scrollToSection(id)) return;
        event.preventDefault();
        onNavigate?.();
        history.pushState(null, "", `#${id}`);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
