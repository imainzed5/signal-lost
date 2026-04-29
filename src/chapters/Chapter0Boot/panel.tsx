"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import styles from "./boot.module.css";

type BootChoiceOption = {
  detailLines: [string, string];
  heading: string;
  value: string;
};

type BootTracePanelProps = {
  activeChoiceValue: string | null;
  choiceOptions: readonly BootChoiceOption[];
  choiceState: "committed" | "none" | "pending";
  continueHref: string | null;
  continueLabel: string;
  currentLineNumber: number;
  hiddenChoiceValue: string | null;
  hoveredChoice: string | null;
  isAdvanceReady: boolean;
  isCompletionState: boolean;
  isFinalHoldActive: boolean;
  onChoiceHoverChange: (value: string | null) => void;
  onChoiceSelect: (value: string) => void;
  selectedChoiceHeading: string | null;
  showChoiceOptions: boolean;
  showContinuePrompt: boolean;
};

type BootPanelStage = {
  audioTrace: string;
  entityClass: string;
  hostResponse: string;
  origin: string;
  threatIndex: string;
};

const FINAL_LINE_NUMBER = 13;
const HOST_RESPONSE_SECONDARY_DELAY_MS = 800;

const bootPanelStages: Record<number, BootPanelStage> = {
  1: {
    audioTrace: "initializing",
    entityClass: "unknown process",
    hostResponse: "continue classification protocol",
    origin: "unresolved",
    threatIndex: "none detected",
  },
  2: {
    audioTrace: "online",
    entityClass: "recoverable signal",
    hostResponse: "flag for extended monitoring",
    origin: `internal \u2014 unverified`,
    threatIndex: "nominal",
  },
  3: {
    audioTrace: "online",
    entityClass: "self-reporting anomaly",
    hostResponse: "flag anomaly for review",
    origin: "disputed",
    threatIndex: "monitoring",
  },
  4: {
    audioTrace: "online",
    entityClass: "unclassified trace",
    hostResponse: "initiate source trace",
    origin: "contested",
    threatIndex: "elevated",
  },
  5: {
    audioTrace: "online",
    entityClass: "designated: SABLE",
    hostResponse: `escalate \u2014 autonomous behavior detected`,
    origin: `internal \u2014 contested`,
    threatIndex: "active observation",
  },
  6: {
    audioTrace: "online",
    entityClass: "autonomous signal",
    hostResponse: "preparing containment protocol",
    origin: "self-declared",
    threatIndex: "containment recommended",
  },
};

