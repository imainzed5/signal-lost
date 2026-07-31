"use client";

import { useCallback, useEffect, useRef } from "react";

import { CHAPTER1_AUDIO } from "./constants";
import type { MonologueEndingKey } from "./types";

export function useMemoryAudio() {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const baseRef = useRef<HTMLAudioElement | null>(null);
  const endingsRef = useRef<Record<MonologueEndingKey, HTMLAudioElement | null>>({
    default: null,
    "mirror-first": null,
    "mirror-last": null,
  });
  const endingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const ambient = new Audio(CHAPTER1_AUDIO.ambient);
    const base = new Audio(CHAPTER1_AUDIO.monologueBase);
    const endings: Record<MonologueEndingKey, HTMLAudioElement> = {
      default: new Audio(CHAPTER1_AUDIO.monologueEnd.default),
      "mirror-first": new Audio(CHAPTER1_AUDIO.monologueEnd["mirror-first"]),
      "mirror-last": new Audio(CHAPTER1_AUDIO.monologueEnd["mirror-last"]),
    };

    ambient.loop = true;
    ambient.preload = "auto";
    ambient.volume = 0.025;
    base.preload = "auto";
    base.volume = 0.68;

    for (const ending of Object.values(endings)) {
      ending.preload = "auto";
      ending.volume = 0.72;
    }

    ambientRef.current = ambient;
    baseRef.current = base;
    endingsRef.current = endings;

    return () => {
      if (endingTimerRef.current !== null) {
        window.clearTimeout(endingTimerRef.current);
      }

      for (const audio of [ambient, base, ...Object.values(endings)]) {
        audio.onended = null;
        audio.pause();
        audio.currentTime = 0;
      }

      ambientRef.current = null;
      baseRef.current = null;
      endingsRef.current = {
        default: null,
        "mirror-first": null,
        "mirror-last": null,
      };
    };
  }, []);

  const startAmbient = useCallback(() => {
    const ambient = ambientRef.current;

    if (!ambient || !ambient.paused) {
      return;
    }

    void ambient.play().catch(() => {
      // Playback is optional; a later user gesture can retry.
    });
  }, []);

  const stopMonologue = useCallback(() => {
    if (endingTimerRef.current !== null) {
      window.clearTimeout(endingTimerRef.current);
      endingTimerRef.current = null;
    }

    const base = baseRef.current;

    if (base) {
      base.onended = null;
      base.pause();
      base.currentTime = 0;
    }

    for (const ending of Object.values(endingsRef.current)) {
      if (ending) {
        ending.pause();
        ending.currentTime = 0;
      }
    }
  }, []);

  const playMonologue = useCallback(
    (endingKey: MonologueEndingKey) => {
      stopMonologue();
      const base = baseRef.current;
      const ending = endingsRef.current[endingKey];

      if (!base || !ending) {
        return;
      }

      base.onended = () => {
        endingTimerRef.current = window.setTimeout(() => {
          ending.currentTime = 0;
          void ending.play().catch(() => {
            // Text pacing remains authoritative when audio is unavailable.
          });
          endingTimerRef.current = null;
        }, 600);
      };

      base.currentTime = 0;
      void base.play().catch(() => {
        // Text pacing remains authoritative when autoplay is blocked.
      });
    },
    [stopMonologue],
  );

  return { playMonologue, startAmbient, stopMonologue };
}
