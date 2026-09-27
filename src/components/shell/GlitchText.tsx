"use client";

import { useEffect, useState } from "react";

// ASCII only: every glyph must exist in IBM Plex Mono or the fallback font breaks the rhythm.
const NOISE_GLYPHS = "#%&*+=<>/\\|?!01_-:;";

type GlitchTextProps = {
  text: string;
  className?: string;
  /** Delay before the decode begins, in ms. */
  delay?: number;
  /** Total decode duration, in ms. */
  duration?: number;
  glitch?: "off" | "live" | "burst";
  reducedMotion?: boolean;
};

/**
 * Text that arrives as noise and resolves left to right, then keeps a pair of
 * channel ghosts that tear apart in short bursts.
 */
export function GlitchText({
  text,
  className = "",
  delay = 0,
  duration = 1100,
  glitch = "live",
  reducedMotion = false,
}: GlitchTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frame = 0;
    let start: number | null = null;

    function tick(now: number) {
      if (start === null) {
        start = now + delay;
      }

      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      const resolved = Math.floor(progress * text.length);

      setDisplay(
        Array.from(text, (character, index) => {
          if (character === " " || index < resolved) {
            return character;
          }

          return NOISE_GLYPHS[Math.floor(Math.random() * NOISE_GLYPHS.length)];
        }).join(""),
      );

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [delay, duration, reducedMotion, text]);

  const shown = reducedMotion ? text : display;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        className={`glitch-text ${className}`}
        data-text={shown}
        data-glitch={reducedMotion ? "off" : glitch}
        aria-hidden="true"
      >
        {shown}
      </span>
    </>
  );
}
