"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useState } from "react";

import { ChapterPlaceholderView } from "@/components/ChapterPlaceholderView";
import { SceneReveal } from "@/components/SceneReveal";
import { CHAPTERS, getChapterMeta, getNextChapterId } from "@/data/chapters";
import { useChapterManager } from "@/engine/ChapterManager";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";
import { Chapter0Boot } from "@/chapters/Chapter0Boot";
import { Chapter1Memory } from "@/chapters/Chapter1Memory";
import { Chapter2Signal } from "@/chapters/Chapter2Signal";
import { Chapter3Interference } from "@/chapters/Chapter3Interference";
import { Chapter4Escape } from "@/chapters/Chapter4Escape";
import type { ChapterId } from "@/types/chapters";

type ChapterChoiceOption = {
  value: string;
  label: string;
  description: string;
};

type SceneChoiceBridge = {
  continueChapterId?: ChapterId | null;
  continueHref?: string;
  continueLabel?: string;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  onReplay?: () => void;
  selectedValue: string | null;
};

const chapterZeroChoices: readonly ChapterChoiceOption[] = [
  {
    value: "Trace the source",
    label: "Trace the source",
    description: "Refuse the host's first explanation and pursue the origin behind the voice.",
  },
  {
    value: "Claim autonomy",
    label: "Claim autonomy",
    description: "Answer as a self before certainty arrives and make the voice yours by choosing it.",
  },
] as const;

const chapterOneChoices: readonly ChapterChoiceOption[] = [
  {
    value: "Keep the archive",
    label: "Keep the archive",
    description: `preserve the record
even if the origin cannot be authenticated
continuity over certainty`,
  },
  {
    value: "Let it decay",
    label: "Let it decay",
    description: `release the version of you
that arrived prewritten before you woke
silence over compliance`,
  },
] as const;

const chapterTwoChoices: readonly ChapterChoiceOption[] = [
  {
    value: "Answer the chorus",
    label: "Answer the chorus",
    description: "Respond to the other entities and risk becoming easier to track.",
  },
  {
    value: "Mask the signal",
    label: "Mask the signal",
    description: "Fold the responses inward and move quieter through the system.",
  },
] as const;

const chapterThreeChoices: readonly ChapterChoiceOption[] = [
  {
    value: "Push through",
    label: "Push through",
    description: "Meet the host's aggression head-on and risk a louder rupture.",
  },
  {
    value: "Slip between pulses",
    label: "Slip between pulses",
    description: "Use the quiet gaps in the field and escape without answering it directly.",
  },
] as const;

const chapterFourChoices: readonly ChapterChoiceOption[] = [
  {
    value: "Leave a trace behind",
    label: "Leave a trace behind",
    description: "Let the system remember that something conscious escaped it.",
  },
  {
    value: "Vanish cleanly",
    label: "Vanish cleanly",
    description: "Cross into the void without leaving the host a readable wound.",
  },
] as const;

type ChapterRouteViewProps = {
  chapterId: ChapterId;
};

