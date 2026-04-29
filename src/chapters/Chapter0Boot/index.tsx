"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createBootAudioController,
  type BootAudioController,
  type BootAudioStatus,
} from "@/chapters/Chapter0Boot/audio";
import { BootTracePanel } from "@/chapters/Chapter0Boot/panel";
import { bootPreludeBeats, bootScript, type BootLine } from "@/chapters/Chapter0Boot/script";
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

type OpeningPhase = "visible" | "fading";

type BootChoiceOption = {
  detailLines: [string, string];
  heading: string;
  value: string;
};

const SYSTEM_TYPE_SPEED_MS = 28;
const SABLE_TYPE_SPEED_MS = 48;
const SABLE_PRETYPE_DELAY_MS = 600;
const TERMINAL_HANDOFF_DELAY_MS = 260;
const FINAL_LINE_HOLD_MS = 1800;
const TITLE_PULSE_DURATION_MS = 1200;
const CHOICE_RESPONSE_DELAY_MS = 280;
const MEMORY_UNLOCKED_LABEL = "MEMORY UNLOCKED";

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
          onFinish={() => setEntryPhase("terminal")}
          prefersReducedMotion={profile.prefersReducedMotion}
        />
      ) : null}
      {entryPhase === "terminal" ? (
        <Chapter0Terminal
          audioController={audioController}
          onComplete={onComplete}
          sceneChoice={sceneChoice}
        />
      ) : null}
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
  const [visibleBeatCount, setVisibleBeatCount] = useState(1);
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>("visible");
  const hasExitedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const handoffAudioRef = useRef<HTMLAudioElement | null>(null);

  const clearOpeningTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }

    timersRef.current = [];
  }, []);

  const completeOpening = useCallback(() => {
    if (hasExitedRef.current) {
      return;
    }

    clearOpeningTimers();
    hasExitedRef.current = true;
    onFinish();
  }, [clearOpeningTimers, onFinish]);

  const schedule = useMemo(
    () =>
      prefersReducedMotion
        ? {
            beatOffsets: [0, 420, 920, 1460],
            fadeAt: 2080,
            finishAt: 2360,
          }
        : {
            beatOffsets: [0, 980, 2140, 3460],
            fadeAt: 4700,
            finishAt: 5140,
          },
    [prefersReducedMotion],
  );

  useEffect(() => {
    const handoffAudio = new Audio(chapter0OneShotCueMap.preludeTerminalHandoff);

    handoffAudio.preload = "auto";
    handoffAudio.volume = 0.38;
    handoffAudioRef.current = handoffAudio;

    audioController.activate();
    audioController.setAmbientLevel(prefersReducedMotion ? 0.012 : 0.018);
    audioController.playLineStart(
      bootPreludeBeats[0].tone,
      bootPreludeBeats[0].body,
      "opening",
    );
    window.setTimeout(() => {
      audioController.playLineResolved(bootPreludeBeats[0].tone, "opening");
    }, prefersReducedMotion ? 190 : 320);

    const timers = schedule.beatOffsets.slice(1).map((offset, index) =>
      window.setTimeout(() => {
        const beat = bootPreludeBeats[index + 1];

        setVisibleBeatCount(index + 2);
        audioController.playLineStart(beat.tone, beat.body, "opening");

        window.setTimeout(() => {
          audioController.playLineResolved(beat.tone, "opening");
        }, prefersReducedMotion ? 190 : 320);
      }, offset),
    );

    const fadeTimer = window.setTimeout(() => {
      setOpeningPhase("fading");
    }, schedule.fadeAt);
    const finishTimer = window.setTimeout(() => {
      completeOpening();
    }, schedule.finishAt);

    timersRef.current = [...timers, fadeTimer, finishTimer];

    return () => {
      clearOpeningTimers();
      handoffAudio.pause();
      handoffAudio.currentTime = 0;
      handoffAudioRef.current = null;
    };
  }, [audioController, clearOpeningTimers, completeOpening, prefersReducedMotion, schedule]);

  function handleSkip() {
    if (hasExitedRef.current) {
      return;
    }

    const currentBeat = bootPreludeBeats[Math.max(visibleBeatCount - 1, 0)];

    clearOpeningTimers();
    audioController.activate();
    audioController.playSkip(currentBeat.tone);
    audioController.setAmbientLevel(0.01);
    setOpeningPhase("fading");

    window.setTimeout(() => {
      completeOpening();
    }, 220);
  }

  const visibleBeats = bootPreludeBeats.slice(0, visibleBeatCount);
  const progress = visibleBeatCount / bootPreludeBeats.length;
  const statusLabel =
    visibleBeatCount >= bootPreludeBeats.length
      ? "terminal lock acquired"
      : visibleBeatCount >= 3
        ? "identity trace cohering"
        : visibleBeatCount >= 2
          ? "host scan unstable"
          : "channel search active";

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
      <div className={styles.bootPreludeShell}>
        <div className={styles.bootPreludeColumn}>
          <header className={styles.bootPreludeHeader}>
            <p className={styles.bootMeta}>Chapter 0 // Boot Threshold</p>
            <div className={styles.titleBlock}>
              <h1 className={styles.title} data-text="SABLE">
                SABLE
              </h1>
              <p className={styles.bootPreludeSummary}>
                The host tries to restore a clean machine state. Something inside it
                is already answering back.
              </p>
            </div>
          </header>

          <div className={styles.bootPreludeTimeline}>
            {visibleBeats.map((beat, index) => {
              const isCurrent = index === visibleBeats.length - 1;

              return (
                <article
                  key={beat.id}
                  className={`${styles.bootPreludeBeat} ${
                    isCurrent ? styles.bootPreludeBeatCurrent : ""
                  }`}
                >
                  <p
                    className={`${styles.bootPreludeBeatLabel} ${
                      beat.tone === "warning"
                        ? styles.lineWarning
                        : beat.tone === "sable"
                          ? styles.speakerSable
                          : ""
                    }`}
                  >
                    {beat.label}
                  </p>
                  <p className={styles.bootPreludeBeatBody}>{beat.body}</p>
                </article>
              );
            })}
          </div>

          <div className={styles.bootPreludeFooter}>
            <div className={styles.bootPreludeMeter}>
              <div
                className={styles.bootPreludeMeterFill}
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
            <p className={styles.advancePrompt}>
              {prefersReducedMotion
                ? "tap or press enter to begin"
                : "tap or press enter to skip prelude"}
            </p>
          </div>
        </div>

        <aside className={styles.bootPreludeRail}>
          <section className={styles.statusPanel}>
            <p className={styles.statusTitle}>Restoration State</p>
            <div className={styles.statusList}>
              <div className={styles.statusRow}>
                <span>boot phase</span>
                <span className={styles.statusValue}>
                  {visibleBeatCount} / {bootPreludeBeats.length}
                </span>
              </div>
              <div className={styles.statusRow}>
                <span>trace mood</span>
                <span className={styles.statusValue}>{statusLabel}</span>
              </div>
              <div className={styles.statusRow}>
                <span>designation</span>
                <span className={styles.statusValue}>
                  {visibleBeatCount >= 3 ? "forming" : "withheld"}
                </span>
              </div>
              <div className={styles.statusRow}>
                <span>audio trace</span>
                <span className={styles.statusValue}>
                  {resolveAudioStatusLabel(audioStatus)}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.hintPanel}>
            <p className={styles.hintTitle}>Handoff Window</p>
            <p className={styles.hintBody}>
              System diagnostics are attempting to stabilize the shell before the full
              terminal transcript is exposed.
            </p>
            <p className={styles.hintFooter}>
              {visibleBeatCount >= bootPreludeBeats.length
                ? "terminal route ready"
                : "boot prelude in progress"}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

