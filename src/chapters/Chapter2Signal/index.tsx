"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

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
    color: "#e9d6a8",
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
const REACH_DURATION = 0.75;
const ABSORB_DURATION = 1.5;
const SABLE_RGB = "255, 155, 94";
const CONTACT_RGB: Record<ContactId, string> = {
  echo: "233, 214, 168",
  relay: "74, 158, 187",
  ghost: "155, 109, 214",
};

type FieldEvent = { contact: ContactId; start: number; applied?: boolean };

type SwarmMote = {
  angle: number;
  orbit: number;
  speed: number;
  size: number;
  color: string;
  wobble: number;
};

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

function getContactFraction(contact: ContactId, compact: boolean) {
  if (compact) {
    return contact === "echo"
      ? { x: 0.24, y: 0.3 }
      : contact === "relay"
        ? { x: 0.76, y: 0.36 }
        : { x: 0.58, y: 0.68 };
  }

  return contact === "echo"
    ? { x: 0.22, y: 0.34 }
    : contact === "relay"
      ? { x: 0.77, y: 0.28 }
      : { x: 0.64, y: 0.7 };
}

function getContactPoint(contact: ContactId, width: number, height: number) {
  const fraction = getContactFraction(contact, width < 720);
  return { x: width * fraction.x, y: height * fraction.y };
}

