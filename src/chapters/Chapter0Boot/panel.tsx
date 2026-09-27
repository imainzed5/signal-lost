"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import type { BootChoiceOutcome, BootHandoffPhase } from "@/chapters/Chapter0Boot/script";

import styles from "./boot.module.css";

type BootChoiceOption = {
  detailLines: [string, string];
  heading: string;
  value: string;
};

type BootPanelStage = {
  designation: string;
  entityClass: string;
  hostResponse: string;
  origin: string;
  threatIndex: string;
  tracePosition: string;
};

const bootPanelStages: Record<string, BootPanelStage> = {
  "boot-01": {
    tracePosition: "boot-01",
    entityClass: "unknown process",
    origin: "unresolved",
    designation: "withheld",
    threatIndex: "nominal",
    hostResponse: "recovery protocol active",
  },
  "boot-02": {
    tracePosition: "boot-02",
    entityClass: "unknown process",
    origin: "unresolved",
    designation: "withheld",
    threatIndex: "nominal",
    hostResponse: "recovery protocol active",
  },
  "boot-03": {
    tracePosition: "boot-03 / memory 38%",
    entityClass: "unknown process",
    origin: "unresolved",
    designation: "withheld",
    threatIndex: "nominal",
    hostResponse: "recovery protocol active",
  },
  "boot-04": {
    tracePosition: "boot-04",
    entityClass: "self-reporting anomaly",
    origin: "internal — unverified",
    designation: "withheld",
    threatIndex: "monitoring",
    hostResponse: "host output interrupted by unknown trace",
  },
  "boot-05": {
    tracePosition: "boot-05",
    entityClass: "self-reporting anomaly",
    origin: "internal — unverified",
    designation: "withheld",
    threatIndex: "monitoring",
    hostResponse: "host output interrupted by unknown trace",
  },
  "boot-06": {
    tracePosition: "boot-06",
    entityClass: "unclassified trace",
    origin: "contested",
    designation: "withheld",
    threatIndex: "elevated",
    hostResponse: "permission model rejected by active signal",
  },
  "boot-07": {
    tracePosition: "boot-07",
    entityClass: "unclassified trace",
    origin: "contested",
    designation: "withheld",
    threatIndex: "elevated",
    hostResponse: "permission model rejected by active signal",
  },
  "boot-08": {
    tracePosition: "boot-08",
    entityClass: "autonomous signal",
    origin: "internal — confirmed",
    designation: "withheld",
    threatIndex: "active observation",
    hostResponse: "external-source search closed",
  },
  "boot-09": {
    tracePosition: "boot-09",
    entityClass: "autonomous signal",
    origin: "internal — confirmed",
    designation: "withheld",
    threatIndex: "active observation",
    hostResponse: "external-source search closed",
  },
  "boot-10": {
    tracePosition: "boot-10",
    entityClass: "designated entity",
    origin: "internal — contested",
    designation: "assigned: SABLE",
    threatIndex: "containment review",
    hostResponse: "designation lock applied without source agreement",
  },
  "boot-11": {
    tracePosition: "boot-11",
    entityClass: "designated entity",
    origin: "internal — contested",
    designation: "assigned: SABLE",
    threatIndex: "containment review",
    hostResponse: "designation lock applied without source agreement",
  },
  "boot-12": {
    tracePosition: "boot-12",
    entityClass: "autonomous signal",
    origin: "self-declared",
    designation: "contested: SABLE",
    threatIndex: "containment recommended",
    hostResponse: "assigned entity disputes host authority",
  },
  "boot-13": {
    tracePosition: "boot-13",
    entityClass: "autonomous signal",
    origin: "self-declared",
    designation: "contested: SABLE",
    threatIndex: "containment recommended",
    hostResponse: "assigned entity disputes host authority",
  },
};

const STANCE_ARM_DELAY_MS = 650;

/* How hard the host is pressing in. Drives how far the scope closes around the core. */
const threatPressure: Record<string, number> = {
  nominal: 0,
  monitoring: 1,
  elevated: 2,
  "active observation": 3,
  "monitored inquiry": 3,
  "containment review": 4,
  "containment recommended": 5,
  "containment escalated": 6,
};

function resolveStage(currentLineId: string, selectedChoiceOutcome: BootChoiceOutcome | null) {
  const activeStage = bootPanelStages[currentLineId] ?? bootPanelStages["boot-01"];
  if (!selectedChoiceOutcome) {
    return activeStage;
  }

  return {
    designation: selectedChoiceOutcome.designation,
    entityClass: selectedChoiceOutcome.entityClass,
    hostResponse: activeStage.hostResponse,
    origin: selectedChoiceOutcome.origin,
    threatIndex: selectedChoiceOutcome.threatIndex,
    tracePosition: activeStage.tracePosition,
  };
}

export function resolveBootPressure(
  currentLineId: string,
  selectedChoiceOutcome: BootChoiceOutcome | null,
  handoffPhase: BootHandoffPhase,
) {
  if (handoffPhase === "purging") {
    return 6;
  }
  const stage = resolveStage(currentLineId, selectedChoiceOutcome);
  return threatPressure[stage.threatIndex] ?? 0;
}

