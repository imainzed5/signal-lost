"use client";

import { createContext, useContext } from "react";

import { CHAPTERS, getNextChapterId } from "@/data/chapters";
import { createDefaultProgressState, useChapterState } from "@/engine/useChapterState";
import type { ChapterId, ChapterManagerContextValue } from "@/types/chapters";

const ChapterManagerContext = createContext<ChapterManagerContextValue | null>(null);

type ChapterManagerProviderProps = {
  children: React.ReactNode;
};

export function ChapterManagerProvider({
  children,
}: ChapterManagerProviderProps) {
  const {
    hydrated,
    markVisited,
    resetProgress,
    setChoice,
    state,
    updateProgressState,
  } = useChapterState();

  function visitChapter(chapterId: ChapterId) {
    markVisited(chapterId);
  }

  function completeChapter(chapterId: ChapterId) {
    updateProgressState((previousState) => {
      const nextChapterId = getNextChapterId(chapterId);
      const unlockedChapters = previousState.unlockedChapters.includes(chapterId)
        ? previousState.unlockedChapters
        : [...previousState.unlockedChapters, chapterId];

      return {
        ...previousState,
        completedChapters: previousState.completedChapters.includes(chapterId)
          ? previousState.completedChapters
          : [...previousState.completedChapters, chapterId],
        unlockedChapters:
          nextChapterId === null
            ? unlockedChapters
            : unlockedChapters.includes(nextChapterId)
              ? unlockedChapters
              : [...unlockedChapters, nextChapterId],
      };
    });
  }

  function saveChoice(chapterId: ChapterId, value: string) {
    setChoice(chapterId, value);
  }

  function isUnlocked(chapterId: ChapterId) {
    return state.unlockedChapters.includes(chapterId);
  }

  function isCompleted(chapterId: ChapterId) {
    return state.completedChapters.includes(chapterId);
  }

  function getChapterStatus(chapterId: ChapterId) {
    if (isCompleted(chapterId)) {
      return "completed" as const;
    }

    if (isUnlocked(chapterId)) {
      return "unlocked" as const;
    }

    return "locked" as const;
  }

  function getChapterChoice(chapterId: ChapterId) {
    return state.choices[chapterId] ?? null;
  }

  const value: ChapterManagerContextValue = {
    chapters: CHAPTERS,
    completeChapter,
    getChapterChoice,
    getChapterStatus,
    hydrated,
    isCompleted,
    isUnlocked,
    progress: hydrated ? state : createDefaultProgressState(),
    resetProgress,
    saveChoice,
    visitChapter,
  };

  return (
    <ChapterManagerContext.Provider value={value}>
      {children}
    </ChapterManagerContext.Provider>
  );
}

export function useChapterManager() {
  const context = useContext(ChapterManagerContext);

  if (!context) {
    throw new Error("useChapterManager must be used within a ChapterManagerProvider.");
  }

  return context;
}