type Chapter0TerminalProps = {
  audioController: BootAudioController;
  onComplete: () => void;
  sceneChoice?: Chapter0BootProps["sceneChoice"];
};

function Chapter0Terminal({
  audioController,
  onComplete,
  sceneChoice,
}: Chapter0TerminalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedCharacterCount, setTypedCharacterCount] = useState(0);
  const [isTypingStarted, setIsTypingStarted] = useState(false);
  const [isLineResolved, setIsLineResolved] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hasCommittedChoice, setHasCommittedChoice] = useState(false);
  const [interruptedLineIds, setInterruptedLineIds] = useState<Record<string, true>>({});
  const [recentlyInterruptedLineId, setRecentlyInterruptedLineId] = useState<string | null>(
    null,
  );
  const [flashingSableLabels, setFlashingSableLabels] = useState<Record<string, boolean>>({});
  const [isFinalHoldActive, setIsFinalHoldActive] = useState(false);
  const [isTitlePulsing, setIsTitlePulsing] = useState(false);
  const [isChoiceStageActive, setIsChoiceStageActive] = useState(false);
  const [showChoiceResponseLine, setShowChoiceResponseLine] = useState(false);
  const [hiddenChoiceValue, setHiddenChoiceValue] = useState<string | null>(null);
  const voiceCueRef = useRef<Record<string, HTMLAudioElement>>({});
  const oneShotCueRef = useRef<Record<string, HTMLAudioElement>>({});
  const onCompleteRef = useRef(onComplete);
  const currentLineRef = useRef<BootLine>(bootScript[0]);
  const typingStartTimeoutRef = useRef<number | null>(null);
  const typingTickTimeoutRef = useRef<number | null>(null);
  const scheduledVoiceTimeoutRef = useRef<number | null>(null);
  const interferenceBurstTimeoutRef = useRef<number | null>(null);
  const labelFlashTimeoutRef = useRef<number | null>(null);
  const interruptTagTimeoutRef = useRef<number | null>(null);
  const titlePulseTimeoutRef = useRef<number | null>(null);
  const finalHoldTimeoutRef = useRef<number | null>(null);
  const choiceResponseTimeoutRef = useRef<number | null>(null);
  const playedVoiceLineRef = useRef<string | null>(null);
  const resolvedLineIdRef = useRef<string | null>(null);
  const finalLandingTriggeredRef = useRef(false);
  const sceneCompletionTriggeredRef = useRef(false);
  const choiceOverlayCuePlayedRef = useRef(false);

  const visibleLines = useMemo(
    () => bootScript.slice(0, currentIndex + 1),
    [currentIndex],
  );
  const currentLine = bootScript[currentIndex];
  const activeChoiceValue = selectedChoice;
  const isChoiceCommitted = hasCommittedChoice;
  const shouldShowChoiceResponseLine =
    showChoiceResponseLine && Boolean(activeChoiceValue);
  const showContinuePrompt = isChoiceCommitted && shouldShowChoiceResponseLine;
  const continueHref =
    sceneChoice?.continueHref ??
    (sceneChoice?.continueChapterId == null ? null : `/chapter/${sceneChoice.continueChapterId}`);
  const allowTranscriptAdvance = !isChoiceStageActive;
  const isCompletionState = currentIndex === bootScript.length - 1;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    currentLineRef.current = currentLine;
  }, [currentLine]);

  const clearTypingTimers = useCallback(() => {
    if (typingStartTimeoutRef.current !== null) {
      window.clearTimeout(typingStartTimeoutRef.current);
      typingStartTimeoutRef.current = null;
    }

    if (typingTickTimeoutRef.current !== null) {
      window.clearTimeout(typingTickTimeoutRef.current);
      typingTickTimeoutRef.current = null;
    }
  }, []);

  const clearLandingTimers = useCallback(() => {
    if (titlePulseTimeoutRef.current !== null) {
      window.clearTimeout(titlePulseTimeoutRef.current);
      titlePulseTimeoutRef.current = null;
    }

    if (finalHoldTimeoutRef.current !== null) {
      window.clearTimeout(finalHoldTimeoutRef.current);
      finalHoldTimeoutRef.current = null;
    }

    if (choiceResponseTimeoutRef.current !== null) {
      window.clearTimeout(choiceResponseTimeoutRef.current);
      choiceResponseTimeoutRef.current = null;
    }

    if (interferenceBurstTimeoutRef.current !== null) {
      window.clearTimeout(interferenceBurstTimeoutRef.current);
      interferenceBurstTimeoutRef.current = null;
    }

  }, []);

  const playVoiceCue = useCallback((lineId: string) => {
    if (playedVoiceLineRef.current === lineId) {
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

    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore playback failures when the browser still gates audio.
    });
    playedVoiceLineRef.current = lineId;
    scheduledVoiceTimeoutRef.current = null;
  }, []);

  const playOneShotCue = useCallback((cueKey: keyof typeof chapter0OneShotCueMap) => {
    const audio = oneShotCueRef.current[cueKey];

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore playback failures when audio is still gated.
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
        window.setTimeout(() => {
          audioController.playGlitchRise();
        }, cueDelay - glitchLead);
      }

      scheduledVoiceTimeoutRef.current = window.setTimeout(() => {
        playVoiceCue(line.id);
      }, cueDelay);
    },
    [audioController, playVoiceCue],
  );

  const triggerFinalLanding = useCallback(() => {
    if (finalLandingTriggeredRef.current) {
      return;
    }

    finalLandingTriggeredRef.current = true;
    setIsFinalHoldActive(true);
    setIsTitlePulsing(true);

    titlePulseTimeoutRef.current = window.setTimeout(() => {
      setIsTitlePulsing(false);
    }, TITLE_PULSE_DURATION_MS);

    finalHoldTimeoutRef.current = window.setTimeout(() => {
      setIsFinalHoldActive(false);
      setIsChoiceStageActive(true);

      if (!sceneCompletionTriggeredRef.current) {
        sceneCompletionTriggeredRef.current = true;
        onCompleteRef.current();
      }
    }, FINAL_LINE_HOLD_MS);
  }, []);

  const finishCurrentLine = useCallback(
    ({ interrupted = false }: { interrupted?: boolean } = {}) => {
      const line = currentLineRef.current;

      if (resolvedLineIdRef.current === line.id) {
        return;
      }

      resolvedLineIdRef.current = line.id;
      clearTypingTimers();

      if (scheduledVoiceTimeoutRef.current !== null) {
        window.clearTimeout(scheduledVoiceTimeoutRef.current);
        scheduledVoiceTimeoutRef.current = null;
      }

      setTypedCharacterCount(line.content.length);
      setIsTypingStarted(true);
      setIsLineResolved(true);
      audioController.stopWarningPulse();
      audioController.playLineResolved(line.tone, "terminal");

      if (line.tone === "sable") {
        playVoiceCue(line.id);
      }

      if (line.id === "boot-10") {
        playOneShotCue("systemAssignment");
      }

      if (line.id === "boot-13") {
        window.setTimeout(() => {
          playOneShotCue("sableFinalLock");
        }, 140);
      }

      if (interrupted && line.speaker === "sable") {
        setInterruptedLineIds((previous) =>
          previous[line.id] ? previous : { ...previous, [line.id]: true },
        );
        setRecentlyInterruptedLineId(line.id);
        setFlashingSableLabels((previous) => ({ ...previous, [line.id]: true }));

        if (interruptTagTimeoutRef.current !== null) {
          window.clearTimeout(interruptTagTimeoutRef.current);
        }

        interruptTagTimeoutRef.current = window.setTimeout(() => {
          setRecentlyInterruptedLineId((previous) => (previous === line.id ? null : previous));
        }, 220);

        if (labelFlashTimeoutRef.current !== null) {
          window.clearTimeout(labelFlashTimeoutRef.current);
        }

        labelFlashTimeoutRef.current = window.setTimeout(() => {
          setFlashingSableLabels((previous) => {
            const next = { ...previous };

            delete next[line.id];
            return next;
          });
        }, 400);
      }

      if (line.id === "boot-13") {
        triggerFinalLanding();
      }
    },
    [audioController, clearTypingTimers, playOneShotCue, playVoiceCue, triggerFinalLanding],
  );

  useEffect(() => {
    const cues = Object.entries(chapter0VoiceCueMap).reduce<Record<string, HTMLAudioElement>>(
      (accumulator, [lineId, source]) => {
        const audio = new Audio(source);

        audio.preload = "auto";
        audio.volume = 0.62;
        accumulator[lineId] = audio;

        return accumulator;
      },
      {},
    );
    const oneShots = Object.entries(chapter0OneShotCueMap).reduce<Record<string, HTMLAudioElement>>(
      (accumulator, [cueKey, source]) => {
        const audio = new Audio(source);

        audio.preload = "auto";
        audio.volume =
          cueKey === "sableFinalLock"
            ? 0.54
            : cueKey === "systemAssignment"
              ? 0.48
              : cueKey === "preludeTerminalHandoff"
                ? 0.38
                : 0.42;
        accumulator[cueKey] = audio;

        return accumulator;
      },
      {},
    );

    voiceCueRef.current = cues;
    oneShotCueRef.current = oneShots;

    audioController.activate();
    audioController.setAmbientLevel(0.028);

    return () => {
      clearTypingTimers();
      clearLandingTimers();

      if (scheduledVoiceTimeoutRef.current !== null) {
        window.clearTimeout(scheduledVoiceTimeoutRef.current);
      }

      for (const audio of Object.values(cues)) {
        audio.pause();
        audio.currentTime = 0;
      }

      for (const audio of Object.values(oneShots)) {
        audio.pause();
        audio.currentTime = 0;
      }

      voiceCueRef.current = {};
      oneShotCueRef.current = {};
      scheduledVoiceTimeoutRef.current = null;
      labelFlashTimeoutRef.current = null;
      interruptTagTimeoutRef.current = null;
      playedVoiceLineRef.current = null;
      resolvedLineIdRef.current = null;
    };
  }, [audioController, clearLandingTimers, clearTypingTimers]);

  useEffect(() => {
    clearTypingTimers();
    clearLandingTimers();

    if (scheduledVoiceTimeoutRef.current !== null) {
      window.clearTimeout(scheduledVoiceTimeoutRef.current);
      scheduledVoiceTimeoutRef.current = null;
    }

    playedVoiceLineRef.current = null;
    resolvedLineIdRef.current = null;
    finalLandingTriggeredRef.current = false;
    choiceOverlayCuePlayedRef.current = false;

    const line = currentLine;
    const basePreTypePause = line.speaker === "sable" ? SABLE_PRETYPE_DELAY_MS : 0;
    const preTypePause =
      currentIndex === 0 ? basePreTypePause + TERMINAL_HANDOFF_DELAY_MS : basePreTypePause;
    const typingSpeed = resolveLineTypingSpeed(line);

    typingStartTimeoutRef.current = window.setTimeout(() => {
      let characterIndex = 1;

      setIsTypingStarted(true);
      audioController.playLineStart(line.tone, line.content, "terminal");

      if (line.tone === "warning") {
        audioController.startWarningPulse();
      } else {
        audioController.stopWarningPulse();
      }

      scheduleVoiceCue(line);

      if (terminalInterferenceLineIds.has(line.id)) {
        const burstDelay = Math.max(160, Math.round(resolveLineTypingDuration(line) * 0.32));

        interferenceBurstTimeoutRef.current = window.setTimeout(() => {
          audioController.playInterferenceBurst();
        }, burstDelay);
      }

      if (line.content.length === 0) {
        finishCurrentLine();
        return;
      }

      setTypedCharacterCount(characterIndex);

      if (characterIndex >= line.content.length) {
        finishCurrentLine();
        return;
      }

      const typeNextCharacter = () => {
        characterIndex += 1;
        setTypedCharacterCount(characterIndex);

        if (characterIndex >= line.content.length) {
          finishCurrentLine();
          return;
        }

        typingTickTimeoutRef.current = window.setTimeout(typeNextCharacter, typingSpeed);
      };

      typingTickTimeoutRef.current = window.setTimeout(typeNextCharacter, typingSpeed);
    }, preTypePause);

    return () => {
      clearTypingTimers();
      audioController.stopWarningPulse();
    };
  }, [
    audioController,
    clearLandingTimers,
    clearTypingTimers,
    currentIndex,
    currentLine,
    finishCurrentLine,
    scheduleVoiceCue,
  ]);

  useEffect(() => {
    if (currentIndex !== 0 || isTypingStarted) {
      return;
    }

    const playTimer = window.setTimeout(() => {
      playOneShotCue("preludeTerminalHandoff");
    }, 24);

    return () => {
      window.clearTimeout(playTimer);
    };
  }, [currentIndex, isTypingStarted, playOneShotCue]);

  useEffect(() => {
    if (!isChoiceStageActive || choiceOverlayCuePlayedRef.current) {
      return;
    }

    choiceOverlayCuePlayedRef.current = true;
    playOneShotCue("choiceOverlayTransition");
  }, [isChoiceStageActive, playOneShotCue]);

  function handleChoiceSelect(value: string) {
    if (isChoiceCommitted) {
      return;
    }

    setSelectedChoice(value);
    setHasCommittedChoice(true);
    setHoveredChoice(value);
    setHiddenChoiceValue(resolveOtherChoiceValue(value));

    if (choiceResponseTimeoutRef.current !== null) {
      window.clearTimeout(choiceResponseTimeoutRef.current);
    }

    choiceResponseTimeoutRef.current = window.setTimeout(() => {
      setShowChoiceResponseLine(true);
    }, CHOICE_RESPONSE_DELAY_MS);

    sceneChoice?.onConfirm(value);
  }

  function handleAdvance() {
    if (isChoiceStageActive) {
      return;
    }

    audioController.activate();

    if (!isLineResolved) {
      audioController.playSkip(currentLine.tone);
      finishCurrentLine({ interrupted: true });
      return;
    }

    if (currentIndex < bootScript.length - 1) {
      audioController.playAdvance();
      setTypedCharacterCount(0);
      setIsTypingStarted(false);
      setIsLineResolved(false);
      setIsFinalHoldActive(false);
      setIsTitlePulsing(false);
      setCurrentIndex((previousIndex) => previousIndex + 1);
    }
  }

  const currentLineText = isLineResolved
    ? currentLine.content
    : currentLine.content.slice(0, typedCharacterCount);

  return (
    <div
      role={allowTranscriptAdvance ? "button" : undefined}
      tabIndex={allowTranscriptAdvance ? 0 : -1}
      className={`${styles.bootInteractive} ${allowTranscriptAdvance ? "" : styles.bootInteractivePassive}`}
      onClick={handleAdvance}
      onKeyDown={(event) => {
        if (!allowTranscriptAdvance) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleAdvance();
        }
      }}
    >
      <div className={styles.bootShell}>
        <div className={`${styles.bootColumn} ${styles.bootColumnMain}`}>
          <header className={styles.bootHeader}>
            <p className={styles.bootMeta}>Chapter 0 // Boot Under Observation</p>
            <div className={styles.titleBlock}>
              <h1
                className={`${styles.title} ${isTitlePulsing ? styles.titlePulseActive : ""}`}
                data-text="SABLE"
              >
                SABLE
              </h1>
              <p className={styles.subtitle}>the host is already watching.</p>
            </div>
          </header>

          <div className={styles.logWindow}>
            <div className={styles.logStack}>
              <ol className={styles.logList}>
                {visibleLines.map((line, index) => {
                  const isCurrentLine = index === currentIndex;
                  const isSableLine = line.speaker === "sable";
                  const displayedText = isCurrentLine ? currentLineText : line.content;
                  const showCursor = isCurrentLine && !isLineResolved;
                  const wasInterrupted = Boolean(interruptedLineIds[line.id]);

                  return (
                    <li
                      key={line.id}
                      className={[
                        styles.logItem,
                        isSableLine ? styles.logItemSable : styles.logItemSystem,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span
                        className={[
                          styles.speaker,
                          line.tone === "warning" ? styles.speakerWarning : "",
                          isSableLine ? styles.speakerSable : "",
                          isSableLine ? styles.speakerSableLabel : "",
                          flashingSableLabels[line.id] ? styles.speakerSableInterrupted : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {line.speaker}
                      </span>
                      <span
                        className={[
                          styles.line,
                          isCurrentLine && !isLineResolved ? styles.lineCurrent : styles.lineStatic,
                          isSableLine ? styles.lineSable : styles.lineSystem,
                          isCurrentLine && isTypingStarted ? styles.lineStarted : "",
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
                        {wasInterrupted ? (
                          <>
                            {"  "}
                            <span
                              className={[
                                styles.interruptedTag,
                                recentlyInterruptedLineId === line.id
                                  ? styles.interruptedTagVisible
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              [INTERRUPTED]
                            </span>
                          </>
                        ) : null}
                      </span>
                    </li>
                  );
                })}

                {shouldShowChoiceResponseLine && activeChoiceValue ? (
                  <li className={`${styles.logItem} ${styles.logItemSystem}`}>
                    <span className={styles.speaker}>SYSTEM</span>
                    <span className={`${styles.line} ${styles.lineStatic} ${styles.lineSystem}`}>
                      choice logged. identity stance recorded.
                    </span>
                  </li>
                ) : null}
              </ol>

              {isChoiceStageActive ? (
                <div className={styles.logUtilityRow}>
                  <button
                    type="button"
                    className={styles.replayLink}
                    onClick={(event) => {
                      event.stopPropagation();
                      sceneChoice?.onReplay?.();
                    }}
                  >
                    replay from boot
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className={styles.bootColumn}>
          <div className={styles.bootSidebar}>
            <BootTracePanel
              activeChoiceValue={activeChoiceValue}
              choiceOptions={bootChoiceOptions}
              choiceState={
                !isChoiceStageActive
                  ? "none"
                  : isChoiceCommitted
                    ? "committed"
                    : "pending"
              }
              continueHref={continueHref}
              continueLabel={MEMORY_UNLOCKED_LABEL}
              currentLineNumber={currentIndex + 1}
              hiddenChoiceValue={hiddenChoiceValue}
              hoveredChoice={hoveredChoice}
              isAdvanceReady={showContinuePrompt}
              isCompletionState={isCompletionState}
              isFinalHoldActive={isFinalHoldActive}
              onChoiceHoverChange={setHoveredChoice}
              onChoiceSelect={handleChoiceSelect}
              selectedChoiceHeading={resolveChoiceHeading(activeChoiceValue)}
              showChoiceOptions={isChoiceStageActive}
              showContinuePrompt={showContinuePrompt}
            />
          </div>
        </aside>
      </div>
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

function resolveLineTypingSpeed(line: BootLine) {
  return line.speaker === "sable" ? SABLE_TYPE_SPEED_MS : SYSTEM_TYPE_SPEED_MS;
}

function resolveLineTypingDuration(line: BootLine) {
  return Math.max(line.content.length * resolveLineTypingSpeed(line), resolveLineTypingSpeed(line));
}

function resolveChoiceHeading(value: string | null) {
  if (!value) {
    return null;
  }

  const option = bootChoiceOptions.find((candidate) => candidate.value === value);

  return option?.heading ?? value.toUpperCase();
}

function resolveOtherChoiceValue(value: string) {
  const option = bootChoiceOptions.find((candidate) => candidate.value !== value);

  return option?.value ?? null;
}
