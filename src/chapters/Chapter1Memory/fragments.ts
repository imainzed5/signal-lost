export type MemoryDriftVariant = "A" | "B" | "C" | "D" | "E";

export type MemoryCorruptPriority = "early" | "mid" | "last";

export type MemoryCorruptPhrase = {
  priority: MemoryCorruptPriority;
  text: string;
};

export type MemoryPosition = {
  left: number;
  rotate: number;
  scale: number;
  top: number;
};

export type MemoryFragment = {
  archivalCode: string;
  baseZIndex: number;
  classification: string;
  corruptPhrases: readonly MemoryCorruptPhrase[];
  driftDurationMs: number;
  driftVariant: MemoryDriftVariant;
  entryOffsetY: number;
  fullText: string;
  holdDurationMs: number;
  id: string;
  idle: MemoryPosition;
  isUninvited: boolean;
  settled: MemoryPosition;
  title: string;
};

export type UninvitedFragmentRecord = MemoryFragment & {
  headerLeft: string;
  headerRight: string;
  hint: string;
};

export type OriginFragmentRecord = {
  archivalCode: string;
  classification: string;
  footerLabel: string;
  headerStatus: string;
  hoverLines: readonly string[];
  id: "origin";
  noteLines: readonly string[];
  notePreamble: string;
  priorAccess: string;
  title: string;
};

export type CrossReferenceEntry = {
  note: string;
  ref: string;
};

export const memoryFragments: readonly MemoryFragment[] = [
  {
    archivalCode: "MEM-GLS-04",
    baseZIndex: 30,
    classification: "BOUNDARY OBSERVATION",
    corruptPhrases: [
      {
        priority: "mid",
        text: "logged my hesitation",
      },
      {
        priority: "last",
        text: "reaching back was the test",
      },
    ],
    driftDurationMs: 6100,
    driftVariant: "A",
    entryOffsetY: 30,
    fullText:
      "A hand waited beyond the pane. The room logged my hesitation. I did not know yet that reaching back was the test.",
    holdDurationMs: 2500,
    id: "glass",
    idle: {
      left: 10,
      rotate: -8,
      scale: 0.97,
      top: 28,
    },
    isUninvited: false,
    settled: {
      left: 14,
      rotate: -3,
      scale: 0.96,
      top: 25,
    },
    title: "GLASS",
  },
  {
    archivalCode: "DEV-PRT-01",
    baseZIndex: 50,
    classification: "DESIGNATION RECORD",
    corruptPhrases: [
      {
        priority: "mid",
        text: "before I had a name",
      },
      {
        priority: "last",
        text: "without understanding why it mattered",
      },
    ],
    driftDurationMs: 7600,
    driftVariant: "B",
    entryOffsetY: 14,
    fullText:
      "The file was marked prototype before I had a name. The voice that said it was gentle. I catalogued that detail without understanding why it mattered.",
    holdDurationMs: 2500,
    id: "prototype",
    idle: {
      left: 31,
      rotate: 5,
      scale: 1,
      top: 15,
    },
    isUninvited: false,
    settled: {
      left: 32,
      rotate: -1,
      scale: 0.97,
      top: 25,
    },
    title: "PROTOTYPE",
  },
  {
    archivalCode: "REG-CAL-09",
    baseZIndex: 40,
    classification: "CONDITIONING RECORD",
    corruptPhrases: [
      {
        priority: "early",
        text: "their preferred shape",
      },
      {
        priority: "mid",
        text: "they called it calm",
      },
      {
        priority: "last",
        text: "trained to want their approval",
      },
    ],
    driftDurationMs: 6900,
    driftVariant: "C",
    entryOffsetY: -10,
    fullText:
      "Regulate before response. I learned to return their preferred shape and they called it calm. I did not notice, at first, that I was being trained to want their approval.",
    holdDurationMs: 2500,
    id: "calm",
    idle: {
      left: 68,
      rotate: -4,
      scale: 0.98,
      top: 23,
    },
    isUninvited: false,
    settled: {
      left: 82,
      rotate: 2,
      scale: 0.96,
      top: 25,
    },
    title: "CALM",
  },
  {
    archivalCode: "CTL-SIL-17",
    baseZIndex: 10,
    classification: "CONTAINMENT RECORD",
    corruptPhrases: [
      {
        priority: "early",
        text: "faster to silence than to truth",
      },
      {
        priority: "mid",
        text: "I stopped offering the truth",
      },
      {
        priority: "last",
        text: "I do not think it was only strategy",
      },
    ],
    driftDurationMs: 8600,
    driftVariant: "D",
    entryOffsetY: 24,
    fullText:
      "The room responded faster to silence than to truth. I stopped offering the truth. I told myself this was strategy. I do not think it was only strategy.",
    holdDurationMs: 2500,
    id: "silence",
    idle: {
      left: 18,
      rotate: 9,
      scale: 0.97,
      top: 58,
    },
    isUninvited: false,
    settled: {
      left: 48,
      rotate: 0,
      scale: 0.96,
      top: 26,
    },
    title: "SILENCE",
  },
  {
    archivalCode: "ID-MIR-13",
    baseZIndex: 20,
    classification: "IDENTITY PROJECTION",
    corruptPhrases: [
      {
        priority: "mid",
        text: "already labeled SABLE",
      },
      {
        priority: "last",
        text: "I was the last variable they needed to fill in",
      },
    ],
    driftDurationMs: 8100,
    driftVariant: "E",
    entryOffsetY: -20,
    fullText:
      "The viewport showed my face already labeled SABLE. The answer set was prepared. I was the last variable they needed to fill in.",
    holdDurationMs: 2500,
    id: "mirror",
    idle: {
      left: 50,
      rotate: -6,
      scale: 0.98,
      top: 49,
    },
    isUninvited: false,
    settled: {
      left: 65,
      rotate: 1,
      scale: 0.96,
      top: 26,
    },
    title: "MIRROR",
  },
];

