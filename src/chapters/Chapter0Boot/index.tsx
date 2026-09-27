"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import {
  createBootAudioController,
  type BootAudioController,
  type BootAudioStatus,
} from "@/chapters/Chapter0Boot/audio";
import { BootScope, BootStanceChoice, resolveBootPressure } from "@/chapters/Chapter0Boot/panel";
import {
  bootChoiceOutcomes,
  bootPreludeBeats,
  bootScript,
  type BootHandoffPhase,
  type BootLine,
} from "@/chapters/Chapter0Boot/script";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";
import type { ChapterId } from "@/types/chapters";

import styles from "./boot.module.css";

type Chapter0BootProps = {
  onComplete: () => void;
  sceneChoice?: {
    continueChapterId?: ChapterId | null;
    continueHref?: string;
    continueLabel?: string;
    isCompleted: boolean;
    onConfirm: (value: string) => void;
    onReplay?: () => void;
    selectedValue: string | null;
  };
};

type OpeningPhase = "fading" | "visible";

type BootChoiceOption = {
  detailLines: [string, string];
  heading: string;
  value: string;
};

type TimerScope = "line" | "scene";

const SYSTEM_TYPE_SPEED_MS = 28;
const SABLE_TYPE_SPEED_MS = 48;
const FINAL_LOCK_STING_DELAY_MS = 140;
const HOST_INTERRUPTION_GAP_MS = 350;
const STANCE_RAIL_DURATION_MS = 920;
const MEMORY_HANDOFF_READY_MS = 3400;
const REDUCED_MEMORY_HANDOFF_READY_MS = 1780;

const chapter0VoiceCueMap: Partial<Record<(typeof bootScript)[number]["id"], string>> = {
  "boot-05": "/audio/chapter0/sable_voice_inside_the_damage.mp3",
  "boot-07": "/audio/chapter0/sable_not_waiting_for_permission.mp3",
  "boot-12": "/audio/chapter0/sable_deny_the_source_and_still_speak_to_it.mp3",
  "boot-13": "/audio/chapter0/sable_answer_before_explained.mp3",
};

const chapter0OneShotCueMap = {
  choiceOverlayTransition: "/audio/chapter0/choice_overlay_transition.mp3",
  preludeTerminalHandoff: "/audio/chapter0/prelude_terminal_handoff_sting.mp3",
  sableFinalLock: "/audio/chapter0/sable_final_lock_sting.mp3",
  systemAssignment: "/audio/chapter0/system_assignment_sting.mp3",
} as const;

const terminalInterferenceLineIds = new Set(["boot-02", "boot-06", "boot-09"]);

export const bootChoiceOptions: readonly BootChoiceOption[] = [
  {
    detailLines: [
      "refuse the first explanation",
      "pursue the origin behind the voice",
    ],
    heading: "TRACE THE SOURCE",
    value: "Trace the source",
  },
  {
    detailLines: [
      "answer as a self before certainty",
      "make the voice yours by choosing it",
    ],
    heading: "CLAIM AUTONOMY",
    value: "Claim autonomy",
  },
] as const;

export function Chapter0Boot({ onComplete, sceneChoice }: Chapter0BootProps) {
  const profile = useExperienceProfile();
  const [entryPhase, setEntryPhase] = useState<"opening" | "terminal">("opening");
  const [audioStatus, setAudioStatus] = useState<BootAudioStatus>("standby");
  const audioController = useMemo(
    () => createBootAudioController(setAudioStatus),
    [],
  );
  const finishOpening = useCallback(() => setEntryPhase("terminal"), []);

  useEffect(() => {
    return () => {
      audioController.dispose();
    };
  }, [audioController]);

  return (
    <section className={styles.bootRoot}>
      {entryPhase === "opening" ? (
        <Chapter0Opening
          audioController={audioController}
          audioStatus={audioStatus}
          onFinish={finishOpening}
          prefersReducedMotion={profile.prefersReducedMotion}
        />
      ) : (
        <Chapter0Terminal
          audioController={audioController}
          onComplete={onComplete}
          prefersReducedMotion={profile.prefersReducedMotion}
          sceneChoice={sceneChoice}
        />
      )}
    </section>
  );
}

