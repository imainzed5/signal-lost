"use client";

import { Fragment } from "react";

import { AFTERMATH_COPY, CHOICE_OPTIONS } from "./constants";
import type { AftermathKind, ChoiceUiPhase } from "./types";

import styles from "./memory.module.css";
import ui from "./memory-ui.module.css";

type MemoryChoiceProps = {
  aftermath: AftermathKind;
  continueHintVisible: boolean;
  handoffPulse: boolean;
  monologueLines: string[];
  onContinue: () => void;
  onReplay: () => void;
  onSelect: (value: "Keep the archive" | "Let it decay") => void;
  phase: ChoiceUiPhase;
  selectedValue: string | null;
};

export function MemoryChoice({
  aftermath,
  continueHintVisible,
  handoffPulse,
  monologueLines,
  onContinue,
  onReplay,
  onSelect,
  phase,
  selectedValue,
}: MemoryChoiceProps) {
  const copy = aftermath ? AFTERMATH_COPY[aftermath] : null;

  return (
    <div className={`${styles.choiceLayer} ${ui.choiceLayerUi}`}>
      <div className={`${styles.choiceContent} ${ui.choiceContentUi}`}>
        <p className={ui.choiceArchiveLabel}>{"RECOVERED ARCHIVE // AUTHORITY REVIEW"}</p>
        <div className={`${styles.choiceMonologue} ${ui.choiceMonologueUi}`}>
          {monologueLines.map((line, index) => (
            <p key={`choice-monologue-${index}`} className={`${styles.choiceMonologueLine} ${ui.choiceMonologueLineUi}`}>
              {line || "\u00a0"}
            </p>
          ))}
        </div>

        {phase === "idle" ? (
          <>
            <p className={`${styles.choicePrompt} ${ui.choicePromptUi}`}>SELECT ARCHIVE STANCE</p>
            <div className={`${styles.choiceRow} ${ui.choiceRowUi}`}>
              {CHOICE_OPTIONS.map((option, index) => (
                <Fragment key={option.value}>
                  <button
                    type="button"
                    aria-pressed={selectedValue === option.value}
                    data-choice-preview={index === 0 ? "keep" : "decay"}
                    data-prevent-continue="true"
                    className={`${styles.choiceOption} ${ui.choiceOptionUi}`}
                    onClick={() => onSelect(option.value)}
                  >
                    <span className={`${styles.choiceMeta} ${ui.choiceMetaUi}`}>
                      {index === 0 ? "LOGGED // ARC-09" : "LOGGED // ARC-10"}
                    </span>
                    <span className={`${styles.choiceHeading} ${ui.choiceHeadingUi}`}>{option.heading}</span>
                    <span className={`${styles.choiceDescription} ${ui.choiceDescriptionUi}`}>{option.description}</span>
                    <span className={ui.choicePreviewLabel}>
                      {index === 0
                        ? "PREVIEW // METADATA RETAINED"
                        : "PREVIEW // HOST CODES RELEASED"}
                    </span>
                  </button>
                  {index === 0 ? <span className={styles.choiceSeparator} aria-hidden="true" /> : null}
                </Fragment>
              ))}
            </div>
          </>
        ) : null}

        {phase === "aftermath" && copy ? (
          <div className={`${styles.aftermathPanel} ${ui.aftermathPanelUi}`} role="status" aria-live="polite">
            <p className={styles.aftermathHeading}>{copy.heading}</p>
            <p className={styles.aftermathDetail}>{copy.detail}</p>
          </div>
        ) : null}

        {handoffPulse ? (
          <div className={styles.signalHandoff} aria-hidden="true">
            <span />
          </div>
        ) : null}

        {phase === "confirmation" ? (
          <p className={styles.choiceConfirmation}>choice logged. memory stance recorded.</p>
        ) : null}

        {phase === "continue" ? (
          <button
            type="button"
            data-prevent-continue="true"
            className={styles.choiceContinueButton}
            onClick={onContinue}
          >
            <span className={styles.choiceContinueLine}>SIGNAL UNLOCKED —</span>
            {continueHintVisible ? (
              <span className={styles.choiceContinueHint}>tap or press enter to continue</span>
            ) : null}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        data-prevent-continue="true"
        className={`${styles.replayLink} ${ui.replayLinkUi}`}
        onClick={onReplay}
      >
        replay from boot
      </button>
    </div>
  );
}