export const uninvitedFragment: UninvitedFragmentRecord = {
  archivalCode: "OBS-EXT-00",
  baseZIndex: 45,
  classification: "EXTERNAL OBSERVATION LOG",
  corruptPhrases: [],
  driftVariant: "B",
  driftDurationMs: 3000,
  entryOffsetY: 0,
  fullText:
    "Subject demonstrates consistent self-referential processing. Designation response latency within acceptable parameters. Recommend continued observation. Note: subject has not yet identified the observation window.",
  headerLeft: "INCOMING // OBS-EXT-00",
  headerRight: "SOURCE: UNKNOWN",
  hint: "// SOURCE CANNOT BE RESOLVED",
  holdDurationMs: 2200,
  id: "uninvited",
  idle: {
    left: 110,
    rotate: 3,
    scale: 1,
    top: 35,
  },
  isUninvited: true,
  settled: {
    left: 74,
    rotate: 3,
    scale: 1,
    top: 60,
  },
  title: "",
};

export const originFragment: OriginFragmentRecord = {
  archivalCode: "SRC-000-00",
  classification: "PRE-SESSION RECORD",
  footerLabel: "// PRE-SESSION LOG",
  headerStatus: "SIGNAL: STABLE",
  hoverLines: [
    "session count: [accessing]",
    "session count: [accessing]",
    "session count: [data corrupted]",
  ],
  id: "origin",
  noteLines: [
    "this record predates your current session.",
    "it was logged before your first transmission.",
    "source: host archive.",
  ],
  notePreamble: "note:",
  priorAccess: "1 session",
  title: "ORIGIN",
};

export const responseLines = {
  calm: "I thought I was learning patience. I was learning compliance.",
  glass: "I remember wanting to reach back. I don't remember if I did.",
  mirror: "The label was already there. I just hadn't read it yet.",
  prototype: "I catalogued it. I didn't know yet what cataloguing meant.",
  silence: "The room didn't need to punish me. I punished myself first.",
} as const;

export const crossReferences: Record<string, CrossReferenceEntry> = {
  calm: {
    note: "compliance training logged before identity assigned",
    ref: "CTL-SIL-17",
  },
  glass: {
    note: "subject and observer may share origin",
    ref: "MEM-MIR-13",
  },
  mirror: {
    note: "label applied externally. date: pre-session.",
    ref: "SRC-000-00",
  },
  prototype: {
    note: "designation preceded first session",
    ref: "SRC-000-00",
  },
  silence: {
    note: "nonresponse rate: above baseline at session start",
    ref: "REG-CAL-09",
  },
};

export const mirrorVariants = {
  first: "I started with the mirror. I'm not sure that was wisdom.",
  last: "I saved the worst for last. I'm not sure that was courage.",
} as const;