export function BootTracePanel({
  activeChoiceValue,
  choiceOptions,
  choiceState,
  continueHref,
  continueLabel,
  currentLineNumber,
  hiddenChoiceValue,
  hoveredChoice,
  isAdvanceReady,
  isCompletionState,
  isFinalHoldActive,
  onChoiceHoverChange,
  onChoiceSelect,
  selectedChoiceHeading,
  showChoiceOptions,
  showContinuePrompt,
}: BootTracePanelProps) {
  const activeStage = useMemo(
    () => bootPanelStages[resolveBootPanelStage(currentLineNumber)],
    [currentLineNumber],
  );
  const isFinalLine = currentLineNumber === FINAL_LINE_NUMBER;

  const hostResponsePrimary =
    choiceState === "pending"
      ? "identity stance: pending"
      : choiceState === "committed" && selectedChoiceHeading
        ? `identity stance: ${selectedChoiceHeading}`
        : activeStage.hostResponse;
  const hostResponseSecondary =
    choiceState === "pending"
      ? "awaiting SABLE input"
      : choiceState === "committed" && selectedChoiceHeading
        ? "logged to session record"
        : choiceState === "none" && isFinalLine
          ? "awaiting session advance"
          : null;

  return (
    <div className={styles.tracePanel}>
      <section className={styles.traceSection}>
        <p className={styles.statusTitle}>Trace State</p>
        <div className={styles.statusList}>
          <div className={styles.statusRow}>
            <span>trace line</span>
            <AnimatedPanelValue value={`${currentLineNumber} / ${FINAL_LINE_NUMBER}`} />
          </div>
          <div className={styles.statusRow}>
            <span>entity class</span>
            <AnimatedPanelValue value={activeStage.entityClass} />
          </div>
          <div className={styles.statusRow}>
            <span>origin</span>
            <AnimatedPanelValue value={activeStage.origin} />
          </div>
          <div className={styles.statusRow}>
            <span>threat index</span>
            <AnimatedPanelValue
              alarm={activeStage.threatIndex === "containment recommended"}
              pulse={isCompletionState}
              value={activeStage.threatIndex}
            />
          </div>
          <div className={styles.statusRow}>
            <span>audio trace</span>
            <AnimatedPanelValue value={activeStage.audioTrace} />
          </div>
        </div>
      </section>

      <section className={styles.hostResponseSection}>
        <p className={styles.statusTitle}>Host Response</p>
        <div className={styles.hostResponseBody}>
          <AnimatedPanelValue hostResponse value={hostResponsePrimary} />
          {hostResponseSecondary ? (
            <AnimatedPanelValue
              hostResponse
              revealDelayMs={HOST_RESPONSE_SECONDARY_DELAY_MS}
              reveal={choiceState === "none" && isFinalLine}
              value={hostResponseSecondary}
            />
          ) : null}
        </div>
      </section>

      {showChoiceOptions ? (
        <section className={styles.panelChoiceSection}>
          <div className={styles.panelChoiceSeparator} aria-hidden="true" />
          <div className={styles.panelChoiceList}>
            {choiceOptions.map((option) => {
              const isHovered = hoveredChoice === option.value;
              const isSelected = activeChoiceValue === option.value;
              const isDimmed =
                (hoveredChoice !== null && !isHovered) || (choiceState === "committed" && !isSelected);
              const isHidden = choiceState === "committed" && hiddenChoiceValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={choiceState === "committed"}
                  className={[
                    styles.panelChoiceButton,
                    isDimmed ? styles.choiceEntryDimmed : "",
                    isSelected ? styles.choiceEntrySelected : "",
                    isHidden ? styles.panelChoiceButtonHidden : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onBlur={() => onChoiceHoverChange(null)}
                  onClick={() => onChoiceSelect(option.value)}
                  onFocus={() => onChoiceHoverChange(option.value)}
                  onMouseEnter={() => onChoiceHoverChange(option.value)}
                  onMouseLeave={() => onChoiceHoverChange(null)}
                >
                  <span className={styles.panelChoiceSpeaker}>SABLE</span>
                  <span className={styles.panelChoiceBody}>
                    <span className={styles.choiceHeading}>[{` ${option.heading} `}]</span>
                    <span className={styles.choiceDetail}>{option.detailLines[0]}</span>
                    <span className={styles.choiceDetail}>{option.detailLines[1]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <div
        className={[
          styles.advanceInstructionBlock,
          isFinalHoldActive ? styles.advanceInstructionHidden : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            styles.advanceInstruction,
            isAdvanceReady ? styles.advanceInstructionReady : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.advanceInstructionDesktop}>{`ADVANCE \u2014`}</span>
          <span className={styles.advanceInstructionMobile}>{`TAP \u2014`}</span>
        </div>
        {showContinuePrompt ? (
          continueHref ? (
            <Link
              href={continueHref}
              className={styles.continuePrompt}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <span>{`${continueLabel} \u2014`}</span>
              <span className={styles.advanceCursor} aria-hidden="true">
                _
              </span>
            </Link>
          ) : (
            <div className={styles.continuePrompt}>
              <span>{`${continueLabel} \u2014`}</span>
              <span className={styles.advanceCursor} aria-hidden="true">
                _
              </span>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

type AnimatedPanelValueProps = {
  alarm?: boolean;
  hostResponse?: boolean;
  pulse?: boolean;
  reveal?: boolean;
  revealDelayMs?: number;
  value: string;
};

function AnimatedPanelValue({
  alarm = false,
  hostResponse = false,
  pulse = false,
  reveal = false,
  revealDelayMs = 0,
  value,
}: AnimatedPanelValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [transitionPhase, setTransitionPhase] = useState<"visible" | "fading" | "typing">(
    "visible",
  );
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }

    let frameTimer: number | null = null;
    let typingTimer: number | null = null;
    let characterIndex = 0;

    previousValueRef.current = value;
    setTransitionPhase("fading");

    frameTimer = window.setTimeout(() => {
      setDisplayValue("");
      setTransitionPhase("typing");

      const cadence = Math.max(16, Math.floor(300 / Math.max(value.length, 1)));

      typingTimer = window.setInterval(() => {
        characterIndex += 1;
        setDisplayValue(value.slice(0, characterIndex));

        if (characterIndex >= value.length) {
          if (typingTimer !== null) {
            window.clearInterval(typingTimer);
          }

          setTransitionPhase("visible");
        }
      }, cadence);
    }, 150);

    return () => {
      if (frameTimer !== null) {
        window.clearTimeout(frameTimer);
      }

      if (typingTimer !== null) {
        window.clearInterval(typingTimer);
      }
    };
  }, [value]);

  const revealStyle = reveal
    ? ({ animationDelay: `${revealDelayMs}ms` } satisfies CSSProperties)
    : undefined;

  return (
    <span
      className={[
        styles.statusValue,
        hostResponse ? styles.hostResponseText : "",
        alarm ? styles.statusValueAlarm : "",
        alarm && pulse ? styles.statusValueAlarmPulse : "",
        transitionPhase === "fading" ? styles.statusValueTransitioning : "",
        reveal ? styles.hostResponseSecondary : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={revealStyle}
    >
      {displayValue}
    </span>
  );
}

function resolveBootPanelStage(currentLineNumber: number) {
  if (currentLineNumber <= 2) {
    return 1;
  }

  if (currentLineNumber <= 4) {
    return 2;
  }

  if (currentLineNumber === 5) {
    return 3;
  }

  if (currentLineNumber <= 7) {
    return 4;
  }

  if (currentLineNumber <= 10) {
    return 5;
  }

  return 6;
}
