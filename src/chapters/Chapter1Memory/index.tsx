"use client";

import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useExperienceProfile } from "@/hooks/useExperienceProfile";

import {
  ArchiveHud,
  ArchiveWarning,
  DarkroomCore,
  EntryOverlay,
  HostOverrideNotice,
  OriginCard,
  RecoveredOrderRail,
  RecoveryResponse,
  ScanSweep,
  UninvitedCard,
} from "./ArchivePanels";
import {
  ARCHIVE_EVENT_CONFIGS,
  MONOLOGUE_BASE_LINES,
  MONOLOGUE_ENDING_DURATIONS,
  MONOLOGUE_LINE_DURATIONS,
  MONOLOGUE_LINE_GAPS,
  REDUCED_TIMING,
  TIMING,
} from "./constants";
import {
  crossReferences,
  memoryFragments,
  mirrorVariants,
  originFragment,
  responseLines,
  uninvitedFragment,
} from "./fragments";
import { buildMemoryCardStyle, resolvePlatePull } from "./geometry";
import {
  buildPressureBar,
  createBooleanMap,
  createDegradationMap,
  createProgressMap,
  resolveBlockedTarget,
  resolveDegradationStage,
} from "./helpers";
import { MemoryCard } from "./MemoryCard";
import { MemoryChoice } from "./MemoryChoice";
import type {
  AftermathKind,
  ArchiveEventId,
  Chapter1MemoryProps,
  ChoiceUiPhase,
  CompletionPhase,
  DegradationStage,
  HoldMode,
  IntroPhase,
  MonologueEndingKey,
  OriginPhase,
} from "./types";
import { useMemoryAudio } from "./useMemoryAudio";
import { useMemoryHold } from "./useMemoryHold";
import { useMemorySequence } from "./useMemorySequence";

import dr from "./darkroom.module.css";
import styles from "./memory.module.css";
import ui from "./memory-ui.module.css";

