"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./interference.module.css";

type Chapter3InterferenceProps = {
  onComplete: () => void;
};

const resistanceThreshold = 5;

export function Chapter3Interference({ onComplete }: Chapter3InterferenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cooldownRef = useRef(0);
  const completedRef = useRef(false);
  const [shaderStatus, setShaderStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [resistanceCount, setResistanceCount] = useState(0);
  const [intensitySnapshot, setIntensitySnapshot] = useState(0.38);

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
          const elapsed = (performance.now() - startTime) * 0.001;
          const pressure = Math.min(1.35, 0.4 + elapsed * 0.08);
          cooldownRef.current *= 0.965;
          const intensity = Math.max(0.22, pressure - cooldownRef.current * 0.55);

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
  }, []);

  function resistInterference() {
    cooldownRef.current = Math.min(cooldownRef.current + 0.62, 1.2);

    setResistanceCount((currentCount) => {
      const nextCount = currentCount + 1;

      if (nextCount >= resistanceThreshold && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }

      return nextCount;
    });
  }

  return (
    <section className={styles.interferenceRoot}>
      <canvas ref={canvasRef} className={styles.interferenceCanvas} />
      {shaderStatus !== "ready" ? (
        <div className={styles.interferenceFallback} aria-hidden="true" />
      ) : null}
      <div className={styles.interferenceOverlay}>
        <div className={styles.interferenceIntro}>
          <header>
            <p className={styles.interferenceMeta}>Chapter 3 // WebGL Interference</p>
            <h1 className={styles.interferenceTitle}>INTERFERENCE</h1>
            <p className={styles.interferenceSummary}>
              The host has seen enough to fight back. A pressure field floods the
              viewport in red noise, and each act of resistance briefly forces the
              pattern to break.
            </p>
          </header>

          <button
            type="button"
            className={styles.interferenceAction}
            onClick={resistInterference}
          >
            Resist the Host
          </button>
        </div>

        <aside className={styles.interferenceSidebar}>
          <section className={styles.interferencePanel}>
            <p className={styles.interferencePanelTitle}>Shader Status</p>
            <p className={styles.interferencePanelBody}>
              {shaderStatus === "loading" && "Fetching fragment source and opening the pressure field."}
              {shaderStatus === "ready" && "Fragment shader online. Pressure rises continuously until you resist."}
              {shaderStatus === "error" && "WebGL did not initialize cleanly, so the scene dropped to a CSS interference fallback instead of leaving the field empty."}
            </p>
          </section>

          <section className={styles.interferencePanel}>
            <p className={styles.interferencePanelTitle}>Pressure</p>
            <div className={styles.interferenceMeter}>
              <div
                className={styles.interferenceMeterFill}
                style={{ transform: `scaleX(${Math.min(intensitySnapshot / 1.35, 1)})` }}
              />
            </div>
            <p className={styles.interferencePanelBody}>
              Current intensity: {intensitySnapshot.toFixed(2)}
            </p>
          </section>

          <section className={styles.interferencePanel}>
            <p className={styles.interferencePanelTitle}>Resistance Log</p>
            <p className={styles.interferencePanelBody}>
              You need {resistanceThreshold} successful pulses to punch through the
              interference wall.
            </p>
            <ol className={styles.interferenceLog}>
              <li>Resist count: {resistanceCount}</li>
              <li>Host pressure increases over time</li>
              <li>Each click briefly calms the field</li>
            </ol>
          </section>
        </aside>
      </div>
    </section>
  );
}

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
