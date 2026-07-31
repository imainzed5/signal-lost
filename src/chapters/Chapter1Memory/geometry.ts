import type { CSSProperties } from "react";

import type { MemoryFragment } from "./fragments";
import type { MemoryCardStyle } from "./types";

const desktopCentersById: Record<string, { left: number; top: number }> = {
  calm: { left: 77, top: 23 },
  glass: { left: 18, top: 28 },
  mirror: { left: 58, top: 49 },
  prototype: { left: 38, top: 15 },
  silence: { left: 26, top: 58 },
};

const compactLayerOrder: Record<string, number> = {
  prototype: 0,
  calm: 1,
  glass: 2,
  mirror: 3,
  silence: 4,
};

const compactRotationById: Record<string, number> = {
  calm: 1.4,
  glass: -1.6,
  mirror: -0.8,
  prototype: 1.2,
  silence: 0.9,
};

export function buildMemoryCardStyle({
  fragment,
  fragmentIndex,
  progress,
  recoveryIndex,
}: {
  fragment: MemoryFragment;
  fragmentIndex: number;
  progress: number;
  recoveryIndex: number;
}): MemoryCardStyle {
  const desktop = desktopCentersById[fragment.id] ?? {
    left: clampNumber(fragment.idle.left + 8, 14, 86),
    top: clampNumber(fragment.idle.top, 12, 64),
  };
  const settledIndex = recoveryIndex >= 0 ? recoveryIndex : fragmentIndex;
  const settledLeft = 12 + settledIndex * 19;
  const settledRotate = [-1.1, -0.5, 0, 0.5, 1.1][settledIndex] ?? 0;

  return {
    "--card-idle-left": `${desktop.left}%`,
    "--card-idle-rotate": `${fragment.idle.rotate}deg`,
    "--card-idle-top": `${desktop.top}%`,
    "--card-settled-left": `${settledLeft}%`,
    "--card-settled-rotate": `${settledRotate}deg`,
    "--card-settled-top": `${18 + Math.abs(2 - settledIndex) * 1.4}%`,
    "--card-z": `${fragment.baseZIndex}`,
    "--compact-index": `${compactLayerOrder[fragment.id] ?? fragmentIndex}`,
    "--compact-rotate": `${compactRotationById[fragment.id] ?? 0}deg`,
    "--compact-settled-left": `${18 + Math.max(settledIndex, 0) * 16}%`,
    "--compact-top": `${12 + (compactLayerOrder[fragment.id] ?? fragmentIndex) * 7.3}%`,
    "--entry-delay": `${fragmentIndex * 150}ms`,
    "--entry-offset-y": `${fragment.entryOffsetY}px`,
    "--recovery-index": `${Math.max(recoveryIndex, 0)}`,
    "--stabilize-progress": `${clampNumber(progress, 0, 1)}`,
  } as MemoryCardStyle & CSSProperties;
}

export function buildUninvitedStyle(progress: number, exiting: boolean): CSSProperties {
  return {
    "--stabilize-progress": `${clampNumber(progress, 0, 1)}`,
    "--uninvited-transition": exiting ? "900ms" : "1100ms",
  } as CSSProperties;
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
