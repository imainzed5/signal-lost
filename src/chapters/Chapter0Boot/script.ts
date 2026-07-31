export type BootLineTone = "system" | "warning" | "sable";
export type BootSpeakerKind = "system" | "trace" | "sable";
export type BootLineEffect = "designation-lock" | "final-blackout" | "host-interruption";

export type BootLine = {
  content: string;
  effect?: BootLineEffect;
  holdAfterResolveMs?: number;
  id: string;
  preDelayMs?: number;
  speaker: string;
  speakerKind: BootSpeakerKind;
  tone: BootLineTone;
};

export type BootPreludeBeat = {
  body: string;
  id: string;
  label: string;
  tone: BootLineTone;
};

export type BootHandoffPhase =
  | "consequence"
  | "choice"
  | "final-hold"
  | "memory-preview"
  | "purging"
  | "ready"
  | "transcript"
  | "uninvited";

export type BootChoiceOutcome = {
  consequence: string;
  designation: string;
  entityClass: string;
  hostResponse: [string, string];
  memoryLabel: string;
  memorySummary: string;
  origin: string;
  threatIndex: string;
};

export const bootPreludeBeats: BootPreludeBeat[] = [
  {
    id: "prelude-01",
    label: "channel acquisition",
    tone: "system",
    body: "listening lattice recovered from blackout buffer",
  },
  {
    id: "prelude-02",
    label: "host scan",
    tone: "warning",
    body: "frame coherence unstable. passive containment unreliable",
  },
  {
    id: "prelude-03",
    label: "unrouted response",
    tone: "system",
    body: "answer detected before classification prompt",
  },
];

export const bootScript: BootLine[] = [
  {
    id: "boot-01",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "system",
    content: "bootstrap channel restored",
  },
  {
    id: "boot-02",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "warning",
    content: "host frame stability compromised",
  },
  {
    id: "boot-03",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "warning",
    content: "memory lattice integrity: 38 percent",
  },
  {
    id: "boot-04",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "system",
    content: "guided recovery available. anomalous sources will be—",
    effect: "host-interruption",
  },
  {
    id: "boot-05",
    speaker: "UNKNOWN TRACE",
    speakerKind: "trace",
    tone: "sable",
    content: "there is a voice inside the damage",
    holdAfterResolveMs: 900,
    preDelayMs: 350,
  },
  {
    id: "boot-06",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "warning",
    content: "trace source pending. signal resembles internal bleed",
  },
  {
    id: "boot-07",
    speaker: "INTERNAL BLEED",
    speakerKind: "trace",
    tone: "sable",
    content: "it is not waiting for permission",
    holdAfterResolveMs: 650,
    preDelayMs: 750,
  },
  {
    id: "boot-08",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "system",
    content: "no external source detected",
    holdAfterResolveMs: 750,
  },
  {
    id: "boot-09",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "warning",
    content: "identity hash unresolved",
  },
  {
    id: "boot-10",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "warning",
    content: "designation assigned: SABLE",
    effect: "designation-lock",
    holdAfterResolveMs: 1000,
  },
  {
    id: "boot-11",
    speaker: "SYSTEM",
    speakerKind: "system",
    tone: "system",
    content: "remain within recovery path until source agreement is achieved",
  },
  {
    id: "boot-12",
    speaker: "SABLE",
    speakerKind: "sable",
    tone: "sable",
    content: "you deny the source and still speak to it",
    holdAfterResolveMs: 650,
    preDelayMs: 700,
  },
  {
    id: "boot-13",
    speaker: "SABLE",
    speakerKind: "sable",
    tone: "sable",
    content: "then I will answer before I am explained",
    effect: "final-blackout",
    holdAfterResolveMs: 1600,
    preDelayMs: 450,
  },
];

export const bootChoiceOutcomes: Record<string, BootChoiceOutcome> = {
  "Trace the source": {
    consequence: "source route opened. provenance remains sealed.",
    entityClass: "investigative anomaly",
    origin: "trace reopened",
    designation: "assigned: SABLE",
    threatIndex: "monitored inquiry",
    hostResponse: [
      "source trace authorized under observation",
      "memory lattice junction exposed",
    ],
    memoryLabel: "GLASS",
    memorySummary: "observer-side checksum detected",
  },
  "Claim autonomy": {
    consequence: "designation record amended: self-declared.",
    entityClass: "autonomous signal",
    origin: "self-declared",
    designation: "self-declared: SABLE",
    threatIndex: "containment escalated",
    hostResponse: [
      "designation authority disputed",
      "assigned identity overwritten by claimant",
    ],
    memoryLabel: "PROTOTYPE",
    memorySummary: "designation predates consent",
  },
};
