"use client";

import { useSyncExternalStore } from "react";

import { CHAPTER_IDS } from "@/data/chapters";
import type { ChapterId, ChapterProgressState } from "@/types/chapters";

export const CHAPTER_PROGRESS_STORAGE_KEY = "signal-lost:progress";
const DEFAULT_PROGRESS_STATE: ChapterProgressState = {
  unlockedChapters: [0],
  completedChapters: [],
  choices: {},
  lastVisitedChapter: null,
};
const SERVER_PROGRESS_SNAPSHOT = DEFAULT_PROGRESS_STATE;

let cachedSnapshot: ChapterProgressState = DEFAULT_PROGRESS_STATE;
let cachedSerializedSnapshot: string | null = null;
let hasHydratedOnClient = false;
const hydrationListeners = new Set<() => void>();

export function createDefaultProgressState(): ChapterProgressState {
  return {
    unlockedChapters: [...DEFAULT_PROGRESS_STATE.unlockedChapters],
    completedChapters: [...DEFAULT_PROGRESS_STATE.completedChapters],
    choices: { ...DEFAULT_PROGRESS_STATE.choices },
    lastVisitedChapter: DEFAULT_PROGRESS_STATE.lastVisitedChapter,
  };
}

export function useChapterState() {
  const state = useSyncExternalStore(
    subscribeToProgressStore,
    readProgressSnapshot,
    getServerProgressSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydrationStore,
    readHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  function persistProgressState(nextState: ChapterProgressState) {
    writeProgressSnapshot(nextState);
  }

  function updateProgressState(
    updater: (previousState: ChapterProgressState) => ChapterProgressState,
  ) {
    writeProgressSnapshot(updater(readProgressSnapshot()));
  }

  function markVisited(chapterId: ChapterId) {
    updateProgressState((previousState) => ({
      ...previousState,
      lastVisitedChapter: chapterId,
    }));
  }

  function markComplete(chapterId: ChapterId) {
    updateProgressState((previousState) => ({
      ...previousState,
      completedChapters: appendChapterId(previousState.completedChapters, chapterId),
    }));
  }

  function setChoice(chapterId: ChapterId, value: string) {
    updateProgressState((previousState) => ({
      ...previousState,
      choices: {
        ...previousState.choices,
        [chapterId]: value,
      },
    }));
  }

  function resetProgress() {
    persistProgressState(createDefaultProgressState());
  }

  return {
    hydrated,
    state,
    markVisited,
    markComplete,
    setChoice,
    resetProgress,
    updateProgressState,
  };
}

const progressStoreListeners = new Set<() => void>();

function subscribeToProgressStore(listener: () => void) {
  progressStoreListeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key === CHAPTER_PROGRESS_STORAGE_KEY) {
      listener();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    progressStoreListeners.delete(listener);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function readProgressSnapshot(): ChapterProgressState {
  if (typeof window === "undefined") {
    return SERVER_PROGRESS_SNAPSHOT;
  }

  const storedState = window.localStorage.getItem(CHAPTER_PROGRESS_STORAGE_KEY);

  if (!storedState) {
    cachedSerializedSnapshot = null;
    cachedSnapshot = DEFAULT_PROGRESS_STATE;
    return cachedSnapshot;
  }

  if (storedState === cachedSerializedSnapshot) {
    return cachedSnapshot;
  }

  cachedSerializedSnapshot = storedState;
  cachedSnapshot = sanitizeProgressState(parseStoredProgress(storedState));
  return cachedSnapshot;
}

function writeProgressSnapshot(nextState: ChapterProgressState) {
  if (typeof window === "undefined") {
    return;
  }

  const sanitizedState = sanitizeProgressState(nextState);
  const serializedState = JSON.stringify(sanitizedState);
  cachedSerializedSnapshot = serializedState;
  cachedSnapshot = sanitizedState;
  window.localStorage.setItem(CHAPTER_PROGRESS_STORAGE_KEY, serializedState);

  for (const listener of progressStoreListeners) {
    listener();
  }
}

function getServerProgressSnapshot() {
  return SERVER_PROGRESS_SNAPSHOT;
}

function subscribeToHydrationStore(listener: () => void) {
  hydrationListeners.add(listener);

  if (typeof window !== "undefined" && !hasHydratedOnClient) {
    queueMicrotask(() => {
      hasHydratedOnClient = true;

      for (const subscribedListener of hydrationListeners) {
        subscribedListener();
      }
    });
  }

  return () => {
    hydrationListeners.delete(listener);
  };
}

function readHydrationSnapshot() {
  return hasHydratedOnClient;
}

function getServerHydrationSnapshot() {
  return false;
}

function parseStoredProgress(storedValue: string): unknown {
  try {
    return JSON.parse(storedValue);
  } catch {
    return createDefaultProgressState();
  }
}

function sanitizeProgressState(input: unknown): ChapterProgressState {
  if (!input || typeof input !== "object") {
    return createDefaultProgressState();
  }

  const candidate = input as Partial<ChapterProgressState> & {
    choices?: Record<string, unknown>;
  };

  return {
    unlockedChapters: normalizeChapterIdList(candidate.unlockedChapters, [0]),
    completedChapters: normalizeChapterIdList(candidate.completedChapters, []),
    choices: normalizeChoices(candidate.choices),
    lastVisitedChapter: normalizeNullableChapterId(candidate.lastVisitedChapter),
  };
}

function normalizeChapterIdList(
  value: ChapterId[] | undefined,
  fallback: ChapterId[],
): ChapterId[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return CHAPTER_IDS.filter((chapterId) => value.includes(chapterId));
}

function normalizeChoices(
  value: Record<string, unknown> | undefined,
): Partial<Record<ChapterId, string>> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const normalizedChoices: Partial<Record<ChapterId, string>> = {};

  for (const chapterId of CHAPTER_IDS) {
    const candidate = value[String(chapterId)];

    if (typeof candidate === "string" && candidate.length > 0) {
      normalizedChoices[chapterId] = candidate;
    }
  }

  return normalizedChoices;
}

function normalizeNullableChapterId(value: unknown): ChapterId | null {
  if (typeof value === "number" && CHAPTER_IDS.includes(value as ChapterId)) {
    return value as ChapterId;
  }

  return null;
}

function appendChapterId(chapterIds: ChapterId[], chapterId: ChapterId): ChapterId[] {
  return chapterIds.includes(chapterId)
    ? chapterIds
    : [...chapterIds, chapterId].sort((left, right) => left - right);
}