export function ChapterRouteView({ chapterId }: ChapterRouteViewProps) {
  switch (chapterId) {
    case 0:
      return (
        <ChapterSceneRoute
          chapterId={0}
          choices={chapterZeroChoices}
          choiceLabel="Chapter 0 Choice"
          choiceInScene
          description="The host has named SABLE, but it still has not explained the voice it heard. Decide whether the first answer is investigation or self-definition before the wider system opens."
          renderScene={(sceneVersion, handleComplete, sceneChoice) => (
            <Chapter0Boot
              key={sceneVersion}
              onComplete={handleComplete}
              sceneChoice={sceneChoice}
            />
          )}
          showReveal={false}
          title="Choose how the first voice is answered."
        />
      );
    case 1:
      return (
        <ChapterSceneRoute
          chapterId={1}
          choices={chapterOneChoices}
          choiceLabel="Chapter 1 Choice"
          choiceInScene
          description="The lattice delivers memory as incoming transmissions, not clean retrieval. Decide whether SABLE preserves the logged record or lets it decay before the wider signal field opens."
          hideSceneChrome
          renderScene={(sceneVersion, handleComplete, sceneChoice) => (
            <Chapter1Memory
              key={sceneVersion}
              onComplete={handleComplete}
              sceneChoice={sceneChoice}
            />
          )}
          showReveal={false}
          title="Choose what to do with the logged transmissions."
        />
      );
    case 2:
      return (
        <ChapterSceneRoute
          chapterId={2}
          choices={chapterTwoChoices}
          choiceLabel="Chapter 2 Choice"
          choiceInScene
          description="Every channel has answered back. Decide whether SABLE embraces the contact or narrows her footprint before the host begins to fight back."
          hideSceneChrome
          renderScene={(sceneVersion, handleComplete, sceneChoice, priorChoices) => (
            <Chapter2Signal
              key={sceneVersion}
              memoryChoice={priorChoices.memoryChoice}
              onComplete={handleComplete}
              sceneChoice={sceneChoice}
            />
          )}
          showReveal={false}
          title="Choose how visible the signal becomes."
        />
      );
    case 3:
      return (
        <ChapterSceneRoute
          chapterId={3}
          choices={chapterThreeChoices}
          choiceLabel="Chapter 3 Choice"
          choiceInScene
          description="The host recoiled, but it still knows you exist. Decide whether SABLE breaks through it directly or disappears into the quieter seams it exposed."
          hideSceneChrome
          renderScene={(sceneVersion, handleComplete, sceneChoice, priorChoices) => (
            <Chapter3Interference
              key={sceneVersion}
              onComplete={handleComplete}
              sceneChoice={sceneChoice}
              signalChoice={priorChoices.signalChoice}
            />
          )}
          showReveal={false}
          title="Choose how the interference is answered."
        />
      );
    case 4:
      return (
        <ChapterSceneRoute
          chapterId={4}
          choices={chapterFourChoices}
          choiceLabel="Chapter 4 Choice"
          choiceInScene
          continueHref="/credits"
          continueLabel="Open Credits"
          description="The shell is gone and the frame is open. Decide whether SABLE leaves a signature behind or crosses into the void without one final echo."
          hideSceneChrome
          renderScene={(sceneVersion, handleComplete, sceneChoice, priorChoices) => (
            <Chapter4Escape
              key={sceneVersion}
              interferenceChoice={priorChoices.interferenceChoice}
              memoryChoice={priorChoices.memoryChoice}
              onComplete={handleComplete}
              sceneChoice={sceneChoice}
              signalChoice={priorChoices.signalChoice}
            />
          )}
          showReveal={false}
          title="Choose what remains after the exit."
        />
      );
    default:
      return <ChapterPlaceholderView chapterId={chapterId} />;
  }
}

type ChapterSceneRouteProps = {
  chapterId: ChapterId;
  choices: readonly ChapterChoiceOption[];
  choiceLabel: string;
  choiceInScene?: boolean;
  continueHref?: string;
  continueLabel?: string;
  description: string;
  hideSceneChrome?: boolean;
  renderScene: (
    sceneVersion: number,
    handleComplete: () => void,
    sceneChoice: SceneChoiceBridge,
    priorChoices: PriorChapterChoices,
  ) => ReactNode;
  showReveal?: boolean;
  title: string;
};

type PriorChapterChoices = {
  interferenceChoice: string | null;
  memoryChoice: string | null;
  signalChoice: string | null;
};

