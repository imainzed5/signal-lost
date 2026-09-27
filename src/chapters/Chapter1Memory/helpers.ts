import { CORRUPT_THRESHOLDS } from "./constants";
import {
  memoryFragments,
  uninvitedFragment,
  type MemoryCorruptPriority,
  type MemoryFragment,
} from "./fragments";
import { clampNumber } from "./geometry";
import type { DegradationStage, MemorySegment, PressureBarState } from "./types";

export function createProgressMap(): Record<string, number> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, 0]),
  );
}

export function createBooleanMap(): Record<string, boolean> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, false]),
  );
}

export function createDegradationMap(): Record<string, DegradationStage> {
  return Object.fromEntries(memoryFragments.map((fragment) => [fragment.id, 0])) as Record<
    string,
    DegradationStage
  >;
}

export function resolveSegments(fragment: MemoryFragment): MemorySegment[] {
  const markers = fragment.corruptPhrases
    .map((phrase) => ({
      index: fragment.fullText.indexOf(phrase.text),
      priority: phrase.priority,
      text: phrase.text,
    }))
    .filter((marker) => marker.index >= 0)
    .sort((left, right) => left.index - right.index);

  if (markers.length === 0) {
    return [{ corrupt: false, text: fragment.fullText }];
  }

  const segments: MemorySegment[] = [];
  let cursor = 0;

  for (const marker of markers) {
    if (marker.index > cursor) {
      segments.push({ corrupt: false, text: fragment.fullText.slice(cursor, marker.index) });
    }

    segments.push({ corrupt: true, priority: marker.priority, text: marker.text });
    cursor = marker.index + marker.text.length;
  }

  if (cursor < fragment.fullText.length) {
    segments.push({ corrupt: false, text: fragment.fullText.slice(cursor) });
  }

  return segments;
}

export function resolveCorruptThreshold(
  fragmentId: string,
  priority: MemoryCorruptPriority,
) {
  if (fragmentId === "mirror" && priority === "last") {
    return 0.96;
  }

  return CORRUPT_THRESHOLDS[priority];
}

export function toCorruptionMask(text: string, seed: string) {
  const glyphs = ["█", "▓", "▒"];
  const hash = hashString(seed);

  return text
    .split(/(\s+)/)
    .map((token, tokenIndex) => {
      if (!token || /^\s+$/.test(token)) {
        return token;
      }

      const punctuation = token.match(/[.,!?;:]+$/)?.[0] ?? "";
      const core = punctuation ? token.slice(0, -punctuation.length) : token;

      if (!/[A-Za-z]/.test(core)) {
        return token;
      }

      const glyph = glyphs[(hash + tokenIndex) % glyphs.length];
      const masked = core.length <= 4 ? glyph.repeat(core.length) : `${glyph}[ERR]${glyph}`;
      return `${masked}${punctuation}`;
    })
    .join("");
}

export function resolveDegradationStage(elapsedMs: number): DegradationStage {
  if (elapsedMs >= 30000) {
    return 3;
  }

  if (elapsedMs >= 19000) {
    return 2;
  }

  if (elapsedMs >= 9000) {
    return 1;
  }

  return 0;
}

export function buildPressureBar(
  stabilizedCount: number,
  hasDegradationPressure: boolean,
): PressureBarState {
  const totalSegments = 10;
  const filledSegments = clampNumber(stabilizedCount * 2, 0, totalSegments);

  return {
    filledSegments,
    hasDegradationPressure: hasDegradationPressure && filledSegments < totalSegments,
    totalSegments,
  };
}

export function resolveBlockedTarget(stabilizedIds: readonly string[]) {
  for (const candidateId of ["mirror", "silence", "calm"] as const) {
    if (!stabilizedIds.includes(candidateId)) {
      return candidateId;
    }
  }

  return memoryFragments.find((fragment) => !stabilizedIds.includes(fragment.id))?.id ?? null;
}

const EROSION_BY_STAGE = [0, 0.16, 0.34, 0.54] as const;

/** Neglected plates lose words to frost, deterministically, deeper with each stage. */
export function isWordEroded(seed: string, stage: DegradationStage) {
  return (hashString(seed) % 1000) / 1000 < EROSION_BY_STAGE[stage];
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}
