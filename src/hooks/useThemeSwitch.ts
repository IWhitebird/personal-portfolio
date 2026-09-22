"use client";

import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

export type Theme = "light" | "dark";

/**
 * Switches theme behind a View Transition, so the whole page cross-fades as one
 * frame: images and the WebGL sphere included, which per-property CSS
 * transitions can never do, and with nothing fading on its own clock. The
 * provider keeps `disableTransitionOnChange`, which is what lets the new state
 * settle instantly for a clean second snapshot; the fade itself is the
 * browser's. Plain switch when the API is missing or motion is reduced.
 */
export function useThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();

  const switchTheme = useCallback(
    (next: Theme) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || typeof document.startViewTransition !== "function") {
        setTheme(next);
        return;
      }
      // next-themes applies the class in an effect. flushSync commits that
      // inside the callback, which is where the browser expects the DOM change.
      document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
    },
    [setTheme],
  );

  return { resolvedTheme, switchTheme };
}