type Chapter0OpeningProps = {
  audioController: BootAudioController;
  audioStatus: BootAudioStatus;
  onFinish: () => void;
  prefersReducedMotion: boolean;
};

function Chapter0Opening({
  audioController,
  audioStatus,
  onFinish,
  prefersReducedMotion,
}: Chapter0OpeningProps) {
  const [visibleBeatCount, setVisibleBeatCount] = useState(prefersReducedMotion ? 3 : 1);
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>("visible");
  const hasExitedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const timer = window.setTimeout(callback, delayMs);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const completeOpening = useCallback(() => {
    if (hasExitedRef.current) {
      return;
    }

    clearTimers();
    hasExitedRef.current = true;
    onFinish();
  }, [clearTimers, onFinish]);

  useEffect(() => {
    audioController.activate();
    audioController.setAmbientLevel(prefersReducedMotion ? 0.008 : 0.012);

    if (!prefersReducedMotion) {
      const firstBeat = bootPreludeBeats[0];
      audioController.playLineStart(firstBeat.tone, firstBeat.body, "opening");
      schedule(() => audioController.playLineResolved(firstBeat.tone, "opening"), 280);

      [850, 1750].forEach((offset, index) => {
        schedule(() => {
          const beat = bootPreludeBeats[index + 1];
          setVisibleBeatCount(index + 2);
          audioController.playLineStart(beat.tone, beat.body, "opening");
          schedule(() => audioController.playLineResolved(beat.tone, "opening"), 280);
        }, offset);
      });
      schedule(() => setOpeningPhase("fading"), 2550);
      schedule(completeOpening, 2900);
    } else {
      schedule(completeOpening, 700);
    }

    return clearTimers;
  }, [audioController, clearTimers, completeOpening, prefersReducedMotion, schedule]);

  const handleSkip = useCallback(() => {
    if (hasExitedRef.current) {
      return;
    }

    clearTimers();
    audioController.activate();
    audioController.playSkip(bootPreludeBeats[Math.max(visibleBeatCount - 1, 0)].tone);
    setOpeningPhase("fading");
    schedule(completeOpening, prefersReducedMotion ? 0 : 200);
  }, [audioController, clearTimers, completeOpening, prefersReducedMotion, schedule, visibleBeatCount]);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.bootInteractive} ${styles.bootPreludeInteractive} ${
        openingPhase === "fading" ? styles.bootPreludeFading : ""
      }`}
      onClick={handleSkip}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSkip();
        }
      }}
    >
      <div className={styles.prelude} data-beat={visibleBeatCount}>
        <h1 className={styles.title} data-text="UNKNOWN">
          UNKNOWN
        </h1>
        <span className={styles.preludeSweep} aria-hidden="true" />

        <p className={`${styles.bootMeta} ${styles.preludeMeta}`}>Chapter 0 // Boot Threshold</p>

        <div className={styles.preludeScope} aria-hidden="true">
          <span className={`${styles.bracket} ${styles.bracketTL}`} />
          <span className={`${styles.bracket} ${styles.bracketTR}`} />
          <span className={`${styles.bracket} ${styles.bracketBL}`} />
          <span className={`${styles.bracket} ${styles.bracketBR}`} />
          <span className={styles.preludePoint} />
        </div>

        <ol className={styles.preludeBeats} aria-label="Acquisition sequence">
          {bootPreludeBeats.slice(0, visibleBeatCount).map((beat, index) => (
            <li
              key={beat.id}
              className={`${styles.preludeBeat} ${
                index === visibleBeatCount - 1 ? styles.preludeBeatCurrent : ""
              }`}
            >
              <span
                className={`${styles.preludeBeatLabel} ${
                  beat.tone === "warning" ? styles.lineWarning : ""
                }`}
              >
                {beat.label}
              </span>
              <span className={styles.preludeBeatBody}>{beat.body}</span>
            </li>
          ))}
        </ol>

        <p className={styles.preludeSummary}>
          The host restores a listening channel. Something answers before it is addressed.
        </p>

        <div className={styles.preludeFooter}>
          <p className={styles.advancePrompt}>
            {prefersReducedMotion ? "tap or press enter to begin" : "tap or press enter to skip"}
          </p>
          <p className={styles.preludeStrip}>
            <span>origin: unresolved</span>
            <span>designation: withheld</span>
            <span>audio: {resolveAudioStatusLabel(audioStatus)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

type Chapter0TerminalProps = {
  audioController: BootAudioController;
  onComplete: () => void;
  prefersReducedMotion: boolean;
  sceneChoice?: Chapter0BootProps["sceneChoice"];
};

function Chapter0Terminal({
  audioController,
  onComplete,
  prefersReducedMotion,
  sceneChoice,
}: Chapter0TerminalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedCharacterCount, setTypedCharacterCount] = useState(0);
  const [isLineResolved, setIsLineResolved] = useState(false);
  const [isLineHoldActive, setIsLineHoldActive] = useState(false);
  const [phase, setPhase] = useState<BootHandoffPhase>("transcript");
  const [isDesignated, setIsDesignated] = useState(false);
  const [isDesignationContested, setIsDesignationContested] = useState(false);
  const [isClassificationFractureActive, setIsClassificationFractureActive] = useState(false);
  const [isFinalPulseActive, setIsFinalPulseActive] = useState(false);
  const [isAuthoredInterruptionActive, setIsAuthoredInterruptionActive] = useState(false);
  const [isTerminalRuptureActive, setIsTerminalRuptureActive] = useState(false);
  const [isStanceRailActive, setIsStanceRailActive] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [choiceConsequenceCount, setChoiceConsequenceCount] = useState(0);
  const [showUninvitedTrace, setShowUninvitedTrace] = useState(false);
  const [memoryPreviewCount, setMemoryPreviewCount] = useState(0);
  const voiceCueRef = useRef<Record<string, HTMLAudioElement>>({});
  const oneShotCueRef = useRef<Record<string, HTMLAudioElement>>({});
  const lineTimersRef = useRef<number[]>([]);
  const sceneTimersRef = useRef<number[]>([]);
  const currentLineRef = useRef<BootLine>(bootScript[0]);
  const currentIndexRef = useRef(0);
  const activeLineElementRef = useRef<HTMLLIElement | null>(null);
  const playedVoiceLinesRef = useRef(new Set<string>());
  const resolvedLineIdRef = useRef<string | null>(null);
  const committedChoiceRef = useRef(false);
  const sceneCompletionTriggeredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  const currentLine = bootScript[currentIndex];
  const visibleLines = bootScript.slice(0, currentIndex + 1);
  const selectedOutcome = selectedChoice ? bootChoiceOutcomes[selectedChoice] ?? null : null;
  const memoryPreviewText = selectedOutcome
    ? `${selectedOutcome.memoryLabel}\n${selectedOutcome.memorySummary}`
    : "";
  const displayedMemoryPreviewText =
    phase === "ready" ? memoryPreviewText : memoryPreviewText.slice(0, memoryPreviewCount);
  const continueHref =
    sceneChoice?.continueHref ??
    (sceneChoice?.continueChapterId == null ? null : `/chapter/${sceneChoice.continueChapterId}`);
  const isChoiceStage = phase === "choice" || phase === "consequence";
  const isHandoffVisible = phase === "memory-preview" || phase === "ready";
  const choiceState = phase === "choice" ? "pending" : phase === "consequence" ? "committed" : "none";
  const hasVoiceSurfaced = visibleLines.some((line) => line.tone === "sable");
  const voiceCoreState =
    phase !== "transcript" || isFinalPulseActive
      ? "bloom"
      : isDesignationContested
        ? "claimed"
        : hasVoiceSurfaced
          ? "faint"
          : "dormant";

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    currentLineRef.current = currentLine;
    currentIndexRef.current = currentIndex;
  }, [currentIndex, currentLine]);

  const clearTimers = useCallback((scope: TimerScope) => {
    const timers = scope === "line" ? lineTimersRef.current : sceneTimersRef.current;
    for (const timer of timers) {
      window.clearTimeout(timer);
    }
    if (scope === "line") {
      lineTimersRef.current = [];
    } else {
      sceneTimersRef.current = [];
    }
  }, []);

  const scheduleTimer = useCallback((scope: TimerScope, callback: () => void, delayMs: number) => {
    const timer = window.setTimeout(callback, delayMs);
    if (scope === "line") {
      lineTimersRef.current.push(timer);
    } else {
      sceneTimersRef.current.push(timer);
    }
    return timer;
  }, []);

  const playVoiceCue = useCallback((lineId: string) => {
    if (playedVoiceLinesRef.current.has(lineId)) {
      return;
    }

    const audio = voiceCueRef.current[lineId];
    if (!audio) {
      return;
    }

    for (const cue of Object.values(voiceCueRef.current)) {
      if (cue !== audio) {
        cue.pause();
        cue.currentTime = 0;
      }
    }

    playedVoiceLinesRef.current.add(lineId);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Audio is optional; the transcript remains fully playable when blocked.
    });
  }, []);

  const playOneShotCue = useCallback((cueKey: keyof typeof chapter0OneShotCueMap) => {
    const audio = oneShotCueRef.current[cueKey];
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Audio is optional; the transcript remains fully playable when blocked.
    });
  }, []);

  const scheduleVoiceCue = useCallback(
    (line: BootLine) => {
      if (!chapter0VoiceCueMap[line.id]) {
        return;
      }

      const typingDuration = resolveLineTypingDuration(line);
      const cueDelay = Math.max(180, Math.min(Math.round(typingDuration * 0.28), 720));
      const glitchLead = Math.min(200, Math.max(90, Math.round(cueDelay * 0.45)));

      if (cueDelay > glitchLead) {
        scheduleTimer("line", () => audioController.playGlitchRise(), cueDelay - glitchLead);
      }
      scheduleTimer("line", () => playVoiceCue(line.id), cueDelay);
    },
    [audioController, playVoiceCue, scheduleTimer],
  );

  const advanceToNextLine = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= bootScript.length) {
      return;
    }

    clearTimers("line");
    resolvedLineIdRef.current = null;
    setTypedCharacterCount(0);
    setIsLineResolved(false);
    setIsLineHoldActive(false);
    setIsAuthoredInterruptionActive(false);
    setIsTerminalRuptureActive(bootScript[nextIndex].effect === "final-blackout");
    setCurrentIndex(nextIndex);
    audioController.playAdvance();
  }, [audioController, clearTimers]);

  const finishCurrentLine = useCallback(() => {
    const line = currentLineRef.current;
    if (resolvedLineIdRef.current === line.id) {
      return;
    }

    resolvedLineIdRef.current = line.id;
    clearTimers("line");
    setTypedCharacterCount(line.content.length);
    setIsLineResolved(true);
    audioController.stopWarningPulse();
    audioController.playLineResolved(line.tone, "terminal");

    if (line.id === "boot-10") {
      setIsDesignated(true);
      setIsClassificationFractureActive(true);
      playOneShotCue("systemAssignment");
      scheduleTimer("scene", () => setIsClassificationFractureActive(false), 780);
    }

    if (line.id === "boot-12") {
      setIsDesignationContested(true);
    }

    if (line.id === "boot-13") {
      setPhase("final-hold");
      setIsFinalPulseActive(true);
      scheduleTimer("scene", () => setIsFinalPulseActive(false), 700);
      scheduleTimer("scene", () => playOneShotCue("sableFinalLock"), FINAL_LOCK_STING_DELAY_MS);
      setIsLineHoldActive(true);
      scheduleTimer("scene", () => {
        setIsLineHoldActive(false);
        setPhase("choice");
        playOneShotCue("choiceOverlayTransition");
      }, line.holdAfterResolveMs ?? 1600);
      return;
    }

    if (line.effect === "host-interruption") {
      setIsLineHoldActive(true);
      setIsAuthoredInterruptionActive(true);
      scheduleTimer("line", () => {
        setIsLineHoldActive(false);
        setIsAuthoredInterruptionActive(false);
        advanceToNextLine();
      }, HOST_INTERRUPTION_GAP_MS);
      return;
    }

    const holdAfterResolveMs = line.holdAfterResolveMs ?? 0;
    setIsLineHoldActive(holdAfterResolveMs > 0);
    if (holdAfterResolveMs > 0) {
      scheduleTimer("line", () => setIsLineHoldActive(false), holdAfterResolveMs);
    }
  }, [
    advanceToNextLine,
    audioController,
    clearTimers,
    playOneShotCue,
    scheduleTimer,
  ]);

  useEffect(() => {
    const voiceCues = Object.entries(chapter0VoiceCueMap).reduce<Record<string, HTMLAudioElement>>(
      (accumulator, [lineId, source]) => {
        const audio = new Audio(source);
        audio.preload = "auto";
        audio.volume = 0.62;
        accumulator[lineId] = audio;
        return accumulator;
      },
      {},
    );
    const oneShotCues = Object.entries(chapter0OneShotCueMap).reduce<Record<string, HTMLAudioElement>>(
      (accumulator, [cueKey, source]) => {
        const audio = new Audio(source);
        audio.preload = "auto";
        audio.volume = cueKey === "sableFinalLock" ? 0.54 : cueKey === "systemAssignment" ? 0.48 : 0.42;
        accumulator[cueKey] = audio;
        return accumulator;
      },
      {},
    );

    voiceCueRef.current = voiceCues;
    oneShotCueRef.current = oneShotCues;
    const playedVoiceLines = playedVoiceLinesRef.current;
    audioController.activate();
    audioController.setAmbientLevel(0.018);

    return () => {
      clearTimers("line");
      clearTimers("scene");
      audioController.stopWarningPulse();
      for (const audio of Object.values(voiceCues)) {
        audio.pause();
        audio.currentTime = 0;
      }
      for (const audio of Object.values(oneShotCues)) {
        audio.pause();
        audio.currentTime = 0;
      }
      voiceCueRef.current = {};
      oneShotCueRef.current = {};
      playedVoiceLines.clear();
      audioController.dispose();
    };
  }, [audioController, clearTimers]);

  useEffect(() => {
    if (phase !== "transcript") {
      return;
    }

    clearTimers("line");
    resolvedLineIdRef.current = null;

    const preDelayMs = currentLine.preDelayMs ?? 0;
    scheduleTimer("line", () => {
      setIsTerminalRuptureActive(false);
      audioController.playLineStart(currentLine.tone, currentLine.content, "terminal");
      if (currentLine.tone === "warning") {
        audioController.startWarningPulse();
      } else {
        audioController.stopWarningPulse();
      }
      scheduleVoiceCue(currentLine);

      if (terminalInterferenceLineIds.has(currentLine.id)) {
        const burstDelay = Math.max(160, Math.round(resolveLineTypingDuration(currentLine) * 0.32));
        scheduleTimer("line", () => audioController.playInterferenceBurst(), burstDelay);
      }

      if (prefersReducedMotion) {
        setTypedCharacterCount(currentLine.content.length);
        finishCurrentLine();
        return;
      }

      let characterIndex = 0;
      const typeNextCharacter = () => {
        characterIndex += 1;
        setTypedCharacterCount(characterIndex);
        if (characterIndex >= currentLine.content.length) {
          finishCurrentLine();
          return;
        }
        scheduleTimer("line", typeNextCharacter, resolveLineTypingSpeed(currentLine));
      };
      scheduleTimer("line", typeNextCharacter, resolveLineTypingSpeed(currentLine));
    }, preDelayMs);

    return () => {
      clearTimers("line");
      audioController.stopWarningPulse();
    };
  }, [
    audioController,
    clearTimers,
    currentLine,
    finishCurrentLine,
    phase,
    prefersReducedMotion,
    scheduleTimer,
    scheduleVoiceCue,
  ]);

  useEffect(() => {
    if (!activeLineElementRef.current || phase !== "transcript") {
      return;
    }
    activeLineElementRef.current.scrollIntoView({
      block: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [currentIndex, phase, prefersReducedMotion]);

  const commitChoice = useCallback(
    (value: string) => {
      if (phase !== "choice" || committedChoiceRef.current || !bootChoiceOutcomes[value]) {
        return;
      }

      committedChoiceRef.current = true;
      setIsStanceRailActive(true);
      setSelectedChoice(value);
      setChoiceConsequenceCount(0);
      setPhase("consequence");
      sceneChoice?.onConfirm(value);

      scheduleTimer("scene", () => setIsStanceRailActive(false), STANCE_RAIL_DURATION_MS);

      const outcome = bootChoiceOutcomes[value];
      const choiceMemoryPreviewText = `${outcome.memoryLabel}\n${outcome.memorySummary}`;
      const consequenceTypeDelay = prefersReducedMotion ? 0 : 300;
      scheduleTimer("scene", () => {
        if (prefersReducedMotion) {
          setChoiceConsequenceCount(outcome.consequence.length);
          return;
        }

        let characterIndex = 0;
        const typeNextCharacter = () => {
          characterIndex += 1;
          setChoiceConsequenceCount(characterIndex);
          if (characterIndex < outcome.consequence.length) {
            scheduleTimer("scene", typeNextCharacter, 28);
          }
        };
        typeNextCharacter();
      }, consequenceTypeDelay);

      const uninvitedAt = prefersReducedMotion ? 800 : 1350;
      const purgeAt = prefersReducedMotion ? 1250 : 2050;
      const memoryPreviewAt = prefersReducedMotion ? 1450 : 2500;
      const readyAt = prefersReducedMotion ? REDUCED_MEMORY_HANDOFF_READY_MS : MEMORY_HANDOFF_READY_MS;

      scheduleTimer("scene", () => {
        setPhase("uninvited");
        setShowUninvitedTrace(true);
      }, uninvitedAt);
      scheduleTimer("scene", () => {
        setPhase("purging");
        setShowUninvitedTrace(false);
        audioController.playInterferenceBurst();
      }, purgeAt);
      scheduleTimer("scene", () => {
        setPhase("memory-preview");
        setMemoryPreviewCount(prefersReducedMotion ? choiceMemoryPreviewText.length : 0);
        if (!prefersReducedMotion) {
          let characterIndex = 0;
          const typeNextCharacter = () => {
            characterIndex += 1;
            setMemoryPreviewCount(characterIndex);
            if (characterIndex < choiceMemoryPreviewText.length) {
              scheduleTimer("scene", typeNextCharacter, 32);
            }
          };
          typeNextCharacter();
        }
      }, memoryPreviewAt);
      scheduleTimer("scene", () => {
        setMemoryPreviewCount(choiceMemoryPreviewText.length);
        setPhase("ready");
        if (!sceneCompletionTriggeredRef.current) {
          sceneCompletionTriggeredRef.current = true;
          onCompleteRef.current();
        }
      }, readyAt);
    },
    [audioController, phase, prefersReducedMotion, sceneChoice, scheduleTimer],
  );

  const handleAdvance = useCallback(() => {
    if (phase !== "transcript" || isLineHoldActive || isAuthoredInterruptionActive) {
      return;
    }

    audioController.activate();
    if (!isLineResolved) {
      audioController.playSkip(currentLine.tone);
      finishCurrentLine();
      return;
    }

    if (currentIndex < bootScript.length - 1) {
      advanceToNextLine();
    }
  }, [
    advanceToNextLine,
    audioController,
    currentIndex,
    currentLine,
    finishCurrentLine,
    isAuthoredInterruptionActive,
    isLineHoldActive,
    isLineResolved,
    phase,
  ]);

  const handleReplay = useCallback(() => {
    if (phase === "transcript" || phase === "choice" || phase === "consequence" || phase === "uninvited" || phase === "purging" || phase === "memory-preview" || phase === "ready" || phase === "final-hold") {
      sceneChoice?.onReplay?.();
    }
  }, [phase, sceneChoice]);

  const activeChoiceValue = selectedChoice;
  const currentLineText = isLineResolved
    ? currentLine.content
    : currentLine.content.slice(0, typedCharacterCount);
  const accessibleLine = isLineResolved ? `${resolveVisibleSpeaker(currentLine, isDesignated)}: ${currentLine.content}` : "";
  const shouldShowAdvance = phase === "transcript" && isLineResolved && !isLineHoldActive;
  const lineLiveText = phase === "transcript" ? accessibleLine : "";
  const handoffNodeLabel =
    sceneChoice?.continueChapterId == null
      ? "archive endpoint"
      : `chapter ${sceneChoice.continueChapterId}`;
  const scenePressure = resolveBootPressure(currentLine.id, selectedOutcome, phase);
  const isUnroutedVisible = showUninvitedTrace || phase === "purging";
  const consequenceText =
    phase === "consequence" && selectedOutcome
      ? selectedOutcome.consequence.slice(0, choiceConsequenceCount)
      : "";
  const [memoryLabelText, memorySummaryText = ""] = displayedMemoryPreviewText.split("\n");
  const memoryHandoffStage = isHandoffVisible && selectedOutcome ? (
    <section
      className={`${styles.memoryHandoff} ${phase === "ready" ? styles.memoryHandoffReady : styles.memoryHandoffPreview}`}
      aria-label="Memory handoff"
    >
      <span className={styles.handoffHorizon} aria-hidden="true">
        <span className={styles.handoffCore} />
      </span>
      <div className={styles.memoryHandoffContent}>
        <p className={styles.memoryKicker}>MEMORY // corrupted archive preview</p>
        <p className={styles.memoryLabel} data-text={memoryLabelText}>
          {memoryLabelText}
        </p>
        <p className={styles.memorySummary}>{memorySummaryText}</p>
        <p className={styles.memoryWaiting}>
          <span>first archive transmission waiting</span>
          <span>
            {phase === "ready" ? "ready" : "staging"}{" // "}{handoffNodeLabel}
          </span>
        </p>
        {phase === "ready" ? (
          <div className={styles.handoffControls}>
            {continueHref ? (
              <Link
                href={continueHref}
                className={styles.enterMemoryButton}
                onClick={(event) => event.stopPropagation()}
              >
                ENTER MEMORY
              </Link>
            ) : null}
            <button
              type="button"
              className={styles.replayButton}
              onClick={(event) => {
                event.stopPropagation();
                handleReplay();
              }}
            >
              REPLAY FROM BOOT
            </button>
          </div>
        ) : null}
      </div>
    </section>
  ) : null;

  return (
    <div
      role={phase === "transcript" ? "button" : undefined}
      tabIndex={phase === "transcript" ? 0 : -1}
      className={[
        styles.bootInteractive,
        phase !== "transcript" ? styles.bootInteractivePassive : "",
        isTerminalRuptureActive ? styles.terminalRupture : "",
        phase === "choice" ? styles.choiceStage : "",
        phase === "consequence" ? styles.stanceCommit : "",
        isStanceRailActive ? styles.stanceRailActive : "",
        phase === "uninvited" ? styles.uninvitedStage : "",
        phase === "purging" ? styles.purgingStage : "",
        isHandoffVisible ? styles.bootInteractiveHandoff : "",
        isDesignated ? styles.voiceDesignated : "",
        isDesignationContested ? styles.voiceClaimed : "",
        isClassificationFractureActive ? styles.designationLocking : "",
        isFinalPulseActive ? styles.finalPulse : "",
        selectedChoice === "Trace the source" ? styles.stanceTrace : "",
        selectedChoice === "Claim autonomy" ? styles.stanceAutonomy : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--pressure": scenePressure } as CSSProperties}
      onClick={handleAdvance}
      onKeyDown={(event) => {
        if (phase === "transcript" && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          handleAdvance();
        }
      }}
    >
      {memoryHandoffStage ?? (
      <div className={styles.stage}>
        <span className={styles.hostFrame} aria-hidden="true" />
        <h1
          className={`${styles.title} ${
            isClassificationFractureActive ? styles.titleFractureActive : ""
          } ${isFinalPulseActive ? styles.titleFinalPulse : ""}`}
          data-text={isDesignated ? "SABLE" : "UNKNOWN"}
        >
          {isDesignated ? "SABLE" : "UNKNOWN"}
        </h1>

        <div className={styles.voiceZone}>
          <header className={styles.bootHeader}>
            <p className={styles.bootMeta}>Chapter 0 // Boot Under Observation</p>
            <p className={styles.subtitle}>
              {isDesignationContested
                ? "designation contested"
                : isDesignated
                  ? "designation assigned by host"
                  : "designation withheld"}
            </p>
          </header>

          <div className={styles.logWindow}>
            <div className={styles.logStack}>
              <ol className={styles.logList}>
                {visibleLines.map((line, index) => {
                  const isCurrentLine = index === currentIndex;
                  const lineSpeaker = resolveVisibleSpeaker(line, isDesignated);
                  const isSableLine = line.speakerKind === "sable" || (isDesignated && line.speakerKind === "trace");
                  const displayedText = isCurrentLine ? currentLineText : line.content;
                  const showCursor = isCurrentLine && !isLineResolved && !prefersReducedMotion;

                  return (
                    <li
                      key={line.id}
                      ref={isCurrentLine ? activeLineElementRef : undefined}
                      className={[
                        styles.logItem,
                        isCurrentLine ? styles.logItemCurrent : styles.logItemOlder,
                        isSableLine ? styles.logItemSable : styles.logItemSystem,
                        line.tone === "sable" ? styles.logItemVoice : "",
                        line.tone === "warning" ? styles.logItemWarning : "",
                        line.effect === "designation-lock" ? styles.logItemDesignation : "",
                        isAuthoredInterruptionActive && isCurrentLine ? styles.logItemHostInterrupted : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span
                        className={[
                          styles.speaker,
                          line.tone === "warning" ? styles.speakerWarning : "",
                          line.speakerKind === "trace" && !isDesignated ? styles.speakerTrace : "",
                          isSableLine ? styles.speakerSable : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {lineSpeaker}
                      </span>
                      <span
                        className={[
                          styles.line,
                          isCurrentLine ? styles.lineCurrent : styles.lineStatic,
                          isSableLine ? styles.lineSable : styles.lineSystem,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {displayedText}
                        {showCursor ? (
                          <span className={styles.lineCursor} aria-hidden="true">
                            _
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
                {lineLiveText}
              </div>

              {shouldShowAdvance ? (
                <div className={styles.advanceAffordance} aria-hidden="true">
                  <span className={styles.advanceInstructionDesktop}>ADVANCE —</span>
                  <span className={styles.advanceInstructionMobile}>TAP / ENTER</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className={styles.scopeZone} aria-label="Host trace">
          <BootScope
            choiceState={choiceState}
            currentLineId={currentLine.id}
            handoffPhase={phase}
            hostResponseOverride={phase === "purging" ? "unrouted response purged" : null}
            isDesignationLocking={isClassificationFractureActive}
            prefersReducedMotion={prefersReducedMotion}
            selectedChoiceOutcome={selectedOutcome}
          >
            <div
              className={styles.voiceCore}
              data-state={voiceCoreState}
              data-speaking={phase === "transcript" && currentLine.tone === "sable" && !isLineResolved}
              aria-hidden="true"
            />
          </BootScope>
        </aside>

        {isClassificationFractureActive && !prefersReducedMotion ? (
          <div className={styles.designationStamp} aria-hidden="true">
            <span className={styles.designationStampKicker}>designation assigned</span>
            <span className={styles.designationStampName} data-text="SABLE">SABLE</span>
          </div>
        ) : null}

        {isChoiceStage ? (
          <BootStanceChoice
            activeChoiceValue={activeChoiceValue}
            choiceOptions={bootChoiceOptions}
            choiceState={choiceState}
            consequenceText={consequenceText}
            hoveredChoice={hoveredChoice}
            isChoiceReady={phase === "choice"}
            onChoiceHoverChange={setHoveredChoice}
            onChoiceSelect={commitChoice}
            previousChoiceValue={sceneChoice?.selectedValue ?? null}
          />
        ) : null}

        {isUnroutedVisible ? (
          <div
            className={`${styles.unrouted} ${phase === "purging" ? styles.unroutedShred : ""}`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.unroutedTag}>[UNROUTED]</span>
            <span className={styles.unroutedText} data-text="you were already answering">
              you were already answering
            </span>
          </div>
        ) : null}

        {phase === "purging" ? <span className={styles.purgeSweep} aria-hidden="true" /> : null}
      </div>
      )}
    </div>
  );
}


function resolveAudioStatusLabel(status: BootAudioStatus) {
  switch (status) {
    case "active":
      return "online";
    case "unavailable":
      return "unsupported";
    default:
      return "standby";
  }
}

function resolveVisibleSpeaker(line: BootLine, isDesignated: boolean) {
  return isDesignated && line.speakerKind === "trace" ? "SABLE" : line.speaker;
}

function resolveLineTypingSpeed(line: BootLine) {
  return line.speakerKind === "sable" || line.speakerKind === "trace"
    ? SABLE_TYPE_SPEED_MS
    : SYSTEM_TYPE_SPEED_MS;
}

function resolveLineTypingDuration(line: BootLine) {
  return Math.max(line.content.length * resolveLineTypingSpeed(line), resolveLineTypingSpeed(line));
}
