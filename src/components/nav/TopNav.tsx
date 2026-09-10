"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiMenu, FiX } from "react-icons/fi";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { SocialKey } from "@/lib/cms/schema";
import { Clock } from "./Clock";
import { SectionLink } from "./SectionLink";
import { ThemeToggle } from "./ThemeToggle";

export const NAV_SECTIONS = [
  { label: "Home", id: "home" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
] as const;

const BLOG = { label: "Blog", href: "/blog" } as const;

type Props = {
  name: string;
  socials: { key: SocialKey; label: string; href: string }[];
  /** The Blog link is hidden until something is published: an empty page reads worse than no link. */
  showBlog: boolean;
};

export function TopNav({ name, socials, showBlog }: Props) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  const onBlog = pathname.startsWith("/blog");
  const ease = [0.25, 1, 0.5, 1] as const;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The section crossing the upper-middle band of the viewport is "active".
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries.find((e) => e.isIntersecting);
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open || onBlog;
  const underline =
    "after:absolute after:-bottom-[19px] after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-accent after:transition-transform after:duration-500 after:ease-out-expo";

  return (
    <>
      {/* The bar is transparent until you scroll, so on its own the nav sat directly
          on the sphere. This scrim guarantees contrast whatever passes behind it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-bg via-bg/75 to-transparent"
      />
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ease-out-quart ${
          solid ? "glass border-line" : "border-transparent"
        }`}
      >
        <nav className="container-x flex h-14 items-center justify-between" aria-label="Primary">
          <SectionLink
            id="home"
            className={`text-[15px] font-medium text-fg transition-opacity duration-500 ease-out-quart ${
              solid ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {name}
          </SectionLink>

          <ul className="hidden items-center gap-7 md:flex">
            {NAV_SECTIONS.map(({ label, id }) => {
              const isActive = !onBlog && active === id;
              return (
                <li key={id}>
                  <SectionLink
                    id={id}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative text-[14px] transition-colors duration-200 hover:text-fg ${
                      isActive ? "text-fg" : "text-muted"
                    } ${underline} ${isActive ? "after:scale-x-100" : "after:scale-x-0"}`}
                  >
                    {label}
                  </SectionLink>
                </li>
              );
            })}
            {showBlog ? (
              <li>
              <Link
                href={BLOG.href}
                aria-current={onBlog ? "page" : undefined}
                className={`relative text-[14px] transition-colors duration-200 hover:text-fg ${
                  onBlog ? "text-fg" : "text-muted"
                } ${underline} ${onBlog ? "after:scale-x-100" : "after:scale-x-0"}`}
              >
                {BLOG.label}
              </Link>
              </li>
            ) : null}
          </ul>

          <div className="flex items-center gap-1.5">
            <Clock className="mr-2 hidden lg:inline" />
            <ThemeToggle />
            <button
              type="button"
              className="icon-btn md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-bg pt-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease }}
          >
            <ul className="container-x flex flex-col gap-1">
              {[...NAV_SECTIONS, ...(showBlog ? [{ label: BLOG.label, id: null }] : [])].map(({ label, id }, index) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease, delay: reduceMotion ? 0 : 0.04 * index }}
                >
                  {id ? (
                    <SectionLink
                      id={id}
                      onNavigate={() => setOpen(false)}
                      className={`display block py-3 text-[2.125rem] tracking-[-0.01em] ${
                        !onBlog && active === id ? "text-fg" : "text-muted"
                      }`}
                    >
                      {label}
                    </SectionLink>
                  ) : (
                    <Link
                      href={BLOG.href}
                      onClick={() => setOpen(false)}
                      className={`display block py-3 text-[2.125rem] tracking-[-0.01em] ${
                        onBlog ? "text-fg" : "text-muted"
                      }`}
                    >
                      {label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
            <div className="container-x mt-auto pb-10">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer me" className="link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <Clock />
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