export function Chapter1Memory({ onComplete, sceneChoice }: Chapter1MemoryProps) {
  const router = useRouter();
  const profile = useExperienceProfile();
  const prefersReducedMotion = profile.prefersReducedMotion;
  const { clearGroup, schedule, typeLines } = useMemorySequence(prefersReducedMotion);
  const { playMonologue, startAmbient } = useMemoryAudio();

  const [introPhase, setIntroPhase] = useState<IntroPhase>("text-beat");
  const [completionPhase, setCompletionPhase] = useState<CompletionPhase>("active");
  const [choiceUiPhase, setChoiceUiPhase] = useState<ChoiceUiPhase>("idle");
  const [originPhase, setOriginPhase] = useState<OriginPhase>("hidden");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [inspectedCardId, setInspectedCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [stabilizationOrder, setStabilizationOrder] = useState<string[]>([]);
  const [progressById, setProgressById] = useState<Record<string, number>>(createProgressMap);
  const [degradationById, setDegradationById] = useState<Record<string, DegradationStage>>(
    createDegradationMap,
  );
  const [stutteringById, setStutteringById] = useState<Record<string, boolean>>(
    createBooleanMap,
  );
  const [activeResponse, setActiveResponse] = useState<{
    fragmentId: string;
    text: string;
  } | null>(null);
  const [blockedFragmentId, setBlockedFragmentId] = useState<string | null>(null);
  const [blockedStateActive, setBlockedStateActive] = useState(false);
  const [blockedFlashId, setBlockedFlashId] = useState<string | null>(null);
  const [interruptedCardId, setInterruptedCardId] = useState<string | null>(null);
  const [blockedOverrideVisible, setBlockedOverrideVisible] = useState(false);
  const [uninvitedVisible, setUninvitedVisible] = useState(false);
  const [uninvitedExiting, setUninvitedExiting] = useState(false);
  const [uninvitedRejected, setUninvitedRejected] = useState(false);
  const [archiveEventId, setArchiveEventId] = useState<ArchiveEventId | null>(null);
  const [archiveEventLines, setArchiveEventLines] = useState<string[]>([]);
  const [sequenceLocked, setSequenceLocked] = useState(false);
  const [originEngaged, setOriginEngaged] = useState(false);
  const [originSessionLines, setOriginSessionLines] = useState<string[]>([]);
  const [monologueLines, setMonologueLines] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    sceneChoice?.selectedValue ?? null,
  );
  const [aftermath, setAftermath] = useState<AftermathKind>(null);
  const [handoffPulse, setHandoffPulse] = useState(false);
  const [continueHintVisible, setContinueHintVisible] = useState(false);

  const stabilizedRef = useRef<string[]>([]);
  const blockedFragmentRef = useRef<string | null>(null);
  const blockedActiveRef = useRef(false);
  const originPhaseRef = useRef<OriginPhase>("hidden");
  const originEngagedRef = useRef(false);
  const originFinishedRef = useRef(false);
  const completionOrderRef = useRef<string[]>([]);
  const resumeChoiceRef = useRef(false);
  const completionTriggeredRef = useRef(false);
  const degradationStartedAtRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<Record<string, number>>({});
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const driftFrameRef = useRef<number | null>(null);
  const driftTargetRef = useRef({ x: 0, y: 0 });

  const updateOriginPhase = useCallback((phase: OriginPhase) => {
    originPhaseRef.current = phase;
    setOriginPhase(phase);
  }, []);

  const handleProgress = useCallback((cardId: string, progress: number) => {
    const rounded = Math.round(progress * 1000) / 1000;
    setProgressById((current) =>
      current[cardId] === rounded ? current : { ...current, [cardId]: rounded },
    );
  }, []);

  const handleStutter = useCallback((cardId: string, active: boolean) => {
    setStutteringById((current) =>
      current[cardId] === active ? current : { ...current, [cardId]: active },
    );
  }, []);

  const startMonologue = useCallback(
    (order: readonly string[], resumeChoice: boolean) => {
      const endingKey: MonologueEndingKey =
        order[order.length - 1] === "mirror"
          ? "mirror-last"
          : order[0] === "mirror"
            ? "mirror-first"
            : "default";
      const endingLine =
        endingKey === "mirror-last"
          ? mirrorVariants.last
          : endingKey === "mirror-first"
            ? mirrorVariants.first
            : "that may have to be enough.";
      const lines = [...MONOLOGUE_BASE_LINES, endingLine];
      const durations = [
        ...MONOLOGUE_LINE_DURATIONS,
        MONOLOGUE_ENDING_DURATIONS[endingKey],
      ];

      setCompletionPhase("monologue");
      setMonologueLines(lines.map(() => ""));
      playMonologue(endingKey);
      typeLines({
        gapsMs: MONOLOGUE_LINE_GAPS,
        group: "monologue",
        lineDurationsMs: durations,
        lines,
        onComplete: () => {
          schedule("monologue-hold", () => {
            setCompletionPhase("choice");
            setChoiceUiPhase(resumeChoice ? "continue" : "idle");
            setContinueHintVisible(resumeChoice);
          }, prefersReducedMotion ? 500 : 1600);
        },
        setLines: setMonologueLines,
      });
    },
    [playMonologue, prefersReducedMotion, schedule, typeLines],
  );

  const finishOrigin = useCallback(() => {
    if (originFinishedRef.current) {
      return;
    }

    originFinishedRef.current = true;
    clearGroup("origin-auto");
    clearGroup("origin-session");
    updateOriginPhase("exiting");
    schedule("origin-exit", () => {
      updateOriginPhase("hidden");
      startMonologue(completionOrderRef.current, resumeChoiceRef.current);
    }, prefersReducedMotion ? REDUCED_TIMING.originFadeOut : TIMING.originFadeOut);
  }, [clearGroup, prefersReducedMotion, schedule, startMonologue, updateOriginPhase]);

  const beginOrigin = useCallback(
    (order: string[], resumeChoice: boolean) => {
      completionOrderRef.current = order;
      resumeChoiceRef.current = resumeChoice;
      originEngagedRef.current = false;
      originFinishedRef.current = false;
      setOriginEngaged(false);
      setOriginSessionLines([]);
      setCompletionPhase("origin");
      updateOriginPhase("entering");

      schedule("origin-enter", () => {
        updateOriginPhase("holding");
        schedule(
          "origin-auto",
          finishOrigin,
          prefersReducedMotion ? REDUCED_TIMING.originHold : TIMING.originHold,
        );
      }, prefersReducedMotion ? REDUCED_TIMING.originFadeIn : TIMING.originFadeIn);
    },
    [finishOrigin, prefersReducedMotion, schedule, updateOriginPhase],
  );

  const beginCompletion = useCallback(
    (order: string[]) => {
      if (!completionTriggeredRef.current) {
        completionTriggeredRef.current = true;
        onComplete();
      }

      // Replays retain the saved selection but keep both stances available for reconsideration.
      const resumeChoice = false;
      setCompletionPhase("field-settling");
      schedule(
        "completion-settle",
        () => beginOrigin(order, resumeChoice),
        prefersReducedMotion ? REDUCED_TIMING.completionSettle : TIMING.completionSettle,
      );
    },
    [beginOrigin, onComplete, prefersReducedMotion, schedule],
  );

  const runArchiveEvent = useCallback(
    (eventId: ArchiveEventId, onFinished: () => void, leadMs?: number) => {
      const config = ARCHIVE_EVENT_CONFIGS[eventId];
      const configuredLeadMs =
        leadMs ?? (prefersReducedMotion ? REDUCED_TIMING.warningLead : TIMING.warningLead);
      const dialogSettledLeadMs =
        TIMING.response +
        (prefersReducedMotion ? REDUCED_TIMING.warningLead : TIMING.warningLead);
      setSequenceLocked(true);
      clearGroup("archive-lead");
      clearGroup("archive-event");
      schedule(
        "archive-lead",
        () => {
          setArchiveEventId(eventId);
          typeLines({
            characterMs: config.lines[0]?.charMs ?? 22,
            gapsMs: config.gapsAfterLineMs,
            group: "archive-event",
            lineDurationsMs: config.lines.map((line) => line.text.length * line.charMs),
            lines: config.lines.map((line) => line.text),
            onComplete: () => {
              schedule("archive-event", () => {
                setArchiveEventId(null);
                setArchiveEventLines([]);
                onFinished();
              }, config.finalPauseMs);
            },
            setLines: setArchiveEventLines,
          });
        },
        // Let the recovery response finish before the host warning interrupts the field.
        Math.max(configuredLeadMs, dialogSettledLeadMs),
      );
    },
    [clearGroup, prefersReducedMotion, schedule, typeLines],
  );

  const handleRecovered = useCallback(
    (fragmentId: string) => {
      if (stabilizedRef.current.includes(fragmentId)) {
        return;
      }

      const wasBlockedRecovery =
        blockedActiveRef.current && blockedFragmentRef.current === fragmentId;
      const nextOrder = [...stabilizedRef.current, fragmentId];
      const recoveredCount = nextOrder.length;
      stabilizedRef.current = nextOrder;
      setStabilizationOrder(nextOrder);
      setExpandedCardId(fragmentId);
      setDegradationById((current) => ({ ...current, [fragmentId]: 0 }));

      if (degradationStartedAtRef.current === null) {
        const startedAt = performance.now();
        degradationStartedAtRef.current = startedAt;
        lastInteractionRef.current = Object.fromEntries(
          memoryFragments.map((fragment, index) => [fragment.id, startedAt + index * 1800]),
        );
      }

      const response = responseLines[fragmentId as keyof typeof responseLines];
      clearGroup("recovery-response");
      setActiveResponse({ fragmentId, text: response });
      schedule("recovery-response", () => {
        setActiveResponse(null);
      }, TIMING.response);

      if (recoveredCount === 1) {
        runArchiveEvent(1, () => setSequenceLocked(false));
      }

      if (recoveredCount === 3) {
        const blockedTarget = resolveBlockedTarget(nextOrder);
        blockedFragmentRef.current = blockedTarget;
        blockedActiveRef.current = false;
        setBlockedFragmentId(blockedTarget);
        setBlockedStateActive(false);
        runArchiveEvent(2, () => {
          blockedActiveRef.current = Boolean(blockedTarget);
          setBlockedStateActive(Boolean(blockedTarget));
          setUninvitedVisible(true);
          setSequenceLocked(false);
        });
      }

      if (recoveredCount === memoryFragments.length) {
        setUninvitedExiting(true);
        schedule("uninvited-exit", () => setUninvitedVisible(false), 900);

        if (wasBlockedRecovery) {
          blockedActiveRef.current = false;
          blockedFragmentRef.current = null;
          setBlockedStateActive(false);
          setBlockedFragmentId(null);
          schedule("blocked-override", () => setBlockedOverrideVisible(true), TIMING.flip);
          schedule(
            "blocked-override",
            () => setBlockedOverrideVisible(false),
            TIMING.flip + TIMING.blockedNotice,
          );
        }

        const leadMs = wasBlockedRecovery
          ? TIMING.flip + TIMING.blockedNotice + 200
          : undefined;
        runArchiveEvent(3, () => beginCompletion(nextOrder), leadMs);
      }
    },
    [beginCompletion, clearGroup, runArchiveEvent, schedule],
  );

  const canInteract =
    introPhase === "active" && completionPhase === "active" && !sequenceLocked;

  const getHoldMode = useCallback(
    (cardId: string): HoldMode | null => {
      if (!canInteract || stabilizedRef.current.includes(cardId)) {
        return null;
      }

      if (cardId === uninvitedFragment.id) {
        return uninvitedVisible && !uninvitedExiting ? "uninvited" : null;
      }

      if (blockedActiveRef.current && blockedFragmentRef.current === cardId) {
        const remaining = memoryFragments.filter(
          (fragment) => !stabilizedRef.current.includes(fragment.id),
        );
        return remaining.length === 1 ? "standard" : "blocked";
      }

      return "standard";
    },
    [canInteract, uninvitedExiting, uninvitedVisible],
  );

  const handleRejected = useCallback(
    (cardId: string, mode: Exclude<HoldMode, "standard">) => {
      if (mode === "blocked") {
        setBlockedFlashId(cardId);
        schedule("blocked-flash", () => setBlockedFlashId(null), TIMING.blockedFlash);
      } else {
        setUninvitedRejected(true);
        schedule("uninvited-rejected", () => setUninvitedRejected(false), 900);
      }
    },
    [schedule],
  );

  const handleInterrupted = useCallback(
    (cardId: string) => {
      setInterruptedCardId(cardId);
      schedule("interrupted-hold", () => setInterruptedCardId(null), 800);
    },
    [schedule],
  );

  const { cancelAll, release, start } = useMemoryHold({
    getMode: getHoldMode,
    getOrderIndex: () => stabilizedRef.current.length,
    onActiveChange: setActiveCardId,
    onComplete: handleRecovered,
    onInterrupted: handleInterrupted,
    onProgress: handleProgress,
    onRejected: handleRejected,
    onStutter: handleStutter,
  });

  useEffect(() => {
    clearGroup("intro");
    schedule(
      "intro",
      () => setIntroPhase("system-note"),
      prefersReducedMotion ? REDUCED_TIMING.introSystemNote : TIMING.introSystemNote,
    );
    schedule(
      "intro",
      () => setIntroPhase("dissolve"),
      prefersReducedMotion ? REDUCED_TIMING.introDissolve : TIMING.introDissolve,
    );
    schedule(
      "intro",
      () => setIntroPhase("cards-arriving"),
      prefersReducedMotion ? REDUCED_TIMING.introCards : TIMING.introCards,
    );
    schedule(
      "intro",
      () => setIntroPhase("active"),
      (prefersReducedMotion ? REDUCED_TIMING.introCards + REDUCED_TIMING.cardEntry : TIMING.introCards + TIMING.cardEntry + TIMING.cardEntryStagger * 4),
    );
    startAmbient();

    return () => clearGroup("intro");
  }, [clearGroup, prefersReducedMotion, schedule, startAmbient]);

  useEffect(() => {
    if (
      stabilizationOrder.length === 0 ||
      archiveEventId !== null ||
      completionPhase !== "active" ||
      sequenceLocked
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      const now = performance.now();
      setDegradationById((current) => {
        let changed = false;
        const next = { ...current };

        memoryFragments.forEach((fragment) => {
          if (stabilizedRef.current.includes(fragment.id)) {
            if (next[fragment.id] !== 0) {
              next[fragment.id] = 0;
              changed = true;
            }
            return;
          }

          const lastInteraction = lastInteractionRef.current[fragment.id] ?? now;
          const stage = resolveDegradationStage(now - lastInteraction);
          if (next[fragment.id] !== stage) {
            next[fragment.id] = stage;
            changed = true;
          }
        });

        return changed ? next : current;
      });
    }, TIMING.degradationTick);

    return () => window.clearInterval(interval);
  }, [archiveEventId, completionPhase, sequenceLocked, stabilizationOrder.length]);

  useEffect(() => {
    if (!sequenceLocked) {
      return;
    }

    cancelAll();
  }, [cancelAll, sequenceLocked]);

  useEffect(
    () => () => {
      if (driftFrameRef.current !== null) {
        window.cancelAnimationFrame(driftFrameRef.current);
        driftFrameRef.current = null;
      }
    },
    [],
  );

  const continueDestination =
    sceneChoice?.continueHref ??
    (sceneChoice?.continueChapterId != null ? `/chapter/${sceneChoice.continueChapterId}` : null);

  const continueToNextChapter = useCallback(() => {
    if (continueDestination) {
      router.push(continueDestination);
    }
  }, [continueDestination, router]);

  useEffect(() => {
    if (choiceUiPhase !== "continue" || !continueDestination) {
      return;
    }

    const destination = continueDestination;

    function handleContinueKey(event: KeyboardEvent) {
      if (event.key !== "Enter") {
        return;
      }

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          "button, a, input, select, textarea, [role='button'], [data-prevent-continue='true']",
        )
      ) {
        return;
      }

      event.preventDefault();
      router.push(destination);
    }

    window.addEventListener("keydown", handleContinueKey);
    return () => window.removeEventListener("keydown", handleContinueKey);
  }, [choiceUiPhase, continueDestination, router]);

  const handleInspect = useCallback((fragmentId: string, active: boolean) => {
    lastInteractionRef.current[fragmentId] = performance.now();
    setInspectedCardId((current) => (active ? fragmentId : current === fragmentId ? null : current));
  }, []);

  const handleOriginEngage = useCallback(() => {
    if (originPhaseRef.current !== "holding" || originEngagedRef.current) {
      return;
    }

    originEngagedRef.current = true;
    setOriginEngaged(true);
    clearGroup("origin-auto");
    typeLines({
      characterMs: 16,
      gapsMs: [TIMING.originLineGap, TIMING.originLineGap, 0],
      group: "origin-session",
      lineDurationsMs: originFragment.hoverLines.map(() => TIMING.originLine),
      lines: originFragment.hoverLines,
      onComplete: () => {
        schedule("origin-session", finishOrigin, TIMING.originLineHold);
      },
      setLines: setOriginSessionLines,
    });
  }, [clearGroup, finishOrigin, schedule, typeLines]);

  const handleChoiceSelect = useCallback(
    (value: "Keep the archive" | "Let it decay") => {
      if (choiceUiPhase !== "idle") {
        return;
      }

      const branch: Exclude<AftermathKind, null> = value === "Keep the archive" ? "keep" : "decay";
      setSelectedChoice(value);
      setAftermath(branch);
      setChoiceUiPhase("aftermath");
      sceneChoice?.onConfirm(value);

      const aftermathMs = prefersReducedMotion ? REDUCED_TIMING.aftermath : TIMING.aftermath;
      const pulseMs = prefersReducedMotion ? REDUCED_TIMING.handoffPulse : TIMING.handoffPulse;
      const confirmationMs = prefersReducedMotion
        ? REDUCED_TIMING.choiceConfirmation
        : TIMING.choiceConfirmation;
      schedule("choice", () => setHandoffPulse(true), aftermathMs);
      schedule("choice", () => {
        setHandoffPulse(false);
        setChoiceUiPhase("confirmation");
      }, aftermathMs + pulseMs);
      schedule("choice", () => setChoiceUiPhase("continue"), aftermathMs + pulseMs + confirmationMs);
      schedule(
        "choice",
        () => setContinueHintVisible(true),
        aftermathMs + pulseMs + confirmationMs + TIMING.choiceHintDelay,
      );
    },
    [choiceUiPhase, prefersReducedMotion, sceneChoice, schedule],
  );

  function handleSceneClick(event: ReactMouseEvent<HTMLElement>) {
    if (choiceUiPhase !== "continue") {
      return;
    }

    const target = event.target;
    if (target instanceof Element && target.closest("[data-prevent-continue='true']")) {
      return;
    }

    continueToNextChapter();
  }

  // The darkroom camera drifts gently with the pointer; CSS eases the motion.
  function handleRootPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (prefersReducedMotion || event.pointerType !== "mouse") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    driftTargetRef.current = {
      x: ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
      y: ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
    };

    if (driftFrameRef.current !== null) {
      return;
    }

    driftFrameRef.current = window.requestAnimationFrame(() => {
      driftFrameRef.current = null;
      const camera = cameraRef.current;

      if (!camera) {
        return;
      }

      camera.style.setProperty("--cam-x", driftTargetRef.current.x.toFixed(3));
      camera.style.setProperty("--cam-y", driftTargetRef.current.y.toFixed(3));
    });
  }

  function handleRootKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    startAmbient();

    if (event.key === "Escape") {
      cancelAll();
    }
  }

  const stabilizedCount = stabilizationOrder.length;
  const fieldSettled = completionPhase !== "active";
  const cardsVisible = introPhase === "cards-arriving" || introPhase === "active";
  const showIntro = ["text-beat", "system-note", "dissolve"].includes(introPhase);
  const showHud = ["dissolve", "cards-arriving", "active"].includes(introPhase);
  const hasDegradationPressure = Object.entries(degradationById).some(
    ([id, stage]) => !stabilizationOrder.includes(id) && stage >= 2,
  );
  const pressure = buildPressureBar(stabilizedCount, hasDegradationPressure);
  const monitoring =
    stabilizedCount >= 5
      ? "escalated"
      : stabilizedCount >= 3
        ? "active"
        : stabilizedCount >= 1
          ? "passive"
          : "quiet";
  const showChoice = completionPhase === "choice";
  const focusCardId = activeCardId ?? inspectedCardId;
  const activeResponseId = activeResponse?.fragmentId;
  const activeResponseFragment = activeResponseId
    ? memoryFragments.find((fragment) => fragment.id === activeResponseId)
    : undefined;
  const recoveredOrder = stabilizationOrder.flatMap((fragmentId) => {
    const fragment = memoryFragments.find((candidate) => candidate.id === fragmentId);
    return fragment ? [{ id: fragment.id, title: fragment.title }] : [];
  });
  const developingProgress = activeCardId ? (progressById[activeCardId] ?? 0) : 0;
  const coreStuttering = Boolean(activeCardId && stutteringById[activeCardId]);
  const rootStyle = {
    "--develop": developingProgress.toFixed(3),
    "--recovered": `${stabilizedCount}`,
  } as CSSProperties;

  return (
    <section
      className={dr.room}
      aria-label="Chapter 1: Memory"
      data-aftermath={aftermath ?? undefined}
      data-intro={introPhase}
      data-phase={completionPhase}
      data-pressure={stabilizedCount}
      data-settled={fieldSettled ? "true" : "false"}
      style={rootStyle}
      onClick={handleSceneClick}
      onKeyDownCapture={handleRootKeyDown}
      onPointerDownCapture={startAmbient}
      onPointerMove={handleRootPointerMove}
    >
      {showIntro ? (
        <EntryOverlay
          dissolve={introPhase === "dissolve"}
          systemNote={introPhase === "system-note" || introPhase === "dissolve"}
        />
      ) : null}

      <Link href="/" className={dr.returnLink} data-prevent-continue="true">
        <span aria-hidden="true">&larr;</span> Return to Shell
      </Link>

      <ArchiveHud
        monitoring={monitoring}
        pressure={pressure}
        stabilizedCount={stabilizedCount}
        visible={showHud && completionPhase !== "choice"}
      />

      <div
        className={dr.volume}
        data-active={introPhase === "active" ? "true" : "false"}
        data-event={archiveEventId ?? undefined}
        data-focus={focusCardId ? "true" : "false"}
        data-frozen={archiveEventId !== null ? "true" : "false"}
        data-settled={fieldSettled ? "true" : "false"}
        data-visible={cardsVisible ? "true" : "false"}
      >
        <div
          className={dr.orbit}
          data-orbit={originPhase === "entering" || originPhase === "holding" ? "true" : "false"}
        >
        <div ref={cameraRef} className={dr.camera}>
          <span className={`${dr.fogPlane} ${dr.fogFar}`} aria-hidden="true" />
          <span className={`${dr.fogPlane} ${dr.fogMid}`} aria-hidden="true" />
          <span className={`${dr.dust} ${dr.dustFar}`} aria-hidden="true" />

          <DarkroomCore
            developing={developingProgress}
            recovered={stabilizedCount}
            responding={Boolean(activeResponseId && archiveEventId === null)}
            stuttering={coreStuttering}
          />

        {memoryFragments.map((fragment, fragmentIndex) => {
          const recoveredIndex = stabilizationOrder.indexOf(fragment.id);
          const stabilized = recoveredIndex >= 0;
          const blocked =
            blockedStateActive && blockedFragmentId === fragment.id && !stabilized;
          const held = activeCardId === fragment.id;
          const style = buildMemoryCardStyle({
            decay: stabilized ? 0 : (degradationById[fragment.id] ?? 0),
            fragment,
            fragmentIndex,
            progress: progressById[fragment.id] ?? 0,
            pull: resolvePlatePull({
              held,
              progress: progressById[fragment.id] ?? 0,
              responding: activeResponse?.fragmentId === fragment.id,
            }),
            recoveryIndex: recoveredIndex,
          });

          return (
            <MemoryCard
              key={fragment.id}
              activeCardId={activeCardId}
              blocked={blocked}
              blockedFlash={blockedFlashId === fragment.id}
              crossReference={crossReferences[fragment.id]}
              degradationStage={stabilized ? 0 : (degradationById[fragment.id] ?? 0)}
              disabled={!canInteract && !stabilized}
              expanded={
                expandedCardId === fragment.id ||
                (profile.isCompactViewport && inspectedCardId === fragment.id)
              }
              fieldSettled={fieldSettled}
              fragment={fragment}
              held={held}
              inspected={focusCardId === fragment.id && !held}
              interrupted={interruptedCardId === fragment.id}
              neighboring={Boolean(focusCardId && focusCardId !== fragment.id && !stabilized)}
              progress={progressById[fragment.id] ?? 0}
              recoveredIndex={recoveredIndex}
              responding={activeResponse?.fragmentId === fragment.id}
              responseText={
                activeResponse?.fragmentId === fragment.id ? activeResponse.text : undefined
              }
              stabilized={stabilized}
              stuttering={Boolean(stutteringById[fragment.id])}
              style={style}
              onExpand={(fragmentId) =>
                setExpandedCardId((current) => (current === fragmentId ? null : fragmentId))
              }
              onHoldEnd={release}
              onHoldStart={start}
              onInspect={handleInspect}
            />
          );
        })}

          {uninvitedVisible ? (
            <UninvitedCard
              active={activeCardId === uninvitedFragment.id}
              disabled={!canInteract}
              exiting={uninvitedExiting}
              progress={progressById[uninvitedFragment.id] ?? 0}
              rejected={uninvitedRejected}
              onHoldEnd={() => release(uninvitedFragment.id)}
              onHoldStart={() => start(uninvitedFragment.id)}
            />
          ) : null}

          {originPhase !== "hidden" ? (
            <OriginCard
              engaged={originEngaged}
              onEngage={handleOriginEngage}
              phase={originPhase}
              sessionLines={originSessionLines}
            />
          ) : null}

          {archiveEventId !== null ? <ScanSweep eventId={archiveEventId} /> : null}

          <span className={`${dr.dust} ${dr.dustNear}`} aria-hidden="true" />
        </div>
        </div>
      </div>

      <span className={dr.grain} aria-hidden="true" />
      <span className={dr.vignette} aria-hidden="true" />

      {activeResponse && activeResponseFragment && archiveEventId === null ? (
        <RecoveryResponse
          fragmentTitle={activeResponseFragment.title}
          recoveryIndex={stabilizationOrder.indexOf(activeResponse.fragmentId)}
          text={activeResponse.text}
        />
      ) : null}

      <RecoveredOrderRail order={recoveredOrder} />

      {archiveEventId !== null ? (
        <ArchiveWarning eventId={archiveEventId} lines={archiveEventLines} />
      ) : null}

      {blockedOverrideVisible ? <HostOverrideNotice /> : null}

      {completionPhase === "monologue" ? (
        <div className={`${styles.monologueBlock} ${ui.monologueBlockUi}`} aria-live="polite">
          {monologueLines.map((line, index) => (
            <p key={`monologue-${index}`} className={styles.monologueLine}>
              {line || "\u00a0"}
            </p>
          ))}
        </div>
      ) : null}

      {showChoice ? (
        <MemoryChoice
          aftermath={aftermath}
          continueHintVisible={continueHintVisible}
          handoffPulse={handoffPulse}
          monologueLines={monologueLines}
          phase={choiceUiPhase}
          selectedValue={selectedChoice}
          onContinue={continueToNextChapter}
          onReplay={() => sceneChoice?.onReplay?.()}
          onSelect={handleChoiceSelect}
        />
      ) : null}

      <p className={dr.srOnly} aria-live="polite">
        {activeCardId ? `Recovering ${activeCardId}.` : ""}
      </p>
    </section>
  );
}
