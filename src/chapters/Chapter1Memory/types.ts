import type { CSSProperties } from "react";

import type { MemoryCorruptPriority } from "./fragments";

export type SceneChoiceBridge = {
  continueChapterId?: number | null;
  continueHref?: string;
  continueLabel?: string;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  onReplay?: () => void;
  selectedValue: string | null;
};

export type Chapter1MemoryProps = {
  onComplete: () => void;
  sceneChoice?: SceneChoiceBridge;
};

export type IntroPhase =
  | "idle"
  | "text-beat"
  | "system-note"
  | "dissolve"
  | "cards-arriving"
  | "active";

export type CompletionPhase =
  | "active"
  | "field-settling"
  | "origin"
  | "monologue"
  | "choice";

export type ChoiceUiPhase = "idle" | "aftermath" | "confirmation" | "continue";
export type OriginPhase = "hidden" | "entering" | "holding" | "exiting";
export type ArchiveEventId = 1 | 2 | 3;
export type DegradationStage = 0 | 1 | 2 | 3;
export type HoldMode = "blocked" | "standard" | "uninvited";
export type MonologueEndingKey = "default" | "mirror-first" | "mirror-last";
export type AftermathKind = "keep" | "decay" | null;

export type MemorySegment = {
  corrupt: boolean;
  priority?: MemoryCorruptPriority;
  text: string;
};

export type ArchiveEventLine = {
  charMs: number;
  kind: "body" | "header";
  text: string;
};

export type ArchiveEventConfig = {
  finalPauseMs: number;
  gapsAfterLineMs: readonly number[];
  lines: readonly ArchiveEventLine[];
};

export type ChoiceOption = {
  description: string;
  heading: string;
  value: "Keep the archive" | "Let it decay";
};

export type HoldDropAnimation = {
  durationMs: number;
  from: number;
  startedAt: number;
  to: number;
};

export type HoldSession = {
  cardId: string;
  drop: HoldDropAnimation | null;
  durationMs: number;
  lastFrameAt: number | null;
  mode: HoldMode;
  orderIndex: number;
  progress: number;
  standardElapsedMs: number;
  triggeredThresholds: number[];
};

export type MemoryCardStyle = CSSProperties & {
  "--card-idle-left": string;
  "--card-idle-rotate": string;
  "--card-idle-top": string;
  "--card-settled-left": string;
  "--card-settled-rotate": string;
  "--card-settled-top": string;
  "--card-z": string;
  "--compact-index": string;
  "--compact-settled-left": string;
  "--compact-top": string;
  "--entry-delay": string;
  "--entry-offset-y": string;
  "--recovery-index": string;
  "--stabilize-progress": string;
};

export type PressureBarState = {
  filledSegments: number;
  hasDegradationPressure: boolean;
  totalSegments: number;
};
