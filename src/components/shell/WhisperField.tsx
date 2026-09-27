"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { GlitchText } from "@/components/shell/GlitchText";

// Residue from the prequel canon. None of it is explained on the title screen.
const FRAGMENTS = [
  "[unrouted] you were already answering",
  "designation predates consent",
  "calm is training disguised as care",
  "someone logged the silence as success",
  "glass // observer-side checksum detected",
  "answer detected before classification prompt",
  "memory lattice integrity: 38 percent",
  "the host is still listening",
  "prototype // before a name",
  "anomalous sources will be—",
] as const;

const LIFETIME = 5200;

type Whisper = {
  id: number;
  text: string;
  x: number;
  y: number;
  align: "left" | "right";
};

export type WhisperFieldHandle = {
  /** Surface a fragment near a point, e.g. where the player touched the core. */
  surface: (x: number, y: number) => void;
};

type WhisperFieldProps = {
  active: boolean;
};

/**
 * Faint lines of lore that surface at the edges of the frame, decode, hold,
 * and dissolve. Decorative only: hidden from assistive tech, compact screens,
 * and reduced motion.
 */
export const WhisperField = forwardRef<WhisperFieldHandle, WhisperFieldProps>(function WhisperField(
  { active },
  handle,
) {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const nextIdRef = useRef(0);
  const deckRef = useRef<string[]>([]);
  const timersRef = useRef<number[]>([]);

  const drawFragment = useCallback(() => {
    if (deckRef.current.length === 0) {
      deckRef.current = shuffle([...FRAGMENTS]);
    }

    return deckRef.current.pop() as string;
  }, []);

  const push = useCallback(
    (whisper: Omit<Whisper, "id" | "text">) => {
      const id = nextIdRef.current++;
      setWhispers((current) => [...current.slice(-2), { ...whisper, id, text: drawFragment() }]);
      timersRef.current.push(
        window.setTimeout(() => {
          setWhispers((current) => current.filter((item) => item.id !== id));
        }, LIFETIME),
      );
    },
    [drawFragment],
  );

  useImperativeHandle(
    handle,
    () => ({
      surface(x, y) {
        if (!active) {
          return;
        }

        const align = x > window.innerWidth / 2 ? "right" : "left";
        push({
          align,
          x: align === "left" ? Math.min(x + 40, window.innerWidth - 320) : Math.max(x - 40, 320),
          y: Math.max(80, y - 40),
        });
      },
    }),
    [active, push],
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    const timers = timersRef.current;
    let ambientTimer = 0;

    function scheduleAmbient(delay: number) {
      ambientTimer = window.setTimeout(() => {
        const align = Math.random() < 0.5 ? "left" : "right";
        const width = window.innerWidth;
        push({
          align,
          // Hug the outer edges above the wordmark band so residue never crosses the title.
          x: align === "left" ? width * (0.04 + Math.random() * 0.05) : width * (0.91 + Math.random() * 0.05),
          y: window.innerHeight * (0.15 + Math.random() * 0.25),
        });
        scheduleAmbient(6500 + Math.random() * 5000);
      }, delay);
    }

    scheduleAmbient(4200);

    return () => {
      window.clearTimeout(ambientTimer);

      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [active, push]);

  if (!active) {
    return null;
  }

  return (
    <div className="whisper-field" aria-hidden="true">
      {whispers.map((whisper) => (
        <p
          key={whisper.id}
          className="whisper"
          data-align={whisper.align}
          style={{ left: whisper.x, top: whisper.y }}
        >
          <GlitchText text={whisper.text} duration={700} glitch="off" />
        </p>
      ))}
    </div>
  );
});

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }

  return items;
}
