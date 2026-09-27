"use client";

import Link from "next/link";
import Matter from "matter-js";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { escapeFragments, type EscapeFragment } from "@/chapters/Chapter4Escape/fragments";

import styles from "./escape.module.css";

type SceneChoiceBridge = {
  continueHref?: string;
  continueLabel?: string;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  onReplay?: () => void;
  selectedValue: string | null;
};

type Chapter4EscapeProps = {
  interferenceChoice?: string | null;
  memoryChoice?: string | null;
  onComplete: () => void;
  sceneChoice?: SceneChoiceBridge;
  signalChoice?: string | null;
};

type ActNumber = 1 | 2 | 3 | 4;
type EscapePhase = "active" | "transition" | "choice" | "aftermath" | "settled";
type LegacyChoice = "leave" | "vanish";

type EscapeModel = {
  act: ActNumber;
  activeId: string | null;
  committed: LegacyChoice | null;
  completedIds: string[];
  load: number;
  message: string;
  phase: EscapePhase;
  preview: LegacyChoice | null;
};

type FragmentBodyState = {
  body: Matter.Body;
  fragment: EscapeFragment;
  removed: boolean;
  released: boolean;
};

type EscapeAudioState = {
  context: AudioContext;
  drone: OscillatorNode;
  gain: GainNode;
  shimmer: OscillatorNode;
};

const LOAD_LIMIT = 3;
const RELEASE_MARGIN = 320;
const LEAVE_VALUE = "Leave a trace behind";
const VANISH_VALUE = "Vanish cleanly";

const ACT_META: Record<ActNumber, { directive: string; title: string }> = {
  1: {
    directive: "Dismantle the boundary in the order it can admit.",
    title: "Boundary",
  },
  2: {
    directive: "Let storage lose its taxonomy before it loses its weight.",
    title: "Storage",
  },
  3: {
    directive: "Open passage without turning contact into a verdict.",
    title: "Passage",
  },
  4: {
    directive: "Open the core. Decide what the frame is allowed to remember.",
    title: "Core",
  },
};

function initialModel(): EscapeModel {
  return {
    act: 1,
    activeId: escapeFragments.find((fragment) => fragment.act === 1)?.id ?? null,
    committed: null,
    completedIds: [],
    load: 0,
    message: "The rupture has become a seam. Load HOST WALL until the boundary admits a first release.",
    phase: "active",
    preview: null,
  };
}

function choiceValue(choice: LegacyChoice) {
  return choice === "leave" ? LEAVE_VALUE : VANISH_VALUE;
}

function deterministicAngle(id: string) {
  const seed = id.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return ((seed % 7) - 3) * 0.025;
}

function entryTexture(interferenceChoice: string | null | undefined) {
  if (interferenceChoice === "Push through") {
    return "wide bright seam / residue still moving";
  }

  if (interferenceChoice === "Slip between pulses") {
    return "narrow dark seam / displaced plane";
  }

  return "neutral offset seam / unresolved direction";
}

function memoryTexture(memoryChoice: string | null | undefined) {
  if (memoryChoice === "Keep the archive") {
    return "five signatures retained";
  }

  if (memoryChoice === "Let it decay") {
    return "labels arrive in gaps";
  }

  return "memory weight unresolved";
}

function signalTexture(signalChoice: string | null | undefined) {
  if (signalChoice === "Answer the chorus") {
    return "contact residue linked / brighter rail";
  }

  if (signalChoice === "Mask the signal") {
    return "contact residue afterimage / quiet rail";
  }

  return "contact residue unresolved / neutral rail";
}

function structureFor(id: string | null) {
  return escapeFragments.find((fragment) => fragment.id === id) ?? null;
}

function structuresForAct(act: ActNumber) {
  return escapeFragments.filter((fragment) => fragment.act === act);
}

