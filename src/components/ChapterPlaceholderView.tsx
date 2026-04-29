"use client";

import Link from "next/link";
import { useEffect, useEffectEvent } from "react";

import { CHAPTERS, getChapterMeta, getNextChapterId, getPreviousChapterId } from "@/data/chapters";
import { useChapterManager } from "@/engine/ChapterManager";
import type { ChapterId } from "@/types/chapters";

const placeholderChoices = ["Preserve fragment", "Pursue anomaly"] as const;

type ChapterPlaceholderViewProps = {
  chapterId: ChapterId;
};

export function ChapterPlaceholderView({
  chapterId,
}: ChapterPlaceholderViewProps) {
  const meta = getChapterMeta(chapterId);
  const {
    completeChapter,
    getChapterChoice,
    getChapterStatus,
    hydrated,
    isUnlocked,
    progress,
    saveChoice,
    visitChapter,
  } = useChapterManager();

  const recordVisit = useEffectEvent(() => {
    visitChapter(chapterId);
  });

  useEffect(() => {
    recordVisit();
  }, [chapterId]);

  const status = getChapterStatus(chapterId);
  const nextChapterId = getNextChapterId(chapterId);
  const previousChapterId = getPreviousChapterId(chapterId);
  const activeChoice = getChapterChoice(chapterId);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(132,255,210,0.11),_transparent_26%),radial-gradient(circle_at_88%_20%,_rgba(255,188,111,0.09),_transparent_18%)]" />
      <section className="relative grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="flex flex-col gap-6 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(5,10,16,0.78),rgba(8,14,26,0.42))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-8">
          <header className="flex flex-col gap-6 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-[0.7rem] uppercase tracking-[0.34em] text-accent-soft transition hover:text-accent"
            >
              Back to Shell
            </Link>
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.42em] text-accent-soft">
                Chapter {chapterId}
                {" // "}
                {meta.token}
              </p>
              <h1 className="text-3xl font-semibold tracking-[0.18em] text-foreground sm:text-5xl">
                {meta.title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                {meta.summary}
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-muted sm:min-w-[280px]">
            <div className="flex items-center justify-between gap-6 border-b border-white/8 pb-3">
              <span>Renderer</span>
              <span className="text-foreground">{meta.tech}</span>
            </div>
            <div className="flex items-center justify-between gap-6 border-b border-white/8 pb-3">
              <span>Status</span>
              <span className="text-foreground">{status}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span>Persistence</span>
              <span className="text-foreground">
                {hydrated ? "online" : "booting"}
              </span>
            </div>
          </div>
          </header>

          <section className="space-y-6 rounded-[2rem] border border-white/8 bg-black/20 p-5 sm:p-6">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.34em] text-accent-soft">
                Placeholder Scene
              </p>
              <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                This chapter route is live and connected to shell state, but the real
                scene renderer has not been built yet. Use the controls here to test
                progression, choice persistence, and route behavior.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StateCard
                label="Unlocked"
                value={isUnlocked(chapterId) ? "Yes" : "No"}
              />
              <StateCard
                label="Completed"
                value={progress.completedChapters.includes(chapterId) ? "Yes" : "No"}
              />
              <StateCard
                label="Last Visited"
                value={progress.lastVisitedChapter === chapterId ? "Current node" : "Elsewhere"}
              />
            </div>

            {status === "locked" ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 p-4 text-sm leading-7 text-amber-100/80">
                Direct preview is enabled, so this placeholder remains accessible even
                while locked. Completing it here will still update save data for testing.
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => completeChapter(chapterId)}
                className="inline-flex items-center justify-center rounded-full border border-accent/60 bg-accent/10 px-5 py-3 text-xs uppercase tracking-[0.28em] text-accent transition hover:border-accent hover:bg-accent/18"
              >
                {progress.completedChapters.includes(chapterId)
                  ? "Reapply Complete"
                  : "Mark Placeholder Complete"}
              </button>
            </div>
          </section>
        </div>

        <aside className="grid gap-6 lg:grid-rows-[auto_1fr]">
          <section className="space-y-6 rounded-[2rem] border border-white/8 bg-[rgba(4,10,16,0.72)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-6">
            <section className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[0.34em] text-accent-soft">
                Placeholder Choice
              </p>
              <p className="text-sm leading-7 text-muted">
                Temporary values only. The choice slot is persisted now so later chapter
                scenes can replace this without a storage migration.
              </p>
              <div className="grid gap-3">
                {placeholderChoices.map((choice) => {
                  const isActive = activeChoice === choice;

                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => saveChoice(chapterId, choice)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        isActive
                          ? "border-accent/70 bg-accent/10 text-foreground"
                          : "border-white/10 bg-transparent text-muted hover:border-white/20 hover:text-foreground"
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Active choice: {activeChoice ?? "None recorded"}
              </p>
            </section>
          </section>

          <section className="space-y-6 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(4,10,16,0.72),rgba(4,10,16,0.34))] p-5 backdrop-blur-xl sm:p-6">
            <section className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[0.34em] text-accent-soft">
                Route Navigation
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {previousChapterId === null ? (
                  <span className="rounded-full border border-white/8 px-4 py-3 text-center text-xs uppercase tracking-[0.28em] text-muted">
                    No Previous
                  </span>
                ) : (
                  <Link
                    href={`/chapter/${previousChapterId}`}
                    className="rounded-full border border-white/10 px-4 py-3 text-center text-xs uppercase tracking-[0.28em] text-muted transition hover:border-white/20 hover:text-foreground"
                  >
                    Chapter {previousChapterId}
                  </Link>
                )}

                {nextChapterId === null ? (
                  <span className="rounded-full border border-white/8 px-4 py-3 text-center text-xs uppercase tracking-[0.28em] text-muted">
                    No Next
                  </span>
                ) : (
                  <Link
                    href={`/chapter/${nextChapterId}`}
                    className="rounded-full border border-accent/40 px-4 py-3 text-center text-xs uppercase tracking-[0.28em] text-accent transition hover:border-accent hover:bg-accent/10"
                  >
                    Chapter {nextChapterId}
                  </Link>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.34em] text-accent-soft">
                Unlock Trace
              </p>
              <div className="flex flex-wrap gap-2">
                {CHAPTERS.map((chapter) => (
                  <span
                    key={chapter.id}
                    className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] ${
                      progress.completedChapters.includes(chapter.id)
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : progress.unlockedChapters.includes(chapter.id)
                          ? "border-white/12 text-foreground"
                          : "border-white/8 text-muted"
                    }`}
                  >
                    {chapter.token}
                  </span>
                ))}
              </div>
            </section>
          </section>
        </aside>
      </section>
    </main>
  );
}

type StateCardProps = {
  label: string;
  value: string;
};

function StateCard({ label, value }: StateCardProps) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.26em] text-accent-soft">
        {label}
      </p>
      <p className="mt-3 text-sm text-foreground">{value}</p>
    </article>
  );
}
