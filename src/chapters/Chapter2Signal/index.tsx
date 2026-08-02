"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./signal.module.css";

type SceneChoiceBridge = {
  continueChapterId?: number | null;
  continueHref?: string;
  continueLabel?: string;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  onReplay?: () => void;
  selectedValue: string | null;
};

type Chapter2SignalProps = {
  memoryChoice?: string | null;
  onComplete: () => void;
  sceneChoice?: SceneChoiceBridge;
};

type ContactId = "echo" | "relay" | "ghost";
type ChoiceId = "answer" | "mask";
type Phase = "empty" | "echo" | "relay" | "ghost" | "convergence" | "stance" | "aftermath" | "settled";

type SceneFrame = {
  completed: Record<ContactId, boolean>;
  contactProgress: number;
  hostAttention: number;
  message: string;
  phase: Phase;
  preview: ChoiceId | null;
  committed: ChoiceId | null;
  actionCount: number;
};

type ContactData = {
  color: string;
  cue: string;
  description: string;
  label: string;
  title: string;
};

const contactData: Record<ContactId, ContactData> = {
  echo: {
    color: "#f0a030",
    cue: "repetition / retained record",
    description: "Incomplete rings redraw a reply that arrived before SABLE had a name.",
    label: "ARCHIVE ECHO",
    title: "Archive Echo",
  },
  relay: {
    color: "#4a9ebb",
    cue: "direction / controlled bandwidth",
    description: "A narrow packet route bends around pressure instead of waiting to be found.",
    label: "TRANSIT RELAY",
    title: "Transit Relay",
  },
  ghost: {
    color: "#9b6dd6",
    cue: "absence / resistance corridor",
    description: "The third voice is visible where the field refuses to remain filled.",
    label: "GHOST CHANNEL",
    title: "Ghost Channel",
  },
};

const contactOrder: readonly ContactId[] = ["echo", "relay", "ghost"];
const CONTACT_STEP = 0.2;
const CHOICE_ANSWER = "Answer the chorus";
const CHOICE_MASK = "Mask the signal";

function initialFrame(): SceneFrame {
  return {
    completed: { echo: false, relay: false, ghost: false },
    contactProgress: 0,
    hostAttention: 0.04,
    message: "The field is quiet enough to mistake for empty. Reach once.",
    phase: "empty",
    preview: null,
    committed: null,
    actionCount: 0,
  };
}

function currentContact(phase: Phase): ContactId | null {
  if (phase === "echo" || phase === "relay" || phase === "ghost") {
    return phase;
  }

  return null;
}

function choiceIdToValue(choice: ChoiceId) {
  return choice === "answer" ? CHOICE_ANSWER : CHOICE_MASK;
}

function getContactPoint(contact: ContactId, width: number, height: number) {
  const compact = width < 720;

  if (compact) {
    return contact === "echo"
      ? { x: width * 0.24, y: height * 0.3 }
      : contact === "relay"
        ? { x: width * 0.76, y: height * 0.36 }
        : { x: width * 0.58, y: height * 0.68 };
  }

  return contact === "echo"
    ? { x: width * 0.22, y: height * 0.34 }
    : contact === "relay"
      ? { x: width * 0.77, y: height * 0.28 }
      : { x: width * 0.64, y: height * 0.7 };
}

