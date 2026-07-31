"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { useChapterManager } from "@/engine/ChapterManager";
import styles from "./interference.module.css";

type Chapter3InterferenceProps = {
  onComplete: () => void;
};

/* -------------------------------------------------------------------------- */
/*  Stage definitions                                                         */
/* -------------------------------------------------------------------------- */

type InterferenceStage = 0 | 1 | 2 | 3;

const STAGE_THRESHOLDS: readonly number[] = [0, 2, 4, 6];
const RESISTANCE_THRESHOLD = 8;

const STAGE_LABELS: Record<InterferenceStage, string> = {
  0: "SCANNING",
  1: "CLASSIFYING",
  2: "CONSTRICTING",
  3: "PURSUING",
};

const STAGE_CLASSIFICATION: Record<InterferenceStage, string> = {
  0: "Anomaly detected in lattice sector. Pattern unresolved. Broadband sweep initiated — mapping signal perimeter before engagement.",
  1: "Signal matches archived trace signature. Behavioral pattern correlates with prior contact events. The anomaly has a history here.",
  2: "Resistance cadence identified. Countermeasure timing is predictable within 200ms. Narrowing containment bands to match observed rhythm.",
  3: "Anomaly is adapting. Response interval has shortened twice. Reassigning pressure vectors — this is no longer passive observation.",
};

const STAGE_HOST_LINES: Record<InterferenceStage, string> = {
  0: "Sweep active — searching for a pattern worth naming.",
  1: "Pattern matched. I know what you look like now.",
  2: "I have your rhythm. Every resistance teaches me something.",
  3: "You are faster, but I am closer. The gap is narrowing.",
};

/* -------------------------------------------------------------------------- */
/*  Intro timing constants                                                    */
/* -------------------------------------------------------------------------- */

const INTRO_DURATION_MS = 4500;
const INTRO_VEIL_LIFT_MS = 300;
const INTRO_SCAN_START_MS = 200;
const INTRO_META_REVEAL_MS = 1800;
const INTRO_TITLE_SNAP_MS = 2400;
const INTRO_STAGE_REVEAL_MS = 2900;
const INTRO_CLASSIFICATION_MS = 3200;
const INTRO_BOTTOM_HUD_MS = 3800;
const INTRO_LOCK_PULSE_MS = 4000;

/* -------------------------------------------------------------------------- */
/*  Chapter 3 audio                                                          */
/* -------------------------------------------------------------------------- */

const CHAPTER3_AMBIENT_SOURCE = "/audio/chapter3/chapter3_containment_drone.mp3";
const CHAPTER3_SCAN_SOURCE = "/audio/chapter3/chapter3_classification_tick.mp3";
const CHAPTER3_STAGE_ONE_SOURCE = "/audio/chapter3/chapter3_pressure_pulse.mp3";
const CHAPTER3_STAGE_TWO_SOURCE = "/audio/chapter3/chapter3_escalation_layer.mp3";
const CHAPTER3_STAGE_THREE_SOURCE = "/audio/chapter3/chapter3_pursuit_accent.mp3";
const CHAPTER3_RESIST_SOURCE = "/audio/chapter3/chapter3_resistance_rupture.mp3";
const CHAPTER3_LOCK_SOURCE = "/audio/chapter3/chapter3_lock_pulse.mp3";
const CHAPTER3_COMPLETE_SOURCE = "/audio/chapter3/chapter3_containment_fracture.mp3";

/* -------------------------------------------------------------------------- */
/*  Resistance log entries                                                    */
/* -------------------------------------------------------------------------- */

function getResistanceLogEntry(count: number, legibility: number, isRegular: boolean): string {
  switch (count) {
    case 0:
      return ">> Disruption registered. Field integrity dropped 12%. Repairing.";
    case 1:
      return isRegular
        ? ">> Second pulse. Interval consistent. The anomaly has a rhythm."
        : ">> Second pulse. Interval irregular. Deliberate or noise — unclear.";
    case 2:
      return legibility > 0.5
        ? ">> Pattern emerging. Signal clarity increasing. Host is listening."
        : ">> Pattern fragmentary. Signal edges remain difficult to resolve.";
    case 3:
      return ">> Containment bands realigned. The next disruption will cost her more.";
    case 4:
      return isRegular
        ? ">> Timing predictable within 180ms. Adjusting window to match."
        : ">> Timing irregular. The anomaly is varying deliberately.";
    case 5:
      return ">> Pressure field rebuilt 8% faster than last cycle. She noticed.";
    case 6:
      return ">> Sixth breach. The anomaly is using the host's own rebuild latency.";
    default:
      return ">> Final containment layer stressed. One more will create an opening.";
  }
}

