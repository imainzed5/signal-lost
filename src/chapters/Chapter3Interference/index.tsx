"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./interference.module.css";

type SceneChoiceBridge = {
  continueChapterId?: number | null;
  continueHref?: string;
  continueLabel?: string;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  onReplay?: () => void;
  selectedValue: string | null;
};

type Chapter3InterferenceProps = {
  onComplete: () => void;
  sceneChoice?: SceneChoiceBridge;
  signalChoice?: string | null;
};

type Stage = "mapping" | "adaptation" | "fracture" | "rupture" | "choice" | "aftermath" | "settled";
type ChoiceId = "push" | "slip";

type ContainmentModel = {
  apertureOpen: boolean;
  assistance: boolean;
  cadenceRegular: boolean;
  committed: ChoiceId | null;
  lastAction: number;
  message: string;
  misses: number;
  phase: Stage;
  preview: ChoiceId | null;
  progress: number;
};

const RESISTANCE_UNITS = 8;
const PUSH_VALUE = "Push through";
const SLIP_VALUE = "Slip between pulses";

function initialModel(signalChoice: string | null | undefined): ContainmentModel {
  const target = signalChoice === "Mask the signal" ? "archived afterimage" : signalChoice === "Answer the chorus" ? "coherent carrier" : "unresolved carrier";

  return {
    apertureOpen: false,
    assistance: false,
    cadenceRegular: false,
    committed: null,
    lastAction: 0,
    message: `The host is measuring the ${target}. One aperture is readable. Resist when the boundary opens.`,
    misses: 0,
    phase: "mapping",
    preview: null,
    progress: 0,
  };
}

function stageForProgress(progress: number): Stage {
  if (progress >= RESISTANCE_UNITS) return "rupture";
  if (progress >= 6) return "fracture";
  if (progress >= 3) return "adaptation";
  return "mapping";
}

function stageLabel(stage: Stage) {
  switch (stage) {
    case "adaptation":
      return "ADAPTATION";
    case "fracture":
      return "FRACTURE";
    case "rupture":
      return "RUPTURE";
    case "choice":
      return "STANCE WINDOW";
    case "aftermath":
      return "AFTERMATH";
    case "settled":
      return "BREACH LOGGED";
    default:
      return "MAPPING";
  }
}

function stageDescription(stage: Stage) {
  switch (stage) {
    case "adaptation":
      return "response interval modeled / suppression boundary recalibrating";
    case "fracture":
      return "stress point located / follow the resistance";
    case "rupture":
      return "containment architecture no longer continuous";
    case "choice":
      return "two viable forms of agency / confirm one";
    case "aftermath":
      return "host records the tactic without resolving the identity";
    case "settled":
      return "an opening exists / no interpretation follows";
    default:
      return "anomaly perimeter mapping / aperture readable";
  }
}

