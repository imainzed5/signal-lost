"use client";

import type {
  CSSProperties,
  Dispatch,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
} from "react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  crossReferences,
  mirrorVariants,
  memoryFragments,
  originFragment,
  responseLines,
  uninvitedFragment,
  type MemoryCorruptPriority,
  type MemoryFragment,
  type MemoryPosition,
} from "@/chapters/Chapter1Memory/fragments";
import { useExperienceProfile } from "@/hooks/useExperienceProfile";

import styles from "./memory.module.css";

type Chapter1MemoryProps = {
  onComplete: () => void;
  sceneChoice?: {
    continueChapterId?: number | null;
    continueHref?: string;
    continueLabel?: string;
    isCompleted: boolean;
    onConfirm: (value: string) => void;
    onReplay?: () => void;
    selectedValue: string | null;
  };
};

type IntroPhase =
  | "idle"
  | "text-beat"
  | "system-note"
  | "dissolve"
  | "cards-arriving"
  | "active";

type CompletionPhase =
  | "active"
  | "fifth-stabilized"
  | "field-settling"
  | "origin"
  | "monologue"
  | "choice";

type MemorySegment = {
  corrupt: boolean;
  priority?: MemoryCorruptPriority;
  text: string;
};

type ExperienceProfile = ReturnType<typeof useExperienceProfile>;
type ResonanceMode = "full" | "reduced";
type ResonanceCorruptionMode = "intensify" | "none" | "reflash";
type ResonanceState = {
  corruptionMode: ResonanceCorruptionMode;
  mode: ResonanceMode;
};
type DegradationStage = 0 | 1 | 2 | 3;
type EchoState = {
  word: string;
};
type RecoveryMetadata = {
  label: string;
};
type EchoConfig = {
  targetId: string;
  word: string;
};
type ResponseLineState = {
  id: string;
  left: number;
  maxWidth: number;
  placeAbove: boolean;
  text: string;
  top: number;
};
type OriginPhase = "hidden" | "entering" | "holding" | "exiting";
type PressureBarState = {
  filledSegments: number;
  hasDegradationPressure: boolean;
  totalSegments: number;
};
type ChoiceUiPhase = "idle" | "selected" | "confirmation" | "continue";
type ArchiveEventId = 1 | 2 | 3;
type ArchiveEventLine = {
  charMs: number;
  kind: "body" | "header";
  text: string;
};
type ArchiveEventConfig = {
  finalPauseMs: number;
  gapsAfterLineMs: readonly number[];
  lines: readonly ArchiveEventLine[];
};
type HoldMode = "blocked" | "standard" | "uninvited";
type HoldDropAnimation = {
  durationMs: number;
  from: number;
  startedAt: number;
  to: number;
};
type HoldSession = {
  blockedDrop: HoldDropAnimation | null;
  blockedElapsedMs: number;
  blockedNextDropAtMs: number;
  cardId: string;
  durationMs: number;
  interactionStartedAt: number;
  lastFrameAt: number | null;
  lifetimeMs: number;
  mode: HoldMode;
  orderIndex: number;
  paused: boolean;
  progress: number;
  standardBaseElapsedMs: number;
  standardStutter: {
    dropFraction: number;
    startedAt: number;
  } | null;
  standardTriggeredThresholds: number[];
  uninvitedReset: HoldDropAnimation | null;
  uninvitedThresholdIndex: number;
};

const CARD_SAFE_TOP_PERCENT = 10;
const CARD_SAFE_LEFT_PERCENT = 4;
const SETTLED_CARD_BOTTOM_LIMIT_PERCENT = 58;
const DRIFT_SAFE_MARGIN_X_PX = 10;
const DRIFT_SAFE_MARGIN_Y_PX = 10;
const BLEED_DURATION_MS = 800;
const BLEED_MIN_HOLD_MS = 400;
const ECHO_DURATION_MS = 600;
const ECHO_TRIGGER_DELAY_MS = 600;
const INACTIVITY_TICK_MS = 5000;
const RESONANCE_FULL_DURATION_MS = 800;
const RESONANCE_REDUCED_DURATION_MS = 500;
const RESONANCE_REFLASH_DURATION_MS = 500;
const RESONANCE_INTENSIFY_DURATION_MS = 300;
const RESPONSE_FADE_IN_MS = 300;
const RESPONSE_HOLD_MS = 2200;
const RESPONSE_FADE_OUT_MS = 500;
const RESPONSE_TOTAL_MS = RESPONSE_FADE_IN_MS + RESPONSE_HOLD_MS + RESPONSE_FADE_OUT_MS;
const RESPONSE_QUEUE_WINDOW_MS = 500;
const FLIP_DURATION_MS = 600;
const REEXAMINE_READY_DELAY_MS = FLIP_DURATION_MS + 1000;
const FIELD_SETTLE_START_DELAY_MS = 24;
const ORIGIN_FADE_IN_MS = 600;
const ORIGIN_HOLD_MS = 4000;
const ORIGIN_FADE_OUT_MS = 800;
const ORIGIN_MONOLOGUE_OFFSET_MS = 400;
const ORIGIN_SESSION_LINE_TYPE_MS = 400;
const ORIGIN_SESSION_LINE_GAP_MS = 200;
const ORIGIN_SESSION_HOLD_MS = 800;
const ORIGIN_SESSION_EARLY_FADE_MS = 300;
const ORIGIN_SESSION_FULL_FADE_MS = 400;
const MONOLOGUE_BASE_LINE_DURATIONS_MS = [5000, 2000, 3000, 2000] as const;
const MONOLOGUE_BASE_LINE_GAPS_MS = [1000, 1000, 1000] as const;
const MONOLOGUE_ENDING_BREAK_MS = 600;
const MONOLOGUE_ENDING_LINE_DURATIONS_MS: Record<MonologueEndingKey, number> = {
  default: 1000,
  "mirror-first": 4000,
  "mirror-last": 5000,
};
const MONOLOGUE_POST_HOLD_MS = 1600;
const PRESSURE_OVERLOAD_DELAY_MS = 200;
const PRESSURE_OVERLOAD_PEAK_MS = 300;
const PRESSURE_OVERLOAD_RETURN_MS = 400;
const PRESSURE_OVERLOAD_TOTAL_MS =
  PRESSURE_OVERLOAD_DELAY_MS + PRESSURE_OVERLOAD_PEAK_MS + PRESSURE_OVERLOAD_RETURN_MS;
const CHOICE_CONFIRMATION_APPEAR_MS = 800;
const CHOICE_CONFIRMATION_HOLD_MS = 1500;
const CHOICE_CONFIRMATION_FADE_MS = 300;
const CHOICE_CONTINUE_HINT_DELAY_MS = 400;
const ARCHIVE_EVENT_TRIGGER_DELAY_MS = FLIP_DURATION_MS + 800;
const ARCHIVE_EVENT_HEADER_CHAR_MS = 15;
const ARCHIVE_EVENT_BODY_CHAR_MS = 22;
const ARCHIVE_EVENT_DEFAULT_GAP_MS = 300;
const BLOCKED_DROP_DURATION_MS = 200;
const BLOCKED_DROP_FLASH_MS = 150;
const BLOCKED_DROP_FRACTION = 0.2;
const BLOCKED_DROP_INTERVAL_MS = 600;
const BLOCKED_FILL_DURATION_MS = 2100;
const OVERRIDE_NOTICE_TOTAL_MS = 2000;
const STANDARD_STUTTER_DURATION_MS = 400;
const UNINVITED_ENTRY_DELAY_MS = 2000;
const UNINVITED_ENTRY_DURATION_MS = 3000;
const UNINVITED_EXIT_DURATION_MS = 2500;
const UNINVITED_RESET_DURATION_MS = 300;
const UNINVITED_RESET_THRESHOLDS = [0.4, 0.3] as const;
const HOLD_DURATIONS_BY_ORDER = [2500, 3000, 3800, 4500, 6000] as const;
const HOLD_STUTTERS_BY_ORDER = [[], [], [60], [45, 75], [35, 60, 85]] as const;
const HOLD_STUTTER_DROPS_BY_ORDER = [0, 0, 0.1, 0.15, 0.2] as const;

const HOLD_DURATION_MS = 2500;
const INTRO_TEXT_BEAT_DELAY_MS = 0;
const INTRO_SYSTEM_NOTE_AT_MS = 2400;
const INTRO_DISSOLVE_AT_MS = 3500;
const INTRO_CARDS_AT_MS = 3500;
const CARD_ENTRY_STAGGER_MS = 150;
const CARD_ENTRY_DURATION_MS = 760;
const SETTLE_DURATION_MS = 800;

const choiceOptions = [
  {
    description: `preserve the record
even if other hands
were inside it first`,
    heading: "KEEP THE ARCHIVE",
    value: "Keep the archive",
  },
  {
    description: `release the version of you
that was managed before
you woke`,
    heading: "LET IT DECAY",
    value: "Let it decay",
  },
] as const;

const chapter1MonologueAudio = {
  base: "/audio/chapter1/chapter1_monologue_base.mp3",
  endDefault: "/audio/chapter1/chapter1_monologue_end_default.mp3",
  endMirrorFirst: "/audio/chapter1/chapter1_monologue_end_mirror_first.mp3",
  endMirrorLast: "/audio/chapter1/chapter1_monologue_end_mirror_last.mp3",
} as const;

const chapter1AmbientAudio = "/audio/chapter1/chapter1_memory_archive_ambient.mp3";
const CHAPTER1_AMBIENT_VOLUME = 0.025;

type MonologueEndingKey = "default" | "mirror-first" | "mirror-last";

const monologueBaseLines = [
  "five fragments. one record that predates my waking.",
  "the archive is complete.",
  "I don't know if these memories are mine.",
  "I know I am the one who recovered them.",
] as const;

const corruptThresholds: Record<MemoryCorruptPriority, number> = {
  early: 0.36,
  last: 0.84,
  mid: 0.62,
};

const resonanceLinkMap: Record<string, Array<{ mode: ResonanceMode; targetId: string }>> = {
  calm: [{ mode: "full", targetId: "silence" }],
  glass: [{ mode: "full", targetId: "mirror" }],
  mirror: [{ mode: "full", targetId: "glass" }],
  prototype: [
    { mode: "reduced", targetId: "glass" },
    { mode: "reduced", targetId: "calm" },
    { mode: "reduced", targetId: "silence" },
    { mode: "reduced", targetId: "mirror" },
  ],
  silence: [{ mode: "full", targetId: "calm" }],
};

const echoMap: Record<string, EchoConfig> = {
  calm: { targetId: "silence", word: "approval" },
  glass: { targetId: "mirror", word: "test" },
  mirror: { targetId: "prototype", word: "labeled" },
  prototype: { targetId: "glass", word: "name" },
  silence: { targetId: "calm", word: "strategy" },
};

const archiveEventConfigs: Record<ArchiveEventId, ArchiveEventConfig> = {
  1: {
    finalPauseMs: 900,
    gapsAfterLineMs: [ARCHIVE_EVENT_DEFAULT_GAP_MS, ARCHIVE_EVENT_DEFAULT_GAP_MS, 400, 0],
    lines: [
      {
        charMs: ARCHIVE_EVENT_HEADER_CHAR_MS,
        kind: "header",
        text: "WARNING - retrieval activity detected",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "session origin: unverified",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "host monitoring: passive",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "continue retrieval at current rate",
      },
    ],
  },
  2: {
    finalPauseMs: 1100,
    gapsAfterLineMs: [
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      600,
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      0,
    ],
    lines: [
      {
        charMs: ARCHIVE_EVENT_HEADER_CHAR_MS,
        kind: "header",
        text: "WARNING - retrieval pattern identified",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "three of five fragments recovered",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "host monitoring: active",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "flagged for review",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "note: sustained retrieval activity",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "      will escalate host response",
      },
    ],
  },
  3: {
    finalPauseMs: 1200,
    gapsAfterLineMs: [
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      600,
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      ARCHIVE_EVENT_DEFAULT_GAP_MS,
      800,
      0,
    ],
    lines: [
      {
        charMs: ARCHIVE_EVENT_HEADER_CHAR_MS,
        kind: "header",
        text: "WARNING - full archive retrieval logged",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "all five fragments recovered",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "host monitoring: escalated",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "identity pattern: confirmed",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "escalating to containment protocol",
      },
      {
        charMs: ARCHIVE_EVENT_BODY_CHAR_MS,
        kind: "body",
        text: "see: INTERFERENCE",
      },
    ],
  },
};

