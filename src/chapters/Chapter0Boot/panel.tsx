"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { BootChoiceOutcome, BootHandoffPhase } from "@/chapters/Chapter0Boot/script";

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
  currentLineId: string;
  handoffPhase: BootHandoffPhase;
  hoveredChoice: string | null;
  hostResponseOverride: string | null;
  isChoiceReady: boolean;
  onChoiceHoverChange: (value: string | null) => void;
  onChoiceSelect: (value: string) => void;
  prefersReducedMotion: boolean;
  previousChoiceValue: string | null;
  selectedChoiceOutcome: BootChoiceOutcome | null;
  showChoiceOptions: boolean;
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

export function BootTracePanel({
  activeChoiceValue,
  choiceOptions,
  choiceState,
  currentLineId,
  handoffPhase,
  hoveredChoice,
  hostResponseOverride,
  isChoiceReady,
  onChoiceHoverChange,
  onChoiceSelect,
  prefersReducedMotion,
  previousChoiceValue,
  selectedChoiceOutcome,
  showChoiceOptions,
}: BootTracePanelProps) {
  const activeStage = useMemo(
    () => bootPanelStages[currentLineId] ?? bootPanelStages["boot-01"],
    [currentLineId],
  );
  const stage = selectedChoiceOutcome
    ? {
        designation: selectedChoiceOutcome.designation,
        entityClass: selectedChoiceOutcome.entityClass,
        hostResponse: activeStage.hostResponse,
        origin: selectedChoiceOutcome.origin,
        threatIndex: selectedChoiceOutcome.threatIndex,
        tracePosition: activeStage.tracePosition,
      }
    : activeStage;
  const responseLines = selectedChoiceOutcome?.hostResponse ?? [stage.hostResponse];
  const resolvedResponseLines = hostResponseOverride
    ? [hostResponseOverride]
    : choiceState === "pending"
      ? ["stance required. choose a route before handoff."]
      : responseLines;
  const liveResponse = resolvedResponseLines.join(" ");

  return (
    <div className={styles.tracePanel}>
      <section className={styles.traceSection}>
        <p className={styles.statusTitle}>Host Trace</p>
        <div className={styles.statusList}>
          <PanelRow label="trace position" value={stage.tracePosition} prefersReducedMotion={prefersReducedMotion} />
          <PanelRow label="entity class" value={stage.entityClass} prefersReducedMotion={prefersReducedMotion} />
          <PanelRow label="origin" value={stage.origin} prefersReducedMotion={prefersReducedMotion} />
          <PanelRow label="designation" value={stage.designation} prefersReducedMotion={prefersReducedMotion} />
          <PanelRow
            alarm={stage.threatIndex === "containment recommended" || stage.threatIndex === "containment escalated"}
            label="threat index"
            value={stage.threatIndex}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </section>

      <section className={styles.hostResponseSection}>
        <p className={styles.statusTitle}>Host Response</p>
        <div className={styles.hostResponseBody}>
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
      </section>

      {showChoiceOptions ? (
        <section className={styles.panelChoiceSection} aria-label="SABLE stance selection">
          <div className={styles.panelChoiceSeparator} aria-hidden="true" />
          <div className={styles.choiceAnnounce}>a stance is required</div>
          {previousChoiceValue ? (
            <p className={styles.previousChoice}>previously recorded: {previousChoiceValue}</p>
          ) : null}
          <div className={styles.panelChoiceList}>
            {choiceOptions.map((option) => {
              const isHovered = hoveredChoice === option.value;
              const isSelected = activeChoiceValue === option.value;
              const isHidden = choiceState === "committed" && !isSelected;
              const isDimmed = hoveredChoice !== null && !isHovered && !isSelected;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={!isChoiceReady || choiceState === "committed"}
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
                    <span className={styles.choiceHeading}>[ {option.heading} ]</span>
                    <span className={styles.choiceDetail}>{option.detailLines[0]}</span>
                    <span className={styles.choiceDetail}>{option.detailLines[1]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className={styles.panelPhaseNote} aria-live="polite">
        {handoffPhase === "choice"
          ? "select a stance"
          : handoffPhase === "consequence"
            ? "stance recorded"
            : handoffPhase === "memory-preview" || handoffPhase === "ready"
              ? "memory handoff staged"
              : "host classification active"}
      </div>
    </div>
  );
}

function PanelRow({
  alarm = false,
  label,
  prefersReducedMotion,
  value,
}: {
  alarm?: boolean;
  label: string;
  prefersReducedMotion: boolean;
  value: string;
}) {
  return (
    <div className={styles.statusRow}>
      <span>{label}</span>
      <AnimatedPanelValue alarm={alarm} prefersReducedMotion={prefersReducedMotion} value={value} />
    </div>
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