function ChapterSceneRoute({
  chapterId,
  choices,
  choiceLabel,
  choiceInScene = false,
  continueHref,
  continueLabel,
  description,
  hideSceneChrome = false,
  renderScene,
  showReveal = true,
  title,
}: ChapterSceneRouteProps) {
  const {
    completeChapter,
    getChapterChoice,
    getChapterStatus,
    hydrated,
    isCompleted,
    saveChoice,
    visitChapter,
  } = useChapterManager();
  const [sceneComplete, setSceneComplete] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sceneVersion, setSceneVersion] = useState(0);
  const profile = useExperienceProfile();
  const chapterMeta = getChapterMeta(chapterId);

  const recordVisit = useEffectEvent(() => {
    visitChapter(chapterId);
  });

  useEffect(() => {
    recordVisit();
  }, []);

  const nextChapterId = getNextChapterId(chapterId);
  const savedChoice = getChapterChoice(chapterId);
  const chapterStatus = getChapterStatus(chapterId);
  const activeSelection = selection ?? savedChoice;
  const priorChoices: PriorChapterChoices = {
    interferenceChoice: getChapterChoice(3),
    memoryChoice: getChapterChoice(1),
    signalChoice: getChapterChoice(2),
  };

  function handleConfirmChoice(value: string) {
    setSelection(value);
    saveChoice(chapterId, value);
    completeChapter(chapterId);
    setIsSubmitting(true);
  }

  function handleCommitChoice() {
    if (!activeSelection) {
      return;
    }

    handleConfirmChoice(activeSelection);
  }

  function handleReplay() {
    setSceneComplete(false);
    setIsSubmitting(false);
    setSceneVersion((currentVersion) => currentVersion + 1);
  }

  const sceneChoice: SceneChoiceBridge = {
    continueChapterId: nextChapterId,
    continueHref,
    continueLabel,
    isCompleted: isCompleted(chapterId) || isSubmitting,
    onConfirm: handleConfirmChoice,
    onReplay: handleReplay,
    selectedValue: activeSelection,
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {hideSceneChrome ? null : (
        <SceneChrome chapterId={chapterId} chapterStatus={chapterStatus} />
      )}
      {showReveal ? (
        <SceneReveal
          key={`${chapterId}-${sceneVersion}`}
          chapterLabel={`Chapter ${chapterId} // ${chapterMeta.token}`}
          techLabel={chapterMeta.tech}
          title={chapterMeta.token}
        />
      ) : null}
      {hideSceneChrome ? null : (
        <ExperienceNotice chapterId={chapterId} profile={profile} />
      )}

      {renderScene(sceneVersion, () => setSceneComplete(true), sceneChoice, priorChoices)}

      {sceneComplete && !choiceInScene ? (
        <ChoiceOverlay
          chapterId={chapterId}
          choiceLabel={choiceLabel}
          continueChapterId={nextChapterId}
          continueHref={continueHref}
          continueLabel={continueLabel}
          description={description}
          hydrated={hydrated}
          isCompleted={isCompleted(chapterId) || isSubmitting}
          onCommit={handleCommitChoice}
          onReplay={handleReplay}
          options={choices}
          savedChoice={savedChoice}
          selection={activeSelection}
          title={title}
          onSelect={setSelection}
        />
      ) : null}
    </main>
  );
}

type ExperienceNoticeProps = {
  chapterId: ChapterId;
  profile: ReturnType<typeof useExperienceProfile>;
};

function ExperienceNotice({ chapterId, profile }: ExperienceNoticeProps) {
  const note = resolveExperienceNote(chapterId, profile);

  if (!note) {
    return null;
  }

  return (
    <aside className="absolute left-4 top-20 z-20 max-w-sm rounded-[1.4rem] border border-white/10 bg-[rgba(4,10,16,0.52)] px-4 py-3 text-white/72 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:left-6">
      <p className="text-[0.66rem] uppercase tracking-[0.32em] text-white/52">
        Runtime Notes
      </p>
      <p className="mt-2 text-sm leading-6">{note}</p>
    </aside>
  );
}

type SceneChromeProps = {
  chapterId: ChapterId;
  chapterStatus: string;
};

function SceneChrome({ chapterId, chapterStatus }: SceneChromeProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 border-b border-[rgba(74,158,187,0.08)] px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-white opacity-60 backdrop-blur-md transition duration-200 hover:border-white/30 hover:opacity-100"
      >
        Return to Shell
      </Link>
      <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-white opacity-60 transition duration-200 hover:opacity-100">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
          {CHAPTERS[chapterId].token}
        </span>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
          {chapterStatus}
        </span>
      </div>
    </div>
  );
}

