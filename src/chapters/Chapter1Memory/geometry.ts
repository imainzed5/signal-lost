import type { CSSProperties } from "react";

import type { MemoryFragment } from "./fragments";
import type { MemoryCardStyle } from "./types";

type PlateAnchor = {
  /** rotateY toward the core, in degrees */
  ry: number;
  /** rotateZ hang angle, in degrees */
  rz: number;
  /** horizontal offset from the volume centre, in vw */
  x: number;
  /** vertical offset from the volume centre, in vh */
  y: number;
  /** depth, in px (negative = further into the fog) */
  z: number;
};

// Plates hang in the darkroom around SABLE's core, each at its own depth.
const desktopAnchors: Record<string, PlateAnchor> = {
  calm: { ry: -18, rz: 2, x: 33, y: -16, z: -260 },
  glass: { ry: 22, rz: 1.5, x: -35, y: -10, z: -170 },
  mirror: { ry: -14, rz: -1.5, x: 22, y: 18, z: -30 },
  prototype: { ry: 12, rz: -2, x: -15, y: -22, z: -340 },
  silence: { ry: 14, rz: -1, x: -13, y: 21, z: 10 },
};

// Compact: a vertical depth corridor. Plates recede toward the core at the top.
const compactAnchors: Record<string, PlateAnchor> = {
  prototype: { ry: 0, rz: 1.2, x: -7, y: -29, z: -560 },
  calm: { ry: 0, rz: -1.4, x: 8, y: -16, z: -400 },
  glass: { ry: 0, rz: 1.6, x: -7, y: -2, z: -260 },
  mirror: { ry: 0, rz: -0.8, x: 6, y: 13, z: -130 },
  silence: { ry: 0, rz: 0.9, x: -3, y: 28, z: 0 },
};

export function buildMemoryCardStyle({
  decay,
  fragment,
  fragmentIndex,
  progress,
  pull,
  recoveryIndex,
}: {
  decay: number;
  fragment: MemoryFragment;
  fragmentIndex: number;
  progress: number;
  pull: number;
  recoveryIndex: number;
}): MemoryCardStyle {
  const desktop = desktopAnchors[fragment.id] ?? {
    ry: 0,
    rz: fragment.idle.rotate,
    x: clampNumber(fragment.idle.left - 50, -36, 36),
    y: clampNumber(fragment.idle.top - 40, -24, 24),
    z: -200,
  };
  const compact = compactAnchors[fragment.id] ?? { ...desktop, ry: 0, x: 0 };
  const settledIndex = recoveryIndex >= 0 ? recoveryIndex : fragmentIndex;
  const arc = settledIndex - 2;

  return {
    "--c-ry": `${compact.ry}deg`,
    "--c-rz": `${compact.rz}deg`,
    "--c-x": `${compact.x}vw`,
    "--c-y": `${compact.y}vh`,
    "--c-z": `${compact.z}px`,
    "--c-fog": `${resolveDepthFog(compact.z, 720)}`,
    "--c-rank": `${resolveDepthRank(compact.z)}`,
    "--decay": `${decay}`,
    "--entry-delay": `${fragmentIndex * 150}ms`,
    "--f-ry": `${-arc * 9}deg`,
    "--f-rz": `${arc * 0.6}deg`,
    "--f-x": `${arc * 18}vw`,
    "--f-y": `${-19 + Math.abs(arc) * 3}vh`,
    "--f-z": `${-420 - Math.abs(arc) * 60}px`,
    "--f-rank": `${resolveDepthRank(-420 - Math.abs(arc) * 60)}`,
    "--fc-x": `${arc * 17}vw`,
    "--fc-y": `${-27 + Math.abs(arc) * 2}vh`,
    "--fc-z": `${-520}px`,
    "--h-ry": `${desktop.ry}deg`,
    "--h-rz": `${desktop.rz}deg`,
    "--h-x": `${desktop.x}vw`,
    "--h-y": `${desktop.y}vh`,
    "--h-z": `${desktop.z}px`,
    "--h-fog": `${resolveDepthFog(desktop.z, 560)}`,
    "--h-rank": `${resolveDepthRank(desktop.z)}`,
    "--pull": `${clampNumber(pull, 0, 1).toFixed(3)}`,
    // Depth leads the slide so a drawn plate clears its neighbours early.
    "--pull-z": `${(1 - Math.pow(1 - clampNumber(pull, 0, 1), 2)).toFixed(3)}`,
    "--recovery-index": `${Math.max(recoveryIndex, 0)}`,
    "--stabilize-progress": `${clampNumber(progress, 0, 1)}`,
  } as MemoryCardStyle;
}

/** Deeper plates sit further inside the steel haze. */
function resolveDepthFog(z: number, range: number) {
  return clampNumber(-z / range, 0, 0.72).toFixed(3);
}

/**
 * Chrome hit-tests plates in stacking order rather than 3D depth, so each plate's
 * z-index mirrors its depth: nearer plates must win the pointer.
 */
function resolveDepthRank(z: number) {
  return Math.round(clampNumber(1000 + z, 1, 1400));
}

/** How far a plate is drawn out of the fog toward the core while it develops. */
export function resolvePlatePull({
  held,
  progress,
  responding,
}: {
  held: boolean;
  progress: number;
  responding: boolean;
}) {
  if (responding) {
    return 1;
  }

  if (!held) {
    return 0;
  }

  const eased = 1 - Math.pow(1 - clampNumber(progress, 0, 1), 2.2);
  return 0.2 + eased * 0.8;
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