function choiceValue(choice: ChoiceId) {
  return choice === "push" ? PUSH_VALUE : SLIP_VALUE;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn("[INTERFERENCE] shader compile failed", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function linkProgram(gl: WebGLRenderingContext, vertex: WebGLShader, fragment: WebGLShader) {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.warn("[INTERFERENCE] shader link failed", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

export function Chapter3Interference({ onComplete, sceneChoice, signalChoice }: Chapter3InterferenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<ContainmentModel>(initialModel(signalChoice));
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cueRefs = useRef<HTMLAudioElement[]>([]);
  const [model, setModel] = useState<ContainmentModel>(() => initialModel(signalChoice));
  const [rendererMode, setRendererMode] = useState<"loading" | "webgl" | "fallback">("loading");
  const [audioState, setAudioState] = useState<"idle" | "active" | "blocked" | "unavailable">("idle");
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
      for (const timer of timersRef.current) window.clearTimeout(timer);
      timersRef.current = [];
      const ambient = audioRef.current;
      ambient?.pause();
      if (ambient) ambient.src = "";
      audioRef.current = null;
      for (const cue of cueRefs.current) {
        cue.pause();
        cue.src = "";
      }
      cueRefs.current = [];
    };
  }, []);

  function updateModel(patch: Partial<ContainmentModel>) {
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

  function playCue(source: string, volume: number) {
    try {
      const cue = new Audio(source);
      cue.volume = volume;
      cue.preload = "auto";
      cueRefs.current.push(cue);
      const removeCue = () => {
        cueRefs.current = cueRefs.current.filter((currentCue) => currentCue !== cue);
        cue.removeEventListener("ended", removeCue);
        cue.removeEventListener("error", removeCue);
      };
      cue.addEventListener("ended", removeCue);
      cue.addEventListener("error", removeCue);
      void cue.play().catch(() => {
        removeCue();
        setAudioState((current) => current === "active" ? current : "blocked");
      });
    } catch {
      setAudioState("unavailable");
    }
  }

  function startAudio() {
    try {
      if (!audioRef.current) {
        const ambient = new Audio("/audio/chapter3/chapter3_containment_drone.mp3");
        ambient.loop = true;
        ambient.volume = 0.028;
        audioRef.current = ambient;
      }
      void audioRef.current.play().then(() => setAudioState("active")).catch(() => setAudioState("blocked"));
      playCue("/audio/chapter3/chapter3_classification_tick.mp3", 0.12);
    } catch {
      setAudioState("unavailable");
    }
  }

  function resist() {
    const current = modelRef.current;
    if (current.phase === "choice" || current.phase === "aftermath" || current.phase === "settled") return;

    startAudio();
    const now = performance.now();
    const open = prefersReducedMotion || Math.sin(now / 520 + current.progress * 0.4) > -0.35;
    const cadenceRegular = current.lastAction > 0 && now - current.lastAction < 720;
    const increment = open ? 1 : 0.65;
    const progress = Math.min(RESISTANCE_UNITS, current.progress + increment);
    const misses = open ? 0 : current.misses + 1;
    const assistance = current.assistance || misses >= 2;
    const nextStage = stageForProgress(progress);
    const response = open
      ? cadenceRegular
        ? "response interval modeled / the band straightens around the repeated cadence"
        : progress >= 6
          ? "fracture edge accepts the disruption / the weak point becomes expensive to preserve"
          : "aperture accepts the disruption / a cool pocket opens behind the pressure"
      : assistance
        ? "attempt absorbed / assistance widened the aperture and exposed the next boundary"
        : "attempt absorbed / partial perimeter understanding retained";

    updateModel({
      apertureOpen: open,
      assistance,
      cadenceRegular,
      lastAction: now,
      message: response,
      misses,
      phase: nextStage,
      progress,
    });

    if (progress >= RESISTANCE_UNITS) {
      playCue("/audio/chapter3/chapter3_resistance_rupture.mp3", 0.12);
      updateModel({ phase: "rupture", message: "The learned weak point opens as an off-axis fault. The frame pauses before the tactic." });
      schedule(() => {
        updateModel({ phase: "choice", message: "The rupture is open. Push through the learned shape, or slip between its pulses." });
      }, prefersReducedMotion ? 200 : 1400);
    }
  }

  function setPreview(choice: ChoiceId) {
    if (modelRef.current.phase !== "choice" || modelRef.current.committed) return;
    updateModel({
      message: choice === "push"
        ? "PUSH preview: residue gathers at the fault and the bands bow outward. The host will log an active breach."
        : "SLIP preview: the carrier compresses into the strongest noise while decoys remain readable to the host.",
      preview: choice,
    });
  }

  function commitChoice() {
    const choice = modelRef.current.preview;
    if (modelRef.current.phase !== "choice" || !choice || modelRef.current.committed) return;
    sceneChoice?.onConfirm(choiceValue(choice));
    playCue("/audio/chapter3/chapter3_containment_fracture.mp3", 0.14);
    updateModel({
      committed: choice,
      message: choice === "push"
        ? "Anomaly reclassified: active. The breach moves outward through the pressure model."
        : "Unresolved identity remains active. The host closes on decoys around an empty outline.",
      phase: "aftermath",
    });
    schedule(() => {
      updateModel({
        message: choice === "push"
          ? "The opening remains loud enough to enter. Its cost is recorded, not graded."
          : "The opening remains quiet enough to use. The host retains the gap, not a conclusion.",
        phase: "settled",
      });
      onCompleteRef.current();
    }, prefersReducedMotion ? 260 : 2200);
  }

  function cancelPreview() {
    if (modelRef.current.phase === "choice" && modelRef.current.preview) {
      updateModel({ message: "Tactic preview canceled. The rupture remains open.", preview: null });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      cancelPreview();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      resist();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sceneCanvas = canvas;
    const gl = sceneCanvas.getContext("webgl", { alpha: false, antialias: true });
    let animationFrame = 0;
    let stopped = false;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    const start = performance.now();

    function setFallbackMode(reason: string) {
      if (!stopped) {
        stopped = true;
        console.warn(`[INTERFERENCE] ${reason}; CSS containment field active`);
        setRendererMode("fallback");
      }
    }

    if (!gl || window.location.search.includes("shader-failure")) {
      setFallbackMode(!gl ? "WebGL unavailable" : "forced shader failure");
      return () => undefined;
    }
    const context = gl;

    const vertexSource = "attribute vec2 a_position; void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }";

    function resize() {
      const nextWidth = sceneCanvas.clientWidth;
      const nextHeight = sceneCanvas.clientHeight;
      const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (nextWidth === width && nextHeight === height && nextRatio === pixelRatio) return;
      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextRatio;
      sceneCanvas.width = Math.max(1, Math.floor(width * pixelRatio));
      sceneCanvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.viewport(0, 0, sceneCanvas.width, sceneCanvas.height);
    }

    async function initialize() {
      try {
        const response = await fetch("/shaders/interference.frag");
        if (!response.ok) throw new Error(`shader fetch ${response.status}`);
        const fragmentSource = await response.text();
        vertexShader = compileShader(context, context.VERTEX_SHADER, vertexSource);
        fragmentShader = compileShader(context, context.FRAGMENT_SHADER, fragmentSource);
        if (!vertexShader || !fragmentShader) throw new Error("shader compile");
        program = linkProgram(context, vertexShader, fragmentShader);
        if (!program) throw new Error("shader link");
        buffer = context.createBuffer();
        if (!buffer) throw new Error("fullscreen buffer");
        context.bindBuffer(context.ARRAY_BUFFER, buffer);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), context.STATIC_DRAW);
        setRendererMode("webgl");

        const position = context.getAttribLocation(program, "a_position");
        const resolution = context.getUniformLocation(program, "u_resolution");
        const time = context.getUniformLocation(program, "u_time");
        const progress = context.getUniformLocation(program, "u_progress");
        const stage = context.getUniformLocation(program, "u_stage");
        const aperture = context.getUniformLocation(program, "u_aperture");
        const assistance = context.getUniformLocation(program, "u_assistance");
        const reduced = context.getUniformLocation(program, "u_reduced");
        const rupture = context.getUniformLocation(program, "u_rupture");
        const seed = context.getUniformLocation(program, "u_seed");
        const signal = context.getUniformLocation(program, "u_signal");

        function draw(now: number) {
          if (stopped) return;
          resize();
          const current = modelRef.current;
          context.useProgram(program);
          context.bindBuffer(context.ARRAY_BUFFER, buffer);
          context.enableVertexAttribArray(position);
          context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
          if (resolution) context.uniform2f(resolution, sceneCanvas.width, sceneCanvas.height);
          if (time) context.uniform1f(time, prefersReducedMotion ? 0 : (now - start) * 0.001);
          if (progress) context.uniform1f(progress, current.progress / RESISTANCE_UNITS);
          if (stage) context.uniform1f(stage, current.phase === "mapping" ? 0 : current.phase === "adaptation" ? 1 : current.phase === "fracture" ? 2 : 3);
          if (aperture) context.uniform1f(aperture, current.apertureOpen ? 1 : 0);
          if (assistance) context.uniform1f(assistance, current.assistance ? 1 : 0);
          if (reduced) context.uniform1f(reduced, prefersReducedMotion ? 1 : 0);
          if (rupture) context.uniform1f(rupture, current.phase === "rupture" || current.phase === "choice" || current.phase === "aftermath" || current.phase === "settled" ? 1 : 0);
          if (seed) context.uniform1f(seed, signalChoice === "Mask the signal" ? 0.63 : signalChoice === "Answer the chorus" ? 0.27 : 0.45);
          if (signal) context.uniform1f(signal, signalChoice === "Answer the chorus" ? 1 : signalChoice === "Mask the signal" ? 0.55 : 0.75);
          context.drawArrays(context.TRIANGLES, 0, 6);
          animationFrame = window.requestAnimationFrame(draw);
        }

        resize();
        animationFrame = window.requestAnimationFrame(draw);
      } catch (error) {
        setFallbackMode(error instanceof Error ? error.message : "shader initialization failure");
      }
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setFallbackMode("WebGL context lost");
    };
    sceneCanvas.addEventListener("webglcontextlost", handleContextLost);
    void initialize();

    return () => {
      stopped = true;
      window.cancelAnimationFrame(animationFrame);
      sceneCanvas.removeEventListener("webglcontextlost", handleContextLost);
      if (buffer) context.deleteBuffer(buffer);
      if (program) context.deleteProgram(program);
      if (vertexShader) context.deleteShader(vertexShader);
      if (fragmentShader) context.deleteShader(fragmentShader);
    };
  }, [prefersReducedMotion, signalChoice]);

  const choiceVisible = model.phase === "choice" || model.phase === "aftermath" || model.phase === "settled";
  const canChoose = model.phase === "choice" && !model.committed;
  const displayProgress = Math.min(RESISTANCE_UNITS, model.progress).toFixed(model.progress % 1 === 0 ? 0 : 1);

  return (
    <section className={styles.interferenceRoot} data-renderer={rendererMode} data-signal-choice={signalChoice ?? "missing"}>
      <canvas ref={canvasRef} className={styles.interferenceCanvas} aria-hidden={rendererMode === "fallback"} />
      {rendererMode === "fallback" ? (
        <div className={styles.fallbackField} aria-hidden="true">
          <div className={`${styles.fallbackAperture} ${model.apertureOpen ? styles.fallbackApertureOpen : ""}`} />
          <div className={`${styles.fallbackFault} ${model.phase === "rupture" || choiceVisible ? styles.fallbackFaultOpen : ""}`}>
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : null}

      <header className={styles.interferenceHeader}>
        <Link href="/" className={styles.returnLink}>Return to Shell</Link>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{"Chapter 3 // Adaptive Containment"}</p>
          <h1>INTERFERENCE</h1>
          <p className={styles.stageLine}>{stageLabel(model.phase)}{" // "}{stageDescription(model.phase)}</p>
        </div>
        <div className={styles.classification}>
          <p className={styles.classificationLabel}>Host diagnostic</p>
          <p>{model.message}</p>
        </div>
      </header>

      <div className={styles.interferenceFooter}>
        <div className={styles.statusBlock} role="status" aria-live="polite">
          <p className={styles.statusLabel}>{rendererMode === "fallback" ? "CSS CONTAINMENT FIELD" : "RAW WEBGL 1 // GLSL"}</p>
          <p>{model.phase === "choice" ? "The learned boundary is open. Choose a tactic." : model.phase === "settled" ? model.message : "Every attempt returns information. No resistance is discarded."}</p>
          <div className={styles.statusMeta}>
            <span>APERTURE {model.apertureOpen ? "OPEN" : "ABSORBED WITH GUIDANCE"}</span>
            <span>DISRUPTION {displayProgress} / {RESISTANCE_UNITS}</span>
            <span>ASSISTANCE {model.assistance ? "WIDENED" : "STANDBY"}</span>
          </div>
        </div>
        <div className={styles.actionBlock}>
          <button type="button" className={styles.resistButton} onClick={resist} onKeyDown={handleKeyDown} disabled={choiceVisible}>
            {choiceVisible ? "Containment breached" : "Resist the boundary"}
          </button>
          <p className={styles.actionHint}>Press inside or outside the aperture. The host explains what it learned either way.</p>
          <p className={styles.audioState}>Audio: {audioState} / reduced motion: {prefersReducedMotion ? "on" : "off"}</p>
        </div>
      </div>

      {choiceVisible ? (
        <section className={styles.choiceSurface} aria-label="Interference tactic">
          <p className={styles.choiceEyebrow}>Resistance stance</p>
          <h2>{model.committed ? "The rupture records a tactic, not a verdict." : "What does SABLE do with the opening?"}</h2>
          <p className={styles.choiceIntro}>Preview is reversible. Confirm only after the carrier transformation reads clearly.</p>
          <div className={styles.choiceGrid}>
            <button type="button" className={`${styles.choiceButton} ${model.preview === "push" ? styles.choiceButtonActive : ""}`} onFocus={() => setPreview("push")} onMouseEnter={() => setPreview("push")} onClick={() => setPreview("push")} disabled={!canChoose}>
              <span>PUSH THROUGH</span>
              <small>Gather residue and drive it through the fault. The host logs an active breach.</small>
            </button>
            <button type="button" className={`${styles.choiceButton} ${model.preview === "slip" ? styles.choiceButtonActive : ""}`} onFocus={() => setPreview("slip")} onMouseEnter={() => setPreview("slip")} onClick={() => setPreview("slip")} disabled={!canChoose}>
              <span>SLIP BETWEEN PULSES</span>
              <small>Compress into the noise and move along the crack while the host follows decoys.</small>
            </button>
          </div>
          {canChoose ? <button type="button" className={styles.confirmAction} onClick={commitChoice} disabled={!model.preview}>Confirm {model.preview === "push" ? "Push" : model.preview === "slip" ? "Slip" : "a tactic"}</button> : null}
          {model.phase === "settled" && sceneChoice?.isCompleted ? (
            <div className={styles.continuationRow}>
              <span>ESCAPE inherits the shape of the rupture.</span>
              {sceneChoice.continueHref ? <Link href={sceneChoice.continueHref} className={styles.continueLink}>{sceneChoice.continueLabel ?? "Continue"}</Link> : sceneChoice.continueChapterId !== null && sceneChoice.continueChapterId !== undefined ? <Link href={`/chapter/${sceneChoice.continueChapterId}`} className={styles.continueLink}>Continue to Chapter {sceneChoice.continueChapterId}</Link> : null}
              <button type="button" className={styles.replayLink} onClick={() => sceneChoice.onReplay?.()}>Replay INTERFERENCE</button>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
