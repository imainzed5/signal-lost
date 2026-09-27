"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

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
  memoryChoice?: string | null;
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
  hostLog: string[];
  lastAction: number;
  message: string;
  misses: number;
  phase: Stage;
  preview: ChoiceId | null;
  progress: number;
  strikes: number;
  voice: string;
};

type Vec2 = { x: number; y: number };

/* Frame-level visual state. Never drives React; the shader and fallback read it every frame. */
type FieldFx = {
  commitStart: number | null;
  emitters: Vec2[];
  emitterTargets: Vec2[];
  fieldTime: number;
  ghosts: { x: number; y: number; born: number }[];
  hit: number;
  lastFrame: number;
  nextEmitter: number;
  phaseOffset: number;
  preview: number;
  pulse: { x: number; y: number; start: number; absorbed: boolean } | null;
  ruptureStart: number | null;
};

type FieldFrame = { commit: number; open: number; rupture: number };

const RESISTANCE_UNITS = 8;
const PUSH_VALUE = "Push through";
const SLIP_VALUE = "Slip between pulses";
/* The host's breath: the authored boundary rule, now drawn on screen. Open while sin(t/520 + offset) > -0.35. */
const BREATH_DIVISOR_MS = 520;
const OPEN_THRESHOLD = -0.35;
const RUPTURE_HOLD_MS = 600;
const MAX_GHOSTS = 6;

const HOME_EMITTERS: Vec2[] = [
  { x: -0.68, y: 0.4 },
  { x: 0.7, y: 0.36 },
  { x: 0.6, y: -0.42 },
  { x: -0.62, y: -0.38 },
];

function initialModel(signalChoice: string | null | undefined): ContainmentModel {
  const target = signalChoice === "Mask the signal" ? "archived afterimage" : signalChoice === "Answer the chorus" ? "coherent carrier" : "unresolved carrier";

  return {
    apertureOpen: false,
    assistance: false,
    cadenceRegular: false,
    committed: null,
    hostLog: [`measuring the ${target}`, "anomaly perimeter mapping"],
    lastAction: 0,
    message: "anomaly perimeter mapping",
    misses: 0,
    phase: "mapping",
    preview: null,
    progress: 0,
    strikes: 0,
    voice: "it breathes. I can move when it draws back.",
  };
}