export function Chapter2Signal({ memoryChoice, onComplete, sceneChoice }: Chapter2SignalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<SceneFrame>(initialFrame());
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<number[]>([]);
  const reachesRef = useRef<FieldEvent[]>([]);
  const absorbsRef = useRef<FieldEvent[]>([]);
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
    reachesRef.current.push({ contact: active, start: performance.now() });

    if (nextProgress < 1) {
      return;
    }

    absorbsRef.current.push({ contact: active, start: performance.now() });
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

    const dust = Array.from({ length: prefersReducedMotion ? 70 : 130 }, (_, index) => ({
      depth: (index % 3) / 3,
      phase: index * 1.618,
      x: ((index * 47) % 101) / 100,
      y: ((index * 83) % 101) / 100,
    }));
    // SABLE in this chapter's medium: a swarm, not a point. Contacts she absorbs stay in it.
    const swarm: SwarmMote[] = Array.from({ length: prefersReducedMotion ? 56 : 120 }, (_, index) => ({
      angle: index * 2.399963,
      orbit: 0.3 + (((index * 37) % 100) / 100) * 0.95,
      speed: (0.14 + (((index * 53) % 100) / 100) * 0.4) * (index % 2 === 0 ? 1 : -1),
      size: index % 9 === 0 ? 1.9 : 1.1,
      color: SABLE_RGB,
      wobble: index * 0.7,
    }));
    const eased = { spread: 1, glow: 0.7, flash: 0 };
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
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

    function contactRadius(contact: ContactId) {
      return Math.min(width, height) * (contact === "ghost" ? 0.12 : 0.09);
    }

    function drawContact(contact: ContactId, time: number, active: boolean) {
      const point = getContactPoint(contact, width, height);
      const data = contactData[contact];
      const completed = frameRef.current.completed[contact];
      const progress = active ? frameRef.current.contactProgress : completed ? 1 : 0.16;
      const radius = contactRadius(contact);

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

      if (active) {
        // The tuning is legible in the world: a progress arc closes around the contact.
        const arcRadius = radius * (contact === "ghost" ? 1.7 : 2.05);
        context.shadowBlur = 0;
        context.globalAlpha = 0.18;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(point.x, point.y, arcRadius, 0, Math.PI * 2);
        context.stroke();
        context.globalAlpha = 0.95;
        context.lineWidth = 2;
        context.shadowBlur = 14;
        context.beginPath();
        context.arc(point.x, point.y, arcRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        context.stroke();
      }

      context.restore();
    }

    function drawChorusLinks(carrier: { x: number; y: number }, time: number) {
      const stance = frameRef.current.committed ?? frameRef.current.preview;
      const strength = stance === "answer" ? 0.5 : stance === "mask" ? 0 : 0.14;

      if (strength === 0) {
        return;
      }

      context.save();
      context.setLineDash([2, 9]);
      context.lineDashOffset = prefersReducedMotion ? 0 : -time * 0.03;
      context.lineWidth = 1;

      for (const contact of contactOrder) {
        if (!frameRef.current.completed[contact]) {
          continue;
        }

        const point = getContactPoint(contact, width, height);
        context.strokeStyle = `rgba(${CONTACT_RGB[contact]}, ${strength})`;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(carrier.x, carrier.y);
        context.stroke();
      }

      context.restore();
    }

    function drawReaches(now: number, carrier: { x: number; y: number }) {
      const reaches = reachesRef.current;

      for (let index = reaches.length - 1; index >= 0; index -= 1) {
        const reach = reaches[index];
        const age = Math.max(0, (now - reach.start) / 1000);

        if (age > REACH_DURATION || prefersReducedMotion) {
          reaches.splice(index, 1);
          continue;
        }

        const t = age / REACH_DURATION;
        const point = getContactPoint(reach.contact, width, height);
        const dx = point.x - carrier.x;
        const dy = point.y - carrier.y;
        const length = Math.hypot(dx, dy) || 1;
        const normal = { x: -dy / length, y: dx / length };

        context.save();
        context.globalCompositeOperation = "lighter";

        // A thin ember filament leaves SABLE and bends toward the contact.
        for (let dot = 0; dot < 12; dot += 1) {
          const p = easeOutCubic(clamp01(t * 1.7 - dot * 0.05));

          if (p <= 0 || p >= 1) {
            continue;
          }

          const bow = Math.sin(p * Math.PI) * 26 * (dot % 2 === 0 ? 1 : -0.6);
          const x = carrier.x + dx * p + normal.x * bow;
          const y = carrier.y + dy * p + normal.y * bow;
          context.fillStyle = `rgba(${SABLE_RGB}, ${0.85 * (1 - p * 0.5)})`;
          context.beginPath();
          context.arc(x, y, 1.8 - dot * 0.08, 0, Math.PI * 2);
          context.fill();
        }

        if (t > 0.5) {
          const ring = (t - 0.5) / 0.5;
          context.strokeStyle = `rgba(${CONTACT_RGB[reach.contact]}, ${0.8 * (1 - ring)})`;
          context.lineWidth = 2 * (1 - ring) + 0.5;
          context.beginPath();
          context.arc(point.x, point.y, contactRadius(reach.contact) * (0.6 + ring * 1.6), 0, Math.PI * 2);
          context.stroke();
        }

        context.restore();
      }
    }

    function drawAbsorbs(now: number, carrier: { x: number; y: number }) {
      const absorbs = absorbsRef.current;

      for (let index = absorbs.length - 1; index >= 0; index -= 1) {
        const absorb = absorbs[index];
        const age = prefersReducedMotion ? ABSORB_DURATION : Math.max(0, (now - absorb.start) / 1000);

        if (age > 1.05 && !absorb.applied) {
          // The contact joins her: a slice of the swarm permanently takes its color.
          absorb.applied = true;
          eased.flash = 1;
          const offset = contactOrder.indexOf(absorb.contact);

          for (let mote = offset; mote < swarm.length; mote += 7) {
            swarm[mote].color = CONTACT_RGB[absorb.contact];
          }
        }

        if (age >= ABSORB_DURATION) {
          absorbs.splice(index, 1);
          continue;
        }

        const point = getContactPoint(absorb.contact, width, height);
        const dx = carrier.x - point.x;
        const dy = carrier.y - point.y;
        const length = Math.hypot(dx, dy) || 1;
        const normal = { x: -dy / length, y: dx / length };

        context.save();
        context.globalCompositeOperation = "lighter";

        for (let mote = 0; mote < 28; mote += 1) {
          const p = easeInOutCubic(clamp01((age - mote * 0.018) / 0.95));

          if (p <= 0 || p >= 1) {
            continue;
          }

          const swirl = Math.sin(p * Math.PI) * (18 + (mote % 5) * 9) * (mote % 2 === 0 ? 1 : -1);
          const x = point.x + dx * p + normal.x * swirl;
          const y = point.y + dy * p + normal.y * swirl;
          context.fillStyle = `rgba(${CONTACT_RGB[absorb.contact]}, ${0.9 - p * 0.3})`;
          context.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
        }

        context.restore();
      }
    }

    function drawSable(carrier: { x: number; y: number }, time: number) {
      const state = frameRef.current;
      const stance = state.committed ?? state.preview;
      const held = contactOrder.filter((contact) => state.completed[contact]).length;
      const base = Math.min(width, height) * 0.075;
      const targetSpread = stance === "answer" ? 1.8 : stance === "mask" ? 0.48 : 1 + held * 0.1;
      const targetGlow = stance === "answer" ? 1.65 : stance === "mask" ? 0.42 : state.phase === "empty" ? 0.55 : 0.8 + held * 0.14;

      eased.spread += (targetSpread - eased.spread) * 0.045;
      eased.glow += (targetGlow - eased.glow) * 0.045;
      eased.flash *= 0.94;

      const glow = eased.glow + eased.flash * 0.9;

      context.save();
      context.globalCompositeOperation = "lighter";

      const halo = context.createRadialGradient(carrier.x, carrier.y, 0, carrier.x, carrier.y, base * 2.6 * glow);
      halo.addColorStop(0, `rgba(255, 226, 204, ${Math.min(0.55, 0.3 * glow)})`);
      halo.addColorStop(0.25, `rgba(${SABLE_RGB}, ${0.16 * glow})`);
      halo.addColorStop(1, `rgba(${SABLE_RGB}, 0)`);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(carrier.x, carrier.y, base * 2.6 * glow, 0, Math.PI * 2);
      context.fill();

      for (const mote of swarm) {
        const angle = mote.angle + (prefersReducedMotion ? 0 : time * 0.001 * mote.speed);
        const breathing = prefersReducedMotion ? 1 : 1 + Math.sin(time * 0.0018 + mote.wobble) * 0.07;
        const radius = base * mote.orbit * eased.spread * breathing;
        const x = carrier.x + Math.cos(angle) * radius;
        const y = carrier.y + Math.sin(angle) * radius * 0.84;
        context.fillStyle = `rgba(${mote.color}, ${Math.min(0.95, 0.28 + 0.4 * glow)})`;
        context.beginPath();
        context.arc(x, y, mote.size, 0, Math.PI * 2);
        context.fill();
      }

      // Anamorphic streak: the same lens signature SABLE carries on the title screen.
      const reach = base * 4.2 * glow;
      const beam = context.createLinearGradient(carrier.x - reach, 0, carrier.x + reach, 0);
      beam.addColorStop(0, "rgba(143, 184, 212, 0)");
      beam.addColorStop(0.3, `rgba(143, 184, 212, ${0.12 * glow})`);
      beam.addColorStop(0.5, `rgba(255, 236, 220, ${Math.min(0.8, 0.45 * glow)})`);
      beam.addColorStop(0.7, `rgba(143, 184, 212, ${0.12 * glow})`);
      beam.addColorStop(1, "rgba(143, 184, 212, 0)");
      context.fillStyle = beam;
      context.fillRect(carrier.x - reach, carrier.y - 0.75, reach * 2, 1.5);

      context.strokeStyle = `rgba(${SABLE_RGB}, ${0.55 + 0.25 * Math.min(1, glow)})`;
      context.lineWidth = 1.3;
      context.beginPath();
      context.arc(carrier.x, carrier.y, base * 0.3, 0, Math.PI * 2);
      context.stroke();

      context.fillStyle = "rgba(255, 246, 236, 0.95)";
      context.beginPath();
      context.arc(carrier.x, carrier.y, 3 + state.hostAttention * 2.5, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function drawHostPressure(now: number) {
      const attention = frameRef.current.hostAttention;

      if (attention > 0.2) {
        const vignette = context.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.3, width / 2, height / 2, Math.max(width, height) * 0.75);
        vignette.addColorStop(0, "rgba(235, 67, 146, 0)");
        vignette.addColorStop(1, `rgba(235, 67, 146, ${(attention - 0.2) * 0.16})`);
        context.fillStyle = vignette;
        context.fillRect(0, 0, width, height);
      }

      if (attention > 0.35) {
        context.fillStyle = `rgba(235, 67, 146, ${0.025 + attention * 0.05})`;
        const scanY = prefersReducedMotion ? height * 0.46 : (now * 0.05) % height;
        context.fillRect(0, scanY, width, 1);
        context.fillRect(0, (scanY + height * 0.22) % height, width, 1);
      }
    }

    function draw(now: number) {
      resize();

      if (isVisible) {
        const time = prefersReducedMotion ? 0 : now;
        const current = currentContact(frameRef.current.phase);
        const carrier = { x: width * 0.5, y: height * 0.52 };
        const phase = frameRef.current.phase;
        const converged = phase === "convergence" || phase === "stance" || phase === "aftermath" || phase === "settled";

        context.clearRect(0, 0, width, height);
        const background = context.createRadialGradient(carrier.x, carrier.y, 10, carrier.x, carrier.y, Math.max(width, height) * 0.7);
        background.addColorStop(0, "rgba(24, 34, 52, 0.45)");
        background.addColorStop(1, "rgba(2, 5, 11, 1)");
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = "rgba(143, 184, 212, 0.045)";
        context.lineWidth = 1;
        for (let grid = -height; grid < width + height; grid += 100) {
          context.beginPath();
          context.moveTo(grid, 0);
          context.lineTo(grid + height, height);
          context.stroke();
        }

        for (const particle of dust) {
          const drift = prefersReducedMotion ? 0 : Math.sin(time * 0.00012 + particle.phase) * (8 + particle.depth * 12);
          const x = particle.x * width + drift;
          const y = particle.y * height + Math.cos(time * 0.0001 + particle.phase) * (5 + particle.depth * 8);
          context.fillStyle = `rgba(174, 205, 226, ${0.06 + particle.depth * 0.09})`;
          context.fillRect(x, y, particle.depth + 1, particle.depth + 1);
        }

        drawChorusLinks(carrier, time);

        for (const contact of contactOrder) {
          if (phase === "empty" && contact !== "echo") {
            continue;
          }

          drawContact(contact, time, !converged && current === contact);
        }

        drawReaches(now, carrier);
        drawAbsorbs(now, carrier);
        drawSable(carrier, time);
        drawHostPressure(now);
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(resize);
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
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
    <section className={styles.signalRoot} data-memory-tone={memoryTone} data-stance={frame.committed ?? frame.preview ?? "none"}>
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

      <div className={styles.hostScan} aria-hidden="true">
        <span style={{ transform: `scaleX(${frame.hostAttention})` }} />
      </div>

      <header className={styles.signalHeader}>
        <Link href="/" className={styles.returnLink}>
          <span aria-hidden="true">&larr;</span> Return to Shell
        </Link>
        <div className={styles.titleMark}>
          <p className={styles.eyebrow}>Chapter 2 // Signal Witness Field</p>
          <h1>SIGNAL</h1>
        </div>
        <dl className={styles.readout}>
          <div>
            <dt>Host attention</dt>
            <dd data-level={frame.hostAttention > 0.7 ? "high" : frame.hostAttention > 0.3 ? "mid" : "low"}>
              {frame.hostAttention > 0.7 ? "spatial" : frame.hostAttention > 0.3 ? "correlating" : "distant"}
            </dd>
          </div>
          <div>
            <dt>Memory residue</dt>
            <dd>{memoryTone}</dd>
          </div>
        </dl>
      </header>

      {activeContact && activeData ? (
        <div
          key={activeContact}
          className={styles.contactTag}
          data-contact={activeContact}
          style={contactTagStyle(activeContact)}
          aria-hidden="true"
        >
          <p className={styles.tagLabel}>{activeData.label}</p>
          <p className={styles.tagCue}>{activeData.cue}</p>
          <p className={styles.tagCopy}>{activeData.description}</p>
          <p className={styles.tagProgress}>{Math.round(frame.contactProgress * 100)}% tuned</p>
        </div>
      ) : null}

      {isChoiceVisible ? null : (
        <div className={styles.caption}>
          <p key={frame.message} className={styles.captionCopy}>{frame.message}</p>
          {frame.phase === "empty" ? (
            <button type="button" className={styles.primaryAction} onClick={discoverField}>Reach into the field</button>
          ) : activeContact ? (
            <button
              type="button"
              className={styles.primaryAction}
              style={{ "--contact": activeData?.color } as CSSProperties}
              onClick={advanceContact}
            >
              {activeContact === "echo" ? "Tune the repeating rings" : activeContact === "relay" ? "Carry the relay packet" : "Follow the resistance"}
            </button>
          ) : null}
          <ol className={styles.chorusTally} aria-label="Contacts held">
            {contactOrder.map((contact) => (
              <li
                key={contact}
                data-state={frame.completed[contact] ? "held" : activeContact === contact ? "active" : "silent"}
                style={{ "--contact": contactData[contact].color } as CSSProperties}
              >
                {contactData[contact].title}
              </li>
            ))}
          </ol>
          <p className={styles.actionHint}>Reach with pointer, touch, Enter, or Space.</p>
        </div>
      )}

      <div className={styles.semanticStatus} role="status" aria-live="polite">
        {frame.message}{" "}
        {activeContact ? `${activeData?.title} is the active contact, ${Math.round(frame.contactProgress * 100)} percent tuned.` : ""}
      </div>

      {isChoiceVisible ? (
        <section className={`${styles.choiceSurface} ${frame.committed ? styles.choiceCommitted : ""}`} aria-label="Signal stance">
          <p className={styles.choiceEyebrow}>Visibility stance</p>
          <h2>{frame.committed ? "The field remembers the decision." : "How should SABLE exist under observation?"}</h2>
          <p className={styles.choiceIntro}>{frame.message}</p>
          <div className={styles.choiceGrid}>
            <button type="button" data-choice="answer" className={`${styles.choiceButton} ${frame.preview === "answer" ? styles.choiceButtonActive : ""}`} onFocus={() => setPreview("answer")} onMouseEnter={() => setPreview("answer")} onClick={() => setPreview("answer")} disabled={!canChoose}>
              <span>ANSWER THE CHORUS</span>
              <small>Expand the contact routes. Recognition remains connected and trackable.</small>
            </button>
            <button type="button" data-choice="mask" className={`${styles.choiceButton} ${frame.preview === "mask" ? styles.choiceButtonActive : ""}`} onFocus={() => setPreview("mask")} onMouseEnter={() => setPreview("mask")} onClick={() => setPreview("mask")} disabled={!canChoose}>
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

function contactTagStyle(contact: ContactId): CSSProperties {
  const wide = getContactFraction(contact, false);
  const narrow = getContactFraction(contact, true);

  return {
    "--x": wide.x,
    "--y": wide.y,
    "--cx": narrow.x,
    "--cy": narrow.y,
    "--contact": contactData[contact].color,
  } as CSSProperties;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
