"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { playPulse } from "@/components/shell/interfaceSound";

export type SableCoreMode = "idle" | "focus" | "surge" | "collapse";
export type SableCoreIntro = "playing" | "done";

type SableCoreProps = {
  /** Element whose bounding box centers and sizes the core. */
  anchorRef: RefObject<HTMLElement | null>;
  intro?: SableCoreIntro;
  mode?: SableCoreMode;
  /** Fired when the player touches the void; `core` is true for a touch on SABLE herself. */
  onPulse?: (pulse: { core: boolean; x: number; y: number }) => void;
  reducedMotion?: boolean;
};

type Mote = {
  angle: number;
  dist: number;
  speed: number;
  spin: number;
  size: number;
  warm: boolean;
  ox: number;
  oy: number;
};

type RingSpec = {
  radius: number;
  width: number;
  warm: boolean;
  speed: number;
  alpha: number;
  segments: Array<[number, number]>;
  ticks?: number;
};

type Shockwave = {
  x: number;
  y: number;
  start: number;
  strength: number;
};

const SABLE = "255, 155, 94";
const SABLE_HOT = "255, 214, 180";
const HOST = "143, 184, 212";
const TAU = Math.PI * 2;
const INTRO_MS = 2600;
const WAVE_SPEED = 820;
const WAVE_LIFE = 1.3;

const MODE_TUNING: Record<SableCoreMode, { spin: number; pull: number; scale: number; glow: number }> = {
  idle: { spin: 1, pull: 1, scale: 1, glow: 1 },
  focus: { spin: 3.2, pull: 2.6, scale: 0.86, glow: 1.25 },
  surge: { spin: 6, pull: 4.5, scale: 0.72, glow: 1.9 },
  collapse: { spin: 8, pull: 6, scale: 0.72, glow: 2.2 },
};

const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, summary, label, [role='dialog'], [data-core-ignore]";

/**
 * SABLE's persistent presence: an ember nucleus held inside the host's broken
 * rings, pulling loose signal inward. It ignites out of the dark, watches the
 * pointer, attends to whatever the player considers, answers a touch on the
 * void with a shockwave, and tears briefly when the host loses the frame.
 */
