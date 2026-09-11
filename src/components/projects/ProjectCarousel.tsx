"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Project } from "@/lib/cms/schema";

type Props = { images: Project["images"]; name: string };

/**
 * Screenshots as a swipeable strip. The scrolling itself is native CSS
 * scroll-snap, so touch and trackpad gestures work with no JS and the images
 * stay visible when JS has not run yet; the arrows and dots only drive
 * `scrollTo`. Motion here answers a click, which is the one kind this site allows.
 */
export function ProjectCarousel({ images, name }: Props) {
  const strip = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const go = useCallback((index: number) => {
    const el = strip.current;
    const slide = el?.children[index] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  // Derive the active dot from the real scroll position rather than tracking it
  // in state, so a swipe and an arrow press stay in agreement.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setActive(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const last = images.length - 1;

  return (
    <figure className="mt-12">
      <div className="group relative overflow-hidden rounded-lg border border-line bg-surface">
        <ul
          ref={strip}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <li key={image.src} className="w-full shrink-0 snap-start">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1120px) 860px, 100vw"
                priority={i === 0}
                className="h-auto w-full"
              />
            </li>
          ))}
        </ul>

        {images.length > 1 ? (
          <>
            <Arrow side="left" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0} label={`Previous ${name} screenshot`} />
            <Arrow side="right" onClick={() => go(Math.min(last, active + 1))} disabled={active === last} label={`Next ${name} screenshot`} />
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Screenshot ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out-expo ${
                i === active ? "w-6 bg-accent" : "w-1.5 bg-line-strong hover:bg-muted"
              }`}
            />
          ))}
        </div>
      ) : null}

      {images[active]?.alt ? (
        <figcaption className="mt-3 text-center text-[13px] text-muted">{images[active]?.alt}</figcaption>
      ) : null}
    </figure>
  );
}

function Arrow({
  side,
  onClick,
  disabled,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-3" : "right-3"} grid h-9 w-9 place-items-center rounded-full border border-line bg-bg/80 text-fg-soft backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-0 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100`}
    >
      {side === "left" ? <FiChevronLeft size={17} /> : <FiChevronRight size={17} />}
    </button>
  );
}