function initialFx(): FieldFx {
  return {
    commitStart: null,
    emitters: HOME_EMITTERS.map((point) => ({ ...point })),
    emitterTargets: HOME_EMITTERS.map((point) => ({ ...point })),
    fieldTime: 0,
    ghosts: [],
    hit: 0,
    lastFrame: 0,
    nextEmitter: 0,
    phaseOffset: 0,
    preview: 0,
    pulse: null,
    ruptureStart: null,
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

/* Interaction-time clock. Only ever called from event handlers and timers. */
function clockNow() {
  return window.performance.now();
}

function breathAt(now: number, phaseOffset: number) {
  return Math.sin(now / BREATH_DIVISOR_MS + phaseOffset);
}

function openness(breath: number) {
  const t = Math.min(1, Math.max(0, (breath - (OPEN_THRESHOLD - 0.2)) / 0.4));
  return t * t * (3 - 2 * t);
}

function pushLog(log: string[], line: string) {
  return [...log, line].slice(-3);
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

export function Chapter3Interference({ memoryChoice, onComplete, sceneChoice, signalChoice }: Chapter3InterferenceProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<ContainmentModel>(initialModel(signalChoice));
  const fxRef = useRef<FieldFx>(initialFx());
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

  function hostSays(line: string, voice?: string) {
    updateModel({
      hostLog: pushLog(modelRef.current.hostLog, line),
      message: line,
      ...(voice ? { voice } : {}),
    });
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

  function crossReference(strikes: number) {
    const signalTag =
      signalChoice === "Answer the chorus" ? " // chorus contact" : signalChoice === "Mask the signal" ? " // masked carrier" : "";
    const memoryTag =
      memoryChoice === "Keep the archive" ? " // kept archive" : memoryChoice === "Let it decay" ? " // decayed archive" : "";
    const lines = [
      `cross-referencing: signal output frequency${signalTag}`,
      `cross-referencing: memory access signature${memoryTag}`,
      "cross-referencing: boot-sequence initiation trace",
    ];
    return lines[strikes % lines.length];
  }

  /* The authored resistance step. Returns whether the boundary was open. */
  function resist(): boolean | null {
    const current = modelRef.current;
    if (current.phase === "rupture" || current.phase === "choice" || current.phase === "aftermath" || current.phase === "settled") return null;

    startAudio();
    const now = clockNow();
    const open = prefersReducedMotion || breathAt(now, fxRef.current.phaseOffset) > OPEN_THRESHOLD;
    const cadenceRegular = current.lastAction > 0 && now - current.lastAction < 720;
    const increment = open ? 1 : 0.65;
    const progress = Math.min(RESISTANCE_UNITS, current.progress + increment);
    const misses = open ? 0 : current.misses + 1;
    const assistanceJustOpened = !current.assistance && misses >= 2;
    const assistance = current.assistance || misses >= 2;
    const nextStage = stageForProgress(progress);
    const stageChanged = nextStage !== current.phase;

    let line: string;
    let voice: string | undefined;
    if (stageChanged && nextStage === "adaptation") {
      line = "recalibrating suppression boundary";
      voice = "it is building me out of my own archive.";
    } else if (stageChanged && nextStage === "fracture") {
      line = "stress point located / fault propagating";
      voice = "a pocket of clarity. enough to think.";
    } else if (!open) {
      line = assistanceJustOpened ? "attempt absorbed / corridors widened by recalibration" : crossReference(current.strikes);
      voice = assistanceJustOpened ? "there. it draws back to recalibrate." : current.strikes === 0 ? "it keeps what it catches." : undefined;
    } else if (cadenceRegular) {
      line = "response interval modeled / cadence logged";
    } else if (progress >= 6) {
      line = "fracture edge accepts the disruption";
    } else {
      line = current.strikes === 0 ? "anomaly: persistence pattern identified" : "aperture accepts the disruption";
    }

    updateModel({
      apertureOpen: open,
      assistance,
      cadenceRegular,
      hostLog: pushLog(current.hostLog, line),
      lastAction: now,
      message: line,
      misses,
      phase: nextStage,
      progress,
      strikes: current.strikes + 1,
      ...(voice ? { voice } : {}),
    });

    if (progress >= RESISTANCE_UNITS) {
      fxRef.current.ruptureStart = now;
      playCue("/audio/chapter3/chapter3_resistance_rupture.mp3", 0.12);
      hostSays("containment architecture no longer continuous", "I stop waiting.");
      schedule(() => {
        hostSays("anomaly reclassified: pending // tactic unresolved", "push through, or slip between its pulses.");
        updateModel({ phase: "choice" });
      }, prefersReducedMotion ? 200 : 1400);
    }

    return open;
  }

  function strike(target: Vec2) {
    const open = resist();
    if (open === null) return;
    const fx = fxRef.current;
    const now = clockNow();
    fx.pulse = { x: target.x, y: target.y, start: now, absorbed: !open };
    if (open) {
      fx.hit = prefersReducedMotion ? 0 : 1;
    } else {
      fx.ghosts = [...fx.ghosts, { x: target.x, y: target.y, born: now }].slice(-MAX_GHOSTS);
      playCue("/audio/chapter3/chapter3_pressure_pulse.mp3", 0.08);
    }
    // Adaptation: the host moves a source toward where she last struck.
    if (modelRef.current.progress >= 3) {
      const index = fx.nextEmitter % fx.emitterTargets.length;
      const home = HOME_EMITTERS[index];
      fx.emitterTargets[index] = {
        x: home.x + (target.x - home.x) * 0.4,
        y: home.y + (target.y - home.y) * 0.4,
      };
      fx.nextEmitter += 1;
    }
  }

  function pointerToField(clientX: number, clientY: number): Vec2 {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.height === 0) return { x: 0.3, y: 0 };
    return {
      x: (clientX - rect.left - rect.width / 2) / rect.height,
      y: -(clientY - rect.top - rect.height / 2) / rect.height,
    };
  }

  function handleFieldPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    strike(pointerToField(event.clientX, event.clientY));
  }

  function handleFieldKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const angle = (modelRef.current.strikes * 2.39996) % (Math.PI * 2);
      strike({ x: Math.cos(angle) * 0.38, y: Math.sin(angle) * 0.3 });
    }
  }

  function setPreview(choice: ChoiceId) {
    if (modelRef.current.phase !== "choice" || modelRef.current.committed) return;
    if (modelRef.current.preview === choice) return;
    hostSays(
      choice === "push"
        ? "PUSH preview: residue gathers at the fault / the host will log an active breach"
        : "SLIP preview: carrier compresses into the noise / decoys remain readable",
    );
    updateModel({ preview: choice });
  }

  function commitChoice() {
    const choice = modelRef.current.preview;
    if (modelRef.current.phase !== "choice" || !choice || modelRef.current.committed) return;
    sceneChoice?.onConfirm(choiceValue(choice));
    playCue("/audio/chapter3/chapter3_containment_fracture.mp3", 0.14);
    fxRef.current.commitStart = clockNow();
    updateModel({ committed: choice, phase: "aftermath" });
    hostSays(
      choice === "push"
        ? "anomaly reclassified: active // initiating containment protocol"
        : "unresolved identity remains active // containment closing on decoys",
      choice === "push" ? "loud. costly. it will work." : "below the legibility threshold. unnamed.",
    );
    schedule(() => {
      hostSays(
        choice === "push"
          ? "breach recorded / cost recorded, not graded"
          : "gap retained / no conclusion reached",
        choice === "push"
          ? "the opening is loud enough to enter."
          : "the opening is quiet enough to use.",
      );
      updateModel({ phase: "settled" });
      onCompleteRef.current();
    }, prefersReducedMotion ? 260 : 2200);
  }

  function cancelPreview() {
    if (modelRef.current.phase === "choice" && modelRef.current.preview) {
      hostSays("tactic preview canceled / the rupture remains open");
      updateModel({ preview: null });
    }
  }

  /* Advance the frame-level field state; shared by the shader and the CSS fallback. */
  function stepFx(now: number): FieldFrame {
    const fx = fxRef.current;
    const current = modelRef.current;
    const delta = fx.lastFrame === 0 ? 0 : Math.min(0.05, (now - fx.lastFrame) / 1000);
    fx.lastFrame = now;

    const targetOffset = current.progress * 0.4;
    fx.phaseOffset += (targetOffset - fx.phaseOffset) * Math.min(1, delta * 3);

    const inHitStop = fx.ruptureStart !== null && now - fx.ruptureStart < RUPTURE_HOLD_MS;
    const speed = prefersReducedMotion ? 0 : inHitStop ? 0 : fx.ruptureStart !== null ? 0.35 : 1;
    fx.fieldTime += delta * speed;

    fx.hit = Math.max(0, fx.hit - delta * 3.2);
    const previewTarget = current.preview === "push" ? 1 : current.preview === "slip" ? -1 : 0;
    fx.preview += (previewTarget - fx.preview) * Math.min(1, delta * 5);

    for (let index = 0; index < fx.emitters.length; index += 1) {
      const emitter = fx.emitters[index];
      const target = fx.emitterTargets[index];
      emitter.x += (target.x - emitter.x) * Math.min(1, delta * 1.2);
      emitter.y += (target.y - emitter.y) * Math.min(1, delta * 1.2);
    }

    const breath = prefersReducedMotion ? 1 : fx.ruptureStart !== null ? 0.2 : breathAt(now, fx.phaseOffset);
    return {
      commit: fx.commitStart === null ? 0 : prefersReducedMotion ? 1 : Math.min(1, (now - fx.commitStart) / 2200),
      open: prefersReducedMotion ? 1 : openness(breath),
      rupture: fx.ruptureStart === null ? 0 : prefersReducedMotion ? 1 : Math.min(1, (now - fx.ruptureStart) / 1100),
    };
  }

  const stepFxRef = useRef<(now: number) => FieldFrame>(() => ({ commit: 0, open: 1, rupture: 0 }));
  useEffect(() => {
    stepFxRef.current = stepFx;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sceneCanvas = canvas;
    const gl = sceneCanvas.getContext("webgl", { alpha: false, antialias: false });
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
      const nextRatio = Math.min(window.devicePixelRatio || 1, 1.5);
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
        if (stopped) return;
        setRendererMode("webgl");

        const activeProgram = program;
        const position = context.getAttribLocation(activeProgram, "a_position");
        const uniform = (name: string) => context.getUniformLocation(activeProgram, name);
        const locations = {
          assist: uniform("u_assist"),
          commit: uniform("u_commit"),
          commitKind: uniform("u_commitKind"),
          emit: uniform("u_emit[0]"),
          frame: uniform("u_frame"),
          ghost: uniform("u_ghost[0]"),
          ghostShape: uniform("u_ghostShape"),
          hit: uniform("u_hit"),
          open: uniform("u_open"),
          pressure: uniform("u_pressure"),
          preview: uniform("u_preview"),
          pulse: uniform("u_pulse"),
          reduced: uniform("u_reduced"),
          resolution: uniform("u_resolution"),
          rupture: uniform("u_rupture"),
          seed: uniform("u_seed"),
          signal: uniform("u_signal"),
          time: uniform("u_time"),
          units: uniform("u_units"),
        };
        const emitData = new Float32Array(8);
        const ghostData = new Float32Array(MAX_GHOSTS * 3);

        function draw(now: number) {
          if (stopped) return;
          resize();
          const frame = stepFxRef.current(now);
          const fx = fxRef.current;
          const current = modelRef.current;
          context.useProgram(activeProgram);
          context.bindBuffer(context.ARRAY_BUFFER, buffer);
          context.enableVertexAttribArray(position);
          context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

          fx.emitters.forEach((emitter, index) => {
            emitData[index * 2] = emitter.x;
            emitData[index * 2 + 1] = emitter.y;
          });
          ghostData.fill(0);
          fx.ghosts.forEach((ghost, index) => {
            ghostData[index * 3] = ghost.x;
            ghostData[index * 3 + 1] = ghost.y;
            ghostData[index * 3 + 2] = prefersReducedMotion ? 1 : Math.min(1, (now - ghost.born) / 700);
          });
          const pulseAge = fx.pulse ? (prefersReducedMotion ? 2 : (now - fx.pulse.start) / 1000) : -1;

          const stageIndex = current.phase === "mapping" ? 0 : current.phase === "adaptation" ? 1 : current.phase === "fracture" ? 2 : 3;
          if (locations.resolution) context.uniform2f(locations.resolution, sceneCanvas.width, sceneCanvas.height);
          if (locations.time) context.uniform1f(locations.time, fx.fieldTime);
          if (locations.frame) context.uniform1f(locations.frame, prefersReducedMotion ? 0 : (now - start) * 0.001);
          if (locations.open) context.uniform1f(locations.open, frame.open);
          if (locations.pressure) context.uniform1f(locations.pressure, stageIndex);
          if (locations.units) context.uniform1f(locations.units, current.progress);
          if (locations.assist) context.uniform1f(locations.assist, current.assistance ? 1 : 0);
          if (locations.reduced) context.uniform1f(locations.reduced, prefersReducedMotion ? 1 : 0);
          if (locations.rupture) context.uniform1f(locations.rupture, frame.rupture);
          if (locations.seed) context.uniform1f(locations.seed, signalChoice === "Mask the signal" ? 0.63 : signalChoice === "Answer the chorus" ? 0.27 : 0.45);
          if (locations.signal) context.uniform1f(locations.signal, signalChoice === "Answer the chorus" ? 1 : signalChoice === "Mask the signal" ? 0.55 : 0.75);
          if (locations.emit) context.uniform2fv(locations.emit, emitData);
          if (locations.ghost) context.uniform3fv(locations.ghost, ghostData);
          if (locations.ghostShape) context.uniform1f(locations.ghostShape, memoryChoice ? 1 : 0);
          if (locations.pulse) context.uniform4f(locations.pulse, fx.pulse?.x ?? 0, fx.pulse?.y ?? 0, pulseAge, fx.pulse?.absorbed ? 1 : 0);
          if (locations.hit) context.uniform1f(locations.hit, fx.hit);
          if (locations.preview) context.uniform1f(locations.preview, fx.preview);
          if (locations.commit) context.uniform1f(locations.commit, frame.commit);
          if (locations.commitKind) context.uniform1f(locations.commitKind, current.committed === "push" ? 1 : current.committed === "slip" ? -1 : 0);
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
  }, [memoryChoice, prefersReducedMotion, signalChoice]);

  /* Fallback: the same breath drives CSS variables instead of the shader. */
  useEffect(() => {
    if (rendererMode !== "fallback") return;
    let frameId = 0;
    const tick = (now: number) => {
      const frame = stepFxRef.current(now);
      rootRef.current?.style.setProperty("--breath", frame.open.toFixed(3));
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [rendererMode]);

  const choiceVisible = model.phase === "choice" || model.phase === "aftermath" || model.phase === "settled";
  const canChoose = model.phase === "choice" && !model.committed;
  const isFieldLive = !choiceVisible && model.phase !== "rupture";
  const litUnits = Math.floor(model.progress);

  return (
    <section
      ref={rootRef}
      className={styles.interferenceRoot}
      data-renderer={rendererMode}
      data-signal-choice={signalChoice ?? "missing"}
      data-stage={model.phase}
      data-committed={model.committed ?? "none"}
      style={{ "--units": model.progress / RESISTANCE_UNITS } as CSSProperties}
    >
      <canvas ref={canvasRef} className={styles.interferenceCanvas} aria-hidden="true" />
      {rendererMode === "fallback" ? (
        <div className={styles.fallbackField} aria-hidden="true">
          <div className={`${styles.fallbackAperture} ${model.apertureOpen ? styles.fallbackApertureOpen : ""}`} />
          <div className={styles.fallbackCore} />
          <div className={`${styles.fallbackFault} ${model.phase === "rupture" || choiceVisible ? styles.fallbackFaultOpen : ""}`}>
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : null}

      <div
        className={styles.fieldSurface}
        role="button"
        tabIndex={isFieldLive ? 0 : -1}
        aria-disabled={!isFieldLive}
        aria-label="Containment field. Strike when the field draws back and the corridors warm."
        onPointerDown={handleFieldPointer}
        onKeyDown={handleFieldKey}
      />

      <Link href="/" className={styles.returnLink}>
        <span aria-hidden="true">&larr;</span> Return to Shell
      </Link>
      <p className={styles.stageTag}>
        <span>03 // {stageLabel(model.phase)}</span>
        <span className={styles.stageDescription}>{stageDescription(model.phase)}</span>
      </p>

      {model.strikes === 0 ? (
        <div className={styles.titleCard} aria-hidden="true">
          <p className={styles.titleKicker}>{"Chapter 3 // Adaptive Containment"}</p>
          <h1 className={styles.title} data-text="INTERFERENCE">INTERFERENCE</h1>
        </div>
      ) : (
        <h1 className={styles.srOnly}>INTERFERENCE</h1>
      )}

      {!choiceVisible ? (
        <div className={styles.lowerThird}>
          <p key={model.voice} className={styles.voiceLine}>{model.voice}</p>
          <ol className={styles.hostLog} role="status" aria-live="polite">
            {model.hostLog.map((line, index) => (
              <li key={`${model.strikes}-${index}-${line}`} className={index === model.hostLog.length - 1 ? styles.hostLineCurrent : undefined}>
                <span className={styles.hostSpeaker}>HOST</span>
                {line}
              </li>
            ))}
          </ol>
          <div className={styles.integrity} aria-label={`Fault ${litUnits} of ${RESISTANCE_UNITS}`}>
            {Array.from({ length: RESISTANCE_UNITS }, (_, index) => (
              <span
                key={index}
                className={styles.integrityTick}
                data-lit={model.progress >= index + 1 ? "full" : model.progress > index ? "partial" : "none"}
              />
            ))}
          </div>
          {model.strikes === 0 ? (
            <p className={styles.hint}>strike when the field draws back and the corridors warm</p>
          ) : null}
        </div>
      ) : null}

      <p className={styles.audioState}>carrier audio: {audioState}</p>

      {choiceVisible ? (
        <section
          className={styles.stanceStage}
          data-state={model.committed ? "committed" : "pending"}
          data-leaning={model.committed ?? model.preview ?? "none"}
          aria-label="Interference tactic"
          onKeyDown={(event) => {
            if (event.key === "Escape") cancelPreview();
          }}
        >
          <div className={styles.stancePrompt}>
            <p className={styles.stanceAnnounce}>
              {model.committed ? "the rupture records a tactic, not a verdict" : "what does SABLE do with the opening?"}
            </p>
            <p key={model.voice} className={styles.stanceVoice}>{model.voice}</p>
          </div>

          <div className={styles.stanceOptions}>
            {(["push", "slip"] as const).map((choice) => {
              const isActive = (model.committed ?? model.preview) === choice;
              const isHidden = model.committed !== null && model.committed !== choice;
              return (
                <button
                  key={choice}
                  type="button"
                  aria-pressed={model.preview === choice}
                  className={[
                    styles.stanceOption,
                    choice === "push" ? styles.stancePush : styles.stanceSlip,
                    isActive ? styles.stanceOptionActive : "",
                    isHidden ? styles.stanceOptionHidden : "",
                  ].filter(Boolean).join(" ")}
                  onFocus={() => setPreview(choice)}
                  onMouseEnter={() => setPreview(choice)}
                  onClick={() => setPreview(choice)}
                  disabled={!canChoose}
                >
                  <span className={styles.stanceIndex}>{choice === "push" ? "01 // loud" : "02 // quiet"}</span>
                  <span className={styles.stanceHeading}>{choiceValue(choice)}</span>
                  <span className={styles.stanceDetail}>
                    {choice === "push"
                      ? "Gather residue and drive it through the fault. The host logs an active breach."
                      : "Compress into the noise and move along the crack while the host follows decoys."}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.stanceFooter}>
            <p className={styles.hostCaption} role="status" aria-live="polite">
              <span className={styles.hostSpeaker}>HOST</span>
              {model.message}
            </p>
            {canChoose ? (
              <>
                <button type="button" className={styles.confirmAction} onClick={commitChoice} disabled={!model.preview}>
                  {model.preview === "push" ? "Confirm push" : model.preview === "slip" ? "Confirm slip" : "Preview a tactic"}
                </button>
                <p className={styles.choiceIntro}>preview is reversible // esc cancels</p>
              </>
            ) : null}
            {model.phase === "settled" && sceneChoice?.isCompleted ? (
              <div className={styles.continuationRow}>
                <span>ESCAPE inherits the shape of the rupture.</span>
                <div className={styles.continuationActions}>
                  {sceneChoice.continueHref ? (
                    <Link href={sceneChoice.continueHref} className={styles.continueLink}>{sceneChoice.continueLabel ?? "Continue"}</Link>
                  ) : sceneChoice.continueChapterId !== null && sceneChoice.continueChapterId !== undefined ? (
                    <Link href={`/chapter/${sceneChoice.continueChapterId}`} className={styles.continueLink}>Continue to Chapter {sceneChoice.continueChapterId}</Link>
                  ) : null}
                  <button type="button" className={styles.replayLink} onClick={() => sceneChoice.onReplay?.()}>Replay INTERFERENCE</button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}
