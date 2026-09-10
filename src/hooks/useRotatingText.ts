"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Options = {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  startDelayMs?: number;
};

/**
 * Types each string out, holds, deletes it, and moves to the next one.
 * With reduced motion, shows the first string statically.
 */
export function useRotatingText(items: string[], opts: Options = {}) {
  const { typeMs = 38, deleteMs = 18, holdMs = 2600, startDelayMs = 900 } = opts;
  const reduce = usePrefersReducedMotion();
  const [state, setState] = useState({ text: "", typing: false });

  useEffect(() => {
    if (items.length === 0 || reduce) return;

    let index = 0;
    let pos = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = items[index];
      if (!current) return;
      if (!deleting) {
        pos += 1;
        const done = pos >= current.length;
        setState({ text: current.slice(0, pos), typing: !done });
        if (done) {
          deleting = true;
          timer = setTimeout(tick, holdMs);
          return;
        }
        timer = setTimeout(tick, typeMs);
      } else {
        pos -= 1;
        setState({ text: current.slice(0, pos), typing: false });
        if (pos <= 0) {
          deleting = false;
          index = (index + 1) % items.length;
          timer = setTimeout(tick, 300);
          return;
        }
        timer = setTimeout(tick, deleteMs);
      }
    };

    timer = setTimeout(tick, startDelayMs);
    return () => clearTimeout(timer);
  }, [items, reduce, typeMs, deleteMs, holdMs, startDelayMs]);

  if (reduce) return { text: items[0] ?? "", typing: false };
  return state;
}