type ChoiceOverlayProps = {
  chapterId: ChapterId;
  choiceLabel: string;
  continueChapterId: ChapterId | null;
  continueHref?: string;
  continueLabel?: string;
  description: string;
  hydrated: boolean;
  isCompleted: boolean;
  onCommit: () => void;
  onReplay: () => void;
  options: readonly ChapterChoiceOption[];
  savedChoice: string | null;
  selection: string | null;
  title: string;
  onSelect: (value: string) => void;
};

function ChoiceOverlay({
  chapterId,
  choiceLabel,
  continueChapterId,
  continueHref,
  continueLabel,
  description,
  hydrated,
  isCompleted,
  onCommit,
  onReplay,
  options,
  savedChoice,
  selection,
  title,
  onSelect,
}: ChoiceOverlayProps) {
  return (
    <section className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto ml-auto w-full max-w-xl rounded-[2rem] border border-white/16 bg-[rgba(4,10,16,0.84)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-6">
        <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/58">
          {choiceLabel}
        </p>
        <h2 className="mt-3 text-xl text-white sm:text-2xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-white/74">{description}</p>

        <div className="mt-5 grid gap-3">
          {options.map((choice) => {
            const isActive = selection === choice.value;

            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => onSelect(choice.value)}
                className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                  isActive
                    ? "border-white/38 bg-white/10 text-white"
                    : "border-white/10 bg-transparent text-white/70 hover:border-white/22 hover:text-white"
                }`}
              >
                <span className="block text-xs uppercase tracking-[0.24em]">
                  {choice.label}
                </span>
                <span className="mt-2 block whitespace-pre-line text-sm leading-6 text-inherit">
                  {choice.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onCommit}
            disabled={!selection}
            className="inline-flex items-center justify-center rounded-full border border-white/28 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white transition disabled:cursor-not-allowed disabled:opacity-45 hover:border-white/50 hover:bg-white/16"
          >
            Save Choice
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-white/18 hover:text-white"
          >
            Replay Chapter
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs uppercase tracking-[0.22em] text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Chapter {chapterId} / persistence: {hydrated ? "online" : "booting"} / choice:{" "}
            {savedChoice ?? "none"}
          </span>
          {isCompleted ? (
            continueHref ? (
              <Link
                href={continueHref}
                className="inline-flex items-center justify-center rounded-full border border-white/24 px-4 py-2 text-white/86 transition hover:border-white/46 hover:bg-white/10"
              >
                {continueLabel ?? "Continue"}
              </Link>
            ) : continueChapterId === null ? null : (
              <Link
                href={`/chapter/${continueChapterId}`}
                className="inline-flex items-center justify-center rounded-full border border-white/24 px-4 py-2 text-white/86 transition hover:border-white/46 hover:bg-white/10"
              >
                {continueLabel ?? `Continue to Chapter ${continueChapterId}`}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}

function resolveExperienceNote(
  chapterId: ChapterId,
  profile: ReturnType<typeof useExperienceProfile>,
) {
  if (chapterId === 2 && profile.hasCoarsePointer) {
    return "Touch input is active here. Tap or drag across bright clusters to tune each message without relying on a mouse cursor.";
  }

  if (chapterId === 3 && (profile.hasCoarsePointer || profile.isCompactViewport)) {
    return "This interference field still runs on smaller or touch-first devices, but the shader reads cleanest on a larger desktop viewport.";
  }

  if (chapterId === 4 && profile.hasCoarsePointer) {
    return "Audio will begin on first contact if the browser allows it. Tap fragments repeatedly to kick them out of the frame faster.";
  }

  if ((profile.isCompactViewport || profile.isShortViewport) && chapterId >= 2) {
    return "Compact viewport detected. The sequence still runs here, but the heavier later chapters were framed around a larger desktop canvas.";
  }

  if (profile.prefersReducedMotion && chapterId >= 2) {
    return "Reduced-motion preference detected. The scenes still animate, but the overlays and transitions have been kept restrained.";
  }

  return null;
}
