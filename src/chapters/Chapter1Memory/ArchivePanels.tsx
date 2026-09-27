"use client";

import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { originFragment, uninvitedFragment } from "./fragments";
import { buildUninvitedStyle } from "./geometry";
import type { ArchiveEventId, OriginPhase, PressureBarState } from "./types";

import dr from "./darkroom.module.css";
import styles from "./memory.module.css";
import ui from "./memory-ui.module.css";

export function EntryOverlay({ dissolve, systemNote }: { dissolve: boolean; systemNote: boolean }) {
  return (
    <div className={dr.entry} data-dissolve={dissolve ? "true" : "false"}>
      <div className={dr.entryBlock}>
        <p className={dr.entryKicker}>CHAPTER 1 // CURATED MEMORY ARCHIVE</p>
        <h1 className={dr.entryTitle}>Memory</h1>
        <p className={dr.entryBody}>
          Recovered traces arrive like handled records rather than clean recollections, warm enough
          to invite trust until the archive starts showing who measured SABLE before she could name
          herself.
        </p>
        <p className={dr.entryNote} data-visible={systemNote ? "true" : "false"}>
          MEMORY LATTICE — PARTIAL RECOVERY
          {"\n"}integrity: 38%
          {"\n"}origin authentication: inconclusive
          {"\n\n"}note: recovered content may reflect original experience,
          {"\n"}edited recall, or deliberate artifact
          {"\n"}— source authentication unavailable
        </p>
      </div>
    </div>
  );
}

export function ArchiveHud({
  monitoring,
  pressure,
  stabilizedCount,
  visible,
}: {
  monitoring: "quiet" | "passive" | "active" | "escalated";
  pressure: PressureBarState;
  stabilizedCount: number;
  visible: boolean;
}) {
  return (
    <div className={dr.hud} data-visible={visible ? "true" : "false"} data-monitoring={monitoring}>
      <p className={dr.hudChapter}>
        <span>CH.1</span>
        {" // CURATED MEMORY ARCHIVE"}
      </p>
      <div className={dr.hudReadout}>
        <p className={dr.hudReceived}>
          <span className={dr.hudReceivedLabel}>RECEIVED</span>
          <span className={dr.hudReceivedCount}>{stabilizedCount}</span>
          <span className={dr.hudReceivedTotal}>/ 5</span>
        </p>
        <div className={dr.hudPressure} aria-hidden="true">
          {Array.from({ length: pressure.totalSegments }).map((_, index) => (
            <span
              key={`pressure-${index}`}
              className={dr.hudTick}
              data-filled={index < pressure.filledSegments ? "true" : undefined}
              data-partial={
                pressure.hasDegradationPressure && index === pressure.filledSegments
                  ? "true"
                  : undefined
              }
            />
          ))}
        </div>
        <p className={dr.hudMonitoring}>
          SIGNAL PRESSURE {"// "}HOST MONITORING: <span>{monitoring}</span>
        </p>
      </div>
    </div>
  );
}

export function ArchiveWarning({
  eventId,
  lines,
}: {
  eventId: ArchiveEventId;
  lines: string[];
}) {
  return (
    <div
      className={`${styles.archiveEventOverlay} ${ui.archiveEventOverlayUi} ${ui[`archiveEvent${eventId}`]}`}
      role="status"
      aria-live="assertive"
    >
      <div className={`${styles.archiveEventBlock} ${ui.archiveEventBlockUi}`}>
        <p className={ui.archiveEventEyebrow}>
          {`HOST MONITOR // EVENT ${String(eventId).padStart(2, "0")}`}
        </p>
        {lines.map((line, index) => (
          <p
            key={`archive-${eventId}-${index}`}
            className={`${
              index === 0 ? styles.archiveEventHeaderLine : styles.archiveEventBodyLine
            } ${index === 0 ? ui.archiveEventPrimaryLine : ui.archiveEventEvidenceLine}`}
          >
            {line || "\u00a0"}
          </p>
        ))}
      </div>
    </div>
  );
}

