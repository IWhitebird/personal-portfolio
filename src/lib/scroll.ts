const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Scrolls a section into view. `scroll-margin-top` in globals.css keeps it clear
 * of the fixed nav, so the only thing decided here is whether to animate.
 */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia(REDUCED).matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return true;
}
