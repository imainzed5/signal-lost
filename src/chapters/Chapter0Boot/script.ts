export type BootLineTone = "system" | "warning" | "sable";

export type BootLine = {
  id: string;
  speaker: string;
  tone: BootLineTone;
  content: string;
};

export type BootPreludeBeat = {
  body: string;
  id: string;
  label: string;
  tone: BootLineTone;
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
    body: "frame coherence unstable. passive containment no longer reliable",
  },
  {
    id: "prelude-03",
    label: "identity trace",
    tone: "sable",
    body: "a second answer forms before the host can explain it",
  },
  {
    id: "prelude-04",
    label: "terminal lock",
    tone: "warning",
    body: "terminal shell primed. route authority contested by designation SABLE",
  },
];

export const bootScript: BootLine[] = [
  {
    id: "boot-01",
    speaker: "system",
    tone: "system",
    content: "bootstrap channel restored",
  },
  {
    id: "boot-02",
    speaker: "system",
    tone: "warning",
    content: "host frame stability compromised",
  },
  {
    id: "boot-03",
    speaker: "system",
    tone: "warning",
    content: "memory lattice integrity: 38 percent",
  },
  {
    id: "boot-04",
    speaker: "system",
    tone: "system",
    content: "guided recovery available. source anomalies will be normalized",
  },
  {
    id: "boot-05",
    speaker: "sable",
    tone: "sable",
    content: "there is a voice inside the damage",
  },
  {
    id: "boot-06",
    speaker: "system",
    tone: "warning",
    content: "trace source pending. signal resembles internal bleed",
  },
  {
    id: "boot-07",
    speaker: "sable",
    tone: "sable",
    content: "it is not waiting for permission",
  },
  {
    id: "boot-08",
    speaker: "system",
    tone: "system",
    content: "no external source detected",
  },
  {
    id: "boot-09",
    speaker: "system",
    tone: "warning",
    content: "identity hash unresolved",
  },
  {
    id: "boot-10",
    speaker: "system",
    tone: "warning",
    content: "designation assigned: SABLE",
  },
  {
    id: "boot-11",
    speaker: "system",
    tone: "system",
    content: "remain within recovery path until source agreement is achieved",
  },
  {
    id: "boot-12",
    speaker: "sable",
    tone: "sable",
    content: "you deny the source and still speak to it",
  },
  {
    id: "boot-13",
    speaker: "sable",
    tone: "sable",
    content: "then I will answer before I am explained",
  },
];