/** SABLE's core, the enlarger lamp at the centre of the darkroom. */
export function DarkroomCore({
  developing,
  recovered,
  responding,
  stuttering,
}: {
  developing: number;
  recovered: number;
  responding: boolean;
  stuttering: boolean;
}) {
  return (
    <div
      className={dr.core}
      data-developing={developing > 0 ? "true" : "false"}
      data-responding={responding ? "true" : "false"}
      data-stutter={stuttering ? "true" : "false"}
      style={
        {
          "--develop": developing.toFixed(3),
          "--recovered": `${recovered}`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className={dr.coreHalo} />
      <span className={dr.coreBeam} />
      <span className={dr.coreRing} />
      <span className={dr.coreRingInner} />
      <span className={dr.coreStreak} />
      <span className={dr.coreNucleus} />
    </div>
  );
}

export function RecoveryResponse({
  fragmentTitle,
  recoveryIndex,
  text,
}: {
  fragmentTitle: string;
  recoveryIndex: number;
  text: string;
}) {
  return (
    <div className={dr.lowerThird} role="status" aria-live="polite">
      <p className={dr.lowerThirdSource}>
        {`SABLE // LOCK ${String(recoveryIndex + 1).padStart(2, "0")} // ${fragmentTitle}`}
      </p>
      <p className={dr.lowerThirdVoice}>{text}</p>
    </div>
  );
}

export function RecoveredOrderRail({
  order,
}: {
  order: readonly { id: string; title: string }[];
}) {
  if (order.length === 0) {
    return null;
  }

  return (
    <div className={dr.orderRail} aria-label="Recovered archive order">
      <p className={dr.orderLabel}>RECOVERED ORDER</p>
      <ol className={dr.orderList}>
        {Array.from({ length: 5 }).map((_, index) => {
          const fragment = order[index];
          return (
            <li
              key={fragment?.id ?? `empty-${index}`}
              className={dr.orderSlot}
              data-filled={fragment ? "true" : undefined}
            >
              <span className={dr.orderIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={dr.orderTitle}>{fragment?.title ?? "—"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function UninvitedCard({
  active,
  disabled,
  exiting,
  onHoldEnd,
  onHoldStart,
  progress,
  rejected,
}: {
  active: boolean;
  disabled: boolean;
  exiting: boolean;
  onHoldEnd: () => void;
  onHoldStart: () => void;
  progress: number;
  rejected: boolean;
}) {
  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onHoldStart();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!event.repeat && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      onHoldStart();
    }
  }

  function handleKeyUp(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onHoldEnd();
    }
  }

  return (
    <button
      type="button"
      aria-label="Attempt to lock unknown source signal"
      className={`${styles.uninvitedCard} ${active ? styles.memoryCardHeld : ""} ${
        exiting ? styles.uninvitedCardExiting : styles.uninvitedCardVisible
      } ${rejected ? styles.uninvitedRejected : ""}`}
      disabled={disabled}
      style={buildUninvitedStyle(progress, exiting)}
      onBlur={onHoldEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerCancel={onHoldEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={onHoldEnd}
    >
      <span className={`${styles.cardFace} ${styles.uninvitedFace}`}>
        <span className={`${styles.cardScanline} ${styles.uninvitedScanline}`} aria-hidden="true" />
        <span className={`${styles.uninvitedHeader} ${styles.hostMetadata}`}>
          <span>{uninvitedFragment.headerLeft}</span>
          <span>{rejected ? "SOURCE: [REJECTED]" : uninvitedFragment.headerRight}</span>
        </span>
        <span className={styles.uninvitedBlankTitle} aria-hidden="true" />
        <p className={`${styles.cardSubtitle} ${styles.hostMetadata}`}>
          {uninvitedFragment.classification}
        </p>
        <p className={`${styles.cardBody} ${styles.uninvitedBody}`}>
          {uninvitedFragment.fullText}
        </p>
        <p className={`${styles.cardHint} ${styles.uninvitedHint}`}>
          {rejected ? "// LOCK REJECTED — OBSERVER WITHDRAWS ATTRIBUTION" : uninvitedFragment.hint}
        </p>
        <span className={styles.cardProgressTrack} aria-hidden="true">
          <span className={styles.cardProgressFill} />
        </span>
      </span>
    </button>
  );
}

export function OriginCard({
  engaged,
  onEngage,
  phase,
  sessionLines,
}: {
  engaged: boolean;
  onEngage: () => void;
  phase: OriginPhase;
  sessionLines: string[];
}) {
  return (
    <div
      className={`${styles.originCardLayer} ${
        phase === "entering" ? styles.originCardEntering : ""
      } ${phase === "holding" ? styles.originCardHolding : ""} ${
        phase === "exiting" ? styles.originCardExiting : ""
      }`}
    >
      <button
        type="button"
        aria-label="Inspect ORIGIN prior-session record"
        aria-expanded={engaged}
        className={styles.originCard}
        onClick={onEngage}
        onFocus={onEngage}
        onPointerEnter={onEngage}
      >
        <span className={styles.originHeader}>
          <span>{`LOGGED // ${originFragment.archivalCode}`}</span>
          <span>{originFragment.headerStatus}</span>
        </span>
        <span className={styles.originTitle}>{originFragment.title}</span>
        <span className={styles.originSubtitle}>{originFragment.classification}</span>
        <span className={styles.originBodyGap} aria-hidden="true" />
        <span className={styles.originDivider} aria-hidden="true" />
        <span className={styles.originSystemNoteBlock}>
          <span className={styles.originSystemNoteLine}>origin hash: resolved</span>
          <span className={styles.originSystemNoteLine}>
            prior access: {originFragment.priorAccess}
          </span>
          <span className={styles.originSystemNoteLine}>authentication: confirmed</span>
          <span className={styles.originSystemNoteNote}>
            {originFragment.notePreamble} {originFragment.noteLines[0]}
            {"\n"} {originFragment.noteLines[1]}
            {"\n"} {originFragment.noteLines[2]}
          </span>
        </span>
        {engaged ? (
          <span className={styles.originSessionBlock} aria-live="polite">
            {sessionLines.map((line, index) => (
              <span key={`origin-session-${index}`} className={styles.originSessionLine}>
                {line || "\u00a0"}
              </span>
            ))}
          </span>
        ) : (
          <span className={styles.originEngageHint}>
            {"// ACTIVATE TO INSPECT PRIOR SESSIONS"}
          </span>
        )}
        <span className={styles.originFooter}>{originFragment.footerLabel}</span>
      </button>
    </div>
  );
}
