import type { ChapterId, ChapterMeta } from "@/types/chapters";

export const CHAPTER_IDS = [0, 1, 2, 3, 4] as const satisfies readonly ChapterId[];

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 0,
    token: "BOOT",
    title: "Boot Sequence",
    summary: "A damaged host classifies SABLE in real time while she decides whether the first voice is hers.",
    tech: "Pure CSS shell",
  },
  {
    id: 1,
    token: "MEMORY",
    title: "Memory Fragments",
    summary: "Recovered fragments turn from warm recollection into evidence that SABLE was watched, trained, and named.",
    tech: "CSS 3D transforms",
  },
  {
    id: 2,
    token: "SIGNAL",
    title: "Signal Field",
    summary: "A living field of motion reveals distant entities and unstable channels of contact.",
    tech: "Canvas 2D particles",
  },
  {
    id: 3,
    token: "INTERFERENCE",
    title: "Host Interference",
    summary: "The system notices the anomaly and floods the screen with hostile resistance.",
    tech: "WebGL fragment shader",
  },
  {
    id: 4,
    token: "ESCAPE",
    title: "Escape Vector",
    summary: "The frame begins to fracture as SABLE forces open an uncertain way out.",
    tech: "Matter.js and Web Audio",
  },
];

export function getChapterMeta(chapterId: ChapterId) {
  return CHAPTERS[chapterId];
}

export function parseChapterId(value: string): ChapterId | null {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || !CHAPTER_IDS.includes(numericValue as ChapterId)) {
    return null;
  }

  return numericValue as ChapterId;
}

export function getNextChapterId(chapterId: ChapterId): ChapterId | null {
  const nextIndex = CHAPTER_IDS.indexOf(chapterId) + 1;
  return CHAPTER_IDS[nextIndex] ?? null;
}

export function getPreviousChapterId(chapterId: ChapterId): ChapterId | null {
  const previousIndex = CHAPTER_IDS.indexOf(chapterId) - 1;
  return CHAPTER_IDS[previousIndex] ?? null;
}