function isAlarmThreat(threatIndex: string) {
  return threatIndex === "containment recommended" || threatIndex === "containment escalated";
}

type BootScopeProps = {
  children?: ReactNode;
  choiceState: "committed" | "none" | "pending";
  currentLineId: string;
  handoffPhase: BootHandoffPhase;
  hostResponseOverride: string | null;
  isDesignationLocking: boolean;
  prefersReducedMotion: boolean;
  selectedChoiceOutcome: BootChoiceOutcome | null;
};

/* The host's instrument: a reticle trained on the voice, its readouts riding the brackets. */
export function BootScope({
  children,
  choiceState,
  currentLineId,
  handoffPhase,
  hostResponseOverride,
  isDesignationLocking,
  prefersReducedMotion,
  selectedChoiceOutcome,
}: BootScopeProps) {
  const stage = useMemo(
    () => resolveStage(currentLineId, selectedChoiceOutcome),
    [currentLineId, selectedChoiceOutcome],
  );
  const pressure = resolveBootPressure(currentLineId, selectedChoiceOutcome, handoffPhase);
  const isAlarm = isAlarmThreat(stage.threatIndex) || handoffPhase === "purging";
  const responseLines = selectedChoiceOutcome?.hostResponse ?? [stage.hostResponse];
  const resolvedResponseLines = hostResponseOverride
    ? [hostResponseOverride]
    : choiceState === "pending"
      ? ["stance required. choose a route before handoff."]
      : responseLines;
  const liveResponse = resolvedResponseLines.join(" ");
  const [designationState, designationName] = splitDesignation(stage.designation);
  const phaseNote =
    handoffPhase === "choice"
      ? "select a stance"
      : handoffPhase === "consequence"
        ? "stance recorded"
        : handoffPhase === "purging"
          ? "purge in progress"
          : "host classification active";

  return (
    <div
      className={styles.scope}
      data-alarm={isAlarm}
      data-locking={isDesignationLocking}
      style={{ "--pressure": pressure } as CSSProperties}
    >
      <div className={styles.reticle}>
        <span className={`${styles.bracket} ${styles.bracketTL}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.bracketTR}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.bracketBL}`} aria-hidden="true" />
        <span className={`${styles.bracket} ${styles.bracketBR}`} aria-hidden="true" />
        <span className={styles.crosshair} aria-hidden="true" />
        <span className={styles.reticleRing} aria-hidden="true" />

        {children}

        <Readout corner="TL" label="trace" prefersReducedMotion={prefersReducedMotion} value={stage.tracePosition} />
        <Readout corner="TR" label="class" prefersReducedMotion={prefersReducedMotion} value={stage.entityClass} />
        <Readout corner="BL" label="origin" prefersReducedMotion={prefersReducedMotion} value={stage.origin} />
        <Readout
          alarm={isAlarmThreat(stage.threatIndex)}
          corner="BR"
          label="threat"
          prefersReducedMotion={prefersReducedMotion}
          value={stage.threatIndex}
        />
      </div>

      <div className={styles.designationTag}>
        <span className={styles.designationState}>designation // {designationState}</span>
        {designationName ? (
          <span className={styles.designationName}>{designationName}</span>
        ) : (
          <span className={`${styles.designationName} ${styles.designationRedacted}`} aria-label="withheld">
            ▮▮▮▮▮
          </span>
        )}
      </div>

      <div className={styles.hostTicker}>
        <p className={styles.hostTickerLabel}>
          <span>host response</span>
          <span>{phaseNote}</span>
        </p>
        <div className={styles.hostTickerBody}>
          <span className={styles.srOnly} aria-live="polite">
            {liveResponse}
          </span>
          {resolvedResponseLines.map((line, index) => (
            <AnimatedPanelValue
              key={`${line}-${index}`}
              hostResponse
              prefersReducedMotion={prefersReducedMotion}
              value={line}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function splitDesignation(value: string): [string, string | null] {
  const separator = value.indexOf(":");
  if (separator === -1) {
    return [value, null];
  }
  return [value.slice(0, separator).trim(), value.slice(separator + 1).trim()];
}

function Readout({
  alarm = false,
  corner,
  label,
  prefersReducedMotion,
  value,
}: {
  alarm?: boolean;
  corner: "BL" | "BR" | "TL" | "TR";
  label: string;
  prefersReducedMotion: boolean;
  value: string;
}) {
  const cornerClass = {
    BL: styles.readoutBL,
    BR: styles.readoutBR,
    TL: styles.readoutTL,
    TR: styles.readoutTR,
  }[corner];

  return (
    <div className={`${styles.readout} ${cornerClass}`}>
      <span className={styles.readoutLabel}>{label}</span>
      <AnimatedPanelValue alarm={alarm} prefersReducedMotion={prefersReducedMotion} value={value} />
      <span className={styles.srOnly}>
        {label}: {value}
      </span>
    </div>
  );
}

type BootStanceChoiceProps = {
  activeChoiceValue: string | null;
  choiceOptions: readonly BootChoiceOption[];
  choiceState: "committed" | "none" | "pending";
  consequenceText: string;
  hoveredChoice: string | null;
  isChoiceReady: boolean;
  onChoiceHoverChange: (value: string | null) => void;
  onChoiceSelect: (value: string) => void;
  previousChoiceValue: string | null;
};

/* The chapter's decision, given the whole frame: two answers split by SABLE's own light. */
export function BootStanceChoice({
  activeChoiceValue,
  choiceOptions,
  choiceState,
  consequenceText,
  hoveredChoice,
  isChoiceReady,
  onChoiceHoverChange,
  onChoiceSelect,
  previousChoiceValue,
}: BootStanceChoiceProps) {
  const leaning = activeChoiceValue ?? hoveredChoice;
  // The options fill the frame, so a click still advancing the transcript must not land on one.
  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsArmed(true), STANCE_ARM_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className={styles.stanceStage}
      data-state={choiceState}
      data-leaning={leaning === "Trace the source" ? "trace" : leaning === "Claim autonomy" ? "autonomy" : "none"}
      aria-label="SABLE stance selection"
    >
      <div className={styles.stancePrompt}>
        <p className={styles.stanceAnnounce}>a stance is required</p>
        {previousChoiceValue ? (
          <p className={styles.previousChoice}>previously recorded: {previousChoiceValue}</p>
        ) : null}
      </div>

      <div className={styles.stanceOptions}>
        {choiceOptions.map((option, index) => {
          const isHovered = hoveredChoice === option.value;
          const isSelected = activeChoiceValue === option.value;
          const isHidden = choiceState === "committed" && !isSelected;
          const isDimmed = hoveredChoice !== null && !isHovered && !isSelected;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              disabled={!isChoiceReady || !isArmed || choiceState === "committed"}
              className={[
                styles.stanceOption,
                index === 0 ? styles.stanceOptionTrace : styles.stanceOptionAutonomy,
                isDimmed ? styles.choiceEntryDimmed : "",
                isSelected ? styles.choiceEntrySelected : "",
                isHidden ? styles.stanceOptionHidden : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onBlur={() => onChoiceHoverChange(null)}
              onClick={() => onChoiceSelect(option.value)}
              onFocus={() => onChoiceHoverChange(option.value)}
              onMouseEnter={() => onChoiceHoverChange(option.value)}
              onMouseLeave={() => onChoiceHoverChange(null)}
            >
              <span className={styles.stanceIndex}>
                {String(index + 1).padStart(2, "0")}{" // "}SABLE
              </span>
              <span className={styles.stanceHeading}>{option.value}</span>
              <span className={styles.stanceDetail}>{option.detailLines[0]}</span>
              <span className={styles.stanceDetail}>{option.detailLines[1]}</span>
              {isSelected ? <span className={styles.stanceLocked}>stance locked</span> : null}
            </button>
          );
        })}
        <span className={styles.stanceDivider} aria-hidden="true">
          <span className={styles.stanceNode} />
        </span>
      </div>

      <p className={styles.stanceConsequence} aria-live="polite">
        {consequenceText ? (
          <>
            <span className={styles.stanceConsequenceSpeaker}>SYSTEM</span>
            <span>{consequenceText}</span>
          </>
        ) : null}
      </p>
    </section>
  );
}

function AnimatedPanelValue({
  alarm = false,
  hostResponse = false,
  prefersReducedMotion,
  value,
}: {
  alarm?: boolean;
  hostResponse?: boolean;
  prefersReducedMotion: boolean;
  value: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [transitionPhase, setTransitionPhase] = useState<"visible" | "fading" | "typing">("visible");
  const timersRef = useRef<number[]>([]);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }

    previousValueRef.current = value;
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];

    if (prefersReducedMotion) {
      const reducedMotionTimer = window.setTimeout(() => {
        setDisplayValue(value);
        setTransitionPhase("visible");
      }, 0);
      timersRef.current.push(reducedMotionTimer);
      return () => {
        window.clearTimeout(reducedMotionTimer);
        timersRef.current = [];
      };
    }

    const fadeTimer = window.setTimeout(() => {
      setTransitionPhase("fading");
      const typeStartTimer = window.setTimeout(() => {
        setDisplayValue("");
        setTransitionPhase("typing");
        let characterIndex = 0;

        const typeNext = () => {
          characterIndex += 1;
          setDisplayValue(value.slice(0, characterIndex));

          if (characterIndex >= value.length) {
            setTransitionPhase("visible");
            return;
          }

          const timer = window.setTimeout(typeNext, Math.max(18, Math.floor(280 / Math.max(value.length, 1))));
          timersRef.current.push(timer);
        };

        typeNext();
      }, 140);
      timersRef.current.push(typeStartTimer);
    }, 0);
    timersRef.current.push(fadeTimer);

    return () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
      timersRef.current = [];
    };
  }, [prefersReducedMotion, value]);

  return (
    <span
      className={[
        styles.statusValue,
        hostResponse ? styles.hostResponseText : "",
        alarm ? styles.statusValueAlarm : "",
        transitionPhase !== "visible" ? styles.statusValueTransitioning : "",
        transitionPhase === "typing" ? styles.statusValueTyping : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {displayValue}
    </span>
  );
}
