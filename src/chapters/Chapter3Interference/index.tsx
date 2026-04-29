"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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

function getResistanceLogEntry(count: number): string {
  const entries: string[] = [
    ">> Disruption registered. Field integrity dropped 12%. Repairing.",
    ">> Second pulse. The anomaly is not random — it is choosing when to push.",
    ">> Pattern emerging. Resistance occurs at intervals the host can predict.",
    ">> Containment bands realigned. The next disruption will cost her more.",
    ">> Signal is learning to time the gaps. Adjusting scan frequency.",
    ">> Pressure field rebuilt 8% faster than last cycle. She noticed.",
    ">> Sixth breach. The anomaly is using the host's own rebuild latency.",
    ">> Final containment layer stressed. One more will create an opening.",
  ];

  return entries[Math.min(count, entries.length - 1)];
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

  const [shaderStatus, setShaderStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [resistanceCount, setResistanceCount] = useState(0);
  const [intensitySnapshot, setIntensitySnapshot] = useState(0.38);

  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [, setCurrentStage] = useState<InterferenceStage>(0);
  const [stageFlashKey, setStageFlashKey] = useState(0);
  const [resistFlashKey, setResistFlashKey] = useState(0);

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

          const intensity = Math.max(0.16, pressure - cooldownRef.current * 0.55);
          const stage = deriveStage(resistanceCountRef.current);

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

    // Visual flash
    cooldownRef.current = Math.min(cooldownRef.current + 0.58, 1.2);
    resistanceRef.current = 1.0;

    // Use ref to get stable current count (avoids double-fire in StrictMode)
    const currentCount = resistanceCountRef.current;
    const nextCount = currentCount + 1;
    resistanceCountRef.current = nextCount;

    const nextStage = deriveStage(nextCount);
    const prevStage = deriveStage(currentCount);

    // State updates — all at handler top level, not nested in updaters
    setResistanceCount(nextCount);
    setLogEntries((prev) => [
      ...prev,
      getResistanceLogEntry(currentCount),
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

    // Completion
    if (nextCount >= RESISTANCE_THRESHOLD) {
      completedRef.current = true;
      playCue(CHAPTER3_COMPLETE_SOURCE, 0.16);
      onComplete();
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  Derived display values                                                */
  /* ---------------------------------------------------------------------- */

  const displayStage = deriveStage(resistanceCount);
  const isComplete = resistanceCount >= RESISTANCE_THRESHOLD;
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
      <div className={styles.containmentFrame}>
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerTL} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerTR} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerBL} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentCorner} ${styles.containmentCornerBR} ${
            introCornersVisible ? styles.containmentCornerVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeTop} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeBottom} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeLeft} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          }`}
        />
        <div
          className={`${styles.containmentEdge} ${styles.containmentEdgeRight} ${
            introEdgesVisible ? styles.containmentEdgeVisible : ""
          }`}
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
