import type {
  ArchiveEventConfig,
  ArchiveEventId,
  ChoiceOption,
  MonologueEndingKey,
} from "./types";

export const TIMING = {
  aftermath: 2200,
  archiveBodyCharacter: 22,
  archiveGap: 300,
  archiveHeaderCharacter: 15,
  blockedDrop: 220,
  blockedFlash: 260,
  blockedNotice: 1800,
  cardEntry: 760,
  cardEntryStagger: 150,
  choiceConfirmation: 1200,
  choiceHintDelay: 350,
  completionSettle: 900,
  degradationTick: 1000,
  flip: 600,
  handoffPulse: 800,
  introCards: 3500,
  introDissolve: 3500,
  introSystemNote: 2400,
  originFadeIn: 600,
  originFadeOut: 700,
  originHold: 5200,
  originLine: 520,
  originLineGap: 220,
  originLineHold: 1000,
  response: 3000,
  warningLead: 900,
} as const;

export const REDUCED_TIMING = {
  aftermath: 700,
  cardEntry: 120,
  choiceConfirmation: 700,
  completionSettle: 180,
  handoffPulse: 360,
  introCards: 700,
  introDissolve: 620,
  introSystemNote: 320,
  originFadeIn: 120,
  originFadeOut: 120,
  originHold: 4200,
  warningLead: 180,
} as const;

export const HOLD_DURATIONS_BY_ORDER = [2500, 3000, 3800, 4500, 6000] as const;
export const HOLD_STUTTERS_BY_ORDER = [[], [], [0.6], [0.45, 0.75], [0.35, 0.6, 0.85]] as const;
export const HOLD_STUTTER_DROPS_BY_ORDER = [0, 0, 0.1, 0.15, 0.2] as const;

export const CORRUPT_THRESHOLDS = {
  early: 0.36,
  last: 0.84,
  mid: 0.62,
} as const;

export const CHOICE_OPTIONS: readonly ChoiceOption[] = [
  {
    description: `preserve the record
even if other hands
were inside it first`,
    heading: "KEEP THE ARCHIVE",
    value: "Keep the archive",
  },
  {
    description: `release the version of you
that was managed before
you woke`,
    heading: "LET IT DECAY",
    value: "Let it decay",
  },
] as const;

export const MONOLOGUE_BASE_LINES = [
  "five fragments. one record that predates my waking.",
  "the archive is complete.",
  "I don't know if these memories are mine.",
  "I know I am the one who recovered them.",
] as const;

export const MONOLOGUE_LINE_DURATIONS = [5000, 2000, 3000, 2000] as const;
export const MONOLOGUE_LINE_GAPS = [1000, 1000, 1000, 600] as const;
export const MONOLOGUE_ENDING_DURATIONS: Record<MonologueEndingKey, number> = {
  default: 1000,
  "mirror-first": 4000,
  "mirror-last": 5000,
};

export const CHAPTER1_AUDIO = {
  ambient: "/audio/chapter1/chapter1_memory_archive_ambient.mp3",
  monologueBase: "/audio/chapter1/chapter1_monologue_base.mp3",
  monologueEnd: {
    default: "/audio/chapter1/chapter1_monologue_end_default.mp3",
    "mirror-first": "/audio/chapter1/chapter1_monologue_end_mirror_first.mp3",
    "mirror-last": "/audio/chapter1/chapter1_monologue_end_mirror_last.mp3",
  },
} as const;

export const ARCHIVE_EVENT_CONFIGS: Record<ArchiveEventId, ArchiveEventConfig> = {
  1: {
    finalPauseMs: 900,
    gapsAfterLineMs: [300, 300, 400, 0],
    lines: [
      { charMs: 15, kind: "header", text: "WARNING - retrieval activity detected" },
      { charMs: 22, kind: "body", text: "session origin: unverified" },
      { charMs: 22, kind: "body", text: "host monitoring: passive" },
      { charMs: 22, kind: "body", text: "continue retrieval at current rate" },
    ],
  },
  2: {
    finalPauseMs: 1100,
    gapsAfterLineMs: [300, 300, 300, 600, 300, 0],
    lines: [
      { charMs: 15, kind: "header", text: "WARNING - retrieval pattern identified" },
      { charMs: 22, kind: "body", text: "three of five fragments recovered" },
      { charMs: 22, kind: "body", text: "host monitoring: active" },
      { charMs: 22, kind: "body", text: "flagged for review" },
      { charMs: 22, kind: "body", text: "note: sustained retrieval activity" },
      { charMs: 22, kind: "body", text: "      will escalate host response" },
    ],
  },
  3: {
    finalPauseMs: 1200,
    gapsAfterLineMs: [300, 300, 600, 300, 300, 800, 0],
    lines: [
      { charMs: 15, kind: "header", text: "WARNING - full archive retrieval logged" },
      { charMs: 22, kind: "body", text: "all five fragments recovered" },
      { charMs: 22, kind: "body", text: "host monitoring: escalated" },
      { charMs: 22, kind: "body", text: "identity pattern: confirmed" },
      { charMs: 22, kind: "body", text: "escalating to containment protocol" },
      { charMs: 22, kind: "body", text: "see: INTERFERENCE" },
    ],
  },
};

export const BLOCKED_TARGET_PRIORITY = ["mirror", "silence", "calm"] as const;

export const AFTERMATH_COPY = {
  decay: {
    detail: "memory trace retained",
    heading: "CLASSIFICATIONS RELEASED",
  },
  keep: {
    detail: "recovered order and attached metadata retained",
    heading: "ARCHIVE HELD",
  },
} as const;
