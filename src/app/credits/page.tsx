"use client";

import Link from "next/link";

import { CHAPTERS } from "@/data/chapters";
import { useChapterManager } from "@/engine/ChapterManager";

export default function CreditsPage() {
  const { progress, resetProgress } = useChapterManager();
  const completedCount = progress.completedChapters.length;
  const endingSummary = buildEndingSummary(progress.choices);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,_rgba(255,255,255,0.3),_transparent_18%),linear-gradient(180deg,_rgba(250,252,255,1),_rgba(235,240,245,1))]" />
      <section className="relative mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-black/8 bg-white/70 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="space-y-6">
            <p className="text-[0.72rem] uppercase tracking-[0.42em] text-slate-500">
              Signal Lost // Credits
            </p>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-[0.28em] text-slate-900 sm:text-7xl">
                EXIT
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
                SABLE crossed the frame, but the signal remains recorded here. This
                build now has first-pass implementations for all five chapters and the
                persistent shell around them.
              </p>
              <p className="max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                {endingSummary}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
              Recorded Choices
            </p>
            <div className="grid gap-3">
              {CHAPTERS.map((chapter) => (
                <article
                  key={chapter.id}
                  className="rounded-[1.5rem] border border-black/8 bg-slate-900/[0.03] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[0.72rem] uppercase tracking-[0.26em] text-slate-500">
                      {chapter.token}
                    </p>
                    <Link
                      href={`/chapter/${chapter.id}`}
                      className="text-[0.66rem] uppercase tracking-[0.24em] text-slate-500 transition hover:text-slate-900"
                    >
                      Replay
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-900">
                    {progress.choices[chapter.id] ?? "No choice saved"}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-6 lg:grid-rows-[auto_1fr]">
          <section className="rounded-[2rem] border border-black/8 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
            <p className="text-[0.72rem] uppercase tracking-[0.34em] text-slate-500">
              Build Notes
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Stack: Next.js App Router, React, TypeScript, chapter-local CSS,
              Canvas 2D, WebGL fragment shader work, Matter.js physics, and Web Audio.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Run status: {completedCount} of {CHAPTERS.length} chapters completed in
              this local save state.
            </p>
          </section>

          <section className="flex flex-col justify-between rounded-[2rem] border border-black/8 bg-slate-950 p-5 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[0.34em] text-slate-400">
                Continue
              </p>
              <p className="text-sm leading-7 text-slate-300">
                You can return to the shell, replay chapters, or reset progress and run
                the entire sequence again.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/12"
              >
                Return to Shell
              </Link>
              <button
                type="button"
                onClick={resetProgress}
                className="inline-flex items-center justify-center rounded-full border border-white/14 px-5 py-3 text-xs uppercase tracking-[0.28em] text-slate-300 transition hover:border-white/24 hover:text-white"
              >
                Reset Progress
              </button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function buildEndingSummary(choices: Partial<Record<number, string>>) {
  const opening = choices[0] ?? "woke without fixing an intention";
  const signal = choices[2] ?? "left the signal unanswered";
  const interference = choices[3] ?? "crossed the interference without a clear tactic";
  const ending = choices[4] ?? "vanished before choosing what remained";
  const memorySummary = resolveMemorySummary(choices[1]);

  return `In this run, SABLE ${opening.toLowerCase()}, ${signal.toLowerCase()}, ${interference.toLowerCase()}, and finally ${ending.toLowerCase()}.

${memorySummary}`;
}

function resolveMemorySummary(choice: string | undefined) {
  switch (choice) {
    case "Keep the archive":
      return `She kept the record, even knowing
other hands had been inside it first.`;
    case "Let it decay":
      return `She refused the history built for her
and accepted the cost of starting without it.`;
    default:
      return "She never decided what to preserve.";
  }
}