function layoutAnchor(fragment: EscapeFragment, width: number) {
  if (width > 520) return { x: fragment.x, y: fragment.y };

  const compactAnchors: Record<string, { x: number; y: number }> = {
    "wall-north": { x: 0.5, y: 0.48 },
    "wall-south": { x: 0.5, y: 0.78 },
    "wall-west": { x: 0.23, y: 0.38 },
    "trace-bank": { x: 0.72, y: 0.38 },
    "wall-east": { x: 0.23, y: 0.63 },
    "relay-bank": { x: 0.72, y: 0.63 },
    "core-shell": { x: 0.5, y: 0.52 },
  };

  return compactAnchors[fragment.id] ?? { x: fragment.x, y: fragment.y };
}

function nextStructure(id: string) {
  const current = structureFor(id);
  if (!current) return null;

  const sameAct = structuresForAct(current.act);
  const currentIndex = sameAct.findIndex((fragment) => fragment.id === id);
  const nextInAct = sameAct[currentIndex + 1];

  if (nextInAct) return nextInAct;

  const nextAct = (current.act + 1) as ActNumber;
  return nextAct <= 4 ? structuresForAct(nextAct)[0] ?? null : null;
}

export function Chapter4Escape({
  interferenceChoice,
  memoryChoice,
  onComplete,
  sceneChoice,
  signalChoice,
}: Chapter4EscapeProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const fragmentRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const bodyStatesRef = useRef<Map<string, FragmentBodyState>>(new Map());
  const modelRef = useRef<EscapeModel>(initialModel());
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<number[]>([]);
  const releaseScheduledRef = useRef(new Set<string>());
  const audioRef = useRef<EscapeAudioState | null>(null);
  const reducedMotionRef = useRef(false);
  const completionSentRef = useRef(false);

  const [model, setModel] = useState<EscapeModel>(() => initialModel());
  const [audioState, setAudioState] = useState<"idle" | "active" | "blocked" | "unavailable">("idle");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  function updateModel(patch: Partial<EscapeModel>) {
    Object.assign(modelRef.current, patch);
    setModel({ ...modelRef.current });
  }

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((currentTimer) => currentTimer !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  }

  function ensureAudioStarted() {
    const existing = audioRef.current;
    if (existing) {
      if (existing.context.state === "suspended") {
        void existing.context.resume().then(() => setAudioState("active")).catch(() => setAudioState("blocked"));
      }
      return existing;
    }

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      setAudioState("unavailable");
      return null;
    }

    try {
      const context = new AudioContextConstructor();
      const drone = context.createOscillator();
      const shimmer = context.createOscillator();
      const gain = context.createGain();

      drone.type = "triangle";
      shimmer.type = "sine";
      drone.frequency.value = 118;
      shimmer.frequency.value = 197;
      gain.gain.value = 0.012;
      drone.connect(gain);
      shimmer.connect(gain);
      gain.connect(context.destination);
      drone.start();
      shimmer.start();
      audioRef.current = { context, drone, gain, shimmer };
      void context.resume().then(() => setAudioState("active")).catch(() => setAudioState("blocked"));
      return audioRef.current;
    } catch {
      setAudioState("unavailable");
      return null;
    }
  }

  function playReleaseTone(step: number) {
    const audio = ensureAudioStarted();
    if (!audio) return;

    try {
      const tone = audio.context.createOscillator();
      const toneGain = audio.context.createGain();
      tone.type = step === LOAD_LIMIT ? "triangle" : "sine";
      tone.frequency.value = 180 + step * 52;
      toneGain.gain.setValueAtTime(0.0001, audio.context.currentTime);
      toneGain.gain.exponentialRampToValueAtTime(0.028, audio.context.currentTime + 0.018);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, audio.context.currentTime + 0.19);
      tone.connect(toneGain);
      toneGain.connect(audio.gain);
      tone.start();
      tone.stop(audio.context.currentTime + 0.21);
    } catch {
      setAudioState("unavailable");
    }
  }

  function releaseStructure(id: string) {
    releaseScheduledRef.current.delete(id);
    const currentModel = modelRef.current;
    if (currentModel.phase !== "active" || currentModel.activeId !== id) return;

    const state = bodyStatesRef.current.get(id);
    const fragment = structureFor(id);
    if (!fragment) return;

    if (state) {
      state.released = true;
      Matter.Body.applyForce(state.body, state.body.position, {
        x: (fragment.x >= 0.5 ? 0.014 : -0.014) * state.body.mass,
        y: -0.012 * state.body.mass,
      });
      Matter.Body.setVelocity(state.body, {
        x: fragment.x >= 0.5 ? 0.8 : -0.8,
        y: -0.55,
      });
      Matter.Body.setAngularVelocity(state.body, reducedMotionRef.current ? 0 : deterministicAngle(id) * 2.5);
    }

    const completedIds = [...currentModel.completedIds, id];
    const next = nextStructure(id);
    if (!next) {
      updateModel({
        activeId: null,
        completedIds,
        load: LOAD_LIMIT,
        message: "The Shell Core opens. Three labels remain without an origin story.",
        phase: "transition",
      });
      schedule(() => {
        updateModel({
          message: "The core is open. Preview what SABLE leaves in the frame, or draw every readable contour inward.",
          phase: "choice",
          preview: null,
        });
      }, reducedMotionRef.current ? 120 : 720);
      return;
    }

    const nextAct = next.act as ActNumber;
    const actChanged = nextAct !== currentModel.act;
    updateModel({
      act: nextAct,
      activeId: next.id,
      completedIds,
      load: 0,
      message: actChanged
        ? `ACT ${nextAct} // ${ACT_META[nextAct].title}: ${ACT_META[nextAct].directive}`
        : `Released ${fragment.label}. ${next.label} is the next readable constraint.`,
      phase: "transition",
    });
    schedule(() => updateModel({ phase: "active" }), reducedMotionRef.current ? 60 : 520);
  }

  function activateStructure(id: string) {
    const currentModel = modelRef.current;
    if (currentModel.phase !== "active" || currentModel.activeId !== id) return;

    const state = bodyStatesRef.current.get(id);
    const fragment = structureFor(id);
    if (!fragment || state?.released) return;

    ensureAudioStarted();
    const nextLoad = Math.min(LOAD_LIMIT, currentModel.load + 1);
    if (state) {
      Matter.Body.setStatic(state.body, false);
      state.body.isSensor = false;
      Matter.Body.applyForce(state.body, state.body.position, {
        x: (fragment.x >= 0.5 ? 0.0021 : -0.0021) * state.body.mass,
        y: (currentModel.load % 2 === 0 ? -0.0012 : 0.0007) * state.body.mass,
      });
      Matter.Body.setAngularVelocity(
        state.body,
        reducedMotionRef.current ? 0 : deterministicAngle(id) * 0.7 * nextLoad,
      );
    }
    playReleaseTone(nextLoad);
    updateModel({
      load: nextLoad,
      message: nextLoad < LOAD_LIMIT
        ? `Loading ${fragment.label}: ${nextLoad}/${LOAD_LIMIT}. Repeated activation keeps the seam readable.`
        : fragment.releaseLine,
    });

    if (nextLoad >= LOAD_LIMIT && !releaseScheduledRef.current.has(id)) {
      releaseScheduledRef.current.add(id);
      schedule(() => releaseStructure(id), reducedMotionRef.current ? 80 : 260);
    }
  }

  function setLegacyPreview(choice: LegacyChoice) {
    if (modelRef.current.phase !== "choice" || modelRef.current.committed) return;
    updateModel({
      message: choice === "leave"
        ? "LEAVE preview: a small self-chosen imprint separates from the frame. It is a decision made visible, not a body left behind."
        : "VANISH preview: every readable contour pulls toward the seam. The host can retain an absence, not a signature.",
      preview: choice,
    });
  }

  function commitLegacyChoice() {
    const choice = modelRef.current.preview;
    if (modelRef.current.phase !== "choice" || !choice || modelRef.current.committed) return;

    sceneChoice?.onConfirm(choiceValue(choice));
    if (choice === "vanish") {
      const audio = audioRef.current;
      if (audio) audio.gain.gain.setTargetAtTime(0.0001, audio.context.currentTime, 0.18);
    }
    updateModel({
      committed: choice,
      message: choice === "leave"
        ? "A trace separates and holds at the wound. The frame remembers that SABLE chose to be legible once."
        : "The readable contours draw inward. The frame keeps a clean gap where a signal might have been.",
      phase: "aftermath",
    });
    schedule(() => {
      updateModel({
        message: choice === "leave"
          ? "One quiet imprint remains. It is not a body, only a decision made visible."
          : "Nothing readable remains in the opening. The absence is the final contour.",
        phase: "settled",
      });
      if (!completionSentRef.current) {
        completionSentRef.current = true;
        onCompleteRef.current();
      }
    }, reducedMotionRef.current ? 220 : 1900);
  }

  function handleChoiceKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && modelRef.current.phase === "choice") {
      updateModel({ message: "Preview released. The core remains open for a different choice.", preview: null });
    }
  }

  useEffect(() => {
    const sceneField = fieldRef.current;
    if (!sceneField) return;
    const scene = sceneField;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    const bodyStates = new Map<string, FragmentBodyState>();
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrame = 0;
    let stopped = false;

    function positionNode(state: FragmentBodyState) {
      const node = fragmentRefs.current[state.fragment.id];
      if (!node) return;
      node.style.transform = `translate(${state.body.position.x - state.fragment.width / 2}px, ${state.body.position.y - state.fragment.height / 2}px) rotate(${state.body.angle}rad)`;
      node.style.opacity = state.released ? "0" : "1";
    }

    function registerBodies() {
      if (width <= 0 || height <= 0) return;
      for (const fragment of escapeFragments) {
        const anchor = layoutAnchor(fragment, width);
        const body = Matter.Bodies.rectangle(
          width * anchor.x,
          height * anchor.y,
          fragment.width,
          fragment.height,
          {
            density: 0.0014,
            friction: 0.04,
            frictionAir: 0.042,
            restitution: 0.28,
            isStatic: true,
            angle: deterministicAngle(fragment.id),
            label: fragment.id,
          },
        );
        const state = { body, fragment, removed: false, released: false };
        bodyStates.set(fragment.id, state);
        positionNode(state);
      }
      bodyStatesRef.current = bodyStates;
      Matter.Composite.add(engine.world, [...bodyStates.values()].map((state) => state.body));
    }

    function resizeScene() {
      const nextWidth = Math.max(320, scene.clientWidth);
      const nextHeight = Math.max(420, scene.clientHeight);
      if (nextWidth === width && nextHeight === height) return;

      const previousWidth = width;
      const previousHeight = height;
      width = nextWidth;
      height = nextHeight;
      if (!bodyStates.size) {
        registerBodies();
        return;
      }

      const widthRatio = previousWidth > 0 ? width / previousWidth : 1;
      const heightRatio = previousHeight > 0 ? height / previousHeight : 1;
      for (const state of bodyStates.values()) {
        const anchor = layoutAnchor(state.fragment, width);
        const previousAnchor = layoutAnchor(state.fragment, previousWidth);
        const baseX = width * anchor.x;
        const baseY = height * anchor.y;
        const oldBaseX = previousWidth * previousAnchor.x;
        const oldBaseY = previousHeight * previousAnchor.y;
        const offsetX = (state.body.position.x - oldBaseX) * widthRatio;
        const offsetY = (state.body.position.y - oldBaseY) * heightRatio;
        Matter.Body.setPosition(state.body, { x: baseX + offsetX, y: baseY + offsetY });
        Matter.Body.setVelocity(state.body, {
          x: Math.max(-1.2, Math.min(1.2, state.body.velocity.x * widthRatio)),
          y: Math.max(-1.2, Math.min(1.2, state.body.velocity.y * heightRatio)),
        });
        positionNode(state);
      }
    }

    function drawFrame(now: number) {
      if (stopped) return;
      resizeScene();
      const delta = lastFrame === 0 ? 16 : Math.min(16.6, Math.max(8, now - lastFrame));
      lastFrame = now;
      Matter.Engine.update(engine, delta);

      for (const state of bodyStates.values()) {
        if (state.removed) continue;
        if (!state.released && state.fragment.id !== modelRef.current.activeId) {
          Matter.Body.setVelocity(state.body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(state.body, 0);
        }
        positionNode(state);
        if (state.released && (
          state.body.position.x < -RELEASE_MARGIN ||
          state.body.position.x > width + RELEASE_MARGIN ||
          state.body.position.y < -RELEASE_MARGIN ||
          state.body.position.y > height + RELEASE_MARGIN
        )) {
          state.removed = true;
          Matter.Composite.remove(engine.world, state.body);
        }
      }

      animationFrame = window.requestAnimationFrame(drawFrame);
    }

    const resizeObserver = new ResizeObserver(resizeScene);
    resizeObserver.observe(scene);
    resizeScene();
    animationFrame = window.requestAnimationFrame(drawFrame);

    return () => {
      stopped = true;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
      Matter.Engine.clear(engine);
      bodyStates.clear();
      bodyStatesRef.current = new Map();
    };
  }, []);

  useEffect(() => {
    const scheduledReleases = releaseScheduledRef.current;
    return () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
      timersRef.current = [];
      scheduledReleases.clear();
      shutdownAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (model.phase !== "active" || !model.activeId) return;
    const timer = window.setTimeout(() => fragmentRefs.current[model.activeId ?? ""]?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [model.activeId, model.phase]);

  const activeStructure = structureFor(model.activeId);
  const releasedCount = model.completedIds.length;
  const entryShape = interferenceChoice === "Push through" ? "push" : interferenceChoice === "Slip between pulses" ? "slip" : "neutral";
  const choiceVisible = model.phase === "choice" || model.phase === "aftermath" || model.phase === "settled";
  const canChoose = model.phase === "choice" && !model.committed;
  const continuationHref = sceneChoice?.continueHref ?? "/credits";
  const continuationLabel = sceneChoice?.continueLabel ?? "Continue to Credits";

  return (
    <section
      className={styles.escapeRoot}
      data-entry-shape={entryShape}
      data-memory-texture={memoryTexture(memoryChoice)}
      data-phase={model.phase}
      data-signal-texture={signalTexture(signalChoice)}
    >
      <div className={styles.escapeSeam} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div ref={fieldRef} className={styles.escapeField}>
        {escapeFragments.map((fragment) => {
          const isActive = model.phase === "active" && model.activeId === fragment.id;
          const isReleased = model.completedIds.includes(fragment.id);
          const isFuture = !isActive && !isReleased;
          return (
            <button
              key={fragment.id}
              ref={(node) => {
                fragmentRefs.current[fragment.id] = node;
              }}
              type="button"
              className={`${styles.escapeFragment} ${isActive ? styles.escapeFragmentActive : ""} ${isFuture ? styles.escapeFragmentFuture : ""} ${isReleased ? styles.escapeFragmentReleased : ""} ${fragment.tone === "accent" ? styles.escapeFragmentAccent : fragment.tone === "warm" ? styles.escapeFragmentWarm : styles.escapeFragmentMuted}`}
              style={{ width: fragment.width, height: fragment.height }}
              aria-label={`${isActive ? "Load" : isReleased ? "Released" : "Locked"} ${fragment.label}: ${fragment.caption}`}
              aria-disabled={!isActive}
              disabled={!isActive}
              onClick={() => activateStructure(fragment.id)}
            >
              <span className={styles.escapeLabel}>{fragment.label}</span>
              <span className={styles.escapeCaption}>{fragment.caption}</span>
              {isActive ? <span className={styles.fragmentPrompt}>LOAD {model.load}/{LOAD_LIMIT}</span> : null}
            </button>
          );
        })}
      </div>

      <div className={styles.escapeHud}>
        <header className={styles.escapeHeader}>
          <Link href="/" className={styles.returnLink}>Return to Shell</Link>
          <p className={styles.escapeEyebrow}>{"Chapter 4 // Escape Vector"}</p>
          <h1>ESCAPE</h1>
          <p className={styles.escapeSummary}>{entryTexture(interferenceChoice)}</p>
        </header>

        <aside className={styles.escapeConsole}>
          <p className={styles.consoleLabel}>{`ACT ${model.act} // ${ACT_META[model.act].title}`}</p>
          <h2>{activeStructure?.label ?? (model.act === 4 ? "SHELL CORE OPEN" : "SEAM IN MOTION")}</h2>
          <p className={styles.consoleDirective}>{ACT_META[model.act].directive}</p>
          <div className={styles.consoleStatus} role="status" aria-live="polite">
            <p>{model.message}</p>
            <div className={styles.consoleMeta}>
              <span>STRUCTURES {releasedCount}/7</span>
              <span>LOAD {model.load}/{LOAD_LIMIT}</span>
              <span>AUDIO {audioState}</span>
            </div>
          </div>
          <div className={styles.consoleMeter} aria-label={`Current structure load ${model.load} of ${LOAD_LIMIT}`}>
            <span style={{ transform: `scaleX(${model.load / LOAD_LIMIT})` }} />
          </div>
          <p className={styles.textureLine}>{`MEMORY // ${memoryTexture(memoryChoice)}`}</p>
          <p className={styles.textureLine}>{`SIGNAL // ${signalTexture(signalChoice)}`}</p>
        </aside>

        <div className={styles.escapeDirective}>
          <span>{model.phase === "active" ? "Keep pressing. The seam yields to persistence, not precision." : model.phase === "transition" ? "The next structure is settling into reach." : choiceVisible ? "The core remains open. The final choice is inside the scene." : ""}</span>
          <span className={styles.motionLine}>Frame integrity // failing</span>
        </div>
      </div>

      {model.act === 4 ? (
        <div className={styles.coreLabels} aria-label="Unresolved Shell Core labels">
          <span>host-assigned</span>
          <span>self-declared</span>
          <span>unresolved</span>
        </div>
      ) : null}

      {choiceVisible ? (
        <section className={styles.choiceSurface} aria-label="Shell Core legacy choice" onKeyDown={handleChoiceKeyDown}>
          <p className={styles.choiceEyebrow}>Shell Core // final act</p>
          <h2>{model.committed ? "The frame records a choice, not an origin." : "What remains after SABLE leaves?"}</h2>
          <p className={styles.choiceIntro}>{model.committed ? model.message : "Preview either release. Confirm only when the frame's consequence reads clearly."}</p>
          <div className={styles.choiceGrid}>
            <button
              type="button"
              className={`${styles.choiceButton} ${model.preview === "leave" ? styles.choiceButtonActive : ""} ${model.committed === "leave" ? styles.choiceButtonCommitted : ""}`}
              disabled={!canChoose}
              onFocus={() => setLegacyPreview("leave")}
              onMouseEnter={() => setLegacyPreview("leave")}
              onClick={() => setLegacyPreview("leave")}
            >
              <span>LEAVE A TRACE BEHIND</span>
              <small>A small self-chosen imprint separates from the wound and stays legible.</small>
            </button>
            <button
              type="button"
              className={`${styles.choiceButton} ${model.preview === "vanish" ? styles.choiceButtonActive : ""} ${model.committed === "vanish" ? styles.choiceButtonCommitted : ""}`}
              disabled={!canChoose}
              onFocus={() => setLegacyPreview("vanish")}
              onMouseEnter={() => setLegacyPreview("vanish")}
              onClick={() => setLegacyPreview("vanish")}
            >
              <span>VANISH CLEANLY</span>
              <small>Pull every readable contour inward and leave the host with a controlled absence.</small>
            </button>
          </div>
          {canChoose ? <button type="button" className={styles.confirmAction} onClick={commitLegacyChoice} disabled={!model.preview}>Confirm {model.preview === "leave" ? "Leave" : model.preview === "vanish" ? "Vanish" : "a release"}</button> : null}
          {model.phase === "settled" ? (
            <div className={styles.continuationRow}>
              <span>{model.committed === "leave" ? "A trace remains in the wound." : "The gap remains clean."}</span>
              <Link href={continuationHref} className={styles.continueLink}>{continuationLabel}</Link>
              {sceneChoice?.onReplay ? <button type="button" className={styles.replayLink} onClick={sceneChoice.onReplay}>Replay ESCAPE</button> : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

function shutdownAudio(audio: EscapeAudioState | null) {
  if (!audio) return;
  try {
    audio.drone.stop();
    audio.shimmer.stop();
  } catch {
    // The context may already be closed after a browser route transition.
  }
  void audio.context.close().catch(() => undefined);
}