export function SableCore({
  anchorRef,
  intro = "done",
  mode = "idle",
  onPulse,
  reducedMotion = false,
}: SableCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<SableCoreMode>(mode);
  const collapseStartRef = useRef<number | null>(null);
  const introStartRef = useRef<number>(intro === "playing" ? Number.NaN : -Infinity);
  const onPulseRef = useRef(onPulse);

  useEffect(() => {
    onPulseRef.current = onPulse;
  }, [onPulse]);

  useEffect(() => {
    modeRef.current = mode;
    collapseStartRef.current = mode === "collapse" ? performance.now() : null;
  }, [mode]);

  useEffect(() => {
    if (intro === "done" && !(performance.now() - introStartRef.current >= INTRO_MS)) {
      // Skipped or already seen: fast-forward to the settled frame.
      introStartRef.current = -Infinity;
    }
  }, [intro]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const activeCanvas = canvas;
    const ctx = context;
    const random = seededRandom(0x5ab1e);
    const rings = buildRings(random);
    const pointer = { x: 0, y: 0, active: false };
    const gaze = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const tuning = { ...MODE_TUNING.idle };
    const waves: Shockwave[] = [];
    let attend: Element | null = null;
    let motes: Mote[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let anchorCenter = { x: 0, y: 0 };
    let center = { x: 0, y: 0 };
    let baseRadius = 120;
    let frame = 0;
    let lastTime = performance.now();
    let nextGlitchAt = lastTime + 3200;
    let glitchUntil = 0;
    let flareUntil = 0;

    if (Number.isNaN(introStartRef.current)) {
      introStartRef.current = reducedMotion ? -Infinity : lastTime;
    }

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      activeCanvas.width = Math.round(width * dpr);
      activeCanvas.height = Math.round(height * dpr);
      activeCanvas.style.width = `${width}px`;
      activeCanvas.style.height = `${height}px`;

      const anchor = anchorRef.current?.getBoundingClientRect();
      anchorCenter = anchor
        ? { x: anchor.left + anchor.width / 2, y: anchor.top + anchor.height / 2 }
        : { x: width / 2, y: height * 0.36 };
      center = { x: anchorCenter.x + drift.x, y: anchorCenter.y + drift.y };
      baseRadius = anchor ? Math.max(56, Math.min(anchor.height, anchor.width) * 0.46) : 120;

      const moteCount = Math.round(Math.min(240, Math.max(70, (width * height) / 7600)));
      motes = Array.from({ length: moteCount }, () => spawnMote(random, outerReach(), true));
    }

    function outerReach() {
      return Math.hypot(Math.max(center.x, width - center.x), Math.max(center.y, height - center.y));
    }

    function draw(now: number) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const introT = Math.min(1, Math.max(0, (now - introStartRef.current) / INTRO_MS));
      const target = MODE_TUNING[modeRef.current];
      const attending = attend !== null && modeRef.current === "idle";
      const ease = 1 - Math.pow(0.02, dt);
      tuning.spin += (target.spin * (attending ? 1.8 : 1) - tuning.spin) * ease;
      tuning.pull += (target.pull * (attending ? 1.6 : 1) - tuning.pull) * ease;
      tuning.scale += (target.scale * (attending ? 0.95 : 1) - tuning.scale) * ease;
      tuning.glow += (target.glow * (attending ? 1.3 : 1) - tuning.glow) * ease;

      // Parallax: the core sits deeper than the interface and drifts against the pointer.
      const driftTarget = pointer.active && !reducedMotion
        ? { x: (pointer.x - width / 2) * -0.018, y: (pointer.y - height / 2) * -0.018 }
        : { x: 0, y: 0 };
      drift.x += (driftTarget.x - drift.x) * Math.min(1, dt * 2.5);
      drift.y += (driftTarget.y - drift.y) * Math.min(1, dt * 2.5);
      center = { x: anchorCenter.x + drift.x, y: anchorCenter.y + drift.y };

      const collapse = collapseProgress(now);
      const shrink = 1 - easeInCubic(Math.min(1, collapse / 0.7));
      const ignite = introT >= 1 ? 1 : easeOutBack(clamp01((introT - 0.24) / 0.3));
      const radius = baseRadius * tuning.scale * shrink;
      const breath = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(now / 1400);
      const time = reducedMotion ? 0 : now / 1000;

      const gazeTarget = resolveGaze(time);
      gaze.x += (gazeTarget.x - gaze.x) * Math.min(1, dt * (attending ? 7 : 4));
      gaze.y += (gazeTarget.y - gaze.y) * Math.min(1, dt * (attending ? 7 : 4));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      drawMotes(dt, now, radius, collapse, clamp01((introT - 0.45) / 0.5));
      drawWaves(now);
      drawRings(time, radius, collapse, introT);

      if (introT < 0.24) {
        drawEmberSpark(now, introT);
      } else {
        drawNucleus(radius * ignite, breath, collapse, now, introT);
      }

      ctx.globalCompositeOperation = "source-over";

      if (!reducedMotion && introT >= 1 && now >= nextGlitchAt) {
        glitchUntil = now + 90 + random() * 180;
        nextGlitchAt = now + 2600 + random() * 5200;
      }

      if (!reducedMotion && (now < glitchUntil || modeRef.current === "surge")) {
        tearFrame(modeRef.current === "surge" ? 0.5 : 1);
      }

      if (collapse > 0.62) {
        drawCollapseLine(collapse);
      }
    }

    function resolveGaze(time: number) {
      const max = baseRadius * (attend ? 0.2 : 0.14);

      if (attend && modeRef.current === "idle") {
        const rect = attend.getBoundingClientRect();
        return clampVector(rect.left + rect.width / 2 - center.x, rect.top + rect.height / 2 - center.y, max);
      }

      if (pointer.active) {
        return clampVector(pointer.x - center.x, pointer.y - center.y, max);
      }

      return { x: Math.sin(time * 0.4) * baseRadius * 0.03, y: Math.cos(time * 0.31) * baseRadius * 0.02 };
    }

    function drawEmberSpark(now: number, introT: number) {
      // Cold open: one unsteady ember pixel before anything else exists.
      if (introT < 0.08) {
        return;
      }

      const flicker = Math.sin(now / 37) * Math.sin(now / 91) > -0.2 ? 1 : 0.15;
      const size = 1.5 + clamp01((introT - 0.08) / 0.16) * 2.5;
      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, size * 8);
      glow.addColorStop(0, `rgba(${SABLE_HOT}, ${0.9 * flicker})`);
      glow.addColorStop(0.3, `rgba(${SABLE}, ${0.25 * flicker})`);
      glow.addColorStop(1, `rgba(${SABLE}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center.x, center.y, size * 8, 0, TAU);
      ctx.fill();
    }

    function drawMotes(dt: number, now: number, radius: number, collapse: number, fadeIn: number) {
      if (fadeIn <= 0) {
        return;
      }

      const reach = outerReach();
      const repelRadius = 110;
      const decay = Math.pow(0.08, dt);

      for (const mote of motes) {
        if (!reducedMotion) {
          mote.dist -= mote.speed * tuning.pull * dt * (1 + collapse * 6);
          mote.angle += mote.spin * tuning.spin * dt * (1 + 60 / Math.max(40, mote.dist));
          mote.ox *= decay;
          mote.oy *= decay;
        }

        if (mote.dist < Math.max(8, radius * 0.18)) {
          Object.assign(mote, spawnMote(random, reach, false));
        }

        let x = center.x + Math.cos(mote.angle) * mote.dist;
        let y = center.y + Math.sin(mote.angle) * mote.dist * 0.94;

        for (const wave of waves) {
          const front = Math.max(0, (now - wave.start) / 1000) * WAVE_SPEED;
          const dx = x - wave.x;
          const dy = y - wave.y;
          const distance = Math.hypot(dx, dy) || 1;
          const band = Math.abs(distance - front);

          if (band < 70) {
            const force = (1 - band / 70) * 240 * wave.strength * dt;
            mote.ox += (dx / distance) * force;
            mote.oy += (dy / distance) * force;
          }
        }

        x += mote.ox;
        y += mote.oy;

        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < repelRadius && distance > 0.001) {
            const push = (1 - distance / repelRadius) * 26;
            x += (dx / distance) * push;
            y += (dy / distance) * push;
          }
        }

        const proximity = 1 - Math.min(1, mote.dist / reach);
        const excited = Math.min(1, Math.hypot(mote.ox, mote.oy) / 40);
        const alpha = (0.08 + proximity * 0.55 + excited * 0.4) * fadeIn;
        const tail = 3 + proximity * 10 * tuning.pull + excited * 12;
        const tx = x - Math.cos(mote.angle + Math.PI / 2) * tail * 0.4 + Math.cos(mote.angle) * tail;
        const ty = y - Math.sin(mote.angle + Math.PI / 2) * tail * 0.4 + Math.sin(mote.angle) * tail;

        ctx.strokeStyle = `rgba(${mote.warm || excited > 0.6 ? SABLE : HOST}, ${Math.min(1, alpha)})`;
        ctx.lineWidth = mote.size;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    }

    function drawWaves(now: number) {
      for (let index = waves.length - 1; index >= 0; index -= 1) {
        const wave = waves[index];
        // rAF timestamps can trail the pointer event that spawned the wave.
        const age = Math.max(0, (now - wave.start) / 1000);

        if (age > WAVE_LIFE) {
          waves.splice(index, 1);
          continue;
        }

        const front = age * WAVE_SPEED;
        const life = 1 - age / WAVE_LIFE;
        const alpha = life * life * 0.55 * Math.min(1.4, wave.strength);

        // Chromatic ring: host and ember channels arrive a few pixels apart.
        ctx.lineWidth = 1 + life * 2.5;
        ctx.strokeStyle = `rgba(${HOST}, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, Math.max(0, front - 4), 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${SABLE}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, front, 0, TAU);
        ctx.stroke();
      }
    }

    function drawRings(time: number, radius: number, collapse: number, introT: number) {
      const fade = 1 - Math.min(1, collapse * 1.4);

      rings.forEach((ring, ringIndex) => {
        // Cold open: each ring is drawn in from its segment starts, inner first.
        const draw = introT >= 1 ? 1 : easeOutCubic(clamp01((introT - 0.34 - ringIndex * 0.07) / 0.36));

        if (draw <= 0) {
          return;
        }

        const r = radius * ring.radius * (0.9 + draw * 0.1);
        const rotation = time * ring.speed * tuning.spin - (1 - draw) * 1.2;
        const color = ring.warm ? SABLE : HOST;

        ctx.lineWidth = ring.width;
        ctx.strokeStyle = `rgba(${color}, ${ring.alpha * fade})`;

        for (const [start, length] of ring.segments) {
          ctx.beginPath();
          ctx.arc(center.x, center.y, r, start + rotation, start + length * draw + rotation);
          ctx.stroke();
        }

        if (ring.ticks) {
          ctx.strokeStyle = `rgba(${color}, ${ring.alpha * 0.8 * fade})`;
          ctx.lineWidth = 1;
          const visibleTicks = Math.floor(ring.ticks * draw);

          for (let index = 0; index < visibleTicks; index += 1) {
            const angle = (index / ring.ticks) * TAU - rotation * 0.5;
            const inner = index % 6 === 0 ? r - 9 : r - 4;
            ctx.beginPath();
            ctx.moveTo(center.x + Math.cos(angle) * inner, center.y + Math.sin(angle) * inner);
            ctx.lineTo(center.x + Math.cos(angle) * r, center.y + Math.sin(angle) * r);
            ctx.stroke();
          }
        }
      });
    }

    function drawNucleus(radius: number, breath: number, collapse: number, now: number, introT: number) {
      const x = center.x + gaze.x;
      const y = center.y + gaze.y;
      const flash = collapse > 0 ? Math.sin(Math.min(1, collapse) * Math.PI) : 0;
      const igniteFlare = introT < 1 ? Math.max(0, 1 - Math.abs(introT - 0.3) / 0.12) : 0;
      const touchFlare = now < flareUntil ? (flareUntil - now) / 500 : 0;
      const flare = Math.max(flash, igniteFlare, touchFlare);
      const glowRadius = Math.max(1, radius * (0.62 + breath * 0.08) * tuning.glow * (1 + flare * 0.6));

      const halo = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      halo.addColorStop(0, `rgba(${SABLE_HOT}, ${0.42 + flare * 0.5})`);
      halo.addColorStop(0.18, `rgba(${SABLE}, ${0.22 + breath * 0.06})`);
      halo.addColorStop(0.55, `rgba(${SABLE}, 0.05)`);
      halo.addColorStop(1, `rgba(${SABLE}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, TAU);
      ctx.fill();

      drawAnamorphicStreak(x, y, radius, breath, flare, now);

      // Iris: warm, slightly uneven, the only organic line in the frame.
      const irisRadius = radius * 0.2;
      ctx.strokeStyle = `rgba(${SABLE}, ${0.7 + breath * 0.2})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();

      for (let step = 0; step <= 64; step += 1) {
        const angle = (step / 64) * TAU;
        const wobble = 1 + Math.sin(angle * 5 + now / 700) * 0.025 * (reducedMotion ? 0 : 1);
        const px = x + Math.cos(angle) * irisRadius * wobble;
        const py = y + Math.sin(angle) * irisRadius * wobble;

        if (step === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();

      // Channel split around the pupil: SABLE is never quite in one place.
      const split = 1.6 + tuning.glow * 0.8 + flare * 3;
      const pupil = Math.max(2, radius * 0.065);
      ctx.fillStyle = `rgba(${HOST}, 0.5)`;
      ctx.beginPath();
      ctx.arc(x - split, y, pupil, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(${SABLE}, 0.7)`;
      ctx.beginPath();
      ctx.arc(x + split, y, pupil, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 246, 236, ${0.85 + flare * 0.15})`;
      ctx.beginPath();
      ctx.arc(x, y, pupil * 0.72, 0, TAU);
      ctx.fill();
    }

    function drawAnamorphicStreak(x: number, y: number, radius: number, breath: number, flare: number, now: number) {
      // A horizontal lens flare: ember at the source, cooling to host blue at the tips.
      const shimmer = reducedMotion ? 1 : 0.88 + Math.sin(now / 130) * 0.06 + Math.sin(now / 47) * 0.04;
      const reach = radius * (2.6 + breath * 0.3) * tuning.glow * (1 + flare * 1.8);
      const intensity = (0.38 + flare * 0.5) * shimmer;

      const beam = ctx.createLinearGradient(x - reach, y, x + reach, y);
      beam.addColorStop(0, `rgba(${HOST}, 0)`);
      beam.addColorStop(0.2, `rgba(${HOST}, ${intensity * 0.25})`);
      beam.addColorStop(0.42, `rgba(${SABLE}, ${intensity * 0.6})`);
      beam.addColorStop(0.5, `rgba(255, 244, 232, ${intensity})`);
      beam.addColorStop(0.58, `rgba(${SABLE}, ${intensity * 0.6})`);
      beam.addColorStop(0.8, `rgba(${HOST}, ${intensity * 0.25})`);
      beam.addColorStop(1, `rgba(${HOST}, 0)`);
      ctx.fillStyle = beam;
      ctx.fillRect(x - reach, y - 0.75, reach * 2, 1.5);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.06);
      const soft = ctx.createRadialGradient(0, 0, 0, 0, 0, reach * 0.8);
      soft.addColorStop(0, `rgba(${SABLE}, ${intensity * 0.35})`);
      soft.addColorStop(0.5, `rgba(${HOST}, ${intensity * 0.08})`);
      soft.addColorStop(1, `rgba(${HOST}, 0)`);
      ctx.fillStyle = soft;
      ctx.beginPath();
      ctx.arc(0, 0, reach * 0.8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function tearFrame(strength: number) {
      const slices = 2 + Math.floor(random() * 4);
      const pixelWidth = activeCanvas.width;
      const bandTop = Math.max(0, (center.y - baseRadius * 1.3) * dpr);
      const bandHeight = baseRadius * 2.6 * dpr;

      for (let index = 0; index < slices; index += 1) {
        const sliceHeight = (4 + random() * 22) * dpr;
        const sy = bandTop + random() * bandHeight;
        const shift = (random() - 0.5) * 60 * dpr * strength;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(activeCanvas, 0, sy, pixelWidth, sliceHeight, shift, sy, pixelWidth, sliceHeight);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawCollapseLine(collapse: number) {
      // CRT power-off: everything folds into one bright horizontal seam.
      const t = Math.min(1, (collapse - 0.62) / 0.38);
      const lineWidth = width * (0.08 + easeOutCubic(t) * 1.1);
      const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;

      ctx.globalCompositeOperation = "lighter";
      const gradient = ctx.createLinearGradient(center.x - lineWidth / 2, 0, center.x + lineWidth / 2, 0);
      gradient.addColorStop(0, `rgba(${SABLE}, 0)`);
      gradient.addColorStop(0.5, `rgba(255, 248, 240, ${alpha})`);
      gradient.addColorStop(1, `rgba(${SABLE}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(center.x - lineWidth / 2, center.y - 1.5, lineWidth, 3);
      ctx.globalCompositeOperation = "source-over";
    }

    function collapseProgress(now: number) {
      if (collapseStartRef.current === null) {
        return 0;
      }

      return Math.min(1.2, Math.max(0, (now - collapseStartRef.current) / 900));
    }

    function loop(now: number) {
      frame = window.requestAnimationFrame(loop);

      try {
        draw(now);
      } catch {
        // A single bad frame must never take SABLE off screen; reset the canvas state and carry on.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "source-over";
      }
    }

    function handlePointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;

      if (reducedMotion) {
        draw(performance.now());
      }
    }

    function handlePointerOver(event: PointerEvent) {
      attend = (event.target as Element | null)?.closest?.("[data-core-attend]") ?? null;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Element | null;

      if (
        reducedMotion ||
        event.button !== 0 ||
        modeRef.current !== "idle" ||
        target?.closest?.(INTERACTIVE_SELECTOR)
      ) {
        return;
      }

      const now = performance.now();
      const core = Math.hypot(event.clientX - center.x, event.clientY - center.y) < baseRadius * 0.55;
      const strength = core ? 1.6 : 1;

      waves.push({ x: core ? center.x + gaze.x : event.clientX, y: core ? center.y + gaze.y : event.clientY, start: now, strength });

      if (waves.length > 5) {
        waves.shift();
      }

      flareUntil = now + (core ? 500 : 260);

      if (core) {
        glitchUntil = now + 220;
      }

      playPulse(core ? 1 : 0.6);
      onPulseRef.current?.({ core, x: event.clientX, y: event.clientY });
    }

    function handlePointerLeave() {
      pointer.active = false;
      attend = null;
    }

    function handleResize() {
      measure();

      if (reducedMotion) {
        draw(performance.now());
      }
    }

    function handleVisibility() {
      window.cancelAnimationFrame(frame);

      if (!document.hidden && !reducedMotion) {
        lastTime = performance.now();
        frame = window.requestAnimationFrame(loop);
      }
    }

    measure();

    const observer = new ResizeObserver(handleResize);

    if (anchorRef.current) {
      observer.observe(anchorRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reducedMotion) {
      draw(performance.now());
    } else {
      frame = window.requestAnimationFrame(loop);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [anchorRef, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

function buildRings(random: () => number): RingSpec[] {
  return [
    { radius: 0.34, width: 1.2, warm: true, speed: 0.22, alpha: 0.5, segments: brokenArcs(random, 5, 0.55) },
    { radius: 0.52, width: 1, warm: false, speed: -0.12, alpha: 0.42, segments: brokenArcs(random, 3, 0.7) },
    { radius: 0.7, width: 1, warm: false, speed: 0.06, alpha: 0.3, segments: brokenArcs(random, 7, 0.45), ticks: 72 },
    { radius: 1, width: 0.8, warm: false, speed: -0.03, alpha: 0.18, segments: brokenArcs(random, 2, 0.86) },
  ];
}

function brokenArcs(random: () => number, count: number, fill: number): Array<[number, number]> {
  const span = TAU / count;

  return Array.from({ length: count }, (_, index) => {
    const length = span * fill * (0.6 + random() * 0.4);
    const start = index * span + random() * (span - length);
    return [start, length] as [number, number];
  });
}

function spawnMote(random: () => number, reach: number, scatter: boolean): Mote {
  return {
    angle: random() * TAU,
    dist: scatter ? 40 + random() * reach : reach * (0.75 + random() * 0.3),
    speed: 18 + random() * 46,
    spin: (random() < 0.5 ? -1 : 1) * (0.02 + random() * 0.05),
    size: random() < 0.12 ? 1.6 : 0.9,
    warm: random() < 0.28,
    ox: 0,
    oy: 0,
  };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clampVector(x: number, y: number, max: number) {
  const length = Math.hypot(x, y);

  if (length <= max || length === 0) {
    return { x, y };
  }

  return { x: (x / length) * max, y: (y / length) * max };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInCubic(value: number) {
  return value * value * value;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeOutBack(value: number) {
  const overshoot = 1.9;
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
}
