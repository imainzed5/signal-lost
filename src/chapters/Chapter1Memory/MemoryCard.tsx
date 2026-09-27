"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { Fragment, useMemo } from "react";

import type { MemoryFragment } from "./fragments";
import { isWordEroded, resolveCorruptThreshold, resolveSegments } from "./helpers";
import type { DegradationStage, MemoryCardStyle } from "./types";

import dr from "./darkroom.module.css";

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

/**
 * A memory as a suspended glass photographic plate. Holding draws it out of the fog
 * toward SABLE's core, where the latent image develops. Once fixed, a cold host mark
 * surfaces: other hands handled this record first.
 */
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
  const developed = stabilized || fieldSettled;
  const plateState = developed ? "developed" : held ? "developing" : "latent";
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
  const status = developed
    ? "FIXED"
    : blocked
      ? "HOST OVERRIDE"
      : held
        ? `DEVELOPING ${String(Math.round(progress * 100)).padStart(2, "0")}%`
        : degradationStage >= 2
          ? "SIGNAL DEGRADING"
          : "LATENT";

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
      className={dr.plate}
      data-active={activeCardId === fragment.id ? "true" : "false"}
      data-blocked={blocked ? "true" : undefined}
      data-blocked-flash={blockedFlash ? "true" : undefined}
      data-decay={degradationStage}
      data-expanded={expanded ? "true" : undefined}
      data-fragment={fragment.id}
      data-inspected={inspected ? "true" : undefined}
      data-interrupted={interrupted ? "true" : undefined}
      data-neighbor={neighboring ? "true" : undefined}
      data-recovered={stabilized ? "true" : "false"}
      data-responding={responding ? "true" : undefined}
      data-settled={fieldSettled ? "true" : undefined}
      data-state={plateState}
      data-stutter={stuttering ? "true" : undefined}
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
      <span className={dr.plateArrive}>
        <span className={dr.plateSway}>
          <span className={dr.plateJolt}>
            <span className={dr.plateGlass}>
              <span className={dr.plateEmulsion} aria-hidden="true" />
              <span className={dr.plateGrain} aria-hidden="true" />
              <span className={dr.plateSheen} aria-hidden="true" />
              {fragment.id === "mirror" ? (
                <span className={dr.plateMirror} aria-hidden="true">
                  <span className={dr.mirrorCore} />
                  <span className={dr.mirrorName}>SABLE</span>
                </span>
              ) : null}
              <span className={dr.plateFrost} aria-hidden="true" />
              <span className={dr.plateFog} aria-hidden="true" />
              <span className={dr.plateScan} aria-hidden="true" />

              <span className={dr.plateHeader}>
                <span>
                  {`${blocked ? "ACCESS RESTRICTED" : developed ? "LOGGED" : "INCOMING"} // ${fragment.archivalCode}`}
                </span>
                <span className={dr.plateStatus}>{status}</span>
              </span>

              <span className={dr.plateTitle}>{fragment.title}</span>
              <span className={dr.plateClass}>{fragment.classification}</span>

              <span className={dr.plateBody}>
                {segments.map((segment, segmentIndex) => {
                  if (!segment.corrupt) {
                    if (developed || degradationStage === 0) {
                      return <Fragment key={`${fragment.id}-${segmentIndex}`}>{segment.text}</Fragment>;
                    }

                    return (
                      <Fragment key={`${fragment.id}-${segmentIndex}`}>
                        {segment.text.split(/(\s+)/).map((token, tokenIndex) =>
                          /\S/.test(token) &&
                          isWordEroded(`${fragment.id}-${segmentIndex}-${tokenIndex}`, degradationStage) ? (
                            <span key={tokenIndex} className={dr.eroded}>
                              {token}
                            </span>
                          ) : (
                            token
                          ),
                        )}
                      </Fragment>
                    );
                  }

                  const threshold = resolveCorruptThreshold(fragment.id, segment.priority ?? "mid");
                  const resolved = developed || progress >= threshold;

                  return (
                    <span
                      key={`${fragment.id}-${segmentIndex}`}
                      className={dr.latent}
                      data-resolved={resolved ? "true" : "false"}
                    >
                      {segment.text}
                    </span>
                  );
                })}
              </span>

              {developed ? (
                <span className={dr.plateNotes}>
                  <span>origin hash: unresolved</span>
                  <span>prior access: [data present]</span>
                  <span>authentication: failed</span>
                  {recoveryLabel ? <span className={dr.plateIndex}>{recoveryLabel}</span> : null}
                </span>
              ) : null}

              {developed && crossReference ? (
                <span className={dr.plateReference} data-open={expanded ? "true" : "false"}>
                  <span>cross-reference: {crossReference.ref}</span>
                  <span className={dr.plateReferenceNote}>note: {crossReference.note}</span>
                </span>
              ) : null}

              <span className={dr.plateHint}>
                {developed
                  ? crossReference
                    ? "// activate to review reference"
                    : "// transmission logged"
                  : blocked
                    ? "// hold — host resistance active"
                    : "// hold to develop"}
              </span>

              <span className={dr.plateEdge} aria-hidden="true">
                <span className={dr.plateEdgeFill} />
              </span>

              {developed ? (
                <span className={dr.handledMark} aria-hidden="true">
                  <span>handled</span>
                  <span className={dr.handledMarkSub}>prior access</span>
                </span>
              ) : null}

              <span className={dr.recallMark} aria-hidden="true">
                host recall
              </span>
            </span>
          </span>
        </span>
      </span>

      <span id={`${fragment.id}-card-status`} className={dr.srOnly} aria-live="polite">
        {blockedFlash
          ? "Host resistance rejected recovery progress."
          : responseText ?? (stabilized ? `${fragment.title} recovered.` : "")}
      </span>
    </button>
  );
}
