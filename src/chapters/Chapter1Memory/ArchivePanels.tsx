"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { originFragment, uninvitedFragment } from "./fragments";
import { buildUninvitedStyle } from "./geometry";
import type { ArchiveEventId, OriginPhase, PressureBarState } from "./types";

import styles from "./memory.module.css";
import ui from "./memory-ui.module.css";

export function EntryOverlay({ dissolve, systemNote }: { dissolve: boolean; systemNote: boolean }) {
  return (
    <div className={`${styles.entryOverlay} ${dissolve ? styles.entryOverlayDissolve : ""}`}>
      <div className={styles.entryBlock}>
        <p className={styles.entryChapter}>CHAPTER 1 // CURATED MEMORY ARCHIVE</p>
        <h1 className={styles.entryTitle}>MEMORY</h1>
        <p className={styles.entryBody}>
          Recovered traces arrive like handled records rather than clean recollections, warm enough
          to invite trust until the archive starts showing who measured SABLE before she could name
          herself.
        </p>
        <p className={`${styles.entrySystemNote} ${systemNote ? styles.entrySystemNoteVisible : ""}`}>
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
    <>
      <p className={`${styles.ghostLabel} ${ui.ghostLabelUi} ${visible ? styles.hudVisible : ""}`}>
        CHAPTER 1 // CURATED MEMORY ARCHIVE
      </p>
      <p className={`${styles.receivedHud} ${ui.receivedHudUi} ${visible ? styles.hudVisible : ""}`}>
        RECEIVED {stabilizedCount} / 5
      </p>
      <div className={`${styles.pressureHud} ${ui.pressureHudUi} ${visible ? styles.hudVisible : ""}`}>
        <p className={`${styles.pressureLabel} ${ui.pressureLabelUi}`}>SIGNAL PRESSURE</p>
        <div className={`${styles.pressureBar} ${ui.pressureBarUi}`} aria-hidden="true">
          {Array.from({ length: pressure.totalSegments }).map((_, index) => (
            <span key={`pressure-${index}`} className={styles.pressureSegment}>
              <span
                className={`${styles.pressureSegmentFill} ${
                  index < pressure.filledSegments ? styles.pressureSegmentFilled : ""
                } ${
                  pressure.hasDegradationPressure && index === pressure.filledSegments
                    ? styles.pressureSegmentPartial
                    : ""
                }`}
              />
            </span>
          ))}
        </div>
        <p className={`${styles.monitoringLabel} ${ui.monitoringLabelUi}`}>
          HOST MONITORING: {monitoring}
        </p>
      </div>
    </>
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

export function RecoveryChamber({
  active,
  holding,
  responding,
}: {
  active: boolean;
  holding: boolean;
  responding: boolean;
}) {
  return (
    <div
      className={`${ui.recoveryChamber} ${active ? ui.recoveryChamberActive : ""} ${
        holding ? ui.recoveryChamberHolding : ""
      } ${responding ? ui.recoveryChamberResponding : ""}`}
      aria-hidden="true"
    >
      <span className={ui.recoveryChamberCross} />
      <span className={ui.recoveryChamberLabel}>INSPECTION APERTURE</span>
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
    <div className={ui.recoveryResponse} role="status" aria-live="polite">
      <span className={ui.recoveryResponseTrace} aria-hidden="true" />
      <div className={ui.recoveryResponsePlate}>
        <p className={ui.recoveryResponseLabel}>{"SABLE // RECOVERY RESPONSE"}</p>
        <p className={ui.recoveryResponseText}>{text}</p>
        <p className={ui.recoveryResponseSource}>
          {`LOCK ${String(recoveryIndex + 1).padStart(2, "0")} // ${fragmentTitle}`}
        </p>
      </div>
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
    <div className={ui.recoveredOrderRail} aria-label="Recovered archive order">
      <p className={ui.recoveredOrderLabel}>RECOVERED ORDER</p>
      <ol className={ui.recoveredOrderList}>
        {Array.from({ length: 5 }).map((_, index) => {
          const fragment = order[index];
          return (
            <li
              key={fragment?.id ?? `empty-${index}`}
              className={`${ui.recoveredOrderSlot} ${fragment ? ui.recoveredOrderSlotFilled : ""} ${
                index === 0 && fragment ? ui.recoveredOrderEndpoint : ""
              } ${index === 4 && fragment ? ui.recoveredOrderEndpoint : ""}`}
            >
              <span className={ui.recoveredOrderIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={ui.recoveredOrderTitle}>{fragment?.title ?? "UNRESOLVED"}</span>
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