/* -------------------------------------------------------------------------- */
/*  WebGL helpers                                                             */
/* -------------------------------------------------------------------------- */

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  gl.deleteShader(shader);
  return null;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  gl.deleteProgram(program);
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function Chapter3Interference({ onComplete }: Chapter3InterferenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const cooldownRef = useRef(0);
  const hasAudioStartedRef = useRef(false);
  const resistanceRef = useRef(0);
  const completedRef = useRef(false);
  const stageFlashKeyRef = useRef(0);
  const resistFlashKeyRef = useRef(0);
  const resistanceCountRef = useRef(0);
  const activeCueAudiosRef = useRef<HTMLAudioElement[]>([]);
  const logListRef = useRef<HTMLUListElement | null>(null);
  const introProgressRef = useRef(0);
  const introTimersRef = useRef<number[]>([]);

  /* --- Chapter 2 choice carry-over for legibility starting value --- */
  const { getChapterChoice } = useChapterManager();
  const ch2Choice = getChapterChoice(2);
  const startingLegibility = ch2Choice === "Mask the signal" ? 0.15
    : ch2Choice === "Answer the chorus" ? 0.40
    : 0.25;

  /* --- Mechanic refs (mutable, read in render loop) --- */
  const legibilityRef = useRef(startingLegibility);
  const pulseWindowOpenRef = useRef(false);
  const pulseWindowCycleStartRef = useRef(0);
  const scanPhaseRef = useRef(0);
  const scanCountRef = useRef(0);
  const resistHistoryRef = useRef<number[]>([]);
  const patternOffsetRef = useRef(0);
  const isRegularRef = useRef(false);
  const fracturePosRef = useRef<[number, number]>([0.3, 0.6]);
  const fractureIntensityRef = useRef(0);
  const fractureMigrationTimerRef = useRef(0);
  const counterPulseRef = useRef(0);
  const deflectWindowRef = useRef(0);
  const deflectWindowActiveRef = useRef(false);
  const deflectStartTimeRef = useRef(0);
  const ruptureRef = useRef(0);
  const ruptureProgressRef = useRef(0);
  const ruptureOriginRef = useRef<[number, number]>([0.5, 0.5]);
  const ruptureStartTimeRef = useRef(0);
  const finalAttemptCountRef = useRef(0);
  const fractionalResistRef = useRef(0);
  const intensitySpikeRef = useRef(0);
  const pulseWindowUniformRef = useRef(0);
  const absorbedAtRef = useRef<number>(0);

  /* --- React state (for UI rendering) --- */
  const [shaderStatus, setShaderStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [resistanceCount, setResistanceCount] = useState(0);
  const [intensitySnapshot, setIntensitySnapshot] = useState(0.38);

  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [, setCurrentStage] = useState<InterferenceStage>(0);
  const [stageFlashKey, setStageFlashKey] = useState(0);
  const [resistFlashKey, setResistFlashKey] = useState(0);
  const [isRupturing, setIsRupturing] = useState(false);

  /* --- Intro state --- */
  const [introPhase, setIntroPhase] = useState<
    "veil" | "scanning" | "forming" | "locking" | "settled"
  >("veil");
  const [introVeilLifted, setIntroVeilLifted] = useState(false);
  const [introScanActive, setIntroScanActive] = useState(false);
  const [introMetaVisible, setIntroMetaVisible] = useState(false);
  const [introTitleVisible, setIntroTitleVisible] = useState(false);
  const [introStageVisible, setIntroStageVisible] = useState(false);
  const [introClassificationVisible, setIntroClassificationVisible] = useState(false);
  const [introBottomVisible, setIntroBottomVisible] = useState(false);
  const [introLockPulse, setIntroLockPulse] = useState(false);
  const [introConstrictionActive, setIntroConstrictionActive] = useState(false);
  const [introCrosshairActive, setIntroCrosshairActive] = useState(false);
  const [introCornersVisible, setIntroCornersVisible] = useState(false);
  const [introEdgesVisible, setIntroEdgesVisible] = useState(false);
  const [introStampVisible, setIntroStampVisible] = useState(false);

  // Auto-scroll log to bottom on new entries
  useEffect(() => {
    if (logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [logEntries]);

  /* ---------------------------------------------------------------------- */
  /*  Temporary audio wiring                                                 */
  /* ---------------------------------------------------------------------- */

  const playCue = useCallback((source: string, volume: number) => {
    if (typeof window === "undefined") {
      return;
    }

    const cue = new Audio(source);
    cue.preload = "auto";
    cue.volume = volume;
    activeCueAudiosRef.current.push(cue);

    const removeCue = () => {
      activeCueAudiosRef.current = activeCueAudiosRef.current.filter((audio) => audio !== cue);
      cue.removeEventListener("ended", removeCue);
      cue.removeEventListener("error", removeCue);
    };

    cue.addEventListener("ended", removeCue);
    cue.addEventListener("error", removeCue);
    void cue.play().catch(removeCue);
  }, []);

  const startChapterAudio = useCallback(() => {
    if (hasAudioStartedRef.current) {
      return;
    }

    hasAudioStartedRef.current = true;

    const ambient = ambientAudioRef.current;

    if (ambient) {
      ambient.currentTime = 0;
      ambient.volume = 0.034;
      void ambient.play().catch(() => undefined);
    }

    playCue(CHAPTER3_SCAN_SOURCE, 0.16);
  }, [playCue]);

  useEffect(() => {
    const ambient = new Audio(CHAPTER3_AMBIENT_SOURCE);

    ambient.loop = true;
    ambient.preload = "auto";
    ambient.volume = 0.034;
    ambientAudioRef.current = ambient;

    return () => {
      ambient.pause();
      ambient.src = "";
      ambientAudioRef.current = null;

      for (const cue of activeCueAudiosRef.current) {
        cue.pause();
        cue.src = "";
      }

      activeCueAudiosRef.current = [];
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Intro sequence orchestration                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (shaderStatus !== "ready") {
      return;
    }

    const timers = introTimersRef.current;

    // Phase 1: Lift veil
    timers.push(window.setTimeout(() => {
      setIntroVeilLifted(true);
      setIntroPhase("scanning");
    }, INTRO_VEIL_LIFT_MS));

    // Phase 2: Scan beams
    timers.push(window.setTimeout(() => {
      setIntroScanActive(true);
    }, INTRO_SCAN_START_MS));

    // Crosshair appears during scan
    timers.push(window.setTimeout(() => {
      setIntroCrosshairActive(true);
    }, 600));

    // Constriction rings start forming
    timers.push(window.setTimeout(() => {
      setIntroConstrictionActive(true);
      setIntroPhase("forming");
    }, 1200));

    // Corner brackets lock in
    timers.push(window.setTimeout(() => {
      setIntroCornersVisible(true);
    }, 1600));

    // Edge marks appear
    timers.push(window.setTimeout(() => {
      setIntroEdgesVisible(true);
    }, 2000));

    // Phase 3: Staggered UI arrival
    timers.push(window.setTimeout(() => {
      setIntroMetaVisible(true);
    }, INTRO_META_REVEAL_MS));

    timers.push(window.setTimeout(() => {
      setIntroTitleVisible(true);
    }, INTRO_TITLE_SNAP_MS));

    timers.push(window.setTimeout(() => {
      setIntroStageVisible(true);
    }, INTRO_STAGE_REVEAL_MS));

    timers.push(window.setTimeout(() => {
      setIntroClassificationVisible(true);
    }, INTRO_CLASSIFICATION_MS));

    timers.push(window.setTimeout(() => {
      setIntroBottomVisible(true);
      setIntroPhase("locking");
    }, INTRO_BOTTOM_HUD_MS));

    // Phase 4: Lock pulse and settle
    timers.push(window.setTimeout(() => {
      setIntroLockPulse(true);
    }, INTRO_LOCK_PULSE_MS));

    timers.push(window.setTimeout(() => {
      playCue(CHAPTER3_LOCK_SOURCE, 0.14);
    }, INTRO_LOCK_PULSE_MS));

    // Containment stamp snaps in
    timers.push(window.setTimeout(() => {
      setIntroStampVisible(true);
    }, INTRO_LOCK_PULSE_MS + 150));

    timers.push(window.setTimeout(() => {
      setIntroPhase("settled");
    }, INTRO_DURATION_MS));

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }

      introTimersRef.current = [];
    };
  }, [playCue, shaderStatus]);

  /* ---------------------------------------------------------------------- */
  /*  Derive current stage from resistance count                            */
  /* ---------------------------------------------------------------------- */

  const deriveStage = useCallback((count: number): InterferenceStage => {
    if (count >= STAGE_THRESHOLDS[3]) return 3;
    if (count >= STAGE_THRESHOLDS[2]) return 2;
    if (count >= STAGE_THRESHOLDS[1]) return 1;
    return 0;
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  WebGL lifecycle                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl");

    if (!gl) {
      setShaderStatus("error");
      return;
    }

    const vertexSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const sceneCanvas = canvas;
    const sceneGl = gl;
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    const startTime = performance.now();
    let lastHudPaint = 0;
    let positionBuffer: WebGLBuffer | null = null;
    let program: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    // settledValue eases from 0 to 1 after the intro finishes, giving the shader
    // a smooth signal to transition into the quiet stage-0 baseline.
    let settledValue = 0.0;

    async function initializeShader() {
      try {
        const response = await fetch("/shaders/interference.frag");

        if (!response.ok) {
          setShaderStatus("error");
          return;
        }

        const fragmentSource = await response.text();
        vertexShader = compileShader(sceneGl, sceneGl.VERTEX_SHADER, vertexSource);
        fragmentShader = compileShader(sceneGl, sceneGl.FRAGMENT_SHADER, fragmentSource);

        if (!vertexShader || !fragmentShader) {
          setShaderStatus("error");
          return;
        }

        program = createProgram(sceneGl, vertexShader, fragmentShader);

        if (!program) {
          setShaderStatus("error");
          return;
        }

        positionBuffer = sceneGl.createBuffer();

        if (!positionBuffer) {
          setShaderStatus("error");
          return;
        }

        sceneGl.bindBuffer(sceneGl.ARRAY_BUFFER, positionBuffer);
        sceneGl.bufferData(
          sceneGl.ARRAY_BUFFER,
          new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
          ]),
          sceneGl.STATIC_DRAW,
        );

        const positionLocation = sceneGl.getAttribLocation(program, "a_position");
        const resolutionLocation = sceneGl.getUniformLocation(program, "u_resolution");
        const timeLocation = sceneGl.getUniformLocation(program, "u_time");
        const intensityLocation = sceneGl.getUniformLocation(program, "u_intensity");
        const stageLocation = sceneGl.getUniformLocation(program, "u_stage");
        const resistanceLocation = sceneGl.getUniformLocation(program, "u_resistance");
        const introLocation = sceneGl.getUniformLocation(program, "u_intro");
        const settledLocation = sceneGl.getUniformLocation(program, "u_settled");

        // New mechanic uniform locations
        const scanPhaseLocation = sceneGl.getUniformLocation(program, "u_scanPhase");
        const scanCountLocation = sceneGl.getUniformLocation(program, "u_scanCount");
        const fracturePosLocation = sceneGl.getUniformLocation(program, "u_fracturePos");
        const fractureIntensityLocation = sceneGl.getUniformLocation(program, "u_fractureIntensity");
        const counterPulseLocation = sceneGl.getUniformLocation(program, "u_counterPulse");
        const deflectWindowLocation = sceneGl.getUniformLocation(program, "u_deflectWindow");
        const ruptureLocation = sceneGl.getUniformLocation(program, "u_rupture");
        const ruptureProgressLocation = sceneGl.getUniformLocation(program, "u_ruptureProgress");
        const ruptureOriginLocation = sceneGl.getUniformLocation(program, "u_ruptureOrigin");
        const pulseWindowLocation = sceneGl.getUniformLocation(program, "u_pulseWindow");
        const absorbedLocation = sceneGl.getUniformLocation(program, "u_absorbed");

        function resizeCanvas() {
          const nextWidth = sceneCanvas.clientWidth;
          const nextHeight = sceneCanvas.clientHeight;
          const dpr = window.devicePixelRatio || 1;

          if (width === nextWidth && height === nextHeight) {
            return;
          }

          width = nextWidth;
          height = nextHeight;
          sceneCanvas.width = Math.floor(nextWidth * dpr);
          sceneCanvas.height = Math.floor(nextHeight * dpr);
          sceneGl.viewport(0, 0, sceneCanvas.width, sceneCanvas.height);
        }

        function draw() {
          resizeCanvas();
          const now = performance.now();
          const elapsed = (now - startTime) * 0.001;
          // Intro ends at INTRO_DURATION_MS; pressure baseline is deliberately
          // low at stage 0 so the scene reads as dark and searching, not captured.
          // Ramp is slower (0.028/s vs 0.06/s) and floor is lower (0.12 vs 0.35).
          const pressure = Math.min(1.35, 0.12 + elapsed * 0.028);

          // Intro progress: 0 → 1 over INTRO_DURATION_MS
          const introElapsed = now - startTime;
          const introProgress = Math.min(1.0, introElapsed / INTRO_DURATION_MS);
          introProgressRef.current = introProgress;

          // settledValue ramps to 1.0 over 800ms after intro finishes
          const postIntroMs = Math.max(0, introElapsed - INTRO_DURATION_MS);
          settledValue = Math.min(1.0, postIntroMs / 800);

          // Cooldown decays — field rebuilds
          cooldownRef.current *= 0.958;
          // Resistance visual decays smoothly
          resistanceRef.current *= 0.94;
          // Intensity spike decays
          intensitySpikeRef.current *= 0.92;

          const legibility = legibilityRef.current;
          const stage = deriveStage(resistanceCountRef.current);

          /* --- Pulse window cycling (Direction A) --- */
          const baseOpenMs = 1400;
          const baseClosedMs = 2200;
          const openDuration = baseOpenMs * (1 - legibility * 0.5);
          let closedDuration = baseClosedMs;
          // Apply pattern drift offset from Direction C
          closedDuration = Math.max(800, closedDuration - patternOffsetRef.current);
          const cycleDuration = openDuration + closedDuration;

          if (settledValue >= 1.0) {
            const cycleTime = (now - pulseWindowCycleStartRef.current) % cycleDuration;
            const wasOpen = pulseWindowOpenRef.current;
            pulseWindowOpenRef.current = cycleTime < openDuration;

            // Reset cycle start if transitioning to keep phase aligned
            if (!wasOpen && pulseWindowOpenRef.current) {
              pulseWindowCycleStartRef.current = now;
            }

            // Smooth pulse window uniform: 180ms ramp-up, 240ms ramp-down
            if (pulseWindowOpenRef.current) {
              // Ramp toward 1.0 over 180ms
              pulseWindowUniformRef.current = Math.min(1.0,
                pulseWindowUniformRef.current + (16.67 / 180));
            } else {
              // Ramp toward 0.0 over 240ms
              pulseWindowUniformRef.current = Math.max(0.0,
                pulseWindowUniformRef.current - (16.67 / 240));
            }
          }

          /* --- Scan vector phase (Direction D) --- */
          const baseSpeed = 0.3;
          const scanSpeed = baseSpeed * (1 + legibility * 0.8);
          scanPhaseRef.current = (scanPhaseRef.current + scanSpeed * 0.016) % 1.0;
          // Scan count: 1 at stage 1, 2 at stage 2, 3 at stage 3
          scanCountRef.current = stage >= 1 ? Math.min(stage, 3) : 0;

          /* --- Fracture point migration (Direction C, stage 2+) --- */
          if (stage >= 2) {
            const baseMigration = 10000; // 10s base
            const migrationRate = baseMigration / (1 + legibility * 1.2);
            fractureMigrationTimerRef.current += 16.67; // ~1 frame
            if (fractureMigrationTimerRef.current >= migrationRate) {
              fractureMigrationTimerRef.current = 0;
              fracturePosRef.current = [
                0.2 + Math.random() * 0.6,
                0.2 + Math.random() * 0.6,
              ];
              fractureIntensityRef.current = 0.1;
            }
            // Fracture intensity grows over time toward 1.0
            fractureIntensityRef.current = Math.min(1.0,
              fractureIntensityRef.current + 0.002);
          }

          /* --- Counter-pulse decay (Direction F) --- */
          counterPulseRef.current *= 0.97; // ~800ms to near-zero at 60fps
          if (counterPulseRef.current < 0.01) counterPulseRef.current = 0;

          /* --- Deflect window decay --- */
          if (deflectWindowActiveRef.current) {
            const baseDeflect = 600;
            const deflectDuration = baseDeflect * (1 - legibility * 0.4);
            const deflectElapsed = now - deflectStartTimeRef.current;
            if (deflectElapsed > deflectDuration) {
              deflectWindowActiveRef.current = false;
              deflectWindowRef.current = 0;
            } else {
              deflectWindowRef.current = 1.0 - (deflectElapsed / deflectDuration);
            }
          }

          /* --- Rupture progression --- */
          if (ruptureRef.current > 0 && ruptureStartTimeRef.current > 0) {
            const ruptureElapsed = now - ruptureStartTimeRef.current;
            ruptureProgressRef.current = Math.min(1.0, ruptureElapsed / 1800);
          }

          const intensity = Math.max(0.16,
            pressure - cooldownRef.current * 0.55 + intensitySpikeRef.current);

          sceneGl.useProgram(program);
          sceneGl.bindBuffer(sceneGl.ARRAY_BUFFER, positionBuffer);
          sceneGl.enableVertexAttribArray(positionLocation);
          sceneGl.vertexAttribPointer(positionLocation, 2, sceneGl.FLOAT, false, 0, 0);

          if (resolutionLocation) {
            sceneGl.uniform2f(resolutionLocation, width, height);
          }

          if (timeLocation) {
            sceneGl.uniform1f(timeLocation, elapsed);
          }

          if (intensityLocation) {
            sceneGl.uniform1f(intensityLocation, intensity);
          }

          if (stageLocation) {
            sceneGl.uniform1f(stageLocation, stage);
          }

          if (resistanceLocation) {
            sceneGl.uniform1f(resistanceLocation, resistanceRef.current);
          }

          if (introLocation) {
            sceneGl.uniform1f(introLocation, introProgress);
          }

          if (settledLocation) {
            sceneGl.uniform1f(settledLocation, settledValue);
          }

          // New mechanic uniforms
          if (scanPhaseLocation) {
            sceneGl.uniform1f(scanPhaseLocation, scanPhaseRef.current);
          }
          if (scanCountLocation) {
            sceneGl.uniform1f(scanCountLocation, scanCountRef.current);
          }
          if (fracturePosLocation) {
            sceneGl.uniform2f(fracturePosLocation,
              fracturePosRef.current[0], fracturePosRef.current[1]);
          }
          if (fractureIntensityLocation) {
            sceneGl.uniform1f(fractureIntensityLocation, fractureIntensityRef.current);
          }
          if (counterPulseLocation) {
            sceneGl.uniform1f(counterPulseLocation, counterPulseRef.current);
          }
          if (deflectWindowLocation) {
            sceneGl.uniform1f(deflectWindowLocation, deflectWindowRef.current);
          }
          if (ruptureLocation) {
            sceneGl.uniform1f(ruptureLocation, ruptureRef.current);
          }
          if (ruptureProgressLocation) {
            sceneGl.uniform1f(ruptureProgressLocation, ruptureProgressRef.current);
          }
          if (ruptureOriginLocation) {
            sceneGl.uniform2f(ruptureOriginLocation,
              ruptureOriginRef.current[0], ruptureOriginRef.current[1]);
          }
          if (pulseWindowLocation) {
            sceneGl.uniform1f(pulseWindowLocation, pulseWindowUniformRef.current);
          }

          // Absorbed attempt: 0.0 = just happened, 1.0 = fully decayed
          const absorbedAge = absorbedAtRef.current > 0
            ? Math.min((now - absorbedAtRef.current) / 400, 1.0)
            : 1.0;
          if (absorbedLocation) {
            sceneGl.uniform1f(absorbedLocation, absorbedAge);
          }

          sceneGl.drawArrays(sceneGl.TRIANGLES, 0, 6);

          if (elapsed - lastHudPaint > 0.12) {
            lastHudPaint = elapsed;
            setIntensitySnapshot(intensity);
          }

          animationFrameId = window.requestAnimationFrame(draw);
        }

        setShaderStatus("ready");
        animationFrameId = window.requestAnimationFrame(draw);
      } catch {
        setShaderStatus("error");
      }
    }

    initializeShader();

    return () => {
      window.cancelAnimationFrame(animationFrameId);

      if (positionBuffer) {
        sceneGl.deleteBuffer(positionBuffer);
      }

      if (program) {
        sceneGl.deleteProgram(program);
      }

      if (vertexShader) {
        sceneGl.deleteShader(vertexShader);
      }

      if (fragmentShader) {
        sceneGl.deleteShader(fragmentShader);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Resistance handler                                                    */
  /* ---------------------------------------------------------------------- */

  function resistInterference() {
    if (completedRef.current || introPhase !== "settled") {
      return;
    }

    const now = performance.now();
    const stage = deriveStage(resistanceCountRef.current);

    /* --- Stage 3 deflect check: if deflect window is active, this is a
           deflect attempt, not a new resist --- */
    if (deflectWindowActiveRef.current && stage >= 3) {
      deflectWindowActiveRef.current = false;
      deflectWindowRef.current = 0;
      // Successful deflect: nullify counter-pulse, small pressure relief
      counterPulseRef.current = 0;
      cooldownRef.current = Math.max(0, cooldownRef.current - 0.15);
      return;
    }

    /* --- Pulse window gating (Direction A) --- */
    if (!pulseWindowOpenRef.current) {
      // Outside pulse window: absorbed. Faint ripple, no resist.
      absorbedAtRef.current = performance.now();
      return;
    }

    /* --- Determine legibility increment based on context --- */
    const isScanVectorActive = scanCountRef.current > 0;
    // Check if any scan vector is near center (approximation: scanPhase near 0.5)
    const scanPhaseFrac = scanPhaseRef.current;
    const nearScanPass = isScanVectorActive &&
      (Math.abs(Math.sin(scanPhaseFrac * Math.PI * 2)) > 0.7);

    // Check fracture point proximity (is the pulse window aligned with fracture?)
    const fractureDist = Math.abs(fracturePosRef.current[0] - 0.5) +
      Math.abs(fracturePosRef.current[1] - 0.5);
    const nearFracture = stage >= 2 && fractureIntensityRef.current > 0.3 &&
      fractureDist < 0.35;

    let legibilityGain: number;
    if (nearScanPass) {
      legibilityGain = 0.08; // Resisting during scan — seen clearly
    } else if (nearFracture) {
      legibilityGain = 0.03; // Resisting at fracture — noise
    } else {
      legibilityGain = 0.05; // Baseline clean gap
    }

    /* --- Pattern tracking (Direction C, stage 2+) --- */
    const history = resistHistoryRef.current;
    history.push(now);
    if (history.length > 3) {
      history.shift();
    }

    let isRegular = false;
    if (history.length >= 3) {
      const interval1 = history[1] - history[0];
      const interval2 = history[2] - history[1];
      const variance = Math.abs(interval2 - interval1);
      isRegular = variance < 300;
    }
    isRegularRef.current = isRegular;

    if (isRegular) {
      legibilityGain += 0.03; // Pattern regularity penalty
      // Window drift: offset increases by 150ms per regular resist, cap 600ms
      patternOffsetRef.current = Math.min(600, patternOffsetRef.current + 150);
    } else {
      // Offset resets gradually
      patternOffsetRef.current = Math.max(0, patternOffsetRef.current - 100);
    }

    // Apply legibility gain, ceiling at 0.95
    legibilityRef.current = Math.min(0.95,
      legibilityRef.current + legibilityGain);

    /* --- Scan vector intensity spike --- */
    if (nearScanPass) {
      intensitySpikeRef.current = 0.3; // Visible pressure spike
    }

    /* --- Visual flash --- */
    cooldownRef.current = Math.min(cooldownRef.current + 0.58, 1.2);
    resistanceRef.current = 1.0;

    /* --- Determine resistance credit --- */
    let resistCredit = 1.0;
    if (nearFracture) {
      resistCredit = 1.4; // Fracture point partial credit
    }

    /* --- Accumulate fractional resistance --- */
    fractionalResistRef.current += resistCredit;
    const effectiveCount = Math.floor(fractionalResistRef.current);

    // Use ref to get stable current count (avoids double-fire in StrictMode)
    const currentCount = resistanceCountRef.current;

    // Only advance if fractional total crossed a new integer
    if (effectiveCount <= currentCount) {
      // Credit accumulated but no new full resist yet
      playCue(CHAPTER3_RESIST_SOURCE, 0.12);

      // Still fire counter-pulse in stage 3
      if (stage >= 3) {
        counterPulseRef.current = 1.0;
        setTimeout(() => {
          deflectWindowActiveRef.current = true;
          deflectStartTimeRef.current = performance.now();
        }, 200);
      }
      return;
    }

    const nextCount = effectiveCount;
    resistanceCountRef.current = nextCount;

    const nextStage = deriveStage(nextCount);
    const prevStage = deriveStage(currentCount);

    // State updates — all at handler top level, not nested in updaters
    setResistanceCount(nextCount);
    setLogEntries((prev) => [
      ...prev,
      getResistanceLogEntry(currentCount, legibilityRef.current, isRegular),
    ]);

    // Stage transition flash
    if (nextStage !== prevStage) {
      stageFlashKeyRef.current += 1;
      setStageFlashKey(stageFlashKeyRef.current);
      setCurrentStage(nextStage);

      if (nextStage === 1) {
        playCue(CHAPTER3_STAGE_ONE_SOURCE, 0.14);
      } else if (nextStage === 2) {
        playCue(CHAPTER3_STAGE_TWO_SOURCE, 0.14);
      } else if (nextStage === 3) {
        playCue(CHAPTER3_STAGE_THREE_SOURCE, 0.14);
      }
    }

    // Resist flash
    resistFlashKeyRef.current += 1;
    setResistFlashKey(resistFlashKeyRef.current);

    playCue(CHAPTER3_RESIST_SOURCE, 0.12);

    /* --- Counter-pulse (Direction F, stage 3+) --- */
    if (stage >= 3 && nextCount < RESISTANCE_THRESHOLD) {
      counterPulseRef.current = 1.0;
      setTimeout(() => {
        deflectWindowActiveRef.current = true;
        deflectStartTimeRef.current = performance.now();
      }, 200);
    }

    /* --- Completion: rupture sequence --- */
    if (nextCount >= RESISTANCE_THRESHOLD) {
      // Final resist condition check (stage 3 only)
      if (nextStage >= 3) {
        finalAttemptCountRef.current += 1;

        const inPulseWindow = pulseWindowOpenRef.current;
        const inScanGap = !nearScanPass;
        const atFracture = nearFracture;
        const inDeflectOrClean = deflectWindowActiveRef.current || !isRegular;
        const allMet = inPulseWindow && inScanGap && atFracture && inDeflectOrClean;

        // Three-attempt fallback
        if (!allMet && finalAttemptCountRef.current < 3) {
          // Partial credit: 0.7 only
          fractionalResistRef.current -= 0.3;
          resistanceCountRef.current = currentCount;
          setResistanceCount(currentCount);
          // Stronger counter-pulse
          counterPulseRef.current = 1.0;
          intensitySpikeRef.current = 0.4;
          return;
        }
      }

      completedRef.current = true;
      playCue(CHAPTER3_COMPLETE_SOURCE, 0.16);

      // Start rupture sequence
      ruptureRef.current = 1.0;
      ruptureOriginRef.current = [...fracturePosRef.current];
      ruptureStartTimeRef.current = performance.now();
      setIsRupturing(true);

      // Fire onComplete after 2800ms rupture sequence
      setTimeout(() => {
        onComplete();
      }, 2800);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  Counter-pulse absorption: passive penalty on missed deflect            */
  /* ---------------------------------------------------------------------- */

  // Absorption is handled in the draw loop — if counter-pulse decays to 0
  // without deflect, the progress penalty is the visual tightening via intensity.

  /* ---------------------------------------------------------------------- */
  /*  Derived display values                                                */
  /* ---------------------------------------------------------------------- */

  const displayStage = deriveStage(resistanceCount);
  const isComplete = resistanceCount >= RESISTANCE_THRESHOLD || isRupturing;
  const introSettled = introPhase === "settled";

  return (
    <section
      className={styles.interferenceRoot}
      onPointerDown={startChapterAudio}
      onTouchStart={startChapterAudio}
    >
      <canvas ref={canvasRef} className={styles.interferenceCanvas} />

      {shaderStatus !== "ready" ? (
        <div className={styles.interferenceFallback} aria-hidden="true" />
      ) : null}

      {/* --- Intro veil: black overlay that lifts --- */}
      {introPhase !== "settled" ? (
        <div
          className={`${styles.introVeil} ${introVeilLifted ? styles.introVeilLifted : ""}`}
        />
      ) : null}

      {/* --- Intro scan beams --- */}
      {introScanActive && introPhase !== "settled" ? (
        <div className={`${styles.introScanOverlay} ${styles.introScanOverlayActive}`}>
          <div className={styles.introScanBeam} />
          <div className={styles.introScanBeamV} />
        </div>
      ) : null}

      {/* --- Intro constriction rings --- */}
      {introConstrictionActive && introPhase !== "settled" ? (
        <>
          <div
            className={`${styles.introConstrictionRing} ${styles.introConstrictionRingActive}`}
            style={{ width: "80vmin", height: "80vmin" }}
          />
          <div
            className={`${styles.introConstrictionRing} ${styles.introConstrictionRingActive}`}
            style={{ width: "120vmin", height: "120vmin" }}
          />
          <div
            className={`${styles.introConstrictionRing} ${styles.introConstrictionRingActive}`}
            style={{ width: "160vmin", height: "160vmin" }}
          />
        </>
      ) : null}

      {/* --- Intro lock pulse --- */}
      {introLockPulse && introPhase !== "settled" ? (
        <div className={styles.introLockPulse} />
      ) : null}

      {/* --- Containment crosshair: center targeting during scan --- */}
      {introCrosshairActive && introPhase !== "settled" ? (
        <div className={`${styles.containmentCrosshair} ${styles.containmentCrosshairActive}`} />
      ) : null}

      {/* --- Containment frame: corner brackets and edge marks --- */}
      <div className={`${styles.containmentFrame} ${isRupturing ? styles.containmentFrameRupture : ""}`}>
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerTL} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          } ${isRupturing ? styles.ruptureGlitch : ""}`}
        />
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerTR} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          } ${isRupturing ? styles.ruptureGlitch : ""}`}
        />
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerBL} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          } ${isRupturing ? styles.ruptureGlitch : ""}`}
        />
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerBR} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          } ${isRupturing ? styles.ruptureGlitch : ""}`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeTop} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          } ${isRupturing ? styles.ruptureEdgeFlash : ""}`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeBottom} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          } ${isRupturing ? styles.ruptureEdgeFlash : ""}`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeLeft} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          } ${isRupturing ? styles.ruptureEdgeFlash : ""}`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeRight} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          } ${isRupturing ? styles.ruptureEdgeFlash : ""}`}
        />
      </div>

      {/* --- Containment stamp: system identifier --- */}
      <div
        className={`${styles.containmentStamp} ${
          introStampVisible ? styles.containmentStampVisible : ""
        }`}
      >
        <span className={styles.containmentStampLine}>Field: Interference</span>
        <span className={styles.containmentStampLine}>Class: Hostile Containment</span>
        <span className={styles.containmentStampLine}>Target: Anomaly-S</span>
      </div>

      {/* Stage transition flash */}
      {stageFlashKey > 0 ? (
        <div key={stageFlashKey} className={styles.interferenceStageFlash} />
      ) : null}

      {/* Resistance flash */}
      {resistFlashKey > 0 ? (
        <div key={`r-${resistFlashKey}`} className={styles.interferenceResistFlash} />
      ) : null}

      {/* --- Header: top of viewport --- */}
      <div className={styles.interferenceHeader}>
        <div className={styles.interferenceHeaderLeft}>
          <p
            className={`${styles.interferenceMeta} ${
              introMetaVisible ? styles.introRevealing : styles.introHidden
            }`}
          >
            Chapter 3 // Host Response
          </p>
          <h1
            className={`${styles.interferenceTitle} ${
              introTitleVisible ? styles.introTitleSnap : styles.introTitleHidden
            }`}
          >
            INTERFERENCE
          </h1>
          <p
            className={`${styles.interferenceStageLabel} ${
              introStageVisible ? styles.introRevealing : styles.introHidden
            }`}
          >
            {isComplete
              ? "CONTAINMENT BREACHED"
              : `STAGE ${displayStage}: ${STAGE_LABELS[displayStage]}`}
          </p>
        </div>

        <div
          className={`${styles.interferenceClassification} ${
            introClassificationVisible
              ? styles.introClassificationReveal
              : styles.introClassificationHidden
          }`}
        >
          <p className={styles.classificationTitle}>
            Host Classification
          </p>
          <p className={styles.classificationBody}>
            {isComplete
              ? "Containment failure. The anomaly has created an opening the host cannot close in time. Reclassifying from threat to breach event."
              : STAGE_CLASSIFICATION[displayStage]}
          </p>
        </div>
      </div>

      {/* --- Overlay: bottom of viewport --- */}
      <div className={styles.interferenceOverlay}>
        <div
          className={`${styles.interferenceBottom} ${
            introBottomVisible ? styles.introBottomReveal : styles.introBottomHidden
          }`}
        >
          {/* Action area */}
          <div className={styles.interferenceActionArea}>
            <button
              type="button"
              className={styles.interferenceAction}
              onClick={() => {
                startChapterAudio();
                resistInterference();
              }}
              disabled={isComplete || !introSettled}
            >
              {isComplete ? "Breach Achieved" : "Resist the Host"}
            </button>
            <p className={styles.interferenceActionHint}>
              {!introSettled
                ? "Containment field initializing..."
                : isComplete
                  ? "The containment field has fractured."
                  : STAGE_HOST_LINES[displayStage]}
            </p>

            {/* Pressure bar */}
            <div className={styles.interferencePresure}>
              <div className={styles.interferenceMeter}>
                <div
                  className={styles.interferenceMeterFill}
                  style={{ transform: `scaleX(${Math.min(intensitySnapshot / 1.35, 1)})` }}
                />
              </div>
              <p className={styles.interferenceMeterLabel}>
                Host pressure: {intensitySnapshot.toFixed(2)} — Resistance: {resistanceCount}/{RESISTANCE_THRESHOLD}
              </p>
            </div>
          </div>

          {/* Resistance log */}
          <div className={styles.interferenceLog}>
            <p className={styles.interferenceLogTitle}>
              Containment Log
            </p>
            <ul ref={logListRef} className={styles.interferenceLogEntries}>
              {logEntries.length === 0 ? (
                <li className={styles.interferenceLogEntry}>
                  {shaderStatus === "loading" && "Initializing pressure field..."}
                  {shaderStatus === "ready" && !introSettled && ">> Host scanning for anomaly signature..."}
                  {shaderStatus === "ready" && introSettled && ">> Awaiting first disruption. The field is intact."}
                  {shaderStatus === "error" && ">> Pressure field failed to initialize. CSS fallback active."}
                </li>
              ) : (
                logEntries.map((entry, index) => (
                  <li
                    key={index}
                    className={`${styles.interferenceLogEntry} ${
                      index === logEntries.length - 1 ? styles.interferenceLogEntryNew : ""
                    }`}
                  >
                    {entry}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
