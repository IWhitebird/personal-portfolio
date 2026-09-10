"use client";

import { memo, useEffect, useRef } from "react";
import { chain, delay, spring, value } from "popmotion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { VisuallyHidden } from "./VisuallyHidden";

// Devanagari syllables of "श्रेयस पतंगे": the scramble resolves from his name in Marathi to his name in Latin.
const GLYPHS = ["श्रे", "य", "स", "प", "तं", "गे"];

type Char = { type: "glyph" | "value"; value: string };

function shuffle(content: string[], output: Char[], position: number): Char[] {
  return content.map((char, index) => {
    if (index < position) return { type: "value", value: char };
    if (char === " ") return { type: "value", value: " " };
    if (position % 1 < 0.5) {
      return { type: "glyph", value: GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "" };
    }
    return { type: "glyph", value: output[index]?.value ?? "" };
  });
}

type Props = {
  text: string;
  start?: boolean;
  delayMs?: number;
  className?: string;
};

function DecoderTextImpl({ text, start = true, delayMs = 300, className }: Props) {
  const container = useRef<HTMLSpanElement>(null);
  const output = useRef<Char[]>([]);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const content = text.split("");

    const render = () => {
      el.innerHTML = output.current
        .map((c) => `<span class="decoder-text__${c.type}">${c.value}</span>`)
        .join("");
    };

    // `usePrefersReducedMotion` is false on the first render, so the scramble can
    // already have mutated the DOM by the time it flips true. Writing the text
    // back is what stops a reduced-motion visitor being left with a name made of
    // Devanagari glyphs.
    if (reduceMotion || !start) {
      el.textContent = text;
      return;
    }

    output.current = content.map(() => ({ type: "glyph", value: "" }));
    const springValue = value(0, (position: number) => {
      output.current = shuffle(content, output.current, position);
      render();
    });

    const animation = chain(
      delay(delayMs),
      spring({ from: 0, to: content.length, stiffness: 8, damping: 5 }),
    ).start(springValue);

    return () => {
      animation.stop();
      // Interrupting mid-scramble must never leave a half-decoded name on screen.
      el.textContent = text;
    };
  }, [text, start, delayMs, reduceMotion]);

  // The resolved text is server-rendered so it paints before JS (LCP, no-JS). An invisible copy reserves the
  // final size while the animated glyphs are overlaid on top, so the wider Devanagari forms never shift layout.
  return (
    <span className={`decoder-text relative inline-block ${className ?? ""}`}>
      <VisuallyHidden>{text}</VisuallyHidden>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span
        aria-hidden
        ref={container}
        className="decoder-text__content absolute inset-0 whitespace-nowrap"
        suppressHydrationWarning
      >
        {text}
      </span>
    </span>
  );
}

export const DecoderText = memo(DecoderTextImpl);
