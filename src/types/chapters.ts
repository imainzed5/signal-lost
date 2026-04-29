export type ChapterId = 0 | 1 | 2 | 3 | 4;

export type ChapterMeta = {
  id: ChapterId;
  token: string;
  title: string;
  summary: string;
  tech: string;
};

export type ChapterProgressState = {
  unlockedChapters: ChapterId[];
  completedChapters: ChapterId[];
  choices: Partial<Record<ChapterId, string>>;
  lastVisitedChapter: ChapterId | null;
};

export type ChapterStatus = "locked" | "unlocked" | "completed";

export type ChapterManagerContextValue = {
  chapters: ChapterMeta[];
  completeChapter: (chapterId: ChapterId) => void;
  getChapterChoice: (chapterId: ChapterId) => string | null;
  getChapterStatus: (chapterId: ChapterId) => ChapterStatus;
  hydrated: boolean;
  isCompleted: (chapterId: ChapterId) => boolean;
  isUnlocked: (chapterId: ChapterId) => boolean;
  progress: ChapterProgressState;
  resetProgress: () => void;
  saveChoice: (chapterId: ChapterId, value: string) => void;
  visitChapter: (chapterId: ChapterId) => void;
};
