"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef } from "react";

type TypeLinesOptions = {
  characterMs?: number;
  group: string;
  gapsMs?: readonly number[];
  lineDurationsMs?: readonly number[];
  lines: readonly string[];
  onComplete: () => void;
  setLines: Dispatch<SetStateAction<string[]>>;
};

export function useMemorySequence(prefersReducedMotion: boolean) {
  const timerGroupsRef = useRef<Map<string, Set<number>>>(new Map());

  const clearGroup = useCallback((group: string) => {
    const timers = timerGroupsRef.current.get(group);

    if (!timers) {
      return;
    }

    for (const timer of timers) {
      window.clearTimeout(timer);
    }

    timerGroupsRef.current.delete(group);
  }, []);

  const schedule = useCallback((group: string, callback: () => void, delayMs: number) => {
    const timers = timerGroupsRef.current.get(group) ?? new Set<number>();
    timerGroupsRef.current.set(group, timers);

    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, Math.max(0, delayMs));

    timers.add(timer);
    return timer;
  }, []);

  const typeLines = useCallback(
    ({
      characterMs = 22,
      gapsMs = [],
      group,
      lineDurationsMs,
      lines,
      onComplete,
      setLines,
    }: TypeLinesOptions) => {
      clearGroup(group);
      setLines(lines.map(() => ""));

      let offsetMs = 0;

      lines.forEach((line, lineIndex) => {
        const authoredDuration = lineDurationsMs?.[lineIndex] ?? line.length * characterMs;
        const durationMs = prefersReducedMotion
          ? Math.min(Math.max(authoredDuration * 0.18, 260), 760)
          : authoredDuration;

        if (prefersReducedMotion) {
          schedule(group, () => {
            setLines((current) => {
              const next = [...current];
              next[lineIndex] = line;
              return next;
            });
          }, offsetMs);
        } else {
          const characterDuration = line.length > 0 ? durationMs / line.length : 0;

          for (let characterIndex = 0; characterIndex <= line.length; characterIndex += 1) {
            schedule(group, () => {
              setLines((current) => {
                const next = [...current];
                next[lineIndex] = line.slice(0, characterIndex);
                return next;
              });
            }, offsetMs + characterIndex * characterDuration);
          }
        }

        const gapMs = gapsMs[lineIndex] ?? 0;
        offsetMs += durationMs + (prefersReducedMotion ? Math.min(gapMs, 320) : gapMs);
      });

      schedule(group, onComplete, offsetMs);
    },
    [clearGroup, prefersReducedMotion, schedule],
  );

  useEffect(() => {
    const groups = timerGroupsRef.current;

    return () => {
      for (const timers of groups.values()) {
        for (const timer of timers) {
          window.clearTimeout(timer);
        }
      }

      groups.clear();
    };
  }, []);

  return { clearGroup, schedule, typeLines };
}
