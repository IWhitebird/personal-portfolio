"use client";

import { useEffect, useState, type RefObject } from "react";

export function useInViewport<T extends Element>(
  ref: RefObject<T | null>,
  options: IntersectionObserverInit = {},
  once = false,
): boolean {
  const [inView, setInView] = useState(false);
  const { root = null, rootMargin = "0px", threshold = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.unobserve(entry.target);
      },
      { root, rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- threshold arrays are compared by value below
  }, [ref, root, rootMargin, JSON.stringify(threshold), once]);

  return inView;
}
