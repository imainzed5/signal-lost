"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  HOLD_DURATIONS_BY_ORDER,
  HOLD_STUTTER_DROPS_BY_ORDER,
  HOLD_STUTTERS_BY_ORDER,
  TIMING,
} from "./constants";
import { clampNumber } from "./geometry";
import type { HoldMode, HoldSession } from "./types";

type MemoryHoldOptions = {
  getMode: (cardId: string) => HoldMode | null;
  getOrderIndex: () => number;
  onActiveChange: (cardId: string | null) => void;
  onComplete: (cardId: string, interactionAt: number) => void;
  onInterrupted: (cardId: string, progress: number) => void;
  onProgress: (cardId: string, progress: number) => void;
  onRejected: (cardId: string, mode: Exclude<HoldMode, "standard">) => void;
  onStutter: (cardId: string, active: boolean) => void;
};

export function useMemoryHold({
  getMode,
  getOrderIndex,
  onActiveChange,
  onComplete,
  onInterrupted,
  onProgress,
  onRejected,
  onStutter,
}: MemoryHoldOptions) {
  const frameRef = useRef<number | null>(null);
  const sessionRef = useRef<HoldSession | null>(null);
  const stepRef = useRef<(timestamp: number) => void>(() => undefined);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const step = useCallback(
    (timestamp: number) => {
      const session = sessionRef.current;

      if (!session) {
        frameRef.current = null;
        return;
      }

      if (session.lastFrameAt === null) {
        session.lastFrameAt = timestamp;
        frameRef.current = window.requestAnimationFrame((nextTimestamp) => {
          stepRef.current(nextTimestamp);
        });
        return;
      }

      const deltaMs = Math.min(timestamp - session.lastFrameAt, 80);
      session.lastFrameAt = timestamp;
      let nextProgress = session.progress;

      if (session.drop) {
        const ratio = (timestamp - session.drop.startedAt) / session.drop.durationMs;
        nextProgress = session.drop.from + (session.drop.to - session.drop.from) * clampNumber(ratio, 0, 1);

        if (ratio >= 1) {
          session.drop = null;
          onStutter(session.cardId, false);
        }
      } else if (session.mode === "standard") {
        session.standardElapsedMs += deltaMs;
        const baseProgress = clampNumber(session.standardElapsedMs / session.durationMs, 0, 1);
        const thresholds = HOLD_STUTTERS_BY_ORDER[session.orderIndex] ?? [];
        const nextThreshold = thresholds[session.triggeredThresholds.length];

        if (nextThreshold !== undefined && baseProgress >= nextThreshold) {
          const drop = HOLD_STUTTER_DROPS_BY_ORDER[session.orderIndex] ?? 0;
          session.triggeredThresholds.push(nextThreshold);
          session.drop = {
            durationMs: 360,
            from: baseProgress,
            startedAt: timestamp,
            to: Math.max(0, baseProgress - drop),
          };
          onStutter(session.cardId, true);
          nextProgress = baseProgress;
        } else {
          nextProgress = baseProgress;
        }

        if (baseProgress >= 1) {
          const cardId = session.cardId;
          sessionRef.current = null;
          frameRef.current = null;
          onProgress(cardId, 1);
          onStutter(cardId, false);
          onActiveChange(null);
          onComplete(cardId, timestamp);
          return;
        }
      } else {
        nextProgress += deltaMs / session.durationMs;
        const ceiling = session.mode === "blocked" ? 0.34 : 0.42;

        if (nextProgress >= ceiling) {
          session.drop = {
            durationMs: session.mode === "blocked" ? TIMING.blockedDrop : 300,
            from: ceiling,
            startedAt: timestamp,
            to: 0,
          };
          nextProgress = ceiling;
          onStutter(session.cardId, true);
          onRejected(session.cardId, session.mode);
        }
      }

      session.progress = clampNumber(nextProgress, 0, 1);
      onProgress(session.cardId, session.progress);
      frameRef.current = window.requestAnimationFrame((nextTimestamp) => {
        stepRef.current(nextTimestamp);
      });
    },
    [onActiveChange, onComplete, onProgress, onRejected, onStutter],
  );

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const release = useCallback(
    (cardId: string) => {
      const session = sessionRef.current;

      if (!session || session.cardId !== cardId) {
        return;
      }

      sessionRef.current = null;
      cancelFrame();
      if (session.mode === "standard" && session.progress > 0.04 && session.progress < 1) {
        onInterrupted(cardId, session.progress);
      }
      onProgress(cardId, 0);
      onStutter(cardId, false);
      onActiveChange(null);
    },
    [cancelFrame, onActiveChange, onInterrupted, onProgress, onStutter],
  );

  const start = useCallback(
    (cardId: string) => {
      const mode = getMode(cardId);

      if (!mode) {
        return;
      }

      if (sessionRef.current?.cardId === cardId) {
        return;
      }

      if (sessionRef.current) {
        release(sessionRef.current.cardId);
      }

      const orderIndex = clampNumber(getOrderIndex(), 0, HOLD_DURATIONS_BY_ORDER.length - 1);
      sessionRef.current = {
        cardId,
        drop: null,
        durationMs:
          mode === "standard"
            ? (HOLD_DURATIONS_BY_ORDER[orderIndex] ?? HOLD_DURATIONS_BY_ORDER[0])
            : mode === "blocked"
              ? 1800
              : 1600,
        lastFrameAt: null,
        mode,
        orderIndex,
        progress: 0,
        standardElapsedMs: 0,
        triggeredThresholds: [],
      };

      onProgress(cardId, 0);
      onActiveChange(cardId);
      cancelFrame();
      frameRef.current = window.requestAnimationFrame((timestamp) => {
        stepRef.current(timestamp);
      });
    },
    [cancelFrame, getMode, getOrderIndex, onActiveChange, onProgress, release],
  );

  const cancelAll = useCallback(() => {
    const cardId = sessionRef.current?.cardId ?? null;
    sessionRef.current = null;
    cancelFrame();

    if (cardId) {
      onProgress(cardId, 0);
      onStutter(cardId, false);
    }

    onActiveChange(null);
  }, [cancelFrame, onActiveChange, onProgress, onStutter]);

  useEffect(() => cancelAll, [cancelAll]);

  return { cancelAll, release, start };
}
