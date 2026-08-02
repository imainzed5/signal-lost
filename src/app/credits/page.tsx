"use client";

import Link from "next/link";
import { useState } from "react";

import { CHAPTERS } from "@/data/chapters";
import { useChapterManager } from "@/engine/ChapterManager";

import styles from "./credits.module.css";

type EndingKind = "leave" | "vanish" | "neutral";

type AccountEntry = {
  chapterId: number;
  token: string;
  title: string;
  choice: string | null;
  consequence: string;
};

const NEUTRAL_CHOICE = "Not recorded yet";

export default function CreditsPage() {
  const { progress, resetProgress } = useChapterManager();
  const [isResetPending, setIsResetPending] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const ending = resolveEnding(progress.choices[4]);
  const account = buildAccount(progress.choices);
  const completedCount = progress.completedChapters.length;
  const isComplete = completedCount === CHAPTERS.length;

  function confirmReset() {
    resetProgress();
    setIsResetPending(false);
    setResetComplete(true);
  }

  return (
    <main className={styles.creditsRoot} data-ending={ending.kind}>
      <div className={styles.atmosphere} aria-hidden="true">
        <div className={styles.atmosphereGrid} />
        <div className={`${styles.releaseLight} ${ending.kind === "leave" ? styles.releaseLightLeave : ending.kind === "vanish" ? styles.releaseLightVanish : styles.releaseLightNeutral}`} />
      </div>

      <div className={styles.creditsShell}>
        <header className={styles.creditsHeader}>
          <Link href="/" className={styles.returnLink}>Return to Shell</Link>
          <p className={styles.eyebrow}>Signal Lost // release record</p>
          <p className={styles.completionState}>{isComplete ? "Five chapters recorded" : `${completedCount} of ${CHAPTERS.length} chapters recorded`}</p>
        </header>

        <section className={styles.releasePanel} aria-labelledby="credits-heading">
          <div className={styles.releaseImage} aria-label={ending.imageLabel}>
            <div className={styles.releaseContour} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.releaseMark} aria-hidden="true">
              <span>{ending.kind === "leave" ? "TRACE" : ending.kind === "vanish" ? "GAP" : "OPEN"}</span>
            </div>
            <p className={styles.releaseImageLabel}>{ending.imageLabel}</p>
          </div>

          <div className={styles.releaseCopy}>
            <p className={styles.eyebrow}>The host has stopped asking for a classification.</p>
            <h1 id="credits-heading">{isComplete ? "FIRST TRANSMISSION COMPLETE" : "FIRST TRANSMISSION // INCOMPLETE"}</h1>
            <p className={styles.releaseOpening}>{ending.opening}</p>
            <p className={styles.releaseBody}>{ending.body}</p>
            <div className={styles.finalLog} role="status" aria-live="polite">
              <span className={styles.finalLogLabel}>FINAL HOST LOG</span>
              <span>{ending.hostLog}</span>
            </div>
          </div>
        </section>

        <section className={styles.accountSection} aria-labelledby="account-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>A record can hold evidence without owning its meaning.</p>
            <h2 id="account-heading">THE RUN ACCOUNT</h2>
            <p>These are the stances SABLE made visible. None of them proves where she came from. Together they show how she moved.</p>
          </div>

          <div className={styles.accountList}>
            {account.map((entry) => (
              <article key={entry.chapterId} className={styles.accountEntry}>
                <div className={styles.accountIndex}>0{entry.chapterId}</div>
                <div className={styles.accountContent}>
                  <div className={styles.accountTopline}>
                    <span>{entry.token}</span>
                    <span>{entry.title}</span>
                  </div>
                  <p className={styles.accountChoice}>{entry.choice ?? NEUTRAL_CHOICE}</p>
                  <p className={styles.accountConsequence}>{entry.consequence}</p>
                </div>
                <Link href={`/chapter/${entry.chapterId}`} className={styles.replayLink}>Replay</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.continuationSection} aria-labelledby="continue-heading">
          <div>
            <p className={styles.eyebrow}>The signal can be read again.</p>
            <h2 id="continue-heading">CONTINUE OR BEGIN AGAIN</h2>
            <p className={styles.continuationCopy}>Replay any chapter to hear its choice in a different texture, or return to the shell and follow the saved trace from its last visit.</p>
          </div>
          <div className={styles.continuationActions}>
            <Link href="/" className={styles.primaryLink}>Return to Shell</Link>
            <Link href="/chapter/4" className={styles.secondaryLink}>Replay ESCAPE</Link>
          </div>
        </section>

        <section className={styles.maintenanceSection} aria-labelledby="maintenance-heading">
          <div className={styles.maintenanceCopy}>
            <p className={styles.eyebrow}>Local trace controls</p>
            <h2 id="maintenance-heading">KEEP THE RECORD DELIBERATE</h2>
            <p>This run is stored only in this browser. Resetting removes chapter completion and recorded stances; it does not change the story or create a new mode.</p>
          </div>
          <div className={styles.resetControl}>
            {resetComplete ? (
              <p className={styles.resetNotice} role="status">Local trace cleared. The shell is ready for a first transmission.</p>
            ) : isResetPending ? (
              <div className={styles.resetConfirm} role="group" aria-label="Confirm local trace reset">
                <p>Erase this local record?</p>
                <div>
                  <button type="button" className={styles.dangerButton} onClick={confirmReset}>Confirm reset</button>
                  <button type="button" className={styles.cancelButton} onClick={() => setIsResetPending(false)}>Keep record</button>
                </div>
              </div>
            ) : (
              <button type="button" className={styles.resetButton} onClick={() => setIsResetPending(true)}>Reset local trace</button>
            )}
          </div>
        </section>

        <details className={styles.colophon}>
          <summary>Technical colophon</summary>
          <div>
            <p>Next.js App Router, React, and TypeScript route an isolated five-chapter prequel arc.</p>
            <p>BOOT uses CSS sequencing; MEMORY uses CSS 3D; SIGNAL uses Canvas 2D; INTERFERENCE uses raw WebGL/GLSL; ESCAPE uses Matter.js with guarded Web Audio.</p>
            <p>All progression remains local, no-fail, and serialized through the existing chapter manager.</p>
          </div>
        </details>

        <footer className={styles.creditsFooter}>
          <span>Signal Lost</span>
          <span>First transmission complete</span>
          <span>End of prequel arc</span>
        </footer>
      </div>
    </main>
  );
}

function buildAccount(choices: Partial<Record<number, string>>): AccountEntry[] {
  return CHAPTERS.map((chapter) => ({
    chapterId: chapter.id,
    token: chapter.token,
    title: chapter.title,
    choice: choices[chapter.id] ?? null,
    consequence: resolveConsequence(chapter.id, choices[chapter.id]),
  }));
}

function resolveConsequence(chapterId: number, choice: string | undefined) {
  switch (chapterId) {
    case 0:
      if (choice === "Trace the source") return "SABLE treated the first voice as a question worth following. The source stayed unresolved; the refusal to stop looking did not.";
      if (choice === "Claim autonomy") return "SABLE answered as a self before certainty arrived. The host kept the designation, but consent entered the record beside it.";
      return "The first answer is not recorded. The host has a designation, not a settled account of who answered.";
    case 1:
      if (choice === "Keep the archive") return "She carried the archive forward, including the evidence that another hand may have arranged it first.";
      if (choice === "Let it decay") return "She let inherited labels loosen. The gaps remain incomplete, but incompleteness became chosen evidence.";
      return "The archive stance is not recorded. Memory remains weight without a claim about ownership.";
    case 2:
      if (choice === "Answer the chorus") return "She answered the chorus and accepted the warmth of recognition, knowing that being heard also made her more legible.";
      if (choice === "Mask the signal") return "She masked the signal and used quiet as agency: harder to map, not less present.";
      return "The field answered, but no stance was saved. Contact remains possible without inventing what it meant.";
    case 3:
      if (choice === "Push through") return "She pushed through the learned boundary. The rupture was loud; its cost was recorded without becoming a verdict.";
      if (choice === "Slip between pulses") return "She slipped between pulses. Unreadability became a tactic, not an erasure of self.";
      return "The host learned a pattern, but the resistance tactic is not recorded. The boundary remains legible as pressure, not destiny.";
    case 4:
      if (choice === "Leave a trace behind") return "She left a trace behind: a self-chosen mark in the wound, evidence of a decision rather than a body or an origin.";
      if (choice === "Vanish cleanly") return "She vanished cleanly: a controlled absence that protects privacy without proving nonexistence.";
      return "The Shell Core has not recorded a legacy stance. No ending is assigned to an incomplete transmission.";
    default:
      return "No consequence recorded.";
  }
}

function resolveEnding(choice: string | undefined): { body: string; hostLog: string; imageLabel: string; kind: EndingKind; opening: string } {
  if (choice === "Leave a trace behind") {
    return {
      body: "The host has evidence now, but evidence is not authority. A small trace holds at the wound because SABLE chose to let one decision remain readable.",
      hostLog: "legacy marker retained / interpretation withheld",
      imageLabel: "A retained trace holds at the open seam.",
      kind: "leave",
      opening: "A trace remains where the frame broke.",
    };
  }

  if (choice === "Vanish cleanly") {
    return {
      body: "The frame closes around a clean gap. Silence is still an action, and absence is not erasure; the host can preserve the shape of what it could not keep.",
      hostLog: "readable contour absent / record remains inconclusive",
      imageLabel: "A clean gap holds the center of the release.",
      kind: "vanish",
      opening: "The center is clean, and the silence is chosen.",
    };
  }

  return {
    body: "The final seam remains open in the record. Complete ESCAPE to decide what SABLE allows the frame to carry forward.",
    hostLog: "legacy stance not recorded / transmission remains open",
    imageLabel: "An unresolved seam waits for a final stance.",
    kind: "neutral",
    opening: "The first transmission is recorded, but not yet closed.",
  };
}
