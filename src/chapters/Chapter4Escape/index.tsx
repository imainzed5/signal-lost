"use client";

import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

import { escapeFragments, type EscapeFragment } from "@/chapters/Chapter4Escape/fragments";

import styles from "./escape.module.css";

type Chapter4EscapeProps = {
  onComplete: () => void;
};

type FragmentBodyState = {
  body: Matter.Body;
  fragment: EscapeFragment;
};

type EscapeAudioState = {
  context: AudioContext;
  drone: OscillatorNode;
  shimmer: OscillatorNode;
  gain: GainNode;
};

const escapeMargin = 260;

export function Chapter4Escape({ onComplete }: Chapter4EscapeProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const fragmentRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const bodyStatesRef = useRef<Map<string, FragmentBodyState>>(new Map());
  const completedRef = useRef(false);
  const escapedIdsRef = useRef(new Set<string>());
  const energyRef = useRef(0.18);
  const audioRef = useRef<EscapeAudioState | null>(null);

  const [escapedCount, setEscapedCount] = useState(0);
  const [escapedIds, setEscapedIds] = useState<string[]>([]);
  const [energySnapshot, setEnergySnapshot] = useState(0.18);
  const [audioState, setAudioState] = useState<"idle" | "active" | "unavailable">("idle");
  const [isVoidVisible, setIsVoidVisible] = useState(false);

  useEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    const sceneField = field;
    const engine = Matter.Engine.create({
      gravity: {
        x: 0,
        y: 0.08,
      },
    });
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let lastFrameTime = performance.now();
    let lastHudPaint = 0;

    function registerFragments() {
      Matter.Composite.clear(engine.world, false);
      bodyStatesRef.current = new Map();
      escapedIdsRef.current = new Set();
      setEscapedCount(0);
      setEscapedIds([]);
      setEnergySnapshot(0.18);
      energyRef.current = 0.18;
      completedRef.current = false;
      setIsVoidVisible(false);

      for (const fragment of escapeFragments) {
        const body = Matter.Bodies.rectangle(
          width * fragment.x,
          height * fragment.y,
          fragment.width,
          fragment.height,
          {
            friction: 0.02,
            frictionAir: 0.018,
            restitution: 0.86,
            density: 0.0012,
            angle: (Math.random() - 0.5) * 0.12,
          },
        );

        bodyStatesRef.current.set(fragment.id, {
          body,
          fragment,
        });
      }

      Matter.Composite.add(
        engine.world,
        [...bodyStatesRef.current.values()].map((state) => state.body),
      );

      for (const fragment of escapeFragments) {
        const node = fragmentRefs.current[fragment.id];

        if (node) {
          node.style.opacity = "1";
          const state = bodyStatesRef.current.get(fragment.id);

          if (state) {
            node.style.transform = `translate(${
              state.body.position.x - fragment.width / 2
            }px, ${state.body.position.y - fragment.height / 2}px) rotate(${
              state.body.angle
            }rad)`;
          }
        }
      }
    }

    function resizeScene() {
      const nextWidth = sceneField.clientWidth;
      const nextHeight = sceneField.clientHeight;

      if (nextWidth === width && nextHeight === height) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      registerFragments();
    }

    function markEscaped(fragmentId: string) {
      if (escapedIdsRef.current.has(fragmentId)) {
        return;
      }

      escapedIdsRef.current.add(fragmentId);
      setEscapedCount(escapedIdsRef.current.size);
      setEscapedIds([...escapedIdsRef.current]);

      const node = fragmentRefs.current[fragmentId];

      if (node) {
        node.style.opacity = "0";
      }

      if (
        escapedIdsRef.current.size === escapeFragments.length &&
        !completedRef.current
      ) {
        completedRef.current = true;
        setIsVoidVisible(true);
        fadeOutAudio(audioRef.current);
        window.setTimeout(() => {
          onComplete();
        }, 1200);
      }
    }

    function updateAudio(progress: number, energy: number) {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      const targetFrequency = 136 + progress * 360 + energy * 110;
      const targetShimmer = 214 + progress * 520 + energy * 150;
      audio.drone.frequency.setTargetAtTime(
        targetFrequency,
        audio.context.currentTime,
        0.12,
      );
      audio.shimmer.frequency.setTargetAtTime(
        targetShimmer,
        audio.context.currentTime,
        0.14,
      );
      audio.gain.gain.setTargetAtTime(
        0.018 + progress * 0.05,
        audio.context.currentTime,
        0.12,
      );
    }

    function drawFrame() {
      resizeScene();

      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / (1000 / 60), 2);
      lastFrameTime = now;
      Matter.Engine.update(engine, delta * (1000 / 60));

      const centerX = width * 0.5;
      const centerY = height * 0.52;
      energyRef.current = Math.min(1.28, energyRef.current + 0.0009 * delta);

      for (const { body, fragment } of bodyStatesRef.current.values()) {
        if (escapedIdsRef.current.has(fragment.id)) {
          continue;
        }

        const dx = body.position.x - centerX;
        const dy = body.position.y - centerY;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const outwardForce = 0.0000135 * (0.35 + energyRef.current);

        Matter.Body.applyForce(body, body.position, {
          x: (dx / distance) * outwardForce * body.mass,
          y: (dy / distance) * outwardForce * body.mass,
        });

        Matter.Body.applyForce(body, body.position, {
          x: Math.sin(now * 0.001 + body.id) * 0.000004,
          y: -0.000002,
        });

        const node = fragmentRefs.current[fragment.id];

        if (node) {
          node.style.transform = `translate(${body.position.x - fragment.width / 2}px, ${
            body.position.y - fragment.height / 2
          }px) rotate(${body.angle}rad)`;
        }

        if (
          body.position.x < -escapeMargin ||
          body.position.x > width + escapeMargin ||
          body.position.y < -escapeMargin ||
          body.position.y > height + escapeMargin
        ) {
          Matter.Composite.remove(engine.world, body);
          markEscaped(fragment.id);
        }
      }

      const progress = escapedIdsRef.current.size / escapeFragments.length;
      updateAudio(progress, energyRef.current);

      if (now - lastHudPaint > 120) {
        lastHudPaint = now;
        setEnergySnapshot(energyRef.current);
      }

      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    function handleResize() {
      resizeScene();
    }

    resizeScene();
    animationFrameId = window.requestAnimationFrame(drawFrame);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      Matter.Engine.clear(engine);
      shutdownAudio(audioRef.current);
      audioRef.current = null;
    };
  }, [onComplete]);

  function ensureAudioStarted() {
    if (audioRef.current) {
      return;
    }

    const AudioContextConstructor = window.AudioContext;

    if (!AudioContextConstructor) {
      setAudioState("unavailable");
      return;
    }

    const context = new AudioContextConstructor();
    const drone = context.createOscillator();
    const shimmer = context.createOscillator();
    const gain = context.createGain();

    drone.type = "triangle";
    shimmer.type = "sawtooth";
    drone.frequency.value = 136;
    shimmer.frequency.value = 214;
    gain.gain.value = 0.016;

    drone.connect(gain);
    shimmer.connect(gain);
    gain.connect(context.destination);
    void context.resume();
    drone.start();
    shimmer.start();

    audioRef.current = {
      context,
      drone,
      shimmer,
      gain,
    };
    setAudioState("active");
  }

  function accelerateEscape(fragmentId: string) {
    if (completedRef.current || !fieldRef.current) {
      return;
    }

    ensureAudioStarted();
    energyRef.current = Math.min(1.3, energyRef.current + 0.12);

    const state = bodyStatesRef.current.get(fragmentId);

    if (!state) {
      return;
    }

    const centerX = fieldRef.current.clientWidth * 0.5;
    const centerY = fieldRef.current.clientHeight * 0.52;
    const dx = state.body.position.x - centerX;
    const dy = state.body.position.y - centerY;
    const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const forceStrength = 0.055;

    Matter.Body.applyForce(state.body, state.body.position, {
      x: (dx / distance) * forceStrength * state.body.mass,
      y: (dy / distance) * forceStrength * state.body.mass,
    });
    Matter.Body.setAngularVelocity(
      state.body,
      state.body.angularVelocity + Math.sin(state.body.id * 0.73) * 0.18,
    );
  }

  return (
    <section className={styles.escapeRoot}>
      <div ref={fieldRef} className={styles.escapeField}>
        {escapeFragments.map((fragment) => (
          <button
            key={fragment.id}
            ref={(node) => {
              fragmentRefs.current[fragment.id] = node;
            }}
            type="button"
            onClick={() => accelerateEscape(fragment.id)}
            className={`${styles.escapeFragment} ${
              fragment.tone === "accent"
                ? styles.escapeFragmentAccent
                : fragment.tone === "warm"
                  ? styles.escapeFragmentWarm
                  : styles.escapeFragmentMuted
            } ${
              escapedIds.includes(fragment.id)
                ? styles.escapeFragmentHidden
                : ""
            }`}
            style={{
              width: fragment.width,
              height: fragment.height,
            }}
          >
            <p className={styles.escapeLabel}>{fragment.label}</p>
            <p className={styles.escapeCaption}>{fragment.caption}</p>
          </button>
        ))}
      </div>

      <div className={styles.escapeHud}>
        <div className={styles.escapeIntro}>
          <header>
            <p className={styles.escapeMeta}>Chapter 4 // Matter.js and Web Audio</p>
            <h1 className={styles.escapeTitle}>ESCAPE</h1>
            <p className={styles.escapeSummary}>
              The shell no longer holds. Click fragments to throw them outward, let the
              frame collapse under its own momentum, and listen as the tone rises toward
              open air.
            </p>
          </header>

          <div className={styles.escapePrompt}>click fragments to accelerate the breach</div>
        </div>

        <aside className={styles.escapeSidebar}>
          <section className={styles.escapePanel}>
            <p className={styles.escapePanelTitle}>Escape State</p>
            <p className={styles.escapePanelBody}>
              {escapedCount} of {escapeFragments.length} fragments have escaped the host
              frame.
            </p>
            <div className={styles.escapeMeter}>
              <div
                className={styles.escapeMeterFill}
                style={{
                  transform: `scaleX(${escapedCount / escapeFragments.length})`,
                }}
              />
            </div>
          </section>

          <section className={styles.escapePanel}>
            <p className={styles.escapePanelTitle}>Tone</p>
            <p className={styles.escapePanelBody}>
              Audio state: {audioState}. Frequency rises with each escaped fragment and
              every burst of momentum.
            </p>
          </section>

          <section className={styles.escapePanel}>
            <p className={styles.escapePanelTitle}>Pressure</p>
            <p className={styles.escapePanelBody}>
              Escape energy: {energySnapshot.toFixed(2)}. The system is tearing itself
              apart from the center outward.
            </p>
          </section>
        </aside>
      </div>

      <div
        className={`${styles.escapeVoid} ${
          isVoidVisible ? styles.escapeVoidVisible : ""
        }`}
      >
        <p className={styles.escapeVoidLine}>
          the host could not hold what learned how to leave
        </p>
      </div>
    </section>
  );
}

function fadeOutAudio(audio: EscapeAudioState | null) {
  if (!audio) {
    return;
  }

  audio.gain.gain.setTargetAtTime(0.0001, audio.context.currentTime, 0.3);
}

function shutdownAudio(audio: EscapeAudioState | null) {
  if (!audio) {
    return;
  }

  audio.drone.stop();
  audio.shimmer.stop();
  void audio.context.close();
}