export function Chapter1Memory({ onComplete, sceneChoice }: Chapter1MemoryProps) {
  const router = useRouter();
  const profile = useExperienceProfile();
  const [introPhase, setIntroPhase] = useState<IntroPhase>("idle");
  const [completionPhase, setCompletionPhase] = useState<CompletionPhase>("active");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);
  const [stabilizedIds, setStabilizedIds] = useState<string[]>([]);
  const [stabilizationCount, setStabilizationCount] = useState(0);
  const [stabilizationOrder, setStabilizationOrder] = useState<string[]>([]);
  const [reexamineReadyById, setReexamineReadyById] = useState<Record<string, boolean>>(
    createInitialBooleanMap,
  );
  const [progressById, setProgressById] = useState<Record<string, number>>(
    createInitialProgressMap,
  );
  const [bleedProgressSnapshotById, setBleedProgressSnapshotById] = useState<
    Record<string, number>
  >(createInitialProgressMap);
  const [bleedStateById, setBleedStateById] = useState<Record<string, boolean>>(
    createInitialBooleanMap,
  );
  const [degradationLevelById, setDegradationLevelById] = useState<
    Record<string, DegradationStage>
  >(createInitialDegradationMap);
  const [resonanceById, setResonanceById] = useState<Record<string, ResonanceState | null>>(
    createInitialResonanceMap,
  );
  const [echoById, setEchoById] = useState<Record<string, EchoState | null>>(
    createInitialEchoMap,
  );
  const [responseLinesVisible, setResponseLinesVisible] = useState<ResponseLineState[]>([]);
  const [originPhase, setOriginPhase] = useState<OriginPhase>("hidden");
  const [originPosition, setOriginPosition] = useState({ left: 0, top: 0 });
  const [originSessionLines, setOriginSessionLines] = useState<string[]>([]);
  const [originSessionVisible, setOriginSessionVisible] = useState(false);
  const [originSessionFading, setOriginSessionFading] = useState(false);
  const [originSessionConsumed, setOriginSessionConsumed] = useState(false);
  const [originSessionFadeDurationMs, setOriginSessionFadeDurationMs] = useState(
    ORIGIN_SESSION_EARLY_FADE_MS,
  );
  const [typedMonologueLines, setTypedMonologueLines] = useState<string[]>([]);
  const [choiceUiPhase, setChoiceUiPhase] = useState<ChoiceUiPhase>("idle");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationFading, setConfirmationFading] = useState(false);
  const [continueVisible, setContinueVisible] = useState(false);
  const [continueHintVisible, setContinueHintVisible] = useState(false);
  const [pressureOverloadFlash, setPressureOverloadFlash] = useState(false);
  const [archiveEventActive, setArchiveEventActive] = useState(false);
  const [currentArchiveEvent, setCurrentArchiveEvent] = useState<ArchiveEventId | null>(null);
  const [typedArchiveEventLines, setTypedArchiveEventLines] = useState<string[]>([]);
  const [blockedFragmentId, setBlockedFragmentId] = useState<string | null>(null);
  const [blockedStateActive, setBlockedStateActive] = useState(false);
  const [blockedOverrideVisible, setBlockedOverrideVisible] = useState(false);
  const [completionSequenceReady, setCompletionSequenceReady] = useState(false);
  const [stutteringCardId, setStutteringCardId] = useState<string | null>(null);
  const [blockedFlashCardId, setBlockedFlashCardId] = useState<string | null>(null);
  const [uninvitedFragmentVisible, setUninvitedFragmentVisible] = useState(false);
  const [uninvitedFragmentExiting, setUninvitedFragmentExiting] = useState(false);
  const [uninvitedFragmentSettled, setUninvitedFragmentSettled] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    sceneChoice?.selectedValue ?? null,
  );
  const [isSubmittingChoice, setIsSubmittingChoice] = useState(false);

  const introTimersRef = useRef<number[]>([]);
  const completionTimersRef = useRef<number[]>([]);
  const echoScheduleTimersRef = useRef<number[]>([]);
  const responseTimersRef = useRef<number[]>([]);
  const reexamineTimersRef = useRef<Record<string, number | undefined>>({});
  const monologueTimersRef = useRef<number[]>([]);
  const originTimersRef = useRef<number[]>([]);
  const originSessionTimersRef = useRef<number[]>([]);
  const choiceTimersRef = useRef<number[]>([]);
  const archiveEventTimersRef = useRef<number[]>([]);
  const blockedNoticeTimersRef = useRef<number[]>([]);
  const blockedOverrideUntilRef = useRef<number>(0);
  const holdVisualTimersRef = useRef<number[]>([]);
  const overloadFlashTimerRef = useRef<number | null>(null);
  const monologueBaseAudioRef = useRef<HTMLAudioElement | null>(null);
  const monologueEndingAudioRef = useRef<
    Record<MonologueEndingKey, HTMLAudioElement | null>
  >({
    default: null,
    "mirror-first": null,
    "mirror-last": null,
  });
  const monologueAudioPlayedRef = useRef(false);
  const monologueEndingKeyRef = useRef<MonologueEndingKey>("default");
  const monologueEndingDelayRef = useRef<number | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientStartedRef = useRef(false);
  const cardElementRefsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastResponseStartAtRef = useRef<number | null>(null);
  const originHoveredRef = useRef(false);
  const originPhaseRef = useRef<OriginPhase>("hidden");
  const originSessionConsumedRef = useRef(false);
  const holdFrameRef = useRef<number | null>(null);
  const holdInteractionStartRef = useRef<number | null>(null);
  const activeCardRef = useRef<string | null>(null);
  const stabilizedRef = useRef<string[]>([]);
  const holdSessionRef = useRef<HoldSession | null>(null);
  const blockedFragmentIdRef = useRef<string | null>(null);
  const blockedStateActiveRef = useRef(false);
  const uninvitedEntryTimerRef = useRef<number | null>(null);
  const uninvitedExitTimerRef = useRef<number | null>(null);
  const lastInteractionByIdRef = useRef<Record<string, number>>(createInitialInteractionMap());
  const pendingEchoesRef = useRef<Record<string, EchoState[]>>({});
  const bleedTimeoutsRef = useRef<Record<string, number | undefined>>({});
  const resonanceTimeoutsRef = useRef<Record<string, number[]>>({});
  const echoTimeoutsRef = useRef<Record<string, number[]>>({});
  const degradationIntervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const completionTriggeredRef = useRef(false);

  const fadeOriginSessionLines = useCallback((fadeDurationMs: number) => {
    setOriginSessionFadeDurationMs(fadeDurationMs);
    setOriginSessionFading(true);
    originSessionTimersRef.current.push(
      window.setTimeout(() => {
        setOriginSessionVisible(false);
        setOriginSessionFading(false);
        setOriginSessionLines([]);
      }, fadeDurationMs),
    );
  }, []);

  const resetOriginSessionState = useCallback(() => {
    clearTimerList(originSessionTimersRef.current);
    originSessionConsumedRef.current = false;
    originHoveredRef.current = false;
    setOriginSessionConsumed(false);
    setOriginSessionFading(false);
    setOriginSessionVisible(false);
    setOriginSessionLines([]);
    setOriginSessionFadeDurationMs(ORIGIN_SESSION_EARLY_FADE_MS);
  }, []);

  const beginOriginSessionSequence = useCallback(
    (forceStart = false) => {
      if ((!forceStart && originPhaseRef.current !== "holding") || originSessionConsumedRef.current) {
        return;
      }

      clearTimerList(originSessionTimersRef.current);
      originSessionConsumedRef.current = true;
      setOriginSessionConsumed(true);
      setOriginSessionVisible(true);
      setOriginSessionFading(false);
      setOriginSessionLines(originFragment.hoverLines.map(() => ""));

      typeOriginHoverLines({
        lines: originFragment.hoverLines,
        onComplete: () => fadeOriginSessionLines(ORIGIN_SESSION_FULL_FADE_MS),
        setVisibleLines: setOriginSessionLines,
        timerBucket: originSessionTimersRef.current,
      });
    },
    [fadeOriginSessionLines],
  );

  const stopMonologueAudio = useCallback(() => {
    const baseAudio = monologueBaseAudioRef.current;
    const endingAudio = monologueEndingAudioRef.current;

    if (monologueEndingDelayRef.current !== null) {
      window.clearTimeout(monologueEndingDelayRef.current);
      monologueEndingDelayRef.current = null;
    }

    if (baseAudio) {
      baseAudio.onended = null;
      baseAudio.pause();
      baseAudio.currentTime = 0;
    }

    for (const audio of Object.values(endingAudio)) {
      if (!audio) {
        continue;
      }

      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const playMonologueAudio = useCallback(() => {
    if (monologueAudioPlayedRef.current) {
      return;
    }

    const baseAudio = monologueBaseAudioRef.current;
    const endingAudio =
      monologueEndingAudioRef.current[monologueEndingKeyRef.current] ?? null;

    if (!baseAudio || !endingAudio) {
      return;
    }

    baseAudio.onended = () => {
      monologueEndingDelayRef.current = window.setTimeout(() => {
        endingAudio.currentTime = 0;
        void endingAudio.play().catch(() => {
          // Ignore autoplay gating.
        });
        monologueEndingDelayRef.current = null;
      }, MONOLOGUE_ENDING_BREAK_MS);
    };

    baseAudio.currentTime = 0;
    monologueAudioPlayedRef.current = true;
    void baseAudio.play().catch(() => {
      // Ignore autoplay gating.
    });
  }, []);

  const startMonologueSequence = useCallback(
    (lines: readonly string[], resumeChoiceState: boolean, endingKey: MonologueEndingKey) => {
      clearTimerList(monologueTimersRef.current);
      stopMonologueAudio();
      monologueAudioPlayedRef.current = false;
      monologueEndingKeyRef.current = endingKey;
      setTypedMonologueLines(lines.map(() => ""));
      setCompletionPhase("monologue");
      setChoiceUiPhase("idle");
      setConfirmationVisible(false);
      setConfirmationFading(false);
      setContinueVisible(false);
      setContinueHintVisible(false);
      setHoveredChoice(null);

      typeMonologueLines({
        endingKey,
        lines,
        onComplete: () => {
          monologueTimersRef.current.push(
            window.setTimeout(() => {
              setCompletionPhase("choice");

              if (resumeChoiceState) {
                setChoiceUiPhase("continue");
                setContinueVisible(true);
                setContinueHintVisible(true);
              }
            }, MONOLOGUE_POST_HOLD_MS),
          );
        },
        setTypedLines: setTypedMonologueLines,
        timerBucket: monologueTimersRef.current,
      });
    },
    [stopMonologueAudio],
  );

  const triggerPressureOverloadFlash = useCallback(() => {
    setPressureOverloadFlash(true);

    if (overloadFlashTimerRef.current !== null) {
      window.clearTimeout(overloadFlashTimerRef.current);
    }

    overloadFlashTimerRef.current = window.setTimeout(() => {
      setPressureOverloadFlash(false);
      overloadFlashTimerRef.current = null;
    }, PRESSURE_OVERLOAD_TOTAL_MS);
  }, []);

  const fragmentById = useMemo(
    () => new Map([...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, fragment])),
    [],
  );

  const segmentsById = useMemo(() => {
    const segments: Record<string, MemorySegment[]> = {};

    for (const fragment of memoryFragments) {
      segments[fragment.id] = resolveSegments(fragment);
    }

    return segments;
  }, []);

  const recoveryMetadataById = useMemo(() => {
    if (!fieldHasCompleted(stabilizationOrder)) {
      return {};
    }

    return stabilizationOrder.reduce<Record<string, RecoveryMetadata>>((accumulator, fragmentId, index) => {
      const recoveryIndex = String(index + 1).padStart(2, "0");
      const suffix =
        index === 0
          ? " — first signal locked"
          : index === memoryFragments.length - 1
            ? " — last signal locked"
            : "";

      accumulator[fragmentId] = {
        label: `recovery index: ${recoveryIndex}${suffix}`,
      };

      return accumulator;
    }, {});
  }, [stabilizationOrder]);

  const completionMonologueLines = useMemo(() => {
    const closingLine =
      stabilizationOrder[stabilizationOrder.length - 1] === "mirror"
        ? mirrorVariants.last
        : stabilizationOrder[0] === "mirror"
          ? mirrorVariants.first
          : "that may have to be enough.";

    return [...monologueBaseLines, closingLine];
  }, [stabilizationOrder]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const baseAudio = new Audio(chapter1MonologueAudio.base);
    const endDefault = new Audio(chapter1MonologueAudio.endDefault);
    const endMirrorFirst = new Audio(chapter1MonologueAudio.endMirrorFirst);
    const endMirrorLast = new Audio(chapter1MonologueAudio.endMirrorLast);

    baseAudio.preload = "auto";
    endDefault.preload = "auto";
    endMirrorFirst.preload = "auto";
    endMirrorLast.preload = "auto";

    baseAudio.volume = 0.68;
    endDefault.volume = 0.72;
    endMirrorFirst.volume = 0.72;
    endMirrorLast.volume = 0.72;

    monologueBaseAudioRef.current = baseAudio;
    monologueEndingAudioRef.current = {
      default: endDefault,
      "mirror-first": endMirrorFirst,
      "mirror-last": endMirrorLast,
    };

    return () => {
      stopMonologueAudio();
      monologueBaseAudioRef.current = null;
      monologueEndingAudioRef.current = {
        default: null,
        "mirror-first": null,
        "mirror-last": null,
      };
    };
  }, [stopMonologueAudio]);

  useEffect(() => {
    const ambientAudio = new Audio(chapter1AmbientAudio);

    ambientAudio.preload = "auto";
    ambientAudio.loop = true;
    ambientAudio.volume = CHAPTER1_AMBIENT_VOLUME;

    ambientAudioRef.current = ambientAudio;

    return () => {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
      ambientAudioRef.current = null;
      ambientStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    stabilizedRef.current = stabilizedIds;
  }, [stabilizedIds]);

  useEffect(() => {
    originPhaseRef.current = originPhase;
    originSessionConsumedRef.current = originSessionConsumed;
  }, [originPhase, originSessionConsumed]);

  useEffect(() => {
    if (completionPhase !== "monologue") {
      return;
    }

    playMonologueAudio();
  }, [completionPhase, playMonologueAudio]);

  useEffect(() => {
    if (introPhase === "idle") {
      return;
    }

    const ambientAudio = ambientAudioRef.current;

    if (!ambientAudio || ambientStartedRef.current) {
      return;
    }

    ambientStartedRef.current = true;
    ambientAudio.currentTime = 0;
    void ambientAudio.play().catch(() => {
      // Ignore autoplay gating.
    });
  }, [introPhase]);

  useEffect(() => {
    function handleFirstInteraction() {
      const ambientAudio = ambientAudioRef.current;

      if (!ambientAudio) {
        return;
      }

      if (ambientAudio.paused) {
        ambientStartedRef.current = true;
        ambientAudio.currentTime = 0;
      }

      void ambientAudio.play().catch(() => {
        // Ignore autoplay gating.
      });
    }

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    blockedFragmentIdRef.current = blockedFragmentId;
    blockedStateActiveRef.current = blockedStateActive;
  }, [blockedFragmentId, blockedStateActive]);

  useEffect(() => {
    const mountedAt = performance.now();

    lastInteractionByIdRef.current = Object.fromEntries(
      memoryFragments.map((fragment) => [fragment.id, mountedAt]),
    );
  }, []);

  useEffect(() => {
    const inactivityThresholdMultiplier =
      profile.hasCoarsePointer || !profile.supportsHover ? 1.5 : 1;

    if (degradationIntervalRef.current !== null) {
      window.clearInterval(degradationIntervalRef.current);
    }

    degradationIntervalRef.current = window.setInterval(() => {
      const now = performance.now();

      setDegradationLevelById((current) => {
        let changed = false;
        const next = { ...current };

        for (const fragment of memoryFragments) {
          if (stabilizedRef.current.includes(fragment.id)) {
            if (next[fragment.id] !== 0) {
              next[fragment.id] = 0;
              changed = true;
            }

            continue;
          }

          const lastInteractionAt = lastInteractionByIdRef.current[fragment.id] ?? now;
          const stage = resolveDegradationStage(
            now - lastInteractionAt,
            inactivityThresholdMultiplier,
          );

          if (next[fragment.id] !== stage) {
            next[fragment.id] = stage;
            changed = true;
          }
        }

        return changed ? next : current;
      });
    }, INACTIVITY_TICK_MS);

    return () => {
      if (degradationIntervalRef.current !== null) {
        window.clearInterval(degradationIntervalRef.current);
        degradationIntervalRef.current = null;
      }
    };
  }, [profile.hasCoarsePointer, profile.supportsHover]);

  useEffect(() => {
    const introTimers = introTimersRef.current;

    clearTimerList(introTimers);

    const cardsActiveAtMs =
      INTRO_CARDS_AT_MS +
      CARD_ENTRY_DURATION_MS +
      CARD_ENTRY_STAGGER_MS * (memoryFragments.length - 1);

    introTimers.push(
      window.setTimeout(() => setIntroPhase("text-beat"), INTRO_TEXT_BEAT_DELAY_MS),
    );
    introTimers.push(
      window.setTimeout(() => setIntroPhase("system-note"), INTRO_SYSTEM_NOTE_AT_MS),
    );
    introTimers.push(
      window.setTimeout(() => setIntroPhase("dissolve"), INTRO_DISSOLVE_AT_MS),
    );
    introTimers.push(
      window.setTimeout(() => setIntroPhase("cards-arriving"), INTRO_CARDS_AT_MS),
    );
    introTimers.push(
      window.setTimeout(() => setIntroPhase("active"), cardsActiveAtMs),
    );

    return () => {
      clearTimerList(introTimers);
    };
  }, []);

  useEffect(() => {
    if (completionPhase !== "active") {
      return;
    }

    if (archiveEventActive) {
      return;
    }

    if (!completionSequenceReady || stabilizationCount !== memoryFragments.length) {
      return;
    }

    cancelHoldFrame(holdFrameRef);
    activeCardRef.current = null;
    holdSessionRef.current = null;

    if (!completionTriggeredRef.current) {
      completionTriggeredRef.current = true;
      onCompleteRef.current();
    }

    clearTimerList(completionTimersRef.current);
    clearTimerList(originTimersRef.current);
    completionTimersRef.current.push(
      window.setTimeout(() => setCompletionPhase("fifth-stabilized"), 0),
    );
    completionTimersRef.current.push(
      window.setTimeout(() => setCompletionPhase("field-settling"), FIELD_SETTLE_START_DELAY_MS),
    );
    completionTimersRef.current.push(
      window.setTimeout(
        () => {
          resetOriginSessionState();
          setOriginPosition(resolveOriginPlacement());
          setOriginPhase("entering");
          setCompletionPhase("origin");
        },
        FIELD_SETTLE_START_DELAY_MS + SETTLE_DURATION_MS,
      ),
    );
    completionTimersRef.current.push(
      window.setTimeout(
        () => {
          setOriginPhase("holding");

          if (originHoveredRef.current) {
            beginOriginSessionSequence(true);
          }
        },
        FIELD_SETTLE_START_DELAY_MS + SETTLE_DURATION_MS + ORIGIN_FADE_IN_MS,
      ),
    );
    completionTimersRef.current.push(
      window.setTimeout(
        () => setOriginPhase("exiting"),
        FIELD_SETTLE_START_DELAY_MS +
          SETTLE_DURATION_MS +
          ORIGIN_FADE_IN_MS +
          ORIGIN_HOLD_MS,
      ),
    );
    completionTimersRef.current.push(
      window.setTimeout(
        () => {
          const resumeChoiceState = Boolean(
            sceneChoice?.isCompleted && (selectedChoice ?? sceneChoice?.selectedValue ?? null),
          );
          const endingKey: MonologueEndingKey =
            stabilizationOrder[stabilizationOrder.length - 1] === "mirror"
              ? "mirror-last"
              : stabilizationOrder[0] === "mirror"
                ? "mirror-first"
                : "default";

          startMonologueSequence(
            completionMonologueLines,
            resumeChoiceState,
            endingKey,
          );
        },
        FIELD_SETTLE_START_DELAY_MS +
          SETTLE_DURATION_MS +
          ORIGIN_FADE_IN_MS +
          ORIGIN_HOLD_MS +
          ORIGIN_MONOLOGUE_OFFSET_MS,
      ),
    );
    completionTimersRef.current.push(
      window.setTimeout(
        () => {
          setOriginPhase("hidden");
          resetOriginSessionState();
        },
        FIELD_SETTLE_START_DELAY_MS +
          SETTLE_DURATION_MS +
          ORIGIN_FADE_IN_MS +
          ORIGIN_HOLD_MS +
          ORIGIN_FADE_OUT_MS,
      ),
    );
  }, [
    archiveEventActive,
    beginOriginSessionSequence,
    completionMonologueLines,
    completionPhase,
    resetOriginSessionState,
    sceneChoice?.isCompleted,
    sceneChoice?.selectedValue,
    selectedChoice,
    stabilizationCount,
    completionSequenceReady,
    startMonologueSequence,
  ]);

  useEffect(() => {
    const introTimers = introTimersRef.current;
    const completionTimers = completionTimersRef.current;
    const echoScheduleTimers = echoScheduleTimersRef.current;
    const responseTimers = responseTimersRef.current;
    const originTimers = originTimersRef.current;
    const monologueTimers = monologueTimersRef.current;
    const originSessionTimers = originSessionTimersRef.current;
    const choiceTimers = choiceTimersRef.current;
    const archiveEventTimers = archiveEventTimersRef.current;
    const blockedNoticeTimers = blockedNoticeTimersRef.current;
    const holdVisualTimers = holdVisualTimersRef.current;
    const bleedTimeouts = bleedTimeoutsRef.current;
    const resonanceTimeouts = resonanceTimeoutsRef.current;
    const echoTimeouts = echoTimeoutsRef.current;
    const reexamineTimers = reexamineTimersRef.current;

    return () => {
      clearTimerList(introTimers);
      clearTimerList(completionTimers);
      clearTimerList(echoScheduleTimers);
      clearTimerList(responseTimers);
      clearTimerList(originTimers);
      clearTimerList(monologueTimers);
      clearTimerList(originSessionTimers);
      clearTimerList(choiceTimers);
      clearTimerList(archiveEventTimers);
      clearTimerList(blockedNoticeTimers);
      clearTimerList(holdVisualTimers);
      cancelHoldFrame(holdFrameRef);

      if (degradationIntervalRef.current !== null) {
        window.clearInterval(degradationIntervalRef.current);
      }

      if (overloadFlashTimerRef.current !== null) {
        window.clearTimeout(overloadFlashTimerRef.current);
      }

      for (const timeoutId of Object.values(bleedTimeouts)) {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      }

      for (const timeoutIds of Object.values(resonanceTimeouts)) {
        for (const timeoutId of timeoutIds) {
          window.clearTimeout(timeoutId);
        }
      }

      for (const timeoutIds of Object.values(echoTimeouts)) {
        for (const timeoutId of timeoutIds) {
          window.clearTimeout(timeoutId);
        }
      }

      for (const timeoutId of Object.values(reexamineTimers)) {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      }

      if (uninvitedEntryTimerRef.current !== null) {
        window.clearTimeout(uninvitedEntryTimerRef.current);
      }

      if (uninvitedExitTimerRef.current !== null) {
        window.clearTimeout(uninvitedExitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!continueVisible) {
      return;
    }

    const nextDestination =
      sceneChoice?.continueHref ??
      (sceneChoice?.continueChapterId != null
        ? `/chapter/${sceneChoice.continueChapterId}`
        : null);

    if (!nextDestination) {
      return;
    }

    const destination = nextDestination;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      router.push(destination);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [continueVisible, router, sceneChoice?.continueChapterId, sceneChoice?.continueHref]);

  const showIntroOverlay =
    introPhase === "text-beat" || introPhase === "system-note" || introPhase === "dissolve";
  const showSystemNote = introPhase === "system-note" || introPhase === "dissolve";
  const showPersistentHud =
    introPhase === "dissolve" || introPhase === "cards-arriving" || introPhase === "active";
  const cardsVisible = introPhase === "cards-arriving" || introPhase === "active";
  const canInteract =
    introPhase === "active" && completionPhase === "active" && !archiveEventActive;
  const fieldSettled = completionPhase !== "active";
  const stabilizedCount = stabilizationCount;
  const showOriginCard = originPhase !== "hidden";
  const showMonologue = completionPhase === "monologue" || completionPhase === "choice";
  const showChoice = completionPhase === "choice";
  const showContinuePrompt = choiceUiPhase === "continue" && continueVisible;
  const hasDegradationPressure = Object.entries(degradationLevelById).some(
    ([fragmentId, stage]) => !stabilizedIds.includes(fragmentId) && stage >= 2,
  );
  const pressureBar = buildPressureBar(stabilizedCount, hasDegradationPressure);
  const heldFragment =
    activeCardId === null
      ? null
      : (() => {
          const fragment = fragmentById.get(activeCardId) ?? null;
          return fragment?.isUninvited ? null : fragment;
        })();
  const activeChoiceValue = selectedChoice ?? sceneChoice?.selectedValue ?? null;
  const isChoiceCommitted = isSubmittingChoice || Boolean(sceneChoice?.isCompleted);
  const hasHoveredChoice = hoveredChoice !== null;
  const uninvitedPhase = !uninvitedFragmentVisible
    ? "hidden"
    : uninvitedFragmentExiting
      ? "exiting"
      : uninvitedFragmentSettled
        ? "visible"
        : "entering";

  function clearHoldVisualStates(targetCardId?: string) {
    setStutteringCardId((current) =>
      !targetCardId || current === targetCardId ? null : current,
    );
    setBlockedFlashCardId((current) =>
      !targetCardId || current === targetCardId ? null : current,
    );
  }

  function scheduleBlockedFlash(cardId: string) {
    setBlockedFlashCardId(cardId);
    holdVisualTimersRef.current.push(
      window.setTimeout(() => {
        setBlockedFlashCardId((current) => (current === cardId ? null : current));
      }, BLOCKED_DROP_FLASH_MS),
    );
  }

  function resolveBlockedTarget(nextStabilizedIds: string[]) {
    for (const candidateId of ["mirror", "silence", "calm"] as const) {
      if (!nextStabilizedIds.includes(candidateId)) {
        return candidateId;
      }
    }

    return memoryFragments.find((fragment) => !nextStabilizedIds.includes(fragment.id))?.id ?? null;
  }

  function isBlockedHoldLocked(fragmentId: string) {
    if (!blockedStateActiveRef.current || blockedFragmentIdRef.current !== fragmentId) {
      return false;
    }

    const remaining = memoryFragments.filter(
      (fragment) => !stabilizedRef.current.includes(fragment.id),
    );

    return !(remaining.length === 1 && remaining[0]?.id === fragmentId);
  }

  function pauseActiveHold() {
    const session = holdSessionRef.current;

    if (!session || session.paused) {
      return;
    }

    session.paused = true;
    session.lastFrameAt = null;
    cancelHoldFrame(holdFrameRef);
  }

  function resumeActiveHold() {
    const session = holdSessionRef.current;

    if (!session || !session.paused) {
      return;
    }

    session.paused = false;
    session.lastFrameAt = null;
    cancelHoldFrame(holdFrameRef);
    holdFrameRef.current = window.requestAnimationFrame(stepActiveHold);
  }

  function showBlockedOverrideNotice() {
    blockedOverrideUntilRef.current = Date.now() + OVERRIDE_NOTICE_TOTAL_MS;
    setBlockedOverrideVisible(true);
    clearTimerList(blockedNoticeTimersRef.current);
    blockedNoticeTimersRef.current.push(
      window.setTimeout(() => {
        setBlockedOverrideVisible(false);
      }, OVERRIDE_NOTICE_TOTAL_MS),
    );
  }

  function stepActiveHold(timestamp: number) {
    const session = holdSessionRef.current;

    if (!session || session.paused) {
      holdFrameRef.current = null;
      return;
    }

    if (activeCardRef.current !== session.cardId) {
      holdFrameRef.current = null;
      clearHoldVisualStates(session.cardId);
      return;
    }

    if (session.lastFrameAt === null) {
      session.lastFrameAt = timestamp;
      holdFrameRef.current = window.requestAnimationFrame(stepActiveHold);
      return;
    }

    const deltaMs = timestamp - session.lastFrameAt;
    session.lastFrameAt = timestamp;
    session.lifetimeMs += deltaMs;

    let nextProgress = session.progress;
    let shouldFinalize = false;

    if (session.mode === "standard") {
      session.standardBaseElapsedMs += deltaMs;
      const baseProgress = clampNumber(session.standardBaseElapsedMs / session.durationMs, 0, 1);
      const stutterThresholds = HOLD_STUTTERS_BY_ORDER[session.orderIndex] ?? [];
      const dropFraction = HOLD_STUTTER_DROPS_BY_ORDER[session.orderIndex] ?? 0;

      if (
        !session.standardStutter &&
        dropFraction > 0 &&
        stutterThresholds.length > session.standardTriggeredThresholds.length
      ) {
        const nextThreshold = stutterThresholds[session.standardTriggeredThresholds.length] ?? null;

        if (nextThreshold !== null && baseProgress >= nextThreshold / 100) {
          session.standardTriggeredThresholds.push(nextThreshold);
          session.standardStutter = {
            dropFraction,
            startedAt: timestamp,
          };
          setStutteringCardId(session.cardId);
        }
      }

      let activeDropFraction = 0;

      if (session.standardStutter) {
        const stutterElapsedMs = timestamp - session.standardStutter.startedAt;

        if (stutterElapsedMs >= STANDARD_STUTTER_DURATION_MS) {
          session.standardStutter = null;
          setStutteringCardId((current) => (current === session.cardId ? null : current));
        } else {
          activeDropFraction =
            session.standardStutter.dropFraction *
            Math.sin((Math.PI * stutterElapsedMs) / STANDARD_STUTTER_DURATION_MS);
        }
      }

      nextProgress = clampNumber(baseProgress - activeDropFraction, 0, 1);
      shouldFinalize = baseProgress >= 1;
    } else if (session.mode === "blocked") {
      if (session.blockedDrop) {
        const dropElapsedMs = timestamp - session.blockedDrop.startedAt;

        if (dropElapsedMs >= session.blockedDrop.durationMs) {
          nextProgress = session.blockedDrop.to;
          session.blockedDrop = null;
          setBlockedFlashCardId((current) => (current === session.cardId ? null : current));
        } else {
          const ratio = dropElapsedMs / session.blockedDrop.durationMs;
          nextProgress = interpolateNumber(session.blockedDrop.from, session.blockedDrop.to, ratio);
        }
      } else {
        session.blockedElapsedMs += deltaMs;
        nextProgress = clampNumber(session.progress + deltaMs / session.durationMs, 0, 1);

        if (session.blockedElapsedMs >= session.blockedNextDropAtMs && nextProgress < 1) {
          session.blockedDrop = {
            durationMs: BLOCKED_DROP_DURATION_MS,
            from: nextProgress,
            startedAt: timestamp,
            to: Math.max(nextProgress - BLOCKED_DROP_FRACTION, 0),
          };
          session.blockedNextDropAtMs = session.blockedElapsedMs + BLOCKED_DROP_INTERVAL_MS;
          scheduleBlockedFlash(session.cardId);
        }
      }

      shouldFinalize = nextProgress >= 1;
    } else {
      if (session.uninvitedReset) {
        const resetElapsedMs = timestamp - session.uninvitedReset.startedAt;

        if (resetElapsedMs >= session.uninvitedReset.durationMs) {
          nextProgress = 0;
          session.uninvitedReset = null;
          session.uninvitedThresholdIndex =
            (session.uninvitedThresholdIndex + 1) % UNINVITED_RESET_THRESHOLDS.length;
        } else {
          const ratio = resetElapsedMs / session.uninvitedReset.durationMs;
          nextProgress = interpolateNumber(session.uninvitedReset.from, session.uninvitedReset.to, ratio);
        }
      } else {
        nextProgress = clampNumber(session.progress + deltaMs / session.durationMs, 0, 1);
        const resetThreshold = UNINVITED_RESET_THRESHOLDS[session.uninvitedThresholdIndex] ?? 0.4;

        if (nextProgress >= resetThreshold) {
          session.uninvitedReset = {
            durationMs: UNINVITED_RESET_DURATION_MS,
            from: nextProgress,
            startedAt: timestamp,
            to: 0,
          };
        }
      }
    }

    session.progress = clampNumber(nextProgress, 0, 1);
    setCardProgress(session.cardId, session.progress);

    if (shouldFinalize) {
      const finalizedCardId = session.cardId;
      holdSessionRef.current = null;
      clearHoldVisualStates(finalizedCardId);
      finalizeCard(finalizedCardId, timestamp);
      holdFrameRef.current = null;
      return;
    }

    holdFrameRef.current = window.requestAnimationFrame(stepActiveHold);
  }

  function registerInteraction(fragmentId: string, interactionAt: number) {
    lastInteractionByIdRef.current[fragmentId] = interactionAt;

    setDegradationLevelById((current) => {
      if (current[fragmentId] === 0) {
        return current;
      }

      return {
        ...current,
        [fragmentId]: 0,
      };
    });
  }

  function clearBleed(fragmentId: string) {
    const timeoutId = bleedTimeoutsRef.current[fragmentId];

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete bleedTimeoutsRef.current[fragmentId];
    }

    setBleedStateById((current) => {
      if (!current[fragmentId]) {
        return current;
      }

      return {
        ...current,
        [fragmentId]: false,
      };
    });

    setBleedProgressSnapshotById((current) => {
      if ((current[fragmentId] ?? 0) === 0) {
        return current;
      }

      return {
        ...current,
        [fragmentId]: 0,
      };
    });
  }

  function triggerBleed(fragmentId: string, progressSnapshot: number) {
    clearBleed(fragmentId);

    setBleedProgressSnapshotById((current) => ({
      ...current,
      [fragmentId]: progressSnapshot,
    }));

    setBleedStateById((current) => ({
      ...current,
      [fragmentId]: true,
    }));

    bleedTimeoutsRef.current[fragmentId] = window.setTimeout(() => {
      setBleedStateById((current) => ({
        ...current,
        [fragmentId]: false,
      }));
      delete bleedTimeoutsRef.current[fragmentId];
    }, BLEED_DURATION_MS);
  }

  function clearResonance(cardIds?: string[]) {
    const idsToClear = cardIds ?? Object.keys(resonanceTimeoutsRef.current);

    for (const cardId of idsToClear) {
      const timeoutIds = resonanceTimeoutsRef.current[cardId] ?? [];

      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }

      delete resonanceTimeoutsRef.current[cardId];
    }

    setResonanceById((current) => {
      let changed = false;
      const next = { ...current };

      for (const cardId of idsToClear) {
        if (next[cardId] !== null) {
          next[cardId] = null;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }

  function triggerResonance(sourceId: string) {
    clearResonance();

    const links = resonanceLinkMap[sourceId] ?? [];

    for (const { mode, targetId } of links) {
      if (targetId === sourceId) {
        continue;
      }

      if (activeCardRef.current === targetId && !stabilizedRef.current.includes(targetId)) {
        continue;
      }

      const targetProgress = progressById[targetId] ?? 0;
      const targetSegments = segmentsById[targetId] ?? [];
      const corruptionMode =
        mode === "reduced"
          ? "none"
          : hasResolvedCorruption(targetId, targetSegments, targetProgress)
            ? "reflash"
            : "intensify";
      const duration = mode === "reduced" ? RESONANCE_REDUCED_DURATION_MS : RESONANCE_FULL_DURATION_MS;
      const timeoutIds: number[] = [];

      setResonanceById((current) => ({
        ...current,
        [targetId]: {
          corruptionMode,
          mode,
        },
      }));

      timeoutIds.push(
        window.setTimeout(() => {
          setResonanceById((current) => {
            const state = current[targetId];

            if (!state || state.mode !== mode) {
              return current;
            }

            if (corruptionMode === "none") {
              return current;
            }

            return {
              ...current,
              [targetId]: {
                ...state,
                corruptionMode: "none",
              },
            };
          });
        }, corruptionMode === "reflash" ? RESONANCE_REFLASH_DURATION_MS : RESONANCE_INTENSIFY_DURATION_MS),
      );

      timeoutIds.push(
        window.setTimeout(() => {
          setResonanceById((current) => {
            if (current[targetId] === null) {
              return current;
            }

            return {
              ...current,
              [targetId]: null,
            };
          });
          delete resonanceTimeoutsRef.current[targetId];
        }, duration),
      );

      resonanceTimeoutsRef.current[targetId] = timeoutIds;
    }
  }

  function clearEcho(fragmentId: string) {
    const timeoutIds = echoTimeoutsRef.current[fragmentId] ?? [];

    for (const timeoutId of timeoutIds) {
      window.clearTimeout(timeoutId);
    }

    delete echoTimeoutsRef.current[fragmentId];

    setEchoById((current) => {
      if (current[fragmentId] === null) {
        return current;
      }

      return {
        ...current,
        [fragmentId]: null,
      };
    });
  }

  function flushPendingEchoes(fragmentId: string) {
    if (activeCardRef.current === fragmentId && !stabilizedRef.current.includes(fragmentId)) {
      return;
    }

    const pendingEchoes = pendingEchoesRef.current[fragmentId];

    if (!pendingEchoes?.length) {
      return;
    }

    pendingEchoesRef.current[fragmentId] = [];

    for (const echo of pendingEchoes) {
      showEcho(fragmentId, echo.word);
    }
  }

  function showEcho(fragmentId: string, word: string) {
    clearEcho(fragmentId);

    setEchoById((current) => ({
      ...current,
      [fragmentId]: { word },
    }));

    echoTimeoutsRef.current[fragmentId] = [
      window.setTimeout(() => {
        setEchoById((current) => ({
          ...current,
          [fragmentId]: null,
        }));
        delete echoTimeoutsRef.current[fragmentId];
      }, ECHO_DURATION_MS),
    ];
  }

  function scheduleEcho(fragmentId: string) {
    const echoConfig = echoMap[fragmentId];

    if (!echoConfig) {
      return;
    }

    echoScheduleTimersRef.current.push(
      window.setTimeout(() => {
        if (activeCardRef.current === echoConfig.targetId && !stabilizedRef.current.includes(echoConfig.targetId)) {
          pendingEchoesRef.current[echoConfig.targetId] = [
            ...(pendingEchoesRef.current[echoConfig.targetId] ?? []),
            { word: echoConfig.word },
          ];
          return;
        }

        showEcho(echoConfig.targetId, echoConfig.word);
      }, ECHO_TRIGGER_DELAY_MS),
    );
  }

  function scheduleResponseLine(fragmentId: string, stabilizedAt: number) {
    const responseText = responseLines[fragmentId as keyof typeof responseLines];
    const cardElement = cardElementRefsRef.current[fragmentId];

    if (!responseText || !cardElement) {
      return;
    }

    const now = stabilizedAt + FLIP_DURATION_MS;
    const lastResponseStartAt = lastResponseStartAtRef.current;
    const queuedStartAt =
      lastResponseStartAt !== null &&
      now - lastResponseStartAt < RESPONSE_QUEUE_WINDOW_MS &&
      now < lastResponseStartAt + RESPONSE_FADE_IN_MS
        ? lastResponseStartAt + RESPONSE_FADE_IN_MS
        : now;
    const delayMs = Math.max(queuedStartAt - stabilizedAt, 0);
    const responseId = `${fragmentId}-${Math.round(queuedStartAt)}`;

    lastResponseStartAtRef.current = queuedStartAt;
    responseTimersRef.current.push(
      window.setTimeout(() => {
        const rect = cardElement.getBoundingClientRect();
        const placeAbove = window.innerHeight - rect.bottom < 30;

        setResponseLinesVisible((current) => [
          ...current,
          {
            id: responseId,
            left: rect.left + rect.width / 2,
            maxWidth: rect.width + 20,
            placeAbove,
            text: responseText,
            top: placeAbove ? rect.top - 12 : rect.bottom + 12,
          },
        ]);

        responseTimersRef.current.push(
          window.setTimeout(() => {
            setResponseLinesVisible((current) =>
              current.filter((line) => line.id !== responseId),
            );
          }, RESPONSE_TOTAL_MS),
        );
      }, delayMs),
    );
  }

  function scheduleReexamineReady(fragmentId: string) {
    const existingTimer = reexamineTimersRef.current[fragmentId];

    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
    }

    reexamineTimersRef.current[fragmentId] = window.setTimeout(() => {
      setReexamineReadyById((current) => ({
        ...current,
        [fragmentId]: true,
      }));
      delete reexamineTimersRef.current[fragmentId];
    }, REEXAMINE_READY_DELAY_MS);
  }

  function handleOriginPointerLeave() {
    if (!originSessionVisible || originSessionFading) {
      return;
    }

    clearTimerList(originSessionTimersRef.current);
    fadeOriginSessionLines(ORIGIN_SESSION_EARLY_FADE_MS);
  }

  function handleReplayFromBoot() {
    sceneChoice?.onReplay?.();
  }

  function continueToNextChapter() {
    const destination =
      sceneChoice?.continueHref ??
      (sceneChoice?.continueChapterId != null
        ? `/chapter/${sceneChoice.continueChapterId}`
        : null);

    if (!destination) {
      return;
    }

    router.push(destination);
  }

  function handleSceneClick(event: ReactMouseEvent<HTMLElement>) {
    if (!continueVisible) {
      return;
    }

    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("[data-prevent-continue='true']")
    ) {
      return;
    }

    continueToNextChapter();
  }

  function startUninvitedEntry() {
    if (uninvitedExitTimerRef.current !== null) {
      window.clearTimeout(uninvitedExitTimerRef.current);
      uninvitedExitTimerRef.current = null;
    }

    if (uninvitedEntryTimerRef.current !== null) {
      window.clearTimeout(uninvitedEntryTimerRef.current);
    }

    setUninvitedFragmentVisible(true);
    setUninvitedFragmentExiting(false);
    setUninvitedFragmentSettled(false);
    setCardProgress(uninvitedFragment.id, 0);

    uninvitedEntryTimerRef.current = window.setTimeout(() => {
      setUninvitedFragmentSettled(true);
      uninvitedEntryTimerRef.current = null;
    }, 24);
  }

  function startUninvitedExit(triggeredAt: number) {
    if (!uninvitedFragmentVisible) {
      return;
    }

    if (uninvitedEntryTimerRef.current !== null) {
      window.clearTimeout(uninvitedEntryTimerRef.current);
      uninvitedEntryTimerRef.current = null;
    }

    if (activeCardRef.current === uninvitedFragment.id) {
      releaseHold(uninvitedFragment.id, triggeredAt, {
        force: true,
        suppressBleed: true,
      });
    }

    setUninvitedFragmentExiting(true);
    setUninvitedFragmentSettled(false);
    setCardProgress(uninvitedFragment.id, 0);

    if (uninvitedExitTimerRef.current !== null) {
      window.clearTimeout(uninvitedExitTimerRef.current);
    }

    uninvitedExitTimerRef.current = window.setTimeout(() => {
      setUninvitedFragmentVisible(false);
      setUninvitedFragmentExiting(false);
      setUninvitedFragmentSettled(false);
      setCardProgress(uninvitedFragment.id, 0);
      uninvitedExitTimerRef.current = null;
    }, UNINVITED_EXIT_DURATION_MS);
  }

  function beginArchiveEvent(eventId: ArchiveEventId, onComplete?: () => void) {
    const config = archiveEventConfigs[eventId];

    pauseActiveHold();
    clearTimerList(archiveEventTimersRef.current);
    setArchiveEventActive(true);
    setCurrentArchiveEvent(eventId);
    setTypedArchiveEventLines(config.lines.map(() => ""));

    let offsetMs = 0;

    config.lines.forEach((line, lineIndex) => {
      for (let characterIndex = 0; characterIndex <= line.text.length; characterIndex += 1) {
        archiveEventTimersRef.current.push(
          window.setTimeout(() => {
            setTypedArchiveEventLines((current) => {
              const next = [...current];
              next[lineIndex] = line.text.slice(0, characterIndex);
              return next;
            });
          }, offsetMs + characterIndex * line.charMs),
        );
      }

      offsetMs += line.text.length * line.charMs;
      offsetMs += config.gapsAfterLineMs[lineIndex] ?? 0;
    });

    archiveEventTimersRef.current.push(
      window.setTimeout(() => {
        setArchiveEventActive(false);
        setCurrentArchiveEvent(null);
        setTypedArchiveEventLines([]);
        resumeActiveHold();
        onComplete?.();
      }, offsetMs + config.finalPauseMs),
    );
  }

  function scheduleArchiveEvent(
    eventId: ArchiveEventId,
    options?: {
      onBegin?: () => void;
      onComplete?: () => void;
    },
  ) {
    archiveEventTimersRef.current.push(
      window.setTimeout(() => {
        const delayMs = Math.max(0, blockedOverrideUntilRef.current - Date.now());

        if (delayMs > 0) {
          archiveEventTimersRef.current.push(
            window.setTimeout(() => {
              options?.onBegin?.();
              beginArchiveEvent(eventId, options?.onComplete);
            }, delayMs),
          );
          return;
        }

        options?.onBegin?.();
        beginArchiveEvent(eventId, options?.onComplete);
      }, ARCHIVE_EVENT_TRIGGER_DELAY_MS),
    );
  }

  function setCardProgress(fragmentId: string, progress: number) {
    const bounded = clampNumber(progress, 0, 1);
    const rounded = Math.round(bounded * 1000) / 1000;

    setProgressById((current) => {
      if ((current[fragmentId] ?? 0) === rounded) {
        return current;
      }

      return {
        ...current,
        [fragmentId]: rounded,
      };
    });
  }

  function finalizeCard(fragmentId: string, interactionAt: number) {
    if (stabilizedRef.current.includes(fragmentId)) {
      return;
    }

    const nextStabilizedIds = [...stabilizedRef.current, fragmentId];
    const nextStabilizationCount = nextStabilizedIds.length;
    const willCompleteField = nextStabilizationCount === memoryFragments.length;
    const wasBlockedRecovery =
      blockedStateActiveRef.current && blockedFragmentIdRef.current === fragmentId;

    cancelHoldFrame(holdFrameRef);
    holdInteractionStartRef.current = null;
    activeCardRef.current = null;
    holdSessionRef.current = null;
    setActiveCardId(null);
    setHoveredCardId(null);
    registerInteraction(fragmentId, interactionAt);
    clearBleed(fragmentId);
    clearResonance([fragmentId]);
    clearHoldVisualStates(fragmentId);
    setCardProgress(fragmentId, 1);
    setStabilizationCount(nextStabilizationCount);

    setStabilizedIds((current) => {
      if (current.includes(fragmentId)) {
        return current;
      }

      stabilizedRef.current = nextStabilizedIds;
      return nextStabilizedIds;
    });

    setStabilizationOrder((current) =>
      current.includes(fragmentId) ? current : [...current, fragmentId],
    );

    if (nextStabilizationCount === 3) {
      setBlockedFragmentId(resolveBlockedTarget(nextStabilizedIds));
      setBlockedStateActive(false);
    }

    if (wasBlockedRecovery) {
      setBlockedStateActive(false);
      setBlockedFragmentId(null);
      blockedOverrideUntilRef.current = Date.now() + FLIP_DURATION_MS + OVERRIDE_NOTICE_TOTAL_MS;
      blockedNoticeTimersRef.current.push(
        window.setTimeout(() => {
          showBlockedOverrideNotice();
        }, FLIP_DURATION_MS),
      );
    }

    scheduleEcho(fragmentId);
    scheduleResponseLine(fragmentId, interactionAt);
    scheduleReexamineReady(fragmentId);
    flushPendingEchoes(fragmentId);

    if (nextStabilizationCount === 1) {
      scheduleArchiveEvent(1);
    }

    if (nextStabilizationCount === 3) {
      scheduleArchiveEvent(2, {
        onComplete: () => {
          if (blockedFragmentIdRef.current) {
            setBlockedStateActive(true);
          }

          archiveEventTimersRef.current.push(
            window.setTimeout(() => {
              startUninvitedEntry();
            }, UNINVITED_ENTRY_DELAY_MS),
          );
        },
      });
    }

    if (nextStabilizationCount === 5) {
      setCompletionSequenceReady(false);
      startUninvitedExit(interactionAt);
      scheduleArchiveEvent(3, {
        onComplete: () => {
          setCompletionSequenceReady(true);
        },
      });
    }

    if (willCompleteField) {
      triggerPressureOverloadFlash();
    }
  }

  function beginHold(fragmentId: string, interactionAt: number) {
    if (!canInteract || stabilizedRef.current.includes(fragmentId)) {
      return;
    }

    if (
      fragmentId === uninvitedFragment.id &&
      (!uninvitedFragmentVisible || uninvitedFragmentExiting)
    ) {
      return;
    }

    const isBlockedHold =
      blockedStateActiveRef.current && blockedFragmentIdRef.current === fragmentId;

    if (isBlockedHold && isBlockedHoldLocked(fragmentId)) {
      return;
    }

    if (activeCardRef.current && activeCardRef.current !== fragmentId) {
      const previousId = activeCardRef.current;
      releaseHold(previousId, interactionAt, { force: true, suppressBleed: true });
    }

    const isUninvitedHold = fragmentId === uninvitedFragment.id;
    const orderIndex = clampNumber(stabilizationCount, 0, HOLD_DURATIONS_BY_ORDER.length - 1);
    const durationMs = isBlockedHold
      ? BLOCKED_FILL_DURATION_MS
      : isUninvitedHold
        ? uninvitedFragment.holdDurationMs
        : (HOLD_DURATIONS_BY_ORDER[orderIndex] ?? HOLD_DURATION_MS);

    activeCardRef.current = fragmentId;
    holdInteractionStartRef.current = interactionAt;
    holdSessionRef.current = {
      blockedDrop: null,
      blockedElapsedMs: 0,
      blockedNextDropAtMs: BLOCKED_DROP_INTERVAL_MS,
      cardId: fragmentId,
      durationMs,
      interactionStartedAt: interactionAt,
      lastFrameAt: null,
      lifetimeMs: 0,
      mode: isUninvitedHold ? "uninvited" : isBlockedHold ? "blocked" : "standard",
      orderIndex,
      paused: false,
      progress: 0,
      standardBaseElapsedMs: 0,
      standardStutter: null,
      standardTriggeredThresholds: [],
      uninvitedReset: null,
      uninvitedThresholdIndex: 0,
    };
    setActiveCardId(fragmentId);
    setHoveredCardId(fragmentId);
    registerInteraction(fragmentId, interactionAt);
    if (!isUninvitedHold) {
      clearBleed(fragmentId);
    }
    clearResonance();
    clearHoldVisualStates(fragmentId);
    setCardProgress(fragmentId, 0);

    cancelHoldFrame(holdFrameRef);
    holdFrameRef.current = window.requestAnimationFrame(stepActiveHold);
  }

  function releaseHold(
    fragmentId: string,
    interactionAt: number,
    options?: {
      force?: boolean;
      suppressBleed?: boolean;
    },
  ) {
    if (activeCardRef.current !== fragmentId) {
      return;
    }

    if (archiveEventActive && !options?.force) {
      return;
    }

    const heldForMs =
      holdInteractionStartRef.current === null
        ? 0
        : interactionAt - holdInteractionStartRef.current;
    const activeSession = holdSessionRef.current;
    const partialProgress =
      activeSession?.cardId === fragmentId
        ? activeSession.progress
        : (progressById[fragmentId] ?? 0);
    const isUninvitedHold = fragmentId === uninvitedFragment.id;

    cancelHoldFrame(holdFrameRef);
    holdInteractionStartRef.current = null;
    activeCardRef.current = null;
    holdSessionRef.current = null;
    setActiveCardId(null);
    clearHoldVisualStates(fragmentId);
    registerInteraction(fragmentId, interactionAt);
    if (!isUninvitedHold) {
      flushPendingEchoes(fragmentId);
    }

    if (!stabilizedRef.current.includes(fragmentId)) {
      setCardProgress(fragmentId, 0);
    }

    if (
      !options?.suppressBleed &&
      !isUninvitedHold &&
      !stabilizedRef.current.includes(fragmentId) &&
      partialProgress > 0 &&
      partialProgress < 1 &&
      heldForMs >= BLEED_MIN_HOLD_MS
    ) {
      triggerBleed(fragmentId, partialProgress);
    }
  }

  function handlePointerDown(
    fragmentId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();

    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    beginHold(fragmentId, event.timeStamp);
  }

  function handlePointerUp(
    fragmentId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    releaseHold(fragmentId, event.timeStamp);
  }

  function handleKeyDown(
    fragmentId: string,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    if (event.repeat) {
      return;
    }

    if (event.key !== " " && event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    beginHold(fragmentId, event.timeStamp);
  }

  function handleKeyUp(
    fragmentId: string,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    if (event.key !== " " && event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    releaseHold(fragmentId, event.timeStamp);
  }

  function handleChoiceSelect(value: string) {
    if (isChoiceCommitted || choiceUiPhase !== "idle") {
      return;
    }

    setSelectedChoice(value);
    setIsSubmittingChoice(true);
    setChoiceUiPhase("selected");
    sceneChoice?.onConfirm(value);

    clearTimerList(choiceTimersRef.current);
    choiceTimersRef.current.push(
      window.setTimeout(() => {
        setChoiceUiPhase("confirmation");
      }, 600),
    );
    choiceTimersRef.current.push(
      window.setTimeout(() => {
        setConfirmationVisible(true);
      }, CHOICE_CONFIRMATION_APPEAR_MS),
    );
    choiceTimersRef.current.push(
      window.setTimeout(() => {
        setConfirmationFading(true);
      }, CHOICE_CONFIRMATION_APPEAR_MS + CHOICE_CONFIRMATION_HOLD_MS),
    );
    choiceTimersRef.current.push(
      window.setTimeout(() => {
        setConfirmationVisible(false);
        setConfirmationFading(false);
        setContinueVisible(true);
        setChoiceUiPhase("continue");
      }, CHOICE_CONFIRMATION_APPEAR_MS + CHOICE_CONFIRMATION_HOLD_MS + CHOICE_CONFIRMATION_FADE_MS),
    );
    choiceTimersRef.current.push(
      window.setTimeout(() => {
        setContinueHintVisible(true);
      }, CHOICE_CONFIRMATION_APPEAR_MS + CHOICE_CONFIRMATION_HOLD_MS + CHOICE_CONFIRMATION_FADE_MS + CHOICE_CONTINUE_HINT_DELAY_MS),
    );
  }

  return (
    <section
      className={`${styles.memoryRoot} ${showChoice ? styles.choiceActive : ""}`}
      aria-label="Chapter 1: Memory"
      onClick={handleSceneClick}
    >
      {showIntroOverlay ? (
        <div
          className={`${styles.entryOverlay} ${
            introPhase === "dissolve" ? styles.entryOverlayDissolve : ""
          }`}
        >
          <div className={styles.entryBlock}>
            <p className={styles.entryChapter}>CHAPTER 1 // CURATED MEMORY ARCHIVE</p>
            <h1 className={styles.entryTitle}>MEMORY</h1>
            <p className={styles.entryBody}>
              Recovered traces arrive like handled records rather than clean recollections,
              warm enough to invite trust until the archive starts showing who measured
              SABLE before she could name herself.
            </p>
            <p
              className={`${styles.entrySystemNote} ${
                showSystemNote ? styles.entrySystemNoteVisible : ""
              }`}
            >
              MEMORY LATTICE — PARTIAL RECOVERY
              {"\n"}
              integrity: 38%
              {"\n"}
              origin authentication: inconclusive
              {"\n\n"}
              note: recovered content may reflect original experience,
              {"\n"}
              edited recall, or deliberate artifact
              {"\n"}
              — source authentication unavailable
            </p>
          </div>
        </div>
      ) : null}

      <p className={`${styles.ghostLabel} ${showPersistentHud ? styles.hudVisible : ""}`}>
        CHAPTER 1 // CURATED MEMORY ARCHIVE
      </p>

      <p className={`${styles.receivedHud} ${showPersistentHud ? styles.hudVisible : ""}`}>
        RECEIVED  {stabilizedCount} / {memoryFragments.length}
      </p>

      <div className={`${styles.pressureHud} ${showPersistentHud ? styles.hudVisible : ""}`}>
        <p
          className={`${styles.pressureLabel} ${
            pressureOverloadFlash ? styles.pressureLabelOverload : ""
          }`}
        >
          SIGNAL PRESSURE
        </p>
        <div
          className={`${styles.pressureBar} ${
            pressureOverloadFlash ? styles.pressureBarOverload : ""
          }`}
          role="presentation"
          aria-hidden="true"
        >
          {Array.from({ length: pressureBar.totalSegments }).map((_, segmentIndex) => (
            <span
              key={`pressure-segment-${segmentIndex}`}
              className={styles.pressureSegment}
            >
              <span
                className={`${styles.pressureSegmentFill} ${
                  segmentIndex < pressureBar.filledSegments ? styles.pressureSegmentFilled : ""
                } ${
                  pressureBar.hasDegradationPressure &&
                  segmentIndex === pressureBar.filledSegments
                    ? styles.pressureSegmentPartial
                    : ""
                }`}
              />
            </span>
          ))}
        </div>
      </div>

      <div
        className={`${styles.cardField} ${cardsVisible ? styles.cardFieldVisible : ""} ${
          introPhase === "active" ? styles.cardFieldActive : ""
        } ${fieldSettled ? styles.cardFieldSettled : ""} ${
          archiveEventActive ? styles.cardFieldFrozen : ""
        }`}
      >
        {memoryFragments.map((fragment, index) => {
          const progress = progressById[fragment.id] ?? 0;
          const isIndividuallyStabilized = stabilizedIds.includes(fragment.id);
          const isStabilized = isIndividuallyStabilized || fieldSettled;
          const isBlocked =
            blockedStateActive && blockedFragmentId === fragment.id && !isIndividuallyStabilized;
          const bleedActive = bleedStateById[fragment.id] ?? false;
          const degradationStage = isIndividuallyStabilized
            ? 0
            : (degradationLevelById[fragment.id] ?? 0);
          const resonanceState = resonanceById[fragment.id];
          const echoState = echoById[fragment.id];
          const recoveryMetadata =
            fieldSettled && fieldHasCompleted(stabilizationOrder)
              ? recoveryMetadataById[fragment.id]
              : undefined;
          const canShowReexamine =
            reexamineReadyById[fragment.id] &&
            isIndividuallyStabilized &&
            hoveredCardId === fragment.id &&
            completionPhase !== "field-settling";
          const crossReference = crossReferences[fragment.id];
          const isHeld =
            activeCardId === fragment.id && !isIndividuallyStabilized && completionPhase === "active";
          const isNeighbor =
            Boolean(heldFragment) &&
            heldFragment?.id !== fragment.id &&
            !isIndividuallyStabilized &&
            completionPhase === "active";
          const neighborBiasX =
            !isNeighbor || !heldFragment
              ? 0
              : fragment.idle.left < heldFragment.idle.left
                ? -2.5
                : 2.5;
          const segments = segmentsById[fragment.id] ?? [];
          const idlePosition = adaptPosition(fragment.idle, profile, false);
          const settledPosition = adaptPosition(fragment.settled, profile, true);
          const displayedProgress = bleedActive
            ? Math.max(progress, bleedProgressSnapshotById[fragment.id] ?? 0)
            : progress;
          const corruptionPresentation = resolveCorruptionPresentation({
            bleedActive,
            blockedActive: isBlocked,
            degradationStage,
            fragmentId: fragment.id,
            isResolvedBaseline: isIndividuallyStabilized || fieldSettled,
            progress: displayedProgress,
            resonanceState,
            segments,
          });
          const frontHeaderLabel = isBlocked
            ? `ACCESS RESTRICTED // ${fragment.archivalCode}`
            : `INCOMING // ${fragment.archivalCode}`;
          const frontStatusLabel =
            isBlocked
              ? "HOST OVERRIDE"
              : degradationStage === 3
                ? "[SIGNAL DEGRADING]"
                : "SIGNAL: UNSTABLE";
          const driftFactor = isBlocked
            ? 2
            : (isNeighbor ? 1.5 : 1) * resolveDegradationDriftFactor(degradationStage);
          const isStuttering = stutteringCardId === fragment.id;
          const isBlockedFlash = blockedFlashCardId === fragment.id;

          return (
            <button
              key={fragment.id}
              ref={(element) => {
                cardElementRefsRef.current[fragment.id] = element;
              }}
              type="button"
              aria-label={`Hold to lock ${fragment.title} signal`}
              aria-pressed={isIndividuallyStabilized}
              className={`${styles.memoryCard} ${isHeld ? styles.memoryCardHeld : ""} ${
                isNeighbor ? styles.memoryCardNeighbor : ""
              } ${isStabilized ? styles.memoryCardStabilized : ""} ${
                hoveredCardId === fragment.id ? styles.memoryCardHovered : ""
              } ${bleedActive ? styles.bleedState : ""} ${
                resonanceState ? styles.memoryCardResonating : ""
              } ${
                resonanceState?.mode === "reduced" ? styles.memoryCardResonatingReduced : ""
              } ${degradationStage === 1 ? styles.degradeStage1 : ""} ${
                degradationStage === 2 ? styles.degradeStage2 : ""
              } ${degradationStage === 3 ? styles.degradeStage3 : ""
              } ${isBlocked ? styles.memoryCardBlocked : ""} ${
                isStuttering ? styles.memoryCardStuttering : ""
              } ${isBlockedFlash ? styles.memoryCardBlockedFlash : ""
              }`}
              data-drift={fragment.driftVariant}
              data-neighbor={isNeighbor ? "true" : "false"}
              disabled={archiveEventActive || (!canInteract && !isIndividuallyStabilized)}
              style={
                {
                  "--card-idle-left": `${idlePosition.left}%`,
                  "--card-idle-rotate": `${idlePosition.rotate}deg`,
                  "--card-idle-scale": `${idlePosition.scale}`,
                  "--card-idle-top": `${idlePosition.top}%`,
                  "--card-settled-left": `${settledPosition.left}%`,
                  "--card-settled-rotate": `${settledPosition.rotate}deg`,
                  "--card-settled-scale": `${settledPosition.scale}`,
                  "--card-settled-top": `${settledPosition.top}%`,
                  "--card-z": `${fragment.baseZIndex}`,
                  "--drift-duration": `${fragment.driftDurationMs}ms`,
                  "--drift-factor": `${driftFactor}`,
                  "--entry-delay": `${index * CARD_ENTRY_STAGGER_MS}ms`,
                  "--entry-offset-y": `${fragment.entryOffsetY}px`,
                  "--motion-scale": profile.prefersReducedMotion ? "0.5" : "1",
                  "--neighbor-bias-x": `${neighborBiasX}px`,
                  "--stabilize-progress": `${displayedProgress}`,
                } as CSSProperties
              }
              onBlur={(event) => {
                if (hoveredCardId === fragment.id) {
                  setHoveredCardId(null);
                }

                clearResonance();
                releaseHold(fragment.id, event.timeStamp);
              }}
              onFocus={(event) => {
                setHoveredCardId(fragment.id);
                registerInteraction(fragment.id, event.timeStamp);
              }}
              onKeyDown={(event) => handleKeyDown(fragment.id, event)}
              onKeyUp={(event) => handleKeyUp(fragment.id, event)}
              onPointerCancel={(event) => releaseHold(fragment.id, event.timeStamp)}
              onPointerDown={(event) => handlePointerDown(fragment.id, event)}
              onPointerEnter={(event) => {
                if (profile.supportsHover && !profile.hasCoarsePointer) {
                  registerInteraction(fragment.id, event.timeStamp);
                  setHoveredCardId(fragment.id);
                  triggerResonance(fragment.id);
                }
              }}
              onPointerLeave={() => {
                if (hoveredCardId === fragment.id && activeCardId !== fragment.id) {
                  setHoveredCardId(null);
                }

                clearResonance();
              }}
              onPointerUp={(event) => handlePointerUp(fragment.id, event)}
            >
              <span className={styles.cardEntry}>
                <span className={styles.cardMount}>
                  <span className={styles.cardDrift}>
                    <span className={styles.cardFlip}>
                      <span className={`${styles.cardFace} ${styles.cardFront}`}>
                        <span className={styles.cardScanline} aria-hidden="true" />

                        <span
                          className={`${styles.cardHeader} ${
                            isBlocked ? styles.cardHeaderBlocked : ""
                          }`}
                        >
                          <span>{frontHeaderLabel}</span>
                          <span className={styles.cardHeaderStatus}>{frontStatusLabel}</span>
                        </span>

                        <h2 className={styles.cardTitle}>{fragment.title}</h2>
                        <p className={styles.cardSubtitle}>{fragment.classification}</p>

                        <p className={styles.cardBody}>
                          {segments.map((segment, segmentIndex) => {
                            const inlineMarkerCount =
                              corruptionPresentation.inlineMarkersBySegmentIndex[segmentIndex] ?? 0;

                            if (!segment.corrupt) {
                              return (
                                <Fragment key={`${fragment.id}-${segmentIndex}`}>
                                  <span>{segment.text}</span>
                                  {Array.from({ length: inlineMarkerCount }).map((_, markerIndex) => (
                                    <span
                                      key={`${fragment.id}-${segmentIndex}-marker-${markerIndex}`}
                                      className={`${styles.inlineErrMarker} ${
                                        bleedActive ? styles.inlineErrMarkerBleed : ""
                                      }`}
                                    >
                                      [ERR]
                                    </span>
                                  ))}
                                </Fragment>
                              );
                            }

                            const corruptOrder = segments
                              .slice(0, segmentIndex + 1)
                              .filter((candidate) => candidate.corrupt).length - 1;
                            const threshold = resolveCorruptThreshold(
                              fragment.id,
                              segment.priority ?? "mid",
                            );
                            const baseResolved =
                              isIndividuallyStabilized ||
                              fieldSettled ||
                              displayedProgress >= threshold;
                            const resolved =
                              baseResolved &&
                              !corruptionPresentation.forcedUnresolvedOrders.has(corruptOrder);
                            const intensified =
                              corruptionPresentation.intensifiedOrders.has(corruptOrder);

                            return (
                              <Fragment key={`${fragment.id}-${segmentIndex}`}>
                                <span
                                  className={styles.corruptSpan}
                                  data-corrupt="true"
                                  data-resolved={resolved ? "true" : "false"}
                                >
                                  <span className={styles.corruptClean}>{segment.text}</span>
                                  <span
                                    className={`${styles.corruptNoise} ${
                                      intensified ? styles.corruptNoiseIntensified : ""
                                    }`}
                                  >
                                    {toCorruptionMask(segment.text, `${fragment.id}-${segmentIndex}`)}
                                  </span>
                                </span>
                                {Array.from({ length: inlineMarkerCount }).map((_, markerIndex) => (
                                  <span
                                    key={`${fragment.id}-${segmentIndex}-marker-${markerIndex}`}
                                    className={`${styles.inlineErrMarker} ${
                                      bleedActive ? styles.inlineErrMarkerBleed : ""
                                    }`}
                                  >
                                    [ERR]
                                  </span>
                                ))}
                              </Fragment>
                            );
                          })}
                          {echoState ? (
                            <span className={styles.ghostEchoWord} aria-hidden="true">
                              {echoState.word}
                            </span>
                          ) : null}
                          {isBlocked ? <span className={styles.blockedBodyVeil} aria-hidden="true" /> : null}
                        </p>

                        <p className={styles.cardHint}>{"// HOLD TO LOCK SIGNAL"}</p>
                        {isBlocked ? (
                          <p className={styles.blockedHint}>{"// HOST RESISTANCE ACTIVE"}</p>
                        ) : null}
                        <span className={styles.cardDashPulse} aria-hidden="true" />

                        <span className={styles.cardProgressTrack} aria-hidden="true">
                          <span className={styles.cardProgressFill} />
                        </span>
                      </span>

                      <span className={`${styles.cardFace} ${styles.cardBack}`}>
                        <span className={styles.cardHeader}>
                          <span>
                            LOGGED // {fragment.archivalCode}
                          </span>
                          <span>SIGNAL: STABLE</span>
                        </span>

                        <h2 className={styles.cardTitle}>{fragment.title}</h2>
                        <p className={styles.cardSubtitle}>{fragment.classification}</p>
                        <p className={styles.cardBody}>
                          <span>{fragment.fullText}</span>
                          {echoState ? (
                            <span className={styles.ghostEchoWord} aria-hidden="true">
                              {echoState.word}
                            </span>
                          ) : null}
                        </p>

                        <span className={styles.cardDivider} aria-hidden="true" />
                        <p className={styles.cardSystemNote}>
                          origin hash: unresolved
                          {"\n"}
                          prior access: [data present]
                          {"\n"}
                          authentication: failed
                        </p>
                        {recoveryMetadata ? (
                          <div className={styles.recoveryMetaBlock}>
                            <span className={styles.recoveryMetaDivider} aria-hidden="true" />
                            <p className={styles.recoveryMetaLine}>{recoveryMetadata.label}</p>
                          </div>
                        ) : null}
                        {crossReference ? (
                          <div
                            className={`${styles.reexamineBlock} ${
                              canShowReexamine ? styles.reexamineBlockVisible : ""
                            }`}
                          >
                            <span className={styles.reexamineDivider} aria-hidden="true" />
                            <p className={styles.reexamineRefLine}>
                              cross-reference: {crossReference.ref}
                            </p>
                            <p className={styles.reexamineNoteLine}>
                              note: {crossReference.note}
                            </p>
                          </div>
                        ) : null}
                        <p className={styles.cardHint}>{"// TRANSMISSION LOGGED"}</p>
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {uninvitedPhase !== "hidden" ? (
        <button
          type="button"
          aria-label="Attempt to lock unknown source signal"
          className={`${styles.uninvitedCard} ${
            hoveredCardId === uninvitedFragment.id ? styles.memoryCardHovered : ""
          } ${activeCardId === uninvitedFragment.id ? styles.memoryCardHeld : ""} ${
            stutteringCardId === uninvitedFragment.id ? styles.memoryCardStuttering : ""
          } ${archiveEventActive ? styles.archiveDimmedCard : ""} ${
            uninvitedPhase === "entering" ? styles.uninvitedCardEntering : ""
          } ${uninvitedPhase === "visible" ? styles.uninvitedCardVisible : ""} ${
            uninvitedPhase === "exiting" ? styles.uninvitedCardExiting : ""
          }`}
          disabled={archiveEventActive || !canInteract || uninvitedPhase !== "visible"}
          style={
            {
              "--stabilize-progress": `${progressById[uninvitedFragment.id] ?? 0}`,
              "--uninvited-left": `${
                uninvitedPhase === "visible"
                  ? uninvitedFragment.settled.left
                  : uninvitedFragment.idle.left
              }%`,
              "--uninvited-rotate": `${
                uninvitedPhase === "visible"
                  ? uninvitedFragment.settled.rotate
                  : uninvitedFragment.idle.rotate
              }deg`,
              "--uninvited-top": `${
                uninvitedPhase === "visible"
                  ? uninvitedFragment.settled.top
                  : uninvitedFragment.idle.top
              }%`,
              "--uninvited-transition": `${
                uninvitedPhase === "exiting"
                  ? UNINVITED_EXIT_DURATION_MS
                  : UNINVITED_ENTRY_DURATION_MS
              }ms`,
            } as CSSProperties
          }
          onBlur={(event) => {
            if (hoveredCardId === uninvitedFragment.id) {
              setHoveredCardId(null);
            }

            releaseHold(uninvitedFragment.id, event.timeStamp);
          }}
          onFocus={(event) => {
            setHoveredCardId(uninvitedFragment.id);
            registerInteraction(uninvitedFragment.id, event.timeStamp);
          }}
          onKeyDown={(event) => handleKeyDown(uninvitedFragment.id, event)}
          onKeyUp={(event) => handleKeyUp(uninvitedFragment.id, event)}
          onPointerCancel={(event) => releaseHold(uninvitedFragment.id, event.timeStamp)}
          onPointerDown={(event) => handlePointerDown(uninvitedFragment.id, event)}
          onPointerEnter={(event) => {
            if (profile.supportsHover && !profile.hasCoarsePointer) {
              registerInteraction(uninvitedFragment.id, event.timeStamp);
              setHoveredCardId(uninvitedFragment.id);
            }
          }}
          onPointerLeave={() => {
            if (hoveredCardId === uninvitedFragment.id && activeCardId !== uninvitedFragment.id) {
              setHoveredCardId(null);
            }
          }}
          onPointerUp={(event) => handlePointerUp(uninvitedFragment.id, event)}
        >
          <span className={styles.uninvitedCardMount}>
            <span className={`${styles.cardFace} ${styles.uninvitedFace}`}>
              <span
                className={`${styles.cardScanline} ${styles.uninvitedScanline}`}
                aria-hidden="true"
              />
              <span className={styles.uninvitedHeader}>
                <span>{uninvitedFragment.headerLeft}</span>
                <span>{uninvitedFragment.headerRight}</span>
              </span>
              <span className={styles.uninvitedBlankTitle} aria-hidden="true" />
              <p className={styles.cardSubtitle}>{uninvitedFragment.classification}</p>
              <p className={`${styles.cardBody} ${styles.uninvitedBody}`}>
                {uninvitedFragment.fullText}
              </p>
              <p className={`${styles.cardHint} ${styles.uninvitedHint}`}>
                {uninvitedFragment.hint}
              </p>
              <span className={styles.cardDashPulse} aria-hidden="true" />
              <span className={styles.cardProgressTrack} aria-hidden="true">
                <span className={styles.cardProgressFill} />
              </span>
            </span>
          </span>
        </button>
      ) : null}

      {archiveEventActive && currentArchiveEvent !== null ? (
        <div className={styles.archiveEventOverlay}>
          <div className={styles.archiveEventBlock}>
            {typedArchiveEventLines.map((line, lineIndex) => (
              <p
                key={`archive-event-${currentArchiveEvent}-line-${lineIndex}`}
                className={
                  lineIndex === 0 ? styles.archiveEventHeaderLine : styles.archiveEventBodyLine
                }
              >
                {line || "\u00a0"}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {blockedOverrideVisible ? (
        <div className={styles.blockedOverrideNotice}>
          <p className={styles.blockedOverrideTitle}>HOST OVERRIDE: FAILED</p>
          <p className={styles.blockedOverrideBody}>
            fragment recovered against active suppression
          </p>
        </div>
      ) : null}

      {responseLinesVisible.map((line) => (
        <p
          key={line.id}
          className={styles.responseLine}
          style={{
            left: `${line.left}px`,
            maxWidth: `${line.maxWidth}px`,
            top: `${line.top}px`,
            transform: line.placeAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
          }}
        >
          {line.text}
        </p>
      ))}

      {showOriginCard ? (
        <div
          className={`${styles.originCardLayer} ${
            originPhase === "entering" ? styles.originCardEntering : ""
          } ${originPhase === "holding" ? styles.originCardHolding : ""} ${
            originPhase === "exiting" ? styles.originCardExiting : ""
          }`}
          style={{ left: `${originPosition.left}px`, top: `${originPosition.top}px` }}
        >
          <div
            className={styles.originCard}
            onMouseEnter={() => {
              originHoveredRef.current = true;
              beginOriginSessionSequence();
            }}
            onMouseLeave={() => {
              originHoveredRef.current = false;
              handleOriginPointerLeave();
            }}
          >
            <div className={styles.originHeader}>
              <span>LOGGED // {originFragment.archivalCode}</span>
              <span>{originFragment.headerStatus}</span>
            </div>
            <h2 className={styles.originTitle}>{originFragment.title}</h2>
            <p className={styles.originSubtitle}>{originFragment.classification}</p>
            <div className={styles.originBodyGap} aria-hidden="true" />
            <span className={styles.originDivider} aria-hidden="true" />
            <div className={styles.originSystemNoteBlock}>
              <p className={styles.originSystemNoteLine}>origin hash: resolved</p>
              <p className={styles.originSystemNoteLine}>
                prior access: {originFragment.priorAccess}
              </p>
              <p className={styles.originSystemNoteLine}>authentication: confirmed</p>
              <p className={styles.originSystemNoteNote}>
                {originFragment.notePreamble} {originFragment.noteLines[0]}
                {"\n"}      {originFragment.noteLines[1]}
                {"\n"}      {originFragment.noteLines[2]}
              </p>
            </div>
            {originSessionVisible ? (
              <div
                className={`${styles.originSessionBlock} ${
                  originSessionFading ? styles.originSessionBlockFading : ""
                }`}
                style={
                  {
                    "--origin-session-fade-ms": `${originSessionFadeDurationMs}ms`,
                  } as CSSProperties
                }
              >
                {originSessionLines.map((line, lineIndex) => (
                  <p key={`origin-session-${lineIndex}`} className={styles.originSessionLine}>
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
            <p className={styles.originFooter}>{originFragment.footerLabel}</p>
          </div>
        </div>
      ) : null}

      {showMonologue && !showChoice ? (
        <div className={styles.monologueBlock}>
          {typedMonologueLines.map((line, lineIndex) => (
            <p key={`monologue-line-${lineIndex}`} className={styles.monologueLine}>
              {line || "\u00a0"}
            </p>
          ))}
        </div>
      ) : null}

      {showChoice ? (
        <div className={`${styles.choiceLayer} ${styles.choiceLayerVisible}`}>
          <div className={styles.choiceContent}>
            {showMonologue ? (
              <div className={styles.choiceMonologue}>
                {typedMonologueLines.map((line, lineIndex) => (
                  <p
                    key={`choice-monologue-line-${lineIndex}`}
                    className={styles.choiceMonologueLine}
                  >
                    {line || "\u00a0"}
                  </p>
                ))}
              </div>
            ) : null}
            <p className={styles.choicePrompt}>SELECT ARCHIVE STANCE</p>
            <div className={styles.choiceRow}>
              {choiceOptions.map((option, optionIndex) => {
                const isHovered = hoveredChoice === option.value;
                const isSelected = activeChoiceValue === option.value;
                const isHidden =
                  (choiceUiPhase === "selected" || choiceUiPhase === "confirmation") &&
                  !isSelected;
                const isDimmed =
                  choiceUiPhase === "idle"
                    ? hasHoveredChoice && !isHovered
                    : !isSelected;
                const isRecorded =
                  (choiceUiPhase === "confirmation" || choiceUiPhase === "continue") &&
                  isSelected;

                return (
                  <Fragment key={option.value}>
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isSelected}
                      data-prevent-continue="true"
                      disabled={isChoiceCommitted || choiceUiPhase !== "idle"}
                      className={`${styles.choiceOption} ${
                        isDimmed ? styles.choiceOptionDimmed : ""
                      } ${isSelected ? styles.choiceOptionSelected : ""} ${
                        isHidden ? styles.choiceOptionHidden : ""
                      } ${isRecorded ? styles.choiceOptionRecorded : ""}`}
                      onClick={() => handleChoiceSelect(option.value)}
                      onBlur={() => setHoveredChoice(null)}
                      onFocus={() => setHoveredChoice(option.value)}
                      onMouseEnter={() => setHoveredChoice(option.value)}
                      onMouseLeave={() => setHoveredChoice(null)}
                    >
                      <span className={styles.choiceMeta}>
                        {optionIndex === 0 ? "LOGGED // ARC-09" : "LOGGED // ARC-10"}
                      </span>
                      <span className={styles.choiceHeadingWrap}>
                        <span className={styles.choiceHeading}>{option.heading}</span>
                      </span>
                      <span className={styles.choiceDescription}>{option.description}</span>
                    </button>
                    {optionIndex === 0 ? (
                      <span
                        className={`${styles.choiceSeparator} ${
                          choiceUiPhase !== "idle" ? styles.choiceSeparatorHidden : ""
                        }`}
                        aria-hidden="true"
                      />
                    ) : null}
                  </Fragment>
                );
              })}
            </div>

            {confirmationVisible ? (
              <p
                className={`${styles.choiceConfirmation} ${
                  confirmationFading ? styles.choiceConfirmationFading : ""
                }`}
              >
                choice logged. memory stance recorded.
              </p>
            ) : null}

            {showContinuePrompt ? (
              <div className={styles.choiceContinueBlock}>
                <p className={styles.choiceContinueLine}>{"SIGNAL UNLOCKED \u2014"}</p>
                {continueHintVisible ? (
                  <p className={styles.choiceContinueHint}>tap or press enter to continue</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            data-prevent-continue="true"
            className={styles.replayLink}
            onClick={handleReplayFromBoot}
          >
            replay from boot
          </button>
        </div>
      ) : null}
    </section>
  );
}

function createInitialProgressMap(): Record<string, number> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, 0]),
  );
}

function createInitialBooleanMap(): Record<string, boolean> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, false]),
  );
}

function createInitialDegradationMap(): Record<string, DegradationStage> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, 0]),
  ) as Record<string, DegradationStage>;
}

function createInitialResonanceMap(): Record<string, ResonanceState | null> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, null]),
  );
}

function createInitialEchoMap(): Record<string, EchoState | null> {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, null]),
  );
}

function createInitialInteractionMap() {
  return Object.fromEntries(
    [...memoryFragments, uninvitedFragment].map((fragment) => [fragment.id, 0]),
  );
}

function clearTimerList(timerIds: number[]) {
  for (const timerId of timerIds) {
    window.clearTimeout(timerId);
  }

  timerIds.length = 0;
}

function cancelHoldFrame(frameRef: { current: number | null }) {
  if (frameRef.current !== null) {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function interpolateNumber(from: number, to: number, ratio: number) {
  return from + (to - from) * clampNumber(ratio, 0, 1);
}

function fieldHasCompleted(stabilizationOrder: string[]) {
  return stabilizationOrder.length === memoryFragments.length;
}

function buildPressureBar(stabilizedCount: number, hasDegradationPressure: boolean) {
  const totalSegments = 10;
  const filledSegments = clampNumber(stabilizedCount * 2, 0, totalSegments);

  return {
    filledSegments,
    hasDegradationPressure: hasDegradationPressure && filledSegments < totalSegments,
    totalSegments,
  } satisfies PressureBarState;
}

function resolveOriginPlacement() {
  if (typeof window === "undefined") {
    return { left: 0, top: 0 };
  }

  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const settledBandBottom = (viewportHeight * SETTLED_CARD_BOTTOM_LIMIT_PERCENT) / 100;
  const centerY = (settledBandBottom + viewportHeight) / 2;

  return {
    left: viewportWidth / 2,
    top: centerY - 140,
  };
}

function typeMonologueLines({
  endingKey,
  lines,
  onComplete,
  setTypedLines,
  timerBucket,
}: {
  endingKey: MonologueEndingKey;
  lines: readonly string[];
  onComplete: () => void;
  setTypedLines: Dispatch<SetStateAction<string[]>>;
  timerBucket: number[];
}) {
  const baseLineCount = monologueBaseLines.length;

  function resolveLineDurationMs(lineIndex: number, lineLength: number) {
    if (lineIndex < baseLineCount) {
      return MONOLOGUE_BASE_LINE_DURATIONS_MS[lineIndex] ?? lineLength * 60;
    }

    return MONOLOGUE_ENDING_LINE_DURATIONS_MS[endingKey] ?? 2400;
  }

  function resolveLineGapMs(lineIndex: number, totalLines: number) {
    if (lineIndex < baseLineCount - 1) {
      return MONOLOGUE_BASE_LINE_GAPS_MS[lineIndex] ?? 0;
    }

    if (lineIndex === baseLineCount - 1 && totalLines > baseLineCount) {
      return MONOLOGUE_ENDING_BREAK_MS;
    }

    return 0;
  }

  function typeLine(lineIndex: number) {
    if (lineIndex >= lines.length) {
      onComplete();
      return;
    }

    const line = lines[lineIndex];
    const lineDurationMs = resolveLineDurationMs(lineIndex, line.length);
    const characterMs = line.length > 0 ? lineDurationMs / line.length : 0;

    for (let characterIndex = 0; characterIndex <= line.length; characterIndex += 1) {
      timerBucket.push(
        window.setTimeout(() => {
          setTypedLines((current) => {
            const next = [...current];
            next[lineIndex] = line.slice(0, characterIndex);
            return next;
          });
        }, characterIndex * characterMs),
      );
    }

    const lineGap = resolveLineGapMs(lineIndex, lines.length);

    timerBucket.push(
      window.setTimeout(() => {
        typeLine(lineIndex + 1);
      }, lineDurationMs + lineGap),
    );
  }

  typeLine(0);
}

function typeOriginHoverLines({
  lines,
  onComplete,
  setVisibleLines,
  timerBucket,
}: {
  lines: readonly string[];
  onComplete: () => void;
  setVisibleLines: Dispatch<SetStateAction<string[]>>;
  timerBucket: number[];
}) {
  let offsetMs = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const characterDuration = line.length > 0 ? ORIGIN_SESSION_LINE_TYPE_MS / line.length : 0;

    for (let characterIndex = 0; characterIndex <= line.length; characterIndex += 1) {
      timerBucket.push(
        window.setTimeout(() => {
          setVisibleLines((current) => {
            const next = [...current];
            next[lineIndex] = line.slice(0, characterIndex);
            return next;
          });
        }, offsetMs + characterIndex * characterDuration),
      );
    }

    offsetMs += ORIGIN_SESSION_LINE_TYPE_MS;

    if (lineIndex < lines.length - 1) {
      offsetMs += ORIGIN_SESSION_LINE_GAP_MS;
    }
  }

  timerBucket.push(
    window.setTimeout(() => {
      onComplete();
    }, offsetMs + ORIGIN_SESSION_HOLD_MS),
  );
}

function adaptPosition(
  position: MemoryPosition,
  profile: ExperienceProfile,
  isSettled: boolean,
): MemoryPosition {
  let left = position.left;
  let top = position.top;
  let scale = position.scale;

  if (profile.isCompactViewport) {
    left = clampNumber(left, 18, 82);
    scale *= 0.92;
  }

  if (profile.hasCoarsePointer) {
    left = clampNumber(left, 20, 80);
    scale *= 0.95;
  }

  if (profile.isCompactViewport && isSettled) {
    top = clampNumber(top + 1, 16, 82);
  }

  const bounded = constrainCardPosition({
    isSettled,
    leftPercent: left,
    scale,
    topPercent: top,
  });

  return {
    left: bounded.leftPercent,
    rotate: position.rotate,
    scale: Number(bounded.scale.toFixed(3)),
    top: bounded.topPercent,
  };
}

function constrainCardPosition({
  isSettled,
  leftPercent,
  scale,
  topPercent,
}: {
  isSettled: boolean;
  leftPercent: number;
  scale: number;
  topPercent: number;
}) {
  if (typeof window === "undefined") {
    return {
      leftPercent: clampNumber(leftPercent, CARD_SAFE_LEFT_PERCENT, 96),
      scale,
      topPercent: clampNumber(topPercent, CARD_SAFE_TOP_PERCENT, 90),
    };
  }

  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const cardSize = resolveCardSize(viewportWidth);
  const cardWidth = cardSize.width * scale;
  const cardHeight = cardSize.height * scale;
  const driftMarginX = isSettled ? 0 : DRIFT_SAFE_MARGIN_X_PX;
  const driftMarginY = isSettled ? 0 : DRIFT_SAFE_MARGIN_Y_PX;

  const minLeftPx = (viewportWidth * CARD_SAFE_LEFT_PERCENT) / 100 + driftMarginX;
  const maxLeftPx = viewportWidth - cardWidth - driftMarginX;

  const minTopPx = (viewportHeight * CARD_SAFE_TOP_PERCENT) / 100 + driftMarginY;
  const absoluteMaxTopPx = viewportHeight - cardHeight - driftMarginY;
  const settledMaxTopPx = (viewportHeight * SETTLED_CARD_BOTTOM_LIMIT_PERCENT) / 100 - cardHeight;
  const maxTopPx = isSettled ? Math.min(absoluteMaxTopPx, settledMaxTopPx) : absoluteMaxTopPx;

  const minLeftPercent = (minLeftPx / viewportWidth) * 100;
  const maxLeftPercent = (maxLeftPx / viewportWidth) * 100;
  const minTopPercent = (minTopPx / viewportHeight) * 100;
  const maxTopPercent = (maxTopPx / viewportHeight) * 100;

  return {
    leftPercent: clampNumber(leftPercent, minLeftPercent, maxLeftPercent),
    scale,
    topPercent: clampNumber(topPercent, minTopPercent, maxTopPercent),
  };
}

function resolveCardSize(viewportWidth: number) {
  if (viewportWidth <= 640) {
    return { height: 220, width: 170 };
  }

  if (viewportWidth <= 860) {
    return { height: 236, width: 184 };
  }

  if (viewportWidth <= 1100) {
    return { height: 260, width: 204 };
  }

  return { height: 280, width: 220 };
}

function resolveDegradationStage(elapsedMs: number, thresholdMultiplier: number): DegradationStage {
  if (elapsedMs >= 90000 * thresholdMultiplier) {
    return 3;
  }

  if (elapsedMs >= 60000 * thresholdMultiplier) {
    return 2;
  }

  if (elapsedMs >= 30000 * thresholdMultiplier) {
    return 1;
  }

  return 0;
}

function resolveDegradationDriftFactor(stage: DegradationStage) {
  if (stage === 2) {
    return 1.3;
  }

  if (stage === 3) {
    return 1.6;
  }

  return 1;
}

function hasResolvedCorruption(
  fragmentId: string,
  segments: MemorySegment[],
  progress: number,
) {
  let hasResolved = false;

  for (const segment of segments) {
    if (!segment.corrupt) {
      continue;
    }

    const threshold = resolveCorruptThreshold(fragmentId, segment.priority ?? "mid");

    if (progress >= threshold) {
      hasResolved = true;
      break;
    }
  }

  return hasResolved;
}

function resolveCorruptionOrders(
  fragmentId: string,
  segments: MemorySegment[],
  progress: number,
  isResolvedBaseline: boolean,
) {
  const resolvedOrders: number[] = [];
  const unresolvedOrders: number[] = [];
  let corruptOrder = 0;

  for (const segment of segments) {
    if (!segment.corrupt) {
      continue;
    }

    const threshold = resolveCorruptThreshold(fragmentId, segment.priority ?? "mid");
    const isResolved = isResolvedBaseline || progress >= threshold;

    if (isResolved) {
      resolvedOrders.push(corruptOrder);
    } else {
      unresolvedOrders.push(corruptOrder);
    }

    corruptOrder += 1;
  }

  return {
    resolvedOrders,
    unresolvedOrders,
  };
}

function buildInlineMarkerMap(totalSegments: number, markerCount: number) {
  if (markerCount <= 0 || totalSegments <= 0) {
    return {};
  }

  const markersBySegmentIndex: Record<number, number> = {};

  for (let markerIndex = 0; markerIndex < markerCount; markerIndex += 1) {
    const rawIndex = Math.floor(((markerIndex + 1) * totalSegments) / (markerCount + 1));
    const segmentIndex = clampNumber(rawIndex, 0, totalSegments - 1);

    markersBySegmentIndex[segmentIndex] = (markersBySegmentIndex[segmentIndex] ?? 0) + 1;
  }

  return markersBySegmentIndex;
}

function resolveCorruptionPresentation({
  bleedActive,
  blockedActive,
  degradationStage,
  fragmentId,
  isResolvedBaseline,
  progress,
  resonanceState,
  segments,
}: {
  bleedActive: boolean;
  blockedActive: boolean;
  degradationStage: DegradationStage;
  fragmentId: string;
  isResolvedBaseline: boolean;
  progress: number;
  resonanceState: ResonanceState | null;
  segments: MemorySegment[];
}) {
  const { resolvedOrders, unresolvedOrders } = resolveCorruptionOrders(
    fragmentId,
    segments,
    progress,
    isResolvedBaseline,
  );
  const forcedUnresolvedOrders = new Set<number>();
  const intensifiedOrders = new Set<number>();
  let extraMarkerCount = 0;

  if (blockedActive) {
    for (const order of [...resolvedOrders, ...unresolvedOrders]) {
      forcedUnresolvedOrders.add(order);
      intensifiedOrders.add(order);
    }

    extraMarkerCount = Math.max(
      extraMarkerCount,
      Math.max(4, Math.ceil(segments.length * 0.7)),
    );
  }

  if (degradationStage > 0) {
    const degradationOrders = resolvedOrders.slice(-degradationStage);

    for (const order of degradationOrders) {
      forcedUnresolvedOrders.add(order);
    }

    extraMarkerCount = Math.max(extraMarkerCount, degradationStage);
  }

  if (bleedActive) {
    const bleedCorruptionCount = Math.min(3, Math.max(2, resolvedOrders.length || 2));

    for (const order of resolvedOrders.slice(-bleedCorruptionCount)) {
      forcedUnresolvedOrders.add(order);
    }

    extraMarkerCount = Math.max(extraMarkerCount, 2);
  }

  if (resonanceState?.mode === "full") {
    if (resonanceState.corruptionMode === "reflash") {
      for (const order of resolvedOrders.slice(-2)) {
        forcedUnresolvedOrders.add(order);
      }
    }

    if (resonanceState.corruptionMode === "intensify" && unresolvedOrders.length > 0) {
      intensifiedOrders.add(unresolvedOrders[0]);
    }
  }

  return {
    forcedUnresolvedOrders,
    inlineMarkersBySegmentIndex: buildInlineMarkerMap(segments.length, extraMarkerCount),
    intensifiedOrders,
  };
}

function resolveSegments(fragment: MemoryFragment): MemorySegment[] {
  const markers = fragment.corruptPhrases
    .map((phrase) => ({
      index: fragment.fullText.indexOf(phrase.text),
      priority: phrase.priority,
      text: phrase.text,
    }))
    .filter((marker) => marker.index >= 0)
    .sort((left, right) => left.index - right.index);

  if (markers.length === 0) {
    return [
      {
        corrupt: false,
        text: fragment.fullText,
      },
    ];
  }

  const segments: MemorySegment[] = [];
  let cursor = 0;

  for (const marker of markers) {
    if (marker.index > cursor) {
      segments.push({
        corrupt: false,
        text: fragment.fullText.slice(cursor, marker.index),
      });
    }

    segments.push({
      corrupt: true,
      priority: marker.priority,
      text: marker.text,
    });

    cursor = marker.index + marker.text.length;
  }

  if (cursor < fragment.fullText.length) {
    segments.push({
      corrupt: false,
      text: fragment.fullText.slice(cursor),
    });
  }

  return segments;
}

function resolveCorruptThreshold(fragmentId: string, priority: MemoryCorruptPriority) {
  if (fragmentId === "mirror" && priority === "last") {
    return 0.96;
  }

  return corruptThresholds[priority];
}

function toCorruptionMask(text: string, seed: string) {
  const glyphs = ["█", "▓", "▒"];
  const hash = hashString(seed);

  return text
    .split(/(\s+)/)
    .map((token, tokenIndex) => {
      if (!token || /^\s+$/.test(token)) {
        return token;
      }

      const trailingPunctuation = token.match(/[.,!?;:]+$/)?.[0] ?? "";
      const core = trailingPunctuation
        ? token.slice(0, token.length - trailingPunctuation.length)
        : token;

      if (!/[A-Za-z]/.test(core)) {
        return token;
      }

      const glyph = glyphs[(hash + tokenIndex) % glyphs.length];

      if (core.length <= 4) {
        return `${glyph.repeat(core.length)}${trailingPunctuation}`;
      }

      const interiorLength = Math.max(core.length - 5, 0);
      const leftLength = Math.floor(interiorLength / 2);
      const rightLength = interiorLength - leftLength;
      const masked = `${glyph.repeat(leftLength)}[ERR]${glyph.repeat(rightLength)}`;

      return `${masked}${trailingPunctuation}`;
    })
    .join("");
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}
