"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { Fragment, useMemo } from "react";

import type { MemoryFragment } from "./fragments";
import { resolveCorruptThreshold, resolveSegments, toCorruptionMask } from "./helpers";
import type { DegradationStage, MemoryCardStyle } from "./types";

import styles from "./memory.module.css";
import ui from "./memory-ui.module.css";

type MemoryCardProps = {
  activeCardId: string | null;
  blocked: boolean;
  blockedFlash: boolean;
  crossReference?: { note: string; ref: string };
  degradationStage: DegradationStage;
  disabled: boolean;
  expanded: boolean;
  fieldSettled: boolean;
  fragment: MemoryFragment;
  held: boolean;
  inspected: boolean;
  interrupted: boolean;
  neighboring: boolean;
  onExpand: (fragmentId: string) => void;
  onHoldEnd: (fragmentId: string) => void;
  onHoldStart: (fragmentId: string) => void;
  onInspect: (fragmentId: string, active: boolean) => void;
  progress: number;
  recoveredIndex: number;
  responding: boolean;
  responseText?: string;
  stabilized: boolean;
  stuttering: boolean;
  style: MemoryCardStyle;
};

export function MemoryCard({
  activeCardId,
  blocked,
  blockedFlash,
  crossReference,
  degradationStage,
  disabled,
  expanded,
  fieldSettled,
  fragment,
  held,
  inspected,
  interrupted,
  neighboring,
  onExpand,
  onHoldEnd,
  onHoldStart,
  onInspect,
  progress,
  recoveredIndex,
  responding,
  responseText,
  stabilized,
  stuttering,
  style,
}: MemoryCardProps) {
  const segments = useMemo(() => resolveSegments(fragment), [fragment]);
  const shownAsRecovered = stabilized || fieldSettled;
  const recoveryLabel =
    recoveredIndex < 0
      ? null
      : `recovery index: ${String(recoveredIndex + 1).padStart(2, "0")}${
          recoveredIndex === 0
            ? " — first signal locked"
            : recoveredIndex === 4
              ? " — last signal locked"
              : ""
        }`;

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (stabilized || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onHoldStart(fragment.id);
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    onHoldEnd(fragment.id);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (stabilized || event.repeat || (event.key !== " " && event.key !== "Enter")) {
      return;
    }

    event.preventDefault();
    onHoldStart(fragment.id);
  }

  function handleKeyUp(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (stabilized || (event.key !== " " && event.key !== "Enter")) {
      return;
    }

    event.preventDefault();
    onHoldEnd(fragment.id);
  }

  return (
    <button
      type="button"
      aria-describedby={`${fragment.id}-card-status`}
      aria-expanded={stabilized ? expanded : undefined}
      aria-label={
        stabilized
          ? `Review ${fragment.title} cross-reference`
          : `Hold to lock ${fragment.title} signal`
      }
      aria-pressed={stabilized}
      className={`${styles.memoryCard} ${ui.memoryCardUi} ${held ? `${styles.memoryCardHeld} ${ui.memoryCardHeldUi}` : ""} ${
        inspected ? ui.memoryCardInspectedUi : ""
      } ${
        neighboring ? styles.memoryCardNeighbor : ""
      } ${neighboring ? ui.memoryCardNeighborUi : ""} ${
        responding ? ui.memoryCardRespondingUi : ""
      } ${
        shownAsRecovered ? `${styles.memoryCardStabilized} ${ui.memoryCardStabilizedUi}` : ""
      } ${
        blocked ? styles.memoryCardBlocked : ""
      } ${blockedFlash ? styles.memoryCardBlockedFlash : ""} ${
        stuttering ? styles.memoryCardStuttering : ""
      } ${interrupted ? styles.memoryCardInterrupted : ""
      } ${degradationStage === 1 ? styles.degradeStage1 : ""} ${
        degradationStage === 2 ? styles.degradeStage2 : ""
      } ${degradationStage === 3 ? styles.degradeStage3 : ""}`}
      data-active={activeCardId === fragment.id ? "true" : "false"}
      data-fragment={fragment.id}
      data-recovered={stabilized ? "true" : "false"}
      disabled={disabled}
      style={style}
      onBlur={() => {
        onInspect(fragment.id, false);
        onHoldEnd(fragment.id);
      }}
      onClick={() => {
        if (stabilized) {
          onExpand(fragment.id);
        }
      }}
      onFocus={() => onInspect(fragment.id, true)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => onInspect(fragment.id, true)}
      onPointerLeave={() => {
        if (!held) {
          onInspect(fragment.id, false);
        }
      }}
      onPointerUp={handlePointerEnd}
    >
      <span className={styles.cardEntry}>
        <span className={styles.cardMount}>
          <span className={styles.cardDrift}>
            <span className={`${styles.cardFlip} ${ui.cardFlipUi}`}>
              <span className={`${styles.cardFace} ${styles.cardFront} ${ui.cardFaceUi}`}>
                <span className={`${styles.fragmentSignature} ${ui.fragmentSignatureUi}`} aria-hidden="true" />
                <span className={styles.cardScanline} aria-hidden="true" />
                <span className={`${styles.cardHeader} ${styles.hostMetadata} ${ui.cardHeaderUi} ${ui.hostMetadataUi}`}>
                  <span>{`${blocked ? "ACCESS RESTRICTED" : "INCOMING"} // ${fragment.archivalCode}`}</span>
                  <span className={styles.cardHeaderStatus}>
                    {blocked
                      ? "HOST OVERRIDE"
                      : degradationStage >= 2
                        ? "[SIGNAL DEGRADING]"
                        : "SIGNAL: UNSTABLE"}
                  </span>
                </span>

                <h2 className={`${styles.cardTitle} ${ui.cardTitleUi}`}>{fragment.title}</h2>
                <p className={`${styles.cardSubtitle} ${styles.hostMetadata} ${ui.cardSubtitleUi} ${ui.hostMetadataUi}`}>
                  {fragment.classification}
                </p>
                <p className={`${styles.cardBody} ${ui.cardBodyUi}`}>
                  {segments.map((segment, segmentIndex) => {
                    if (!segment.corrupt) {
                      return <Fragment key={`${fragment.id}-${segmentIndex}`}>{segment.text}</Fragment>;
                    }

                    const threshold = resolveCorruptThreshold(
                      fragment.id,
                      segment.priority ?? "mid",
                    );
                    const resolved = shownAsRecovered || progress >= threshold;

                    return (
                      <span
                        key={`${fragment.id}-${segmentIndex}`}
                        className={styles.corruptSpan}
                        data-resolved={resolved ? "true" : "false"}
                      >
                        <span className={styles.corruptClean}>{segment.text}</span>
                        <span className={styles.corruptNoise}>
                          {toCorruptionMask(segment.text, `${fragment.id}-${segmentIndex}`)}
                        </span>
                      </span>
                    );
                  })}
                  {blocked ? <span className={styles.blockedBodyVeil} aria-hidden="true" /> : null}
                </p>

                <p className={`${styles.cardHint} ${ui.cardHintUi}`}>
                  {blocked ? "// HOLD — HOST RESISTANCE ACTIVE" : "// HOLD TO LOCK SIGNAL"}
                </p>
                <span className={styles.cardDashPulse} aria-hidden="true" />
                <span className={styles.cardProgressTrack} aria-hidden="true">
                  <span className={styles.cardProgressFill} />
                </span>
              </span>

              <span className={`${styles.cardFace} ${styles.cardBack} ${ui.cardFaceUi}`}>
                <span className={`${styles.fragmentSignature} ${ui.fragmentSignatureUi}`} aria-hidden="true" />
                <span className={`${styles.cardHeader} ${styles.hostMetadata} ${ui.cardHeaderUi} ${ui.hostMetadataUi}`}>
                  <span>LOGGED // {fragment.archivalCode}</span>
                  <span>SIGNAL: STABLE</span>
                </span>
                <h2 className={`${styles.cardTitle} ${ui.cardTitleUi}`}>{fragment.title}</h2>
                <p className={`${styles.cardSubtitle} ${styles.hostMetadata} ${ui.cardSubtitleUi} ${ui.hostMetadataUi}`}>
                  {fragment.classification}
                </p>
                <p className={`${styles.cardBody} ${ui.cardBodyUi}`}>{fragment.fullText}</p>
                <span className={styles.cardDivider} aria-hidden="true" />
                <p className={`${styles.cardSystemNote} ${styles.hostMetadata} ${ui.cardSystemNoteUi} ${ui.hostMetadataUi}`}>
                  origin hash: unresolved
                  {"\n"}prior access: [data present]
                  {"\n"}authentication: failed
                </p>
                {recoveryLabel ? (
                  <p className={`${styles.recoveryMetaLine} ${ui.recoveryMetaLineUi}`}>
                    {recoveryLabel}
                  </p>
                ) : null}
                {crossReference ? (
                  <span
                    className={`${styles.reexamineBlock} ${
                      expanded ? styles.reexamineBlockVisible : ""
                    }`}
                  >
                    <span className={styles.reexamineDivider} aria-hidden="true" />
                    <span className={styles.reexamineRefLine}>
                      cross-reference: {crossReference.ref}
                    </span>
                    <span className={styles.reexamineNoteLine}>
                      note: {crossReference.note}
                    </span>
                  </span>
                ) : null}
                <p className={`${styles.cardHint} ${ui.cardHintUi}`}>
                  {crossReference ? "// ACTIVATE TO REVIEW REFERENCE" : "// TRANSMISSION LOGGED"}
                </p>
              </span>
            </span>
          </span>
        </span>
      </span>

      <span id={`${fragment.id}-card-status`} className={styles.srOnly} aria-live="polite">
        {blockedFlash
          ? "Host resistance rejected recovery progress."
          : responseText ?? (stabilized ? `${fragment.title} recovered.` : "")}
      </span>
    </button>
  );
}