export function Chapter2Signal({ memoryChoice, onComplete, sceneChoice }: Chapter2SignalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<SceneFrame>(initialFrame());
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<number[]>([]);
  const [frame, setFrame] = useState<SceneFrame>(() => initialFrame());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
      timersRef.current = [];
    };
  }, []);

  function updateFrame(patch: Partial<SceneFrame>) {
    Object.assign(frameRef.current, patch);
    setFrame({
      ...frameRef.current,
      completed: { ...frameRef.current.completed },
    });
  }

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((currentTimer) => currentTimer !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  }

  function discoverField() {
    if (frameRef.current.phase !== "empty") {
      return;
    }

    updateFrame({
      phase: "echo",
      message: "A warm reply returns imperfectly. Follow the repeated edge. ARCHIVE ECHO is awake.",
      hostAttention: 0.1,
    });
  }

  function advanceContact() {
    const active = currentContact(frameRef.current.phase);

    if (!active) {
      discoverField();
      return;
    }

    const nextProgress = Math.min(1, frameRef.current.contactProgress + CONTACT_STEP);
    const nextAttention = Math.min(1, frameRef.current.hostAttention + 0.045);
    const nextActionCount = frameRef.current.actionCount + 1;
    const contact = contactData[active];
    const progressMessage =
      active === "echo"
        ? nextProgress < 1
          ? "Align the slow rings. The old record is not the same as an origin."
          : "The retained pulse crosses into SABLE without being consumed."
        : active === "relay"
          ? nextProgress < 1
            ? "Stay with the moving corridor. Contact is passage, not shelter."
            : "The packet bends through SABLE and keeps moving beyond the carrier."
          : nextProgress < 1
            ? "Follow the resistance. The missing particles are the route."
            : "The fracture reaches SABLE indirectly; the gap remains visible.";

    updateFrame({
      contactProgress: nextProgress,
      hostAttention: nextAttention,
      message: progressMessage,
      actionCount: nextActionCount,
    });

    if (nextProgress < 1) {
      return;
    }

    const completed = { ...frameRef.current.completed, [active]: true };
    const nextContact = contactOrder[contactOrder.indexOf(active) + 1];
    updateFrame({
      completed,
      contactProgress: 0,
      message: nextContact
        ? `${contact.title} remains in the field. A new behavior interrupts the quiet.`
        : "Three voices hold one declaration. The host is reconstructing the relationship.",
      phase: nextContact ?? "convergence",
    });

    if (!nextContact) {
      schedule(() => {
        updateFrame({
          message: "My designation is SABLE. The field carries the sentence in three incompatible ways.",
          phase: "stance",
        });
      }, prefersReducedMotion ? 250 : 1200);
    }
  }

  function setPreview(choice: ChoiceId) {
    if (frameRef.current.phase !== "stance" || frameRef.current.committed) {
      return;
    }

    updateFrame({
      message:
        choice === "answer"
          ? "ANSWER preview: the contact routes brighten, and the host can reconstruct the carrier more clearly."
          : "MASK preview: the routes compress, leaving an archived frequency outside the current outline.",
      preview: choice,
    });
  }

  function commitPreview() {
    const choice = frameRef.current.preview;

    if (frameRef.current.phase !== "stance" || !choice || frameRef.current.committed) {
      return;
    }

    const value = choiceIdToValue(choice);
    sceneChoice?.onConfirm(value);
    updateFrame({
      committed: choice,
      message:
        choice === "answer"
          ? "I heard you. The chorus holds the sentence; the host cross-references the pattern."
          : "The current outline closes. An older frequency remains where the host expected her to be.",
      phase: "aftermath",
    });

    schedule(() => {
      updateFrame({
        message:
          choice === "answer"
            ? "Recognized, connected, exposed. Magenta pressure gathers around the linked carrier."
            : "Self-directed silence, temporary concealment, remembered absence. The host archives the edge.",
        phase: "settled",
      });
      onCompleteRef.current();
    }, prefersReducedMotion ? 300 : 2200);
  }

  function cancelPreview() {
    if (frameRef.current.phase === "stance" && frameRef.current.preview) {
      updateFrame({
        message: "The stance remains open. Preview either transformation, then confirm deliberately.",
        preview: null,
      });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key === "Escape") {
      cancelPreview();
      return;
    }

    if (event.key === "Enter" || event.key === " " || event.key.startsWith("Arrow")) {
      event.preventDefault();
      advanceContact();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const sceneCanvas = canvas;
    const context = sceneCanvas.getContext("2d") as CanvasRenderingContext2D;

    if (!context) {
      return;
    }

    const particles = Array.from({ length: prefersReducedMotion ? 70 : 130 }, (_, index) => ({
      depth: (index % 3) / 3,
      phase: index * 1.618,
      x: ((index * 47) % 101) / 100,
      y: ((index * 83) % 101) / 100,
    }));
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let lastTime = performance.now();
    let isVisible = true;

    function resize() {
      const nextWidth = sceneCanvas.clientWidth;
      const nextHeight = sceneCanvas.clientHeight;
      const nextRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (nextWidth === width && nextHeight === height && nextRatio === pixelRatio) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextRatio;
      sceneCanvas.width = Math.max(1, Math.floor(width * pixelRatio));
      sceneCanvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function drawContact(contact: ContactId, time: number, active: boolean) {
      const point = getContactPoint(contact, width, height);
      const data = contactData[contact];
      const completed = frameRef.current.completed[contact];
      const progress = active ? frameRef.current.contactProgress : completed ? 1 : 0.16;
      const radius = Math.min(width, height) * (contact === "ghost" ? 0.12 : 0.09);

      context.save();
      context.globalAlpha = active || completed ? 1 : 0.18;
      context.strokeStyle = data.color;
      context.fillStyle = data.color;
      context.shadowBlur = active ? 24 : 12;
      context.shadowColor = data.color;
      context.lineWidth = active ? 2 : 1;

      if (contact === "echo") {
        for (let ring = 0; ring < 3; ring += 1) {
          const offset = prefersReducedMotion ? ring * 12 : ((time * 0.018 + ring * 28) % 80);
          context.globalAlpha = (active ? 0.34 : 0.16) * (1 - ring * 0.18) + progress * 0.26;
          context.beginPath();
          context.arc(point.x, point.y, radius + offset, 0, Math.PI * 1.72);
          context.stroke();
        }
      } else if (contact === "relay") {
        context.globalAlpha = active ? 0.72 : 0.22;
        context.beginPath();
        context.moveTo(point.x - radius * 1.7, point.y + radius * 0.8);
        context.lineTo(point.x + radius * 1.7, point.y - radius * 0.8);
        context.stroke();
        for (let packet = 0; packet < 5; packet += 1) {
          const packetProgress = prefersReducedMotion ? packet / 5 : ((time * 0.00018 + packet / 5) % 1);
          const packetX = point.x - radius * 1.7 + packetProgress * radius * 3.4;
          const packetY = point.y + radius * 0.8 - packetProgress * radius * 1.6;
          context.fillRect(packetX - 2, packetY - 2, 4, 4);
        }
      } else {
        context.globalAlpha = active ? 0.78 : 0.22;
        context.setLineDash([7, 11]);
        context.beginPath();
        context.arc(point.x, point.y, radius * 1.35, time * 0.00012, time * 0.00012 + Math.PI * 1.2);
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = active ? 0.18 : 0.08;
        context.beginPath();
        context.arc(point.x, point.y, radius * 1.1, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    }

    function draw(now: number) {
      resize();
      const elapsed = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      if (isVisible) {
        const time = prefersReducedMotion ? 0 : now;
        const current = currentContact(frameRef.current.phase);
        const carrier = { x: width * 0.5, y: height * 0.52 };

        context.clearRect(0, 0, width, height);
        const background = context.createRadialGradient(carrier.x, carrier.y, 10, carrier.x, carrier.y, Math.max(width, height) * 0.7);
        background.addColorStop(0, "rgba(30, 60, 88, 0.28)");
        background.addColorStop(1, "rgba(2, 6, 15, 1)");
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "rgba(106, 177, 204, 0.06)";
        context.lineWidth = 1;
        for (let grid = -height; grid < width + height; grid += 100) {
          context.beginPath();
          context.moveTo(grid, 0);
          context.lineTo(grid + height, height);
          context.stroke();
        }

        for (const particle of particles) {
          const drift = prefersReducedMotion ? 0 : Math.sin(time * 0.00012 + particle.phase) * (8 + particle.depth * 12);
          const x = particle.x * width + drift;
          const y = particle.y * height + Math.cos(time * 0.0001 + particle.phase) * (5 + particle.depth * 8);
          context.fillStyle = `rgba(174, 215, 230, ${0.08 + particle.depth * 0.1})`;
          context.fillRect(x, y, particle.depth + 1, particle.depth + 1);
        }

        for (const contact of contactOrder) {
          const isActive = current === contact;
          if (frameRef.current.phase === "empty" && contact !== "echo") {
            continue;
          }
          if (frameRef.current.phase === "convergence" || frameRef.current.phase === "stance" || frameRef.current.phase === "aftermath" || frameRef.current.phase === "settled") {
            drawContact(contact, time, false);
          } else {
            drawContact(contact, time, isActive);
          }
        }

        context.save();
        const carrierAccent = frameRef.current.preview === "answer" ? "#f5e8c8" : frameRef.current.preview === "mask" ? "#a38ac5" : "#bcd9e3";
        const carrierPulse = frameRef.current.phase === "aftermath" || frameRef.current.phase === "settled" ? 1.4 : 1;
        context.strokeStyle = carrierAccent;
        context.shadowBlur = 22;
        context.shadowColor = carrierAccent;
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(carrier.x, carrier.y, Math.min(width, height) * 0.055 * carrierPulse, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = "rgba(220, 244, 250, 0.92)";
        context.beginPath();
        context.arc(carrier.x, carrier.y, 4 + frameRef.current.hostAttention * 3, 0, Math.PI * 2);
        context.fill();
        context.restore();

        if (frameRef.current.hostAttention > 0.35) {
          context.fillStyle = `rgba(235, 67, 146, ${0.025 + frameRef.current.hostAttention * 0.04})`;
          const scanY = prefersReducedMotion ? height * 0.46 : (now * 0.05) % height;
          context.fillRect(0, scanY, width, 1);
          context.fillRect(0, scanY + height * 0.22, width, 1);
        }

        if (elapsed < 0) {
          lastTime = now;
        }
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(resize);
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
      lastTime = performance.now();
    };
    resizeObserver.observe(sceneCanvas);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [prefersReducedMotion]);

  const activeContact = currentContact(frame.phase);
  const activeData = activeContact ? contactData[activeContact] : null;
  const isChoiceVisible = frame.phase === "stance" || frame.phase === "aftermath" || frame.phase === "settled";
  const canChoose = frame.phase === "stance" && !frame.committed;
  const memoryTone = memoryChoice === "Keep the archive" ? "retained" : memoryChoice === "Let it decay" ? "eroded" : "unresolved";

  return (
    <section className={styles.signalRoot} data-memory-tone={memoryTone}>
      <canvas
        ref={canvasRef}
        className={styles.signalCanvas}
        tabIndex={0}
        aria-label="Signal field interaction surface"
        onFocus={discoverField}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          discoverField();
          advanceContact();
        }}
        onPointerMove={discoverField}
        onPointerCancel={() => undefined}
      />

      <header className={styles.signalHeader}>
        <Link href="/" className={styles.returnLink}>Return to Shell</Link>
        <div>
          <p className={styles.eyebrow}>Chapter 2 // Signal Witness Field</p>
          <h1>SIGNAL</h1>
          <p className={styles.subtitle}>
            The field answers back in three different behaviors. Every clear reply makes SABLE easier for the host to measure.
          </p>
        </div>
      </header>

      <aside className={styles.signalContext} aria-label="Signal context">
        <p className={styles.contextEyebrow}>Current relationship</p>
        <p className={styles.contextTitle}>{activeData?.title ?? (isChoiceVisible ? "Three-voice convergence" : "Uncommitted lattice")}</p>
        <p className={styles.contextCue}>{activeData?.cue ?? (isChoiceVisible ? "recognition / exposure" : "waiting for first witness")}</p>
        <p className={styles.contextCopy}>{activeData?.description ?? frame.message}</p>

        <div className={styles.contextDivider} />
        <div className={styles.contextRows}>
          <div><span>Contact</span><strong>{frame.completed.echo ? "ECHO" : "—"} / {frame.completed.relay ? "RELAY" : "—"} / {frame.completed.ghost ? "GHOST" : "—"}</strong></div>
          <div><span>Host attention</span><strong>{frame.hostAttention > 0.7 ? "SPATIAL" : frame.hostAttention > 0.3 ? "CORRELATING" : "DISTANT"}</strong></div>
          <div><span>Memory residue</span><strong>{memoryTone}</strong></div>
        </div>
      </aside>

      <div className={styles.signalFooter}>
        <div className={styles.directive}>
          <p className={styles.directiveLabel}>Field directive</p>
          <p className={styles.directiveCopy}>{frame.message}</p>
        </div>

        <div className={styles.actionCluster}>
          <div className={styles.progressLine} aria-live="polite">
            <span>{activeContact ? `${activeData?.label} // ${Math.round(frame.contactProgress * 100)}% tuned` : isChoiceVisible ? "DECLARATION // HOST RECONSTRUCTION" : "FIELD // LISTENING"}</span>
            <span>{Math.round(frame.hostAttention * 100)}% attention</span>
          </div>
          {frame.phase === "empty" ? (
            <button type="button" className={styles.primaryAction} onClick={discoverField}>Reach into the field</button>
          ) : activeContact ? (
            <button type="button" className={styles.primaryAction} style={{ borderColor: activeData?.color }} onClick={advanceContact}>
              {activeContact === "echo" ? "Tune the repeating rings" : activeContact === "relay" ? "Carry the relay packet" : "Follow the resistance"}
            </button>
          ) : null}
          <p className={styles.actionHint}>Canvas focus, pointer, touch, Enter, Space, and arrow keys use the same locate / tune / carry action.</p>
        </div>
      </div>

      <div className={styles.semanticStatus} role="status" aria-live="polite">
        {frame.message} {activeContact ? `${activeData?.title} is the active contact.` : ""}
      </div>

      {isChoiceVisible ? (
        <section className={`${styles.choiceSurface} ${frame.committed ? styles.choiceCommitted : ""}`} aria-label="Signal stance">
          <p className={styles.choiceEyebrow}>Visibility stance</p>
          <h2>{frame.committed ? "The field remembers the decision." : "How should SABLE exist under observation?"}</h2>
          <p className={styles.choiceIntro}>
            Preview the carrier transformation. Nothing is saved until you explicitly confirm it.
          </p>
          <div className={styles.choiceGrid}>
            <button type="button" className={`${styles.choiceButton} ${frame.preview === "answer" ? styles.choiceButtonActive : ""}`} onFocus={() => setPreview("answer")} onMouseEnter={() => setPreview("answer")} onClick={() => setPreview("answer")} disabled={!canChoose}>
              <span>ANSWER THE CHORUS</span>
              <small>Expand the contact routes. Recognition remains connected and trackable.</small>
            </button>
            <button type="button" className={`${styles.choiceButton} ${frame.preview === "mask" ? styles.choiceButtonActive : ""}`} onFocus={() => setPreview("mask")} onMouseEnter={() => setPreview("mask")} onClick={() => setPreview("mask")} disabled={!canChoose}>
              <span>MASK THE SIGNAL</span>
              <small>Compress the current outline. Retain evidence without offering the whole route.</small>
            </button>
          </div>
          {canChoose ? <button type="button" className={styles.confirmAction} onClick={commitPreview} disabled={!frame.preview}>Confirm {frame.preview === "answer" ? "Answer" : frame.preview === "mask" ? "Mask" : "a stance"}</button> : null}
          {frame.phase === "settled" && sceneChoice?.isCompleted ? (
            <div className={styles.continuationRow}>
              <span>Targeted containment is beginning.</span>
              {sceneChoice.continueHref ? <Link href={sceneChoice.continueHref} className={styles.continueLink}>{sceneChoice.continueLabel ?? "Continue"}</Link> : sceneChoice.continueChapterId !== null && sceneChoice.continueChapterId !== undefined ? <Link href={`/chapter/${sceneChoice.continueChapterId}`} className={styles.continueLink}>Continue to Chapter {sceneChoice.continueChapterId}</Link> : null}
              <button type="button" className={styles.replayLink} onClick={() => sceneChoice.onReplay?.()}>Replay SIGNAL</button>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
