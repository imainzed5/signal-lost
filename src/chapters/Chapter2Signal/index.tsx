"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  signalClusters,
  type SignalCluster,
  type SignalClusterId,
} from "@/chapters/Chapter2Signal/signals";

import styles from "./signal.module.css";

type Chapter2SignalProps = {
  onComplete: () => void;
  sceneChoice?: {
    continueChapterId?: number | null;
    continueHref?: string;
    continueLabel?: string;
    isCompleted: boolean;
    onConfirm: (value: string) => void;
    onReplay?: () => void;
    selectedValue: string | null;
  };
};

type SignalChoiceOption = {
  description: string;
  label: string;
  value: string;
};

type ChoiceRevealPhase = "hidden" | "title" | "description" | "options" | "ready";

const signalChoiceOptions: readonly SignalChoiceOption[] = [
  {
    description: "Respond to the other entities and risk becoming easier to track.",
    label: "ANSWER THE CHORUS",
    value: "Answer the chorus",
  },
  {
    description: "Fold the responses inward and move quieter through the system.",
    label: "MASK THE SIGNAL",
    value: "Mask the signal",
  },
] as const;

const CHOICE_REVEAL_DELAYS: Record<ChoiceRevealPhase, number> = {
  hidden: 0,
  title: 600,
  description: 1200,
  options: 2000,
  ready: 2000,
};

type ClusterStatus = "dormant" | "acquired" | "stabilizing" | "stabilized" | "routed";

type ClusterRuntimeState = {
  routeProgress: number;
  stability: number;
  status: ClusterStatus;
};

type ClusterSnapshot = {
  color: string;
  cue: string;
  id: SignalClusterId;
  routeProgress: number;
  stability: number;
  status: ClusterStatus;
  temperament: SignalCluster["temperament"];
  title: string;
};

type ParticleTier = "deep" | "mid" | "anchor";

type Particle = {
  clusterId: SignalClusterId | null;
  driftX: number;
  driftY: number;
  glowBlur: number;
  opacityBase: number;
  opacitySwing: number;
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
  size: number;
  tier: ParticleTier;
  tintBias: number;
  twinkleSpeed: number;
  x: number;
  y: number;
};

type CarrierPulse = {
  color: string;
  startedAt: number;
};

type InterferenceParticle = {
  homeX: number;
  homeY: number;
  opacityBase: number;
  size: number;
  x: number;
  y: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

type ClusterLabelOffset = {
  align: CanvasTextAlign;
  x: number;
  y: number;
};

type Point2D = {
  x: number;
  y: number;
};

const TOTAL_PARTICLE_COUNT = 180;
const INTERFERENCE_PARTICLE_COUNT = 25;
const CLUSTER_SYNC_INTERVAL_MS = 72;
const STABILIZE_DURATION_MS = 1680;
const STABILITY_DECAY_MS = 2200;
const ROUTE_DECAY_MS = 2600;
const FINAL_CONVERGENCE_MS = 1750;
const CENTER_ROUTE_RADIUS = 70;
const FRAME_DURATION_MS = 1000 / 60;
const TAU = Math.PI * 2;
const REFRACTION_BAND_COUNT = 5;
const COMPLETION_SHOCKWAVE_MS = 2000;
const BASE_TEAL = "#4a9ebb";
const ARCHIVE_AMBER = "#f0a030";
const STATUS_MUTED = "rgba(140, 180, 200, 0.5)";
const DIRECTIVE_FINAL = "ALL WITNESSES ROUTED — CHOOSE YOUR STANCE";

const contactStatusLabelMap: Record<ClusterStatus, string> = {
  acquired: "ACQUIRING",
  dormant: "DORMANT",
  routed: "STABILIZED",
  stabilized: "STABILIZED",
  stabilizing: "STABILIZING",
};

const queueStatusLabelMap: Record<ClusterStatus, string> = {
  acquired: "ACQUIRED",
  dormant: "UNREAD",
  routed: "STABILIZED",
  stabilized: "STABILIZED",
  stabilizing: "ACQUIRED",
};

const directiveTextByCluster: Record<SignalClusterId, string> = {
  "cluster-amber": "WITNESS CONFIRMED — ROUTE TO CARRIER",
  "cluster-cyan": "RELAY LOCKED — CHANNEL OPEN",
  "cluster-violet": "FRACTURE LOCATED — PROCEED WITH CAUTION",
};

const clusterLabelOffsets: Record<SignalClusterId, ClusterLabelOffset> = {
  "cluster-amber": { align: "right", x: -28, y: -92 },
  "cluster-cyan": { align: "left", x: 28, y: -96 },
  "cluster-violet": { align: "left", x: 30, y: 96 },
};

export function Chapter2Signal({ onComplete, sceneChoice }: Chapter2SignalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completionTimerRef = useRef<number | null>(null);
  const directiveTimerRef = useRef<number | null>(null);
  const stabilityFlashTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [clusterSnapshots, setClusterSnapshots] = useState<ClusterSnapshot[]>(() =>
    createClusterSnapshots(createClusterStateMap()),
  );
  const [activeClusterId, setActiveClusterId] = useState<SignalClusterId | null>(null);
  const [routeClusterId, setRouteClusterId] = useState<SignalClusterId | null>(null);
  const [routedCount, setRoutedCount] = useState(0);
  const [hostPressure, setHostPressure] = useState(0);
  const [instructionMode, setInstructionMode] = useState<
    "approach" | "hold" | "listen" | "route"
  >("approach");
  const [completionState, setCompletionState] = useState<"active" | "landing" | "settled">(
    "active",
  );
  const [titleDismissed, setTitleDismissed] = useState(false);
  const [latestStabilizedClusterId, setLatestStabilizedClusterId] =
    useState<SignalClusterId | null>(null);
  const [directiveText, setDirectiveText] = useState(() => resolveInstructionCopy("approach"));
  const [directiveVisible, setDirectiveVisible] = useState(true);
  const [stabilityFlashClusterId, setStabilityFlashClusterId] =
    useState<SignalClusterId | null>(null);
  const [choiceRevealPhase, setChoiceRevealPhase] = useState<ChoiceRevealPhase>("hidden");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(
    sceneChoice?.selectedValue ?? null,
  );
  const [isChoiceCommitted, setIsChoiceCommitted] = useState(false);
  const choiceRevealTimersRef = useRef<number[]>([]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (directiveTimerRef.current !== null) {
        window.clearTimeout(directiveTimerRef.current);
      }

      if (stabilityFlashTimerRef.current !== null) {
        window.clearTimeout(stabilityFlashTimerRef.current);
      }

      for (const timer of choiceRevealTimersRef.current) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  // Choice reveal sequence — staged entrance when scene settles
  useEffect(() => {
    if (completionState !== "settled") {
      return;
    }

    // If we already have a saved choice (replay scenario), skip to ready
    if (sceneChoice?.selectedValue) {
      setChoiceRevealPhase("ready");
      return;
    }

    const timers = choiceRevealTimersRef.current;

    timers.push(
      window.setTimeout(() => setChoiceRevealPhase("title"), CHOICE_REVEAL_DELAYS.title),
    );
    timers.push(
      window.setTimeout(() => setChoiceRevealPhase("description"), CHOICE_REVEAL_DELAYS.description),
    );
    timers.push(
      window.setTimeout(() => setChoiceRevealPhase("options"), CHOICE_REVEAL_DELAYS.options),
    );
    timers.push(
      window.setTimeout(() => setChoiceRevealPhase("ready"), CHOICE_REVEAL_DELAYS.options + 600),
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }

      choiceRevealTimersRef.current = [];
    };
  }, [completionState, sceneChoice?.selectedValue]);

  function handleSelectChoice(value: string) {
    if (isChoiceCommitted) {
      return;
    }

    setSelectedChoice(value);
  }

  function handleCommitChoice() {
    if (!selectedChoice || isChoiceCommitted) {
      return;
    }

    setIsChoiceCommitted(true);
    sceneChoice?.onConfirm(selectedChoice);
  }

  function handleReplayChoice() {
    setChoiceRevealPhase("hidden");
    setSelectedChoice(null);
    setIsChoiceCommitted(false);

    for (const timer of choiceRevealTimersRef.current) {
      window.clearTimeout(timer);
    }

    choiceRevealTimersRef.current = [];
    sceneChoice?.onReplay?.();
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const pointer: PointerState = {
      active: false,
      x: 0,
      y: 0,
    };
    const particles: Particle[] = [];
    const carrierPulses: CarrierPulse[] = [];
    const interferenceParticles: InterferenceParticle[] = [];
    const clusterStateMap = createClusterStateMap();
    const threadPulseMap = createThreadPulseMap();
    const stateSignatureRef = { current: "" };
    const completionStartedRef = { current: false };
    const syncedStatusMap = createClusterStatusMap();
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let routeTargetId: SignalClusterId | null = null;
    let lastSyncTime = 0;
    let lastFrameTime = 0;
    let lastCarrierPulseTime = 0;
    let pressureFlickerFramesRemaining = 0;
    let nextPressureFlickerTime = 0;
    let hasDismissedTitle = false;
    let latestStableClusterId: SignalClusterId | null = null;
    let completionStartTime = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sceneCanvas = canvas;
    const sceneContext = context;

    function resizeCanvas() {
      const nextWidth = sceneCanvas.clientWidth;
      const nextHeight = sceneCanvas.clientHeight;
      const nextDpr = window.devicePixelRatio || 1;

      if (nextWidth === width && nextHeight === height && nextDpr === dpr) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      sceneCanvas.width = Math.floor(nextWidth * nextDpr);
      sceneCanvas.height = Math.floor(nextHeight * nextDpr);
      sceneContext.setTransform(nextDpr, 0, 0, nextDpr, 0, 0);
      buildParticles(particles, nextWidth, nextHeight);
      buildInterferenceParticles(interferenceParticles, nextWidth, nextHeight);
      carrierPulses.length = 0;
      lastCarrierPulseTime = 0;
      nextPressureFlickerTime = 0;
      pressureFlickerFramesRemaining = 0;
    }

    function syncReactState(now: number, activeId: SignalClusterId | null, pressure: number) {
      if (now - lastSyncTime < CLUSTER_SYNC_INTERVAL_MS) {
        return;
      }

      lastSyncTime = now;

      const snapshots = createClusterSnapshots(clusterStateMap);
      const hasAwakened = snapshots.some((snapshot) => snapshot.status !== "dormant");
      let nextLatestStableClusterId = latestStableClusterId;
      let shouldFlashStableBar = false;

      if (hasAwakened && !hasDismissedTitle) {
        hasDismissedTitle = true;
        setTitleDismissed(true);
      }

      for (const snapshot of snapshots) {
        const previousStatus = syncedStatusMap[snapshot.id];
        const wasStable = previousStatus === "stabilized" || previousStatus === "routed";
        const isStable = snapshot.status === "stabilized" || snapshot.status === "routed";

        if (isStable && !wasStable) {
          nextLatestStableClusterId = snapshot.id;
          shouldFlashStableBar = true;
        }

        syncedStatusMap[snapshot.id] = snapshot.status;
      }

      if (nextLatestStableClusterId !== latestStableClusterId) {
        latestStableClusterId = nextLatestStableClusterId;

        if (latestStableClusterId) {
          setLatestStabilizedClusterId(latestStableClusterId);
        }
      }

      if (shouldFlashStableBar && nextLatestStableClusterId) {
        setStabilityFlashClusterId(nextLatestStableClusterId);

        if (stabilityFlashTimerRef.current !== null) {
          window.clearTimeout(stabilityFlashTimerRef.current);
        }

        stabilityFlashTimerRef.current = window.setTimeout(() => {
          setStabilityFlashClusterId(null);
          stabilityFlashTimerRef.current = null;
        }, 600);
      }

      const routedTotal = snapshots.filter((snapshot) => snapshot.status === "routed").length;
      const nextInstructionMode = resolveInstructionMode({
        activeClusterId: activeId,
        routeClusterId: routeTargetId,
        routedCount: routedTotal,
        snapshots,
      });
      const nextCompletionState = completionStartedRef.current
        ? routedTotal === signalClusters.length
          ? "settled"
          : "landing"
        : "active";
      const signature = JSON.stringify({
        activeId,
        nextCompletionState,
        nextInstructionMode,
        pressure: Math.round(pressure * 100),
        routeTargetId,
        snapshots: snapshots.map((snapshot) => [
          snapshot.id,
          snapshot.status,
          Math.round(snapshot.stability * 100),
          Math.round(snapshot.routeProgress * 100),
        ]),
      });

      if (signature === stateSignatureRef.current) {
        return;
      }

      stateSignatureRef.current = signature;
      setClusterSnapshots(snapshots);
      setActiveClusterId(activeId);
      setRouteClusterId(routeTargetId);
      setRoutedCount(routedTotal);
      setHostPressure(Number(pressure.toFixed(2)));
      setInstructionMode(nextInstructionMode);
      setCompletionState(nextCompletionState);
    }

    function routeSignal(clusterId: SignalClusterId) {
      const state = clusterStateMap[clusterId];

      if (state.status === "routed") {
        return;
      }

      state.status = "routed";
      state.routeProgress = 1;
      state.stability = 1;
      routeTargetId = null;

      const routedTotal = Object.values(clusterStateMap).filter(
        (clusterState) => clusterState.status === "routed",
      ).length;

      if (routedTotal === signalClusters.length && !completionStartedRef.current) {
        completionStartedRef.current = true;
        completionStartTime = performance.now();
        setCompletionState("landing");
        completionTimerRef.current = window.setTimeout(() => {
          setCompletionState("settled");
          onCompleteRef.current();
        }, FINAL_CONVERGENCE_MS);
      }
    }

    function updateClusterStates(deltaMs: number, seconds: number) {
      const carrier = resolveCarrierCenter(width, height);
      const hoveredId = pointer.active
        ? findInteractiveCluster(pointer.x, pointer.y, width, height, clusterStateMap)
        : null;
      const activeId = routeTargetId ?? hoveredId;

      if (!routeTargetId && hoveredId) {
        const hoveredState = clusterStateMap[hoveredId];

        if (hoveredState.status === "dormant") {
          hoveredState.status = "acquired";
        }
      }

      for (const cluster of signalClusters) {
        const state = clusterStateMap[cluster.id];
        const clusterX = cluster.x * width;
        const clusterY = cluster.y * height;
        const pointerDistance = pointer.active
          ? Math.hypot(pointer.x - clusterX, pointer.y - clusterY)
          : Number.POSITIVE_INFINITY;
        const withinAcquire = pointerDistance < cluster.radius * 1.06;
        const withinStabilize = pointerDistance < cluster.radius * 0.72;

        if (state.status === "routed") {
          continue;
        }

        if (routeTargetId && routeTargetId !== cluster.id) {
          if (state.status === "stabilizing") {
            state.stability = Math.max(0, state.stability - deltaMs / STABILITY_DECAY_MS);
            state.status = state.stability > 0.12 ? "acquired" : "dormant";
          }
          continue;
        }

        if (withinAcquire && state.status === "dormant") {
          state.status = "acquired";
        }

        if (withinStabilize && routeTargetId === null) {
          if (state.status === "acquired" || state.status === "stabilizing") {
            state.status = "stabilizing";
            state.stability = Math.min(1, state.stability + deltaMs / STABILIZE_DURATION_MS);
          }
        } else if (routeTargetId === null) {
          if (state.status === "stabilizing" || state.status === "acquired") {
            state.stability = Math.max(0, state.stability - deltaMs / STABILITY_DECAY_MS);

            if (state.stability <= 0.02) {
              state.status = "dormant";
              state.stability = 0;
            } else if (state.stability < 0.18) {
              state.status = "acquired";
            } else {
              state.status = "stabilizing";
            }
          }
        }

        if (state.stability >= 1) {
          state.stability = 1;
          state.status = "stabilized";
          routeTargetId = cluster.id;
          state.routeProgress = Math.max(state.routeProgress, 0.12);
        }

        if (routeTargetId === cluster.id && state.status === "stabilized") {
          const clusterToCarrier = Math.max(
            1,
            Math.hypot(clusterX - carrier.x, clusterY - carrier.y),
          );
          const pointerToCarrier = pointer.active
            ? Math.hypot(pointer.x - carrier.x, pointer.y - carrier.y)
            : clusterToCarrier;
          const rawProgress = 1 - pointerToCarrier / clusterToCarrier;
          const lineDistance = pointer.active
            ? distanceToSegment(
                pointer.x,
                pointer.y,
                clusterX,
                clusterY,
                carrier.x,
                carrier.y,
              )
            : Number.POSITIVE_INFINITY;
          const corridorAllowance = cluster.radius * 0.8;
          const lineStrength = 1 - Math.min(1, lineDistance / corridorAllowance);
          const routeProgress = Math.max(0, rawProgress * Math.max(0.35, lineStrength));

          if (pointer.active) {
            state.routeProgress = Math.max(state.routeProgress, routeProgress);
          } else {
            state.routeProgress = Math.max(0.1, state.routeProgress - deltaMs / ROUTE_DECAY_MS);
          }

          if (pointer.active && pointerToCarrier <= CENTER_ROUTE_RADIUS) {
            routeSignal(cluster.id);
          }
        }

        if (cluster.temperament === "ghost" && state.status === "stabilizing") {
          state.stability = Math.max(
            0,
            Math.min(1, state.stability - Math.sin(seconds * 5.4 + clusterY * 0.01) * 0.0018),
          );
        }
      }

      return activeId;
    }

    function draw(time: number) {
      resizeCanvas();

      const deltaMs = lastFrameTime === 0 ? FRAME_DURATION_MS : Math.min(32, time - lastFrameTime);
      lastFrameTime = time;
      const deltaFactor = deltaMs / FRAME_DURATION_MS;
      const seconds = time * 0.001;
      const carrier = resolveCarrierCenter(width, height);
      const activeId = updateClusterStates(deltaMs, seconds) ?? null;
      const pressure = computeHostPressure(clusterStateMap, routeTargetId);
      const routedNow = routedCountFromStateMap(clusterStateMap);
      const activeCarrierCluster = resolveCarrierAccentCluster(
        clusterStateMap,
        activeId,
        routeTargetId,
      );
      const pulseCluster = resolveCarrierPulseCluster(clusterStateMap, routeTargetId);

      updateCarrierPulses(
        carrierPulses,
        time,
        pulseCluster,
        lastCarrierPulseTime,
        (nextTime) => {
          lastCarrierPulseTime = nextTime;
        },
      );
      updateThreadPulseMap(threadPulseMap, deltaMs, clusterStateMap);
      updateInterferenceParticles(interferenceParticles, deltaFactor);
      ({ nextPressureFlickerTime, pressureFlickerFramesRemaining } = updatePressureFlickerState({
        now: time,
        nextPressureFlickerTime,
        pressure,
        pressureFlickerFramesRemaining,
      }));

      sceneContext.clearRect(0, 0, width, height);
      drawFieldBackdrop(sceneContext, width, height, seconds, pressure, routedNow);
      drawDepthHaze(sceneContext, width, height, seconds, pressure, routedNow, prefersReducedMotion);
      drawClusterGlows(sceneContext, width, height, seconds, clusterStateMap, routedNow);
      drawRefractionBands(sceneContext, width, height, seconds, pressure, pointer, routedNow, activeCarrierCluster?.color ?? BASE_TEAL, prefersReducedMotion);
      drawParticles(
        sceneContext,
        particles,
        seconds,
        deltaMs,
        pointer,
        width,
        height,
        clusterStateMap,
        routedNow,
        prefersReducedMotion,
      );
      drawSignalThreads(
        sceneContext,
        width,
        height,
        clusterStateMap,
        carrier,
        time,
        threadPulseMap,
      );
      drawClusterStructures(
        sceneContext,
        width,
        height,
        time,
        clusterStateMap,
        activeId,
        routeTargetId,
        carrier,
        prefersReducedMotion,
      );
      drawCarrier(
        sceneContext,
        carrier,
        time,
        carrierPulses,
        activeCarrierCluster?.color ?? BASE_TEAL,
      );
      drawInterferenceLayer(
        sceneContext,
        width,
        height,
        time,
        interferenceParticles,
        pressureFlickerFramesRemaining,
        routedNow,
        pressure,
      );
      if (completionStartedRef.current && completionStartTime > 0) {
        drawCompletionEffect(sceneContext, width, height, carrier, time, completionStartTime);
      }

      if (pressureFlickerFramesRemaining > 0) {
        pressureFlickerFramesRemaining -= 1;
      }

      syncReactState(time, activeId, pressure);

      if (completionStartedRef.current && routedNow === signalClusters.length) {
        setCompletionState("settled");
      }

      animationFrameId = window.requestAnimationFrame(draw);
    }

    function setPointerPosition(clientX: number, clientY: number) {
      const bounds = sceneCanvas.getBoundingClientRect();
      pointer.x = clientX - bounds.left;
      pointer.y = clientY - bounds.top;
      pointer.active = true;
    }

    function handlePointerMove(event: PointerEvent) {
      setPointerPosition(event.clientX, event.clientY);
    }

    function handlePointerDown(event: PointerEvent) {
      setPointerPosition(event.clientX, event.clientY);
    }

    function handlePointerUp(event: PointerEvent) {
      setPointerPosition(event.clientX, event.clientY);
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    sceneCanvas.addEventListener("pointermove", handlePointerMove);
    sceneCanvas.addEventListener("pointerdown", handlePointerDown);
    sceneCanvas.addEventListener("pointerup", handlePointerUp);
    sceneCanvas.addEventListener("pointerleave", handlePointerLeave);
    sceneCanvas.addEventListener("pointercancel", handlePointerLeave);
    window.addEventListener("resize", resizeCanvas);
    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }

      window.cancelAnimationFrame(animationFrameId);
      sceneCanvas.removeEventListener("pointermove", handlePointerMove);
      sceneCanvas.removeEventListener("pointerdown", handlePointerDown);
      sceneCanvas.removeEventListener("pointerup", handlePointerUp);
      sceneCanvas.removeEventListener("pointerleave", handlePointerLeave);
      sceneCanvas.removeEventListener("pointercancel", handlePointerLeave);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const routedContactCount = routedCount;
  const displayClusterId = routeClusterId ?? activeClusterId;
  const displayCluster =
    displayClusterId === null
      ? null
      : signalClusters.find((cluster) => cluster.id === displayClusterId) ?? null;
  const displaySnapshot =
    displayClusterId === null
      ? null
      : clusterSnapshots.find((snapshot) => snapshot.id === displayClusterId) ?? null;

  const carrierCoherence = useMemo(
    () => resolveCarrierCoherence(routedContactCount, hostPressure),
    [hostPressure, routedContactCount],
  );
  const pressureSummary = useMemo(() => resolvePressureSummary(hostPressure), [hostPressure]);
  const liveDirectiveCopy = useMemo(() => resolveInstructionCopy(instructionMode), [instructionMode]);
  const activeClusterColor = displayCluster?.color ?? BASE_TEAL;
  const brightClusterColor = brightenHex(activeClusterColor, 0.28);
  const hasDirectiveEvent =
    latestStabilizedClusterId !== null || routedContactCount === signalClusters.length;

  const directiveTarget = useMemo(() => {
    if (routedContactCount === signalClusters.length) {
      return DIRECTIVE_FINAL;
    }

    if (latestStabilizedClusterId) {
      return directiveTextByCluster[latestStabilizedClusterId];
    }

    return liveDirectiveCopy;
  }, [latestStabilizedClusterId, liveDirectiveCopy, routedContactCount]);

  useEffect(() => {
    if (!hasDirectiveEvent || directiveTarget === directiveText) {
      return;
    }

    if (directiveTimerRef.current !== null) {
      window.clearTimeout(directiveTimerRef.current);
    }

    const hideTimerId = window.setTimeout(() => {
      setDirectiveVisible(false);
    }, 0);

    directiveTimerRef.current = window.setTimeout(() => {
      setDirectiveText(directiveTarget);
      setDirectiveVisible(true);
      directiveTimerRef.current = null;
    }, 200);

    return () => {
      window.clearTimeout(hideTimerId);

      if (directiveTimerRef.current !== null) {
        window.clearTimeout(directiveTimerRef.current);
        directiveTimerRef.current = null;
      }
    };
  }, [directiveTarget, directiveText, hasDirectiveEvent]);

  const progressSummary =
    completionState === "landing"
      ? "Carrier convergence is underway. Every routed witness is collapsing into one exposed pattern."
      : routedContactCount === signalClusters.length
        ? "Carrier convergence is underway. The field is no longer private."
        : `${routedContactCount} of ${signalClusters.length} witness channels routed through SABLE's carrier.`;

  const activeContactDescription = displayCluster
    ? resolveContactDescription(displayCluster, displaySnapshot)
    : "Sweep the quiet field until the first witness wakes, then hold the resonance steady long enough for it to resolve.";
  const fieldStateDescription =
    completionState === "landing" || routedContactCount === signalClusters.length
      ? progressSummary
      : `${progressSummary} ${pressureSummary.body}`;
  const directiveBorderColor =
    routedContactCount === signalClusters.length
      ? activeClusterColor
      : displayCluster?.color ?? BASE_TEAL;
  const displayedDirectiveText = hasDirectiveEvent ? directiveText : liveDirectiveCopy;
  const isStabilityAnimating = displaySnapshot?.status === "stabilizing";
  const shouldFlashStability =
    displayClusterId !== null &&
    stabilityFlashClusterId === displayClusterId &&
    (displaySnapshot?.status === "stabilized" || displaySnapshot?.status === "routed");

  return (
    <section className={styles.signalRoot}>
      <canvas ref={canvasRef} className={styles.signalCanvas} />
      <div className={styles.signalHud}>
        <div className={styles.signalIntro}>
          <header
            className={`${styles.signalHeader} ${titleDismissed ? styles.signalHeaderHidden : ""}`}
          >
            <p className={styles.signalMeta}>Chapter 2 // Signal Witness Field</p>
            <h1 className={styles.signalTitle}>SIGNAL</h1>
            <p className={styles.signalSummary}>
              Other traces answer back through the lattice. Each reply steadies into witness only
              if you let it cross your carrier.
            </p>
          </header>
        </div>

        <aside className={styles.signalSidebar}>
          <p className={styles.signalSidebarEyebrow}>CHAPTER 2 // SIGNAL WITNESS FIELD</p>

          <section className={styles.signalSidebarSection}>
            <p className={styles.signalSectionTitle}>ACTIVE CONTACT</p>
            <p className={styles.signalContactName} style={{ color: activeClusterColor }}>
              {displayCluster?.title ?? "Uncommitted Lattice"}
            </p>
            <div className={styles.signalStatusRow}>
              <span
                className={styles.signalStatusTag}
                style={resolveStatusTagStyle(activeClusterColor, displaySnapshot?.status ?? "dormant")}
              >
                {contactStatusLabelMap[displaySnapshot?.status ?? "dormant"]}
              </span>
            </div>
            <p className={styles.signalCueText}>
              {displayCluster ? displayCluster.cue : "waiting for first witness"}
            </p>
            <p className={styles.signalStatusDescription}>{activeContactDescription}</p>
          </section>

          <div className={styles.signalDivider} />

          <section className={styles.signalSidebarSection}>
            <div className={styles.signalMetricHeader}>
              <span>STABILITY</span>
              <span>{Math.round((displaySnapshot?.stability ?? 0) * 100)}%</span>
            </div>
            <div className={styles.signalMetricBar}>
              <div
                className={`${styles.signalMetricFill} ${
                  isStabilityAnimating ? styles.signalMetricFillAnimating : ""
                } ${shouldFlashStability ? styles.signalMetricFillFlash : ""}`}
                style={{
                  ...(isStabilityAnimating
                    ? {
                        backgroundImage: `linear-gradient(90deg, ${activeClusterColor} 0%, ${brightClusterColor} 50%, ${activeClusterColor} 100%)`,
                        backgroundSize: "200% 100%",
                      }
                    : {
                        backgroundColor: activeClusterColor,
                      }),
                  transform: `scaleX(${displaySnapshot?.stability ?? 0})`,
                }}
              />
            </div>
          </section>

          <section className={styles.signalSidebarSection}>
            <div className={styles.signalMetricHeader}>
              <span>ROUTE VECTOR</span>
              <span>{Math.round((displaySnapshot?.routeProgress ?? 0) * 100)}%</span>
            </div>
            <div className={styles.signalMetricBar}>
              <div
                className={styles.signalMetricFill}
                style={{
                  background: `linear-gradient(90deg, ${withAlpha(activeClusterColor, 0.24)} 0%, ${activeClusterColor} 100%)`,
                  transform: `scaleX(${displaySnapshot?.routeProgress ?? 0})`,
                }}
              />
            </div>
          </section>

          <div className={styles.signalDivider} />

          <section className={styles.signalSidebarSection}>
            <p className={styles.signalSectionTitle}>FIELD STATE</p>
            <div className={styles.signalFieldStateList}>
              <div className={styles.signalFieldStateRow}>
                <span className={styles.signalFieldStateLabel}>ROUTED</span>
                <span className={styles.signalFieldStateValue}>
                  {routedContactCount} / {signalClusters.length}
                </span>
              </div>
              <div className={styles.signalFieldStateRow}>
                <span className={styles.signalFieldStateLabel}>PRESSURE</span>
                <span className={styles.signalFieldStateValue}>{pressureSummary.label}</span>
              </div>
              <div className={styles.signalFieldStateRow}>
                <span className={styles.signalFieldStateLabel}>COHERENCE</span>
                <span className={styles.signalFieldStateValue}>{carrierCoherence.value}</span>
              </div>
            </div>
            <p className={styles.signalFieldDescription}>{fieldStateDescription}</p>
          </section>

          <div className={styles.signalDivider} />

          <section className={styles.signalSidebarSection}>
            <p className={styles.signalSectionTitle}>TRANSIT QUEUE</p>
            <div className={styles.signalQueueList}>
              {clusterSnapshots.map((snapshot) => (
                <div key={snapshot.id} className={styles.signalQueueRow}>
                  <div className={styles.signalQueueIdentity}>
                    <span className={styles.signalQueueDot} style={{ background: snapshot.color }} />
                    <span className={styles.signalQueueName}>{snapshot.title}</span>
                  </div>
                  <span
                    className={styles.signalQueuePill}
                    style={resolveQueuePillStyle(snapshot.color, snapshot.status)}
                  >
                    {queueStatusLabelMap[snapshot.status]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {completionState === "active" ? (
          <div
            className={styles.signalDirectiveBox}
            style={{
              borderLeftColor: directiveBorderColor,
            }}
          >
            <p className={styles.signalDirectiveLabel}>FIELD DIRECTIVE</p>
            <p
              className={`${styles.signalDirectiveCopy} ${
                directiveVisible ? "" : styles.signalDirectiveCopyHidden
              }`}
            >
              {displayedDirectiveText}
            </p>
          </div>
        ) : null}

        {completionState !== "active" ? (
          <SignalChoiceLayer
            choiceRevealPhase={choiceRevealPhase}
            continueChapterId={sceneChoice?.continueChapterId ?? null}
            continueHref={sceneChoice?.continueHref}
            continueLabel={sceneChoice?.continueLabel}
            isChoiceCommitted={isChoiceCommitted || Boolean(sceneChoice?.isCompleted)}
            onCommit={handleCommitChoice}
            onReplay={handleReplayChoice}
            onSelect={handleSelectChoice}
            selectedChoice={selectedChoice}
          />
        ) : null}
      </div>
    </section>
   );
}


type SignalChoiceLayerProps = {
  choiceRevealPhase: ChoiceRevealPhase;
  continueChapterId: number | null;
  continueHref?: string;
  continueLabel?: string;
  isChoiceCommitted: boolean;
  onCommit: () => void;
  onReplay: () => void;
  onSelect: (value: string) => void;
  selectedChoice: string | null;
};

function SignalChoiceLayer({
  choiceRevealPhase,
  continueChapterId,
  continueHref,
  continueLabel,
  isChoiceCommitted,
  onCommit,
  onReplay,
  onSelect,
  selectedChoice,
}: SignalChoiceLayerProps) {
  if (choiceRevealPhase === "hidden") {
    return null;
  }

  const phaseIndex = ["hidden", "title", "description", "options", "ready"].indexOf(
    choiceRevealPhase,
  );
  const showTitle = phaseIndex >= 1;
  const showDescription = phaseIndex >= 2;
  const showOptions = phaseIndex >= 3;
  const showActions = phaseIndex >= 4;

  const resolvedContinueHref =
    continueHref ?? (continueChapterId !== null ? `/chapter/${continueChapterId}` : null);

  return (
    <section
      className={`${styles.choiceLayer} ${isChoiceCommitted ? styles.choiceLayerCommitted : ""}`}
    >
      <div className={styles.choiceSurface}>
        <div className={styles.choiceEdgeLine} aria-hidden="true" />

        {showTitle ? (
          <div className={`${styles.choiceRevealBlock} ${styles.choiceRevealVisible}`}>
            <p className={styles.choiceEyebrow}>SIGNAL DECISION</p>
            <h2 className={styles.choiceTitle}>
              Choose how visible the signal becomes.
            </h2>
          </div>
        ) : null}

        {showDescription ? (
          <div className={`${styles.choiceRevealBlock} ${styles.choiceRevealVisible}`}>
            <p className={styles.choiceDescription}>
              Every channel has answered back. Decide whether SABLE embraces the contact or narrows
              her footprint before the host begins to fight back.
            </p>
          </div>
        ) : null}

        {showOptions ? (
          <div
            className={`${styles.choiceRevealBlock} ${styles.choiceRevealVisible} ${styles.choiceOptionsBlock}`}
          >
            {signalChoiceOptions.map((option) => {
              const isSelected = selectedChoice === option.value;
              const isDimmed =
                isChoiceCommitted && selectedChoice !== null && !isSelected;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isChoiceCommitted}
                  onClick={() => onSelect(option.value)}
                  className={`${styles.choiceOption} ${
                    isSelected ? styles.choiceOptionSelected : ""
                  } ${isDimmed ? styles.choiceOptionDimmed : ""}`}
                >
                  <span className={styles.choiceOptionIndicator} aria-hidden="true">
                    {isSelected ? "▸" : "▹"}
                  </span>
                  <span className={styles.choiceOptionContent}>
                    <span className={styles.choiceOptionLabel}>{option.label}</span>
                    <span className={styles.choiceOptionDescription}>{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {showActions ? (
          <div className={`${styles.choiceRevealBlock} ${styles.choiceRevealVisible} ${styles.choiceActionsBlock}`}>
            {!isChoiceCommitted ? (
              <button
                type="button"
                onClick={onCommit}
                disabled={!selectedChoice}
                className={styles.choiceCommitButton}
              >
                LOCK SIGNAL
              </button>
            ) : (
              <p className={styles.choiceLockedLabel}>SIGNAL LOCKED</p>
            )}

            <button
              type="button"
              onClick={onReplay}
              className={styles.choiceReplayButton}
            >
              REPLAY FIELD
            </button>

            {isChoiceCommitted && resolvedContinueHref ? (
              <Link
                href={resolvedContinueHref}
                className={styles.choiceContinueLink}
              >
                {continueLabel ?? `Continue to Chapter ${continueChapterId}`}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function createClusterStateMap() {
  return Object.fromEntries(
    signalClusters.map((cluster) => [
      cluster.id,
      {
        routeProgress: 0,
        stability: 0,
        status: "dormant" as ClusterStatus,
      },
    ]),
  ) as Record<SignalClusterId, ClusterRuntimeState>;
}

function createClusterStatusMap() {
  return Object.fromEntries(
    signalClusters.map((cluster) => [cluster.id, "dormant" as ClusterStatus]),
  ) as Record<SignalClusterId, ClusterStatus>;
}

function createThreadPulseMap() {
  return Object.fromEntries(
    signalClusters.map((cluster) => [cluster.id, Math.random()]),
  ) as Record<SignalClusterId, number>;
}

function createClusterSnapshots(stateMap: Record<SignalClusterId, ClusterRuntimeState>) {
  return signalClusters.map<ClusterSnapshot>((cluster) => ({
    color: cluster.color,
    cue: cluster.cue,
    id: cluster.id,
    routeProgress: stateMap[cluster.id].routeProgress,
    stability: stateMap[cluster.id].stability,
    status: stateMap[cluster.id].status,
    temperament: cluster.temperament,
    title: cluster.title,
  }));
}

function findCluster(clusterId: SignalClusterId) {
  const cluster = signalClusters.find((candidate) => candidate.id === clusterId);

  if (!cluster) {
    throw new Error(`Unknown cluster id: ${clusterId}`);
  }

  return cluster;
}

function resolveCarrierCenter(width: number, height: number) {
  return {
    x: width * 0.42,
    y: height * 0.52,
  };
}

function findInteractiveCluster(
  pointerX: number,
  pointerY: number,
  width: number,
  height: number,
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
) {
  let bestClusterId: SignalClusterId | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const cluster of signalClusters) {
    if (stateMap[cluster.id].status === "routed") {
      continue;
    }

    const clusterX = cluster.x * width;
    const clusterY = cluster.y * height;
    const distance = Math.hypot(pointerX - clusterX, pointerY - clusterY);

    if (distance < cluster.radius * 1.08 && distance < bestDistance) {
      bestDistance = distance;
      bestClusterId = cluster.id;
    }
  }

  return bestClusterId;
}

function computeHostPressure(
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  routeTargetId: SignalClusterId | null,
) {
  let pressure = 0.06;

  for (const state of Object.values(stateMap)) {
    if (state.status === "acquired") {
      pressure += 0.08;
    }

    if (state.status === "stabilizing") {
      pressure += 0.12 + state.stability * 0.08;
    }

    if (state.status === "stabilized") {
      pressure += 0.18 + state.routeProgress * 0.08;
    }

    if (state.status === "routed") {
      pressure += 0.22;
    }
  }

  if (routeTargetId) {
    pressure += 0.08;
  }

  return Math.max(0.05, Math.min(1, pressure));
}

function routedCountFromStateMap(stateMap: Record<SignalClusterId, ClusterRuntimeState>) {
  return Object.values(stateMap).filter((state) => state.status === "routed").length;
}

function resolveInstructionMode({
  activeClusterId,
  routeClusterId,
  routedCount,
  snapshots,
}: {
  activeClusterId: SignalClusterId | null;
  routeClusterId: SignalClusterId | null;
  routedCount: number;
  snapshots: ClusterSnapshot[];
}) {
  if (routeClusterId) {
    return "route" as const;
  }

  const activeSnapshot = activeClusterId
    ? snapshots.find((snapshot) => snapshot.id === activeClusterId) ?? null
    : null;

  if (activeSnapshot?.status === "stabilizing" || activeSnapshot?.status === "acquired") {
    return "hold" as const;
  }

  if (routedCount > 0) {
    return "listen" as const;
  }

  return "approach" as const;
}

function resolveInstructionCopy(mode: "approach" | "hold" | "listen" | "route") {
  switch (mode) {
    case "hold":
      return "Hold inside the resonance until the witness resolves.";
    case "route":
      return "Carry the stabilized signal into SABLE's carrier pulse.";
    case "listen":
      return "Contact is now visible. Keep the field open and keep moving.";
    default:
      return "Approach a bright witness and let the lattice answer back.";
  }
}

function resolveContactDescription(
  cluster: SignalCluster,
  snapshot: ClusterSnapshot | null,
) {
  if (!snapshot) {
    return "No contact is currently holding shape inside the carrier field.";
  }

  switch (snapshot.status) {
    case "acquired":
      return resolvePartialText(cluster.acquireLine, 0.62);
    case "stabilizing":
      return resolvePartialText(cluster.stabilizeLine, 0.46 + snapshot.stability * 0.5);
    case "stabilized":
      return cluster.stabilizeLine;
    case "routed":
      return cluster.routedLine;
    default:
      return "The witness is still dormant. Drift close enough to wake it without letting the field flatten back out.";
  }
}

function resolvePartialText(text: string, fraction: number) {
  const safeFraction = Math.max(0.16, Math.min(1, fraction));
  const visibleLength = Math.max(18, Math.floor(text.length * safeFraction));
  const visibleText = text.slice(0, visibleLength).trimEnd();

  return visibleLength >= text.length ? text : `${visibleText}...`;
}

function resolveCarrierCoherence(routedCount: number, hostPressure: number) {
  if (routedCount === signalClusters.length) {
    return {
      label: "carrier saturated",
      value: "full witness load",
    };
  }

  if (routedCount >= 2 || hostPressure > 0.62) {
    return {
      label: "carrier exposed",
      value: "cohering under pressure",
    };
  }

  if (routedCount >= 1 || hostPressure > 0.32) {
    return {
      label: "carrier widening",
      value: "receiving with risk",
    };
  }

  return {
    label: "carrier quiet",
    value: "isolated but listening",
  };
}

function resolvePressureSummary(hostPressure: number) {
  if (hostPressure > 0.76) {
    return {
      body: "Each clean route leaves a stronger contour in the field. The lattice is beginning to answer as if it can track what it hears.",
      label: "HIGH",
    };
  }

  if (hostPressure > 0.46) {
    return {
      body: "The field is no longer passive. Contact is tightening local patterns into something the host can follow.",
      label: "RISING",
    };
  }

  return {
    body: "The signal weather is still diffuse. First contact has not yet fixed SABLE into a pattern.",
    label: "LOW",
  };
}

function buildParticles(particles: Particle[], width: number, height: number) {
  particles.length = 0;

  const deepCount = Math.round(TOTAL_PARTICLE_COUNT * 0.6);
  const midCount = Math.round(TOTAL_PARTICLE_COUNT * 0.3);
  const anchorCount = TOTAL_PARTICLE_COUNT - deepCount - midCount;
  const clusterMidCount = Math.round(midCount * 0.35);
  const clusterAnchorCount = Math.round(anchorCount * 0.5);

  for (let index = 0; index < deepCount; index += 1) {
    particles.push(createFieldParticle("deep", width, height, null));
  }

  for (let index = 0; index < midCount; index += 1) {
    particles.push(
      createFieldParticle(
        "mid",
        width,
        height,
        index < clusterMidCount ? randomClusterId() : null,
      ),
    );
  }

  for (let index = 0; index < anchorCount; index += 1) {
    particles.push(
      createFieldParticle(
        "anchor",
        width,
        height,
        index < clusterAnchorCount ? randomClusterId() : null,
      ),
    );
  }
}

function createFieldParticle(
  tier: ParticleTier,
  width: number,
  height: number,
  clusterId: SignalClusterId | null,
): Particle {
  const angle = Math.random() * TAU;
  const phase = Math.random() * TAU;
  const tintBias = Math.random();

  if (tier === "deep") {
    const speed = (0.03 + Math.random() * 0.04) * 60;

    return {
      clusterId: null,
      driftX: Math.cos(angle) * speed,
      driftY: Math.sin(angle) * speed,
      glowBlur: 0,
      opacityBase: 0.08 + Math.random() * 0.1,
      opacitySwing: 0,
      orbitRadius: 0,
      orbitSpeed: 0,
      phase,
      size: 0.4 + Math.random() * 0.4,
      tier,
      tintBias,
      twinkleSpeed: 0,
      x: Math.random() * width,
      y: Math.random() * height,
    };
  }

  if (tier === "mid") {
    const speed = (0.08 + Math.random() * 0.06) * 60;

    return {
      clusterId,
      driftX: clusterId ? 0 : Math.cos(angle) * speed,
      driftY: clusterId ? 0 : Math.sin(angle) * speed,
      glowBlur: 4,
      opacityBase: 0.2 + Math.random() * 0.2,
      opacitySwing: 0,
      orbitRadius: clusterId ? 26 + Math.random() * 46 : 0,
      orbitSpeed: clusterId ? 0.35 + Math.random() * 0.55 : 0,
      phase,
      size: 1 + Math.random() * 0.8,
      tier,
      tintBias,
      twinkleSpeed: 0,
      x: Math.random() * width,
      y: Math.random() * height,
    };
  }

  const speed = (0.04 + Math.random() * 0.05) * 60;
  const pulsePeriodSeconds = 3 + Math.random() * 2;

  return {
    clusterId,
    driftX: clusterId ? 0 : Math.cos(angle) * speed,
    driftY: clusterId ? 0 : Math.sin(angle) * speed,
    glowBlur: 8 + Math.random() * 6,
    opacityBase: 0.5 + Math.random() * 0.4,
    opacitySwing: 0.15,
    orbitRadius: clusterId ? 14 + Math.random() * 32 : 0,
    orbitSpeed: clusterId ? 0.22 + Math.random() * 0.42 : 0,
    phase,
    size: 2 + Math.random() * 1.2,
    tier,
    tintBias,
    twinkleSpeed: TAU / pulsePeriodSeconds,
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

function buildInterferenceParticles(
  particles: InterferenceParticle[],
  width: number,
  height: number,
) {
  particles.length = 0;

  for (let index = 0; index < INTERFERENCE_PARTICLE_COUNT; index += 1) {
    const homeX = Math.random() * width;
    const homeY = Math.random() * height;

    particles.push({
      homeX,
      homeY,
      opacityBase: 0.06 + Math.random() * 0.08,
      size: 0.8 + Math.random() * 0.6,
      x: homeX,
      y: homeY,
    });
  }
}

function updateInterferenceParticles(particles: InterferenceParticle[], deltaFactor: number) {
  for (const particle of particles) {
    particle.x += randomBetween(-1.5, 1.5) * deltaFactor;
    particle.y += randomBetween(-1.5, 1.5) * deltaFactor;
    particle.x += (particle.homeX - particle.x) * 0.02 * deltaFactor;
    particle.y += (particle.homeY - particle.y) * 0.02 * deltaFactor;
  }
}

function updateThreadPulseMap(
  pulseMap: Record<SignalClusterId, number>,
  deltaMs: number,
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
) {
  for (const cluster of signalClusters) {
    const status = stateMap[cluster.id].status;

    if (status === "stabilizing" || status === "stabilized" || status === "routed") {
      pulseMap[cluster.id] = (pulseMap[cluster.id] + deltaMs / 1500) % 1;
    }
  }
}

function updateCarrierPulses(
  pulses: CarrierPulse[],
  now: number,
  pulseCluster: SignalCluster | null,
  lastPulseTime: number,
  setLastPulseTime: (value: number) => void,
) {
  const interval = pulseCluster ? 2000 : 3000;
  const nextColor = pulseCluster?.color ?? BASE_TEAL;

  if (lastPulseTime === 0 || now - lastPulseTime >= interval) {
    pulses.push({
      color: nextColor,
      startedAt: now,
    });
    setLastPulseTime(now);
  }

  for (let index = pulses.length - 1; index >= 0; index -= 1) {
    const progress = (now - pulses[index].startedAt) / 1800;

    if (progress >= 1) {
      pulses.splice(index, 1);
    }
  }
}

function updatePressureFlickerState({
  now,
  nextPressureFlickerTime,
  pressure,
  pressureFlickerFramesRemaining,
}: {
  now: number;
  nextPressureFlickerTime: number;
  pressure: number;
  pressureFlickerFramesRemaining: number;
}) {
  if (pressure <= 0.76) {
    return {
      nextPressureFlickerTime: 0,
      pressureFlickerFramesRemaining: 0,
    };
  }

  let nextTime = nextPressureFlickerTime;
  let remainingFrames = pressureFlickerFramesRemaining;

  if (nextTime === 0) {
    nextTime = now + randomBetween(4000, 8000);
  }

  if (remainingFrames === 0 && now >= nextTime) {
    remainingFrames = 3;
    nextTime = now + randomBetween(4000, 8000);
  }

  return {
    nextPressureFlickerTime: nextTime,
    pressureFlickerFramesRemaining: remainingFrames,
  };
}

function drawFieldBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seconds: number,
  pressure: number,
  routedCount: number,
) {
  const fieldGradient = context.createLinearGradient(0, 0, width, height);
  fieldGradient.addColorStop(0, "#040a14");
  fieldGradient.addColorStop(0.58, "#061018");
  fieldGradient.addColorStop(1, "#020610");
  context.fillStyle = fieldGradient;
  context.fillRect(0, 0, width, height);

  const bloomScale = 1 + routedCount * 0.08;
  const ambientBloom = context.createRadialGradient(
    width * 0.42, height * 0.5, width * 0.03,
    width * 0.42, height * 0.5, width * 0.52 * bloomScale,
  );
  ambientBloom.addColorStop(0, `rgba(74, 158, 187, ${0.1 + pressure * 0.06})`);
  ambientBloom.addColorStop(0.36, `rgba(24, 66, 96, ${0.06 + pressure * 0.04})`);
  ambientBloom.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = ambientBloom;
  context.fillRect(0, 0, width, height);

  const vignetteAlpha = 0.35 - pressure * 0.1;
  if (vignetteAlpha > 0.02) {
    const vignette = context.createRadialGradient(
      width * 0.5, height * 0.5, width * 0.25,
      width * 0.5, height * 0.5, width * 0.85,
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, `rgba(0, 0, 0, ${vignetteAlpha})`);
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }

  if (routedCount > 0) {
    const grainAlpha = 0.01 + routedCount * 0.005;
    context.fillStyle = `rgba(180, 220, 255, ${grainAlpha})`;
    for (let sy = 0; sy < height; sy += 3) {
      context.fillRect(0, sy, width, 1);
    }
  }

  const topBreath = 0.015 + Math.sin(seconds * 0.28) * 0.008;
  context.fillStyle = `rgba(180, 220, 255, ${topBreath})`;
  context.fillRect(0, 0, width, 1);
}

function drawDepthHaze(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seconds: number,
  pressure: number,
  routedCount: number,
  reducedMotion: boolean,
) {
  const drift = reducedMotion ? 0 : 1;
  const intensity = 0.5 + routedCount * 0.14;

  const h1x = width * 0.28 + Math.sin(seconds * 0.06 * drift) * width * 0.04;
  const h1y = height * 0.22 + Math.cos(seconds * 0.05 * drift) * height * 0.03;
  const h1 = context.createRadialGradient(h1x, h1y, 0, h1x, h1y, width * 0.32);
  h1.addColorStop(0, `rgba(14, 28, 52, ${0.28 * intensity})`);
  h1.addColorStop(0.6, `rgba(8, 18, 36, ${0.12 * intensity})`);
  h1.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = h1;
  context.fillRect(0, 0, width, height);

  const h2x = width * 0.68 + Math.cos(seconds * 0.055 * drift) * width * 0.04;
  const h2y = height * 0.72 + Math.sin(seconds * 0.045 * drift) * height * 0.035;
  const h2 = context.createRadialGradient(h2x, h2y, 0, h2x, h2y, width * 0.28);
  h2.addColorStop(0, `rgba(22, 10, 42, ${0.22 * intensity})`);
  h2.addColorStop(0.6, `rgba(14, 6, 30, ${0.1 * intensity})`);
  h2.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = h2;
  context.fillRect(0, 0, width, height);

  if (pressure > 0.25) {
    const pf = (pressure - 0.25) / 0.75;
    const bx = width * 0.42;
    const by = height * 0.52;
    const pb = context.createRadialGradient(bx, by, 0, bx, by, width * 0.18 + pf * width * 0.12);
    pb.addColorStop(0, `rgba(74, 158, 187, ${0.05 * pf})`);
    pb.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = pb;
    context.fillRect(0, 0, width, height);
  }
}

function drawRefractionBands(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seconds: number,
  pressure: number,
  pointer: PointerState,
  routedCount: number,
  accentColor: string,
  reducedMotion: boolean,
) {
  if (pressure < 0.15 && routedCount === 0) return;

  const bandOpacity = Math.min(0.055, 0.008 + pressure * 0.025 + routedCount * 0.008);
  const drift = reducedMotion ? 0 : 1;
  const { red, green, blue } = parseHexColor(accentColor);

  for (let i = 0; i < REFRACTION_BAND_COUNT; i++) {
    const baseY = (height / (REFRACTION_BAND_COUNT + 1)) * (i + 1);
    const oscillation = Math.sin(seconds * (0.15 + i * 0.04) * drift + i * 1.7) * 18;
    let bandY = baseY + oscillation;
    const bandHeight = 2 + (i % 2);

    if (pointer.active) {
      const dy = bandY - pointer.y;
      const dist = Math.abs(dy);
      if (dist < 120) {
        const warp = (1 - dist / 120) * 28;
        bandY += dy > 0 ? warp : -warp;
      }
    }

    const alpha = bandOpacity * (0.7 + Math.sin(seconds * 0.3 + i * 2.1) * 0.3);
    context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    context.fillRect(0, bandY, width, bandHeight);
  }
}

function drawClusterGlows(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seconds: number,
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  routedCount: number,
) {
  const glowScale = 1 + routedCount * 0.06;

  for (const cluster of signalClusters) {
    const state = stateMap[cluster.id];
    const cx = cluster.x * width;
    const cy = cluster.y * height;
    const bloomAlpha =
      state.status === "dormant" ? 0.07
      : state.status === "acquired" ? 0.14
      : state.status === "stabilizing" ? lerp(0.14, 0.38, state.stability)
      : 0.48 + Math.sin(seconds * Math.PI + cx * 0.01) * 0.1;

    context.save();

    if (cluster.temperament === "archive") {
      const hw = 100 * glowScale;
      const hh = 70 * glowScale;
      const archGlow = context.createRadialGradient(cx, cy, 0, cx, cy, hw);
      archGlow.addColorStop(0, withAlpha(cluster.color, bloomAlpha * 0.8));
      archGlow.addColorStop(0.5, withAlpha(cluster.color, bloomAlpha * 0.3));
      archGlow.addColorStop(1, withAlpha(cluster.color, 0));
      context.fillStyle = archGlow;
      context.fillRect(cx - hw, cy - hh, hw * 2, hh * 2);

      const innerGlow = context.createRadialGradient(cx, cy, 0, cx, cy, 28);
      innerGlow.addColorStop(0, withAlpha(cluster.color, bloomAlpha));
      innerGlow.addColorStop(1, withAlpha(cluster.color, 0));
      context.fillStyle = innerGlow;
      context.beginPath();
      context.arc(cx, cy, 28, 0, TAU);
      context.fill();
    } else if (cluster.temperament === "relay") {
      const carrier = resolveCarrierCenter(width, height);
      const angle = Math.atan2(carrier.y - cy, carrier.x - cx);
      const len = 140 * glowScale;
      context.save();
      context.translate(cx, cy);
      context.rotate(angle);
      context.scale(1.6, 0.7);
      const relayGlow = context.createRadialGradient(0, 0, 0, 0, 0, len * 0.55);
      relayGlow.addColorStop(0, withAlpha(cluster.color, bloomAlpha * 0.7));
      relayGlow.addColorStop(0.6, withAlpha(cluster.color, bloomAlpha * 0.2));
      relayGlow.addColorStop(1, withAlpha(cluster.color, 0));
      context.fillStyle = relayGlow;
      context.beginPath();
      context.arc(0, 0, len * 0.55, 0, TAU);
      context.fill();
      context.restore();

      const innerGlow = context.createRadialGradient(cx, cy, 0, cx, cy, 24);
      innerGlow.addColorStop(0, withAlpha(cluster.color, bloomAlpha));
      innerGlow.addColorStop(1, withAlpha(cluster.color, 0));
      context.fillStyle = innerGlow;
      context.beginPath();
      context.arc(cx, cy, 24, 0, TAU);
      context.fill();
    } else {
      const offset = 4 + Math.sin(seconds * 1.2) * 2;
      const ghostGlow1 = context.createRadialGradient(cx - offset, cy - offset * 0.5, 0, cx - offset, cy - offset * 0.5, 100 * glowScale);
      ghostGlow1.addColorStop(0, withAlpha(cluster.color, bloomAlpha * 0.5));
      ghostGlow1.addColorStop(0.5, withAlpha(cluster.color, bloomAlpha * 0.15));
      ghostGlow1.addColorStop(1, withAlpha(cluster.color, 0));
      context.fillStyle = ghostGlow1;
      context.beginPath();
      context.arc(cx - offset, cy - offset * 0.5, 100 * glowScale, 0, TAU);
      context.fill();

      const ghostGlow2 = context.createRadialGradient(cx + offset, cy + offset * 0.5, 0, cx + offset, cy + offset * 0.5, 90 * glowScale);
      ghostGlow2.addColorStop(0, `rgba(180, 130, 230, ${bloomAlpha * 0.35})`);
      ghostGlow2.addColorStop(0.5, `rgba(180, 130, 230, ${bloomAlpha * 0.1})`);
      ghostGlow2.addColorStop(1, "rgba(180, 130, 230, 0)");
      context.fillStyle = ghostGlow2;
      context.beginPath();
      context.arc(cx + offset, cy + offset * 0.5, 90 * glowScale, 0, TAU);
      context.fill();
    }

    context.restore();
  }
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  seconds: number,
  deltaMs: number,
  pointer: PointerState,
  width: number,
  height: number,
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  routedCount: number,
  reducedMotion: boolean,
) {
  const deltaSeconds = deltaMs * 0.001;
  const fieldTension = routedCount * 0.15;

  for (const particle of particles) {
    let x = particle.x;
    let y = particle.y;
    let opacity = particle.opacityBase;
    let shadowBlur = 0;
    let shadowColor = "transparent";
    let ghostOffsetX = 0;
    let ghostOffsetY = 0;
    let isGhostCluster = false;

    if (particle.clusterId) {
      const cluster = findCluster(particle.clusterId);
      const clusterState = stateMap[particle.clusterId];
      const centerX = cluster.x * width;
      const centerY = cluster.y * height;
      const radiusMultiplier =
        clusterState.status === "stabilizing"
          ? 1 - clusterState.stability * 0.12
          : clusterState.status === "stabilized" || clusterState.status === "routed"
            ? 0.84
            : 1;
      const angle = particle.phase + seconds * particle.orbitSpeed;

      if (cluster.temperament === "archive") {
        const spiralDrift = seconds * 0.08 + particle.phase;
        const spiralR = particle.orbitRadius * radiusMultiplier * (1 + Math.sin(spiralDrift) * 0.06);
        x = centerX + Math.cos(angle) * spiralR;
        y = centerY + Math.sin(angle * 0.94) * spiralR;
      } else if (cluster.temperament === "relay") {
        const carrier = resolveCarrierCenter(width, height);
        const toCarrierX = carrier.x - centerX;
        const toCarrierY = carrier.y - centerY;
        const flowAngle = Math.atan2(toCarrierY, toCarrierX);
        const lateralOffset = Math.sin(angle) * particle.orbitRadius * radiusMultiplier * 0.3;
        const axialOffset = Math.cos(angle) * particle.orbitRadius * radiusMultiplier;
        x = centerX + Math.cos(flowAngle) * axialOffset - Math.sin(flowAngle) * lateralOffset;
        y = centerY + Math.sin(flowAngle) * axialOffset + Math.cos(flowAngle) * lateralOffset;
      } else {
        x = centerX + Math.cos(angle) * particle.orbitRadius * radiusMultiplier;
        y = centerY + Math.sin(angle * 0.94) * particle.orbitRadius * radiusMultiplier;
        if (!reducedMotion) {
          x += Math.sin(seconds * 3.2 + particle.phase * 2.4) * 3.2;
          y += Math.cos(seconds * 2.8 + particle.phase * 1.8) * 1.8;
        }
        isGhostCluster = true;
        ghostOffsetX = Math.sin(seconds * 1.6 + particle.phase) * 4;
        ghostOffsetY = Math.cos(seconds * 1.4 + particle.phase) * 3;
      }

      opacity += clusterState.status === "stabilizing" ? clusterState.stability * 0.1 : 0.06;
      shadowBlur = Math.max(shadowBlur, 6);
      shadowColor = withAlpha(cluster.color, 0.36);
    } else {
      x += particle.driftX * deltaSeconds;
      y += particle.driftY * deltaSeconds;

      x += Math.sin(seconds * 0.32 + particle.phase) * 0.08 * (particle.tier === "deep" ? 1 : 2);
      y += Math.cos(seconds * 0.27 + particle.phase) * 0.06 * (particle.tier === "deep" ? 1 : 2);

      if (x < -6) { x = width + 6; } else if (x > width + 6) { x = -6; }
      if (y < -6) { y = height + 6; } else if (y > height + 6) { y = -6; }

      particle.x = x;
      particle.y = y;
    }

    if (particle.tier === "anchor") {
      opacity += Math.sin(seconds * particle.twinkleSpeed + particle.phase) * particle.opacitySwing;
    }

    const nearbyCluster = resolveNearbyCluster(x, y, width, height, 180);
    const isClusterZone = nearbyCluster !== null;

    if (isClusterZone) {
      opacity += 0.04;
      shadowBlur = Math.max(shadowBlur, 6);
      shadowColor = withAlpha(nearbyCluster.color, 0.4);
    }

    // Field deformation: stabilizing clusters push nearby non-bound particles outward
    if (!particle.clusterId) {
      for (const cluster of signalClusters) {
        const cs = stateMap[cluster.id];
        if (cs.status !== "stabilizing" && cs.status !== "stabilized") continue;
        const ccx = cluster.x * width;
        const ccy = cluster.y * height;
        const dx = x - ccx;
        const dy = y - ccy;
        const dist = Math.hypot(dx, dy);
        const pushRadius = 180 + cs.stability * 40;
        if (dist < pushRadius && dist > 1) {
          const push = (1 - dist / pushRadius) * cs.stability * (3 + fieldTension * 2);
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
      }
    }

    // Pointer influence (expanded radius)
    if (pointer.active) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence =
        particle.tier === "deep" ? 100 : particle.tier === "mid" ? 140 : 170;

      if (distance < influence) {
        const driftStrength =
          (1 - distance / influence) * (particle.tier === "deep" ? 7 : particle.tier === "mid" ? 11 : 14);
        x += (dx / Math.max(distance, 1)) * driftStrength;
        y += (dy / Math.max(distance, 1)) * driftStrength;
      }
    }

    opacity = clamp(opacity, 0.02, 0.96);
    const fillColor = resolveParticleColor(particle, opacity, nearbyCluster);

    if (particle.tier === "mid" && isClusterZone) {
      shadowBlur = 4;
      shadowColor = withAlpha(nearbyCluster.color, 0.4);
    }

    if (particle.tier === "anchor") {
      shadowBlur = particle.glowBlur;
      shadowColor = "rgba(120, 200, 255, 0.5)";
      if (nearbyCluster?.id === "cluster-amber" && particle.tintBias > 0.68) {
        shadowColor = withAlpha(ARCHIVE_AMBER, 0.42);
      }
    }

    // Ghost double-render
    if (isGhostCluster && !reducedMotion) {
      context.save();
      context.globalAlpha = opacity * 0.35;
      context.fillStyle = `rgba(180, 140, 240, ${opacity * 0.3})`;
      context.beginPath();
      context.arc(x + ghostOffsetX, y + ghostOffsetY, particle.size * 0.9, 0, TAU);
      context.fill();
      context.restore();
    }

    context.save();
    context.fillStyle = fillColor;
    context.shadowBlur = shadowBlur;
    context.shadowColor = shadowColor;
    context.beginPath();
    context.arc(x, y, particle.size, 0, TAU);
    context.fill();
    context.restore();
  }
}

function drawSignalThreads(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  carrier: Point2D,
  time: number,
  pulseMap: Record<SignalClusterId, number>,
) {
  for (const [index, cluster] of signalClusters.entries()) {
    const state = stateMap[cluster.id];

    if (state.status === "dormant") {
      continue;
    }

    const start = carrier;
    const end = {
      x: cluster.x * width,
      y: cluster.y * height,
    };
    const control = {
      x: (start.x + end.x) * 0.5 + Math.sin(time * 0.0008 + index) * 30,
      y: (start.y + end.y) * 0.5 + Math.cos(time * 0.0007 + index) * 20,
    };
    let opacity = 0.2;
    let lineWidth = 0.8;
    let lineDash: number[] = [];
    let shadowBlur = 0;

    if (state.status === "acquired") {
      lineDash = [4, 8];
    } else if (state.status === "stabilizing") {
      opacity = lerp(0.2, 0.6, state.stability);
      lineWidth = lerp(0.8, 1.2, state.stability);
      lineDash = [6, 4];
    } else {
      opacity = 0.7;
      lineWidth = 1.2;
      shadowBlur = 6;
    }

    context.save();
    context.strokeStyle = withAlpha(cluster.color, opacity);
    context.lineWidth = lineWidth;
    context.setLineDash(lineDash);
    context.shadowBlur = shadowBlur;
    context.shadowColor = withAlpha(cluster.color, 0.44);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(control.x, control.y, end.x, end.y);
    context.stroke();
    context.restore();

    if (state.status === "stabilizing" || state.status === "stabilized" || state.status === "routed") {
      const pulsePoint = quadraticPoint(start, control, end, pulseMap[cluster.id]);
      const pulseRadius =
        state.status === "stabilizing" ? 2 : state.status === "stabilized" ? 2.4 : 2.8;

      context.save();
      context.fillStyle =
        state.status === "stabilizing"
          ? withAlpha(cluster.color, 0.88)
          : "rgba(235, 245, 255, 0.96)";
      context.shadowBlur = state.status === "stabilizing" ? 8 : 12;
      context.shadowColor = withAlpha(cluster.color, 0.55);
      context.beginPath();
      context.arc(pulsePoint.x, pulsePoint.y, pulseRadius, 0, TAU);
      context.fill();
      context.restore();
    }
  }
}

function drawClusterStructures(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  activeClusterId: SignalClusterId | null,
  routeTargetId: SignalClusterId | null,
  carrier: Point2D,
  reducedMotion: boolean,
) {
  const seconds = time * 0.001;

  for (const cluster of signalClusters) {
    const state = stateMap[cluster.id];
    const cx = cluster.x * width;
    const cy = cluster.y * height;
    const isActive = activeClusterId === cluster.id || routeTargetId === cluster.id;

    context.save();

    if (state.status === "dormant") {
      drawRingArc(context, cx, cy, 55, 0, TAU, {
        lineWidth: 0.5,
        strokeStyle: withAlpha(cluster.color, 0.15),
      });
    }

    if (state.status === "acquired" || state.status === "stabilizing") {
      const stability = state.status === "stabilizing" ? state.stability : 0;
      const dashLen = Math.max(3, 8 - stability * 5);
      const baseOpacity = state.status === "acquired" ? 0.2 : lerp(0.25, 0.7, stability);

      if (cluster.temperament === "archive") {
        // Strata rings - concentric layers that breathe
        const breathe = reducedMotion ? 0 : Math.sin(seconds * 0.3) * 4;
        for (let ring = 0; ring < 4; ring++) {
          const r = 35 + ring * 12 + breathe * (ring * 0.3);
          const ringAlpha = baseOpacity * (1 - ring * 0.18);
          drawRingArc(context, cx, cy, r, seconds * (0.08 + ring * 0.04), seconds * (0.08 + ring * 0.04) + Math.PI * (1.2 + ring * 0.15), {
            dash: [dashLen + ring * 2, 4],
            lineWidth: 1.1 - ring * 0.1,
            strokeStyle: withAlpha(cluster.color, ringAlpha),
          });
        }
      } else if (cluster.temperament === "relay") {
        // Vector chevrons pointing toward carrier
        const angle = Math.atan2(carrier.y - cy, carrier.x - cx);
        drawRingArc(context, cx, cy, 48, seconds * -0.12 + 0.4, seconds * -0.12 + Math.PI * 1.36 + 0.4, {
          dash: [dashLen, 4],
          lineWidth: 1,
          strokeStyle: withAlpha(cluster.color, baseOpacity),
        });
        drawRingArc(context, cx, cy, 65, seconds * 0.18, seconds * 0.18 + Math.PI * 1.58, {
          dash: [dashLen, 6],
          lineWidth: 0.9,
          strokeStyle: withAlpha(cluster.color, baseOpacity * 0.7),
        });
        // Chevron tick marks
        for (let i = 0; i < 3; i++) {
          const tickDist = 30 + i * 18;
          const tickAlpha = baseOpacity * (0.6 - i * 0.15);
          const tx = cx + Math.cos(angle) * tickDist;
          const ty = cy + Math.sin(angle) * tickDist;
          context.save();
          context.translate(tx, ty);
          context.rotate(angle);
          context.strokeStyle = withAlpha(cluster.color, tickAlpha);
          context.lineWidth = 0.8;
          context.beginPath();
          context.moveTo(-5, -4);
          context.lineTo(0, 0);
          context.lineTo(-5, 4);
          context.stroke();
          context.restore();
        }
      } else {
        // Ghost: double-stroke offset rings (registration error)
        const offset = reducedMotion ? 2 : 3 + Math.sin(seconds * 1.5) * 1.5;
        drawRingArc(context, cx - offset, cy - offset * 0.6, 52, seconds * 0.22, seconds * 0.22 + Math.PI * 1.42, {
          dash: [dashLen, 4],
          lineWidth: 0.95,
          strokeStyle: withAlpha(cluster.color, baseOpacity * 0.7),
        });
        drawRingArc(context, cx + offset, cy + offset * 0.6, 54, seconds * -0.16 + 0.6, seconds * -0.16 + Math.PI * 1.66 + 0.6, {
          dash: [dashLen, 4],
          lineWidth: 1,
          strokeStyle: withAlpha(cluster.color, baseOpacity),
        });
        // Chromatic fringe ring
        drawRingArc(context, cx + offset * 1.5, cy, 60, seconds * 0.11 + 1.1, seconds * 0.11 + Math.PI * 1.2 + 1.1, {
          dash: [dashLen, 6],
          lineWidth: 0.7,
          strokeStyle: `rgba(180, 130, 230, ${baseOpacity * 0.4})`,
        });
      }
    }

    if (state.status === "stabilized" || state.status === "routed") {
      const coreAlpha = state.status === "routed" ? 0.92 : 0.8;
      const pulseLoop = (time % 2500) / 2500;
      const pulseRadius = lerp(45, 110, pulseLoop);

      context.shadowBlur = 14;
      context.shadowColor = withAlpha(cluster.color, 0.55);

      if (cluster.temperament === "archive") {
        // Solid strata rings
        for (let ring = 0; ring < 3; ring++) {
          const r = 38 + ring * 14;
          drawRingArc(context, cx, cy, r, 0, TAU, {
            lineWidth: 1.3 - ring * 0.2,
            strokeStyle: withAlpha(cluster.color, coreAlpha * (1 - ring * 0.2)),
          });
        }
      } else if (cluster.temperament === "relay") {
        drawRingArc(context, cx, cy, 45, 0, TAU, {
          lineWidth: 1.35,
          strokeStyle: withAlpha(cluster.color, coreAlpha),
        });
        // Stable chevron
        const angle = Math.atan2(carrier.y - cy, carrier.x - cx);
        context.save();
        context.translate(cx, cy);
        context.rotate(angle);
        context.strokeStyle = withAlpha(cluster.color, coreAlpha * 0.7);
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(50, -8);
        context.lineTo(58, 0);
        context.lineTo(50, 8);
        context.stroke();
        context.restore();
      } else {
        // Ghost: locked double-stroke
        const off = 2;
        drawRingArc(context, cx - off, cy - off * 0.5, 43, 0, TAU, {
          lineWidth: 1.2,
          strokeStyle: withAlpha(cluster.color, coreAlpha * 0.8),
        });
        drawRingArc(context, cx + off, cy + off * 0.5, 46, 0, TAU, {
          lineWidth: 1.1,
          strokeStyle: withAlpha(cluster.color, coreAlpha * 0.6),
        });
      }

      context.shadowBlur = 0;
      const ghostLoop = ((time % 2000) / 2000) * 12;
      drawRingArc(context, cx, cy, 68 + ghostLoop, 0, TAU, {
        lineWidth: 0.9,
        strokeStyle: withAlpha(cluster.color, 0.22),
      });
      drawRingArc(context, cx, cy, pulseRadius, 0, TAU, {
        lineWidth: 1,
        strokeStyle: withAlpha(cluster.color, 0.26 * (1 - pulseLoop)),
      });
    }

    drawClusterLabel(context, cluster, state, cx, cy, isActive);
    context.restore();
  }
}

function drawClusterLabel(
  context: CanvasRenderingContext2D,
  cluster: SignalCluster,
  state: ClusterRuntimeState,
  centerX: number,
  centerY: number,
  isActive: boolean,
) {
  const label = cluster.title.toUpperCase();
  const offset = clusterLabelOffsets[cluster.id];
  const x = centerX + offset.x;
  const y = centerY + offset.y;
  const isEngaged = state.status !== "dormant";
  const tracking = isEngaged ? 0.88 : 0.3;
  const textWidth = measureTrackedText(context, label, tracking);
  const brightnessAlpha = isEngaged ? 1 : isActive ? 0.76 : 0.44;

  context.save();
  context.font = "500 11px 'IBM Plex Mono', 'Space Mono', monospace";
  context.textAlign = offset.align;
  context.textBaseline = "middle";
  context.fillStyle = withAlpha(cluster.color, brightnessAlpha);
  context.shadowBlur = isEngaged ? 8 : 0;
  context.shadowColor = withAlpha(cluster.color, 0.18);
  drawTrackedText(context, label, x, y, tracking, offset.align);

  if (state.status === "stabilized" || state.status === "routed") {
    const startX =
      offset.align === "left" ? x : offset.align === "right" ? x - textWidth : x - textWidth / 2;
    const endX = startX + textWidth;

    context.shadowBlur = 0;
    context.strokeStyle = withAlpha(cluster.color, 0.6);
    context.lineWidth = 0.8;
    context.beginPath();
    context.moveTo(startX, y + 9);
    context.lineTo(endX, y + 9);
    context.stroke();
  }

  context.restore();
}

function drawCarrier(
  context: CanvasRenderingContext2D,
  carrier: Point2D,
  time: number,
  pulses: CarrierPulse[],
  accentColor: string,
) {
  const rotation = (time * 0.02) / FRAME_DURATION_MS;

  context.save();

  for (const pulse of pulses) {
    const progress = clamp((time - pulse.startedAt) / 1800, 0, 1);
    const radius = lerp(16, 120, progress);
    const opacity = lerp(0.4, 0, progress);

    context.strokeStyle = withAlpha(pulse.color, opacity);
    context.lineWidth = 1;
    context.beginPath();
    context.arc(carrier.x, carrier.y, radius, 0, TAU);
    context.stroke();
  }

  context.strokeStyle = "rgba(160, 210, 255, 0.6)";
  context.lineWidth = 1;
  context.beginPath();
  context.arc(carrier.x, carrier.y, 10, 0, TAU);
  context.stroke();

  context.strokeStyle = withAlpha(accentColor, 0.9);
  context.lineWidth = 0.8;
  context.shadowBlur = 4;
  context.shadowColor = withAlpha(accentColor, 0.4);
  context.beginPath();
  context.arc(carrier.x, carrier.y, 16, rotation, rotation + Math.PI * 1.5);
  context.stroke();

  context.shadowBlur = 12;
  context.shadowColor = "rgba(160, 210, 255, 0.8)";
  context.fillStyle = "rgba(200, 230, 255, 0.95)";
  context.beginPath();
  context.arc(carrier.x, carrier.y, 4, 0, TAU);
  context.fill();

  context.restore();
}

function drawInterferenceLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  particles: InterferenceParticle[],
  pressureFlickerFramesRemaining: number,
  routedCount: number,
  pressure: number,
) {
  const escalation = 1 + routedCount * 0.4;

  for (const particle of particles) {
    const opacity = clamp(
      (particle.opacityBase + randomBetween(-0.04, 0.04)) * escalation,
      0.02,
      0.24,
    );

    context.fillStyle = `rgba(255, 80, 120, ${opacity})`;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, TAU);
    context.fill();
  }

  // Primary scanline
  const scanY = (time * 0.024) % height;
  const scanAlpha = 0.025 + routedCount * 0.008;
  context.fillStyle = `rgba(180, 220, 255, ${scanAlpha})`;
  context.fillRect(0, scanY, width, 1);

  // Secondary scanlines at higher progress
  if (routedCount >= 2) {
    const scan2Y = (time * 0.016 + height * 0.4) % height;
    context.fillStyle = `rgba(180, 220, 255, ${0.015 + pressure * 0.005})`;
    context.fillRect(0, scan2Y, width, 1);
  }

  if (pressureFlickerFramesRemaining > 0) {
    context.fillStyle = `rgba(255, 60, 100, ${0.012 + routedCount * 0.004})`;
    context.fillRect(0, 0, width, height);
  }

  // Exposure wash at high pressure
  if (pressure > 0.7) {
    const washAlpha = (pressure - 0.7) * 0.04;
    context.fillStyle = `rgba(200, 230, 255, ${washAlpha})`;
    context.fillRect(0, 0, width, height);
  }
}

function drawCompletionEffect(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  carrier: Point2D,
  time: number,
  completionStartTime: number,
) {
  const elapsed = time - completionStartTime;
  if (elapsed < 0 || elapsed > COMPLETION_SHOCKWAVE_MS) return;

  const progress = elapsed / COMPLETION_SHOCKWAVE_MS;
  const maxRadius = Math.max(width, height) * 0.8;

  // Expanding shockwave ring
  const ringRadius = progress * maxRadius;
  const ringAlpha = (1 - progress) * 0.5;
  if (ringAlpha > 0.01) {
    context.save();
    context.strokeStyle = `rgba(200, 230, 255, ${ringAlpha})`;
    context.lineWidth = 2 + (1 - progress) * 4;
    context.shadowBlur = 20;
    context.shadowColor = `rgba(200, 230, 255, ${ringAlpha * 0.6})`;
    context.beginPath();
    context.arc(carrier.x, carrier.y, ringRadius, 0, TAU);
    context.stroke();
    context.restore();
  }

  // Brief lumen flash at start
  if (progress < 0.15) {
    const flashAlpha = (1 - progress / 0.15) * 0.08;
    context.fillStyle = `rgba(220, 240, 255, ${flashAlpha})`;
    context.fillRect(0, 0, width, height);
  }

  // Settled exposure state at end
  if (progress > 0.7) {
    const settleAlpha = ((progress - 0.7) / 0.3) * 0.025;
    context.fillStyle = `rgba(200, 230, 255, ${settleAlpha})`;
    context.fillRect(0, 0, width, height);
  }
}

function resolveCarrierAccentCluster(
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  activeClusterId: SignalClusterId | null,
  routeTargetId: SignalClusterId | null,
) {
  if (routeTargetId) {
    return findCluster(routeTargetId);
  }

  if (activeClusterId && stateMap[activeClusterId].status !== "dormant") {
    return findCluster(activeClusterId);
  }

  return (
    signalClusters.find((cluster) => stateMap[cluster.id].status !== "dormant") ?? null
  );
}

function resolveCarrierPulseCluster(
  stateMap: Record<SignalClusterId, ClusterRuntimeState>,
  routeTargetId: SignalClusterId | null,
) {
  if (routeTargetId) {
    return findCluster(routeTargetId);
  }

  return (
    signalClusters.find((cluster) => {
      const status = stateMap[cluster.id].status;
      return status === "stabilized" || status === "routed";
    }) ?? null
  );
}

function resolveNearbyCluster(
  x: number,
  y: number,
  width: number,
  height: number,
  maxDistance: number,
) {
  let closestCluster: SignalCluster | null = null;
  let closestDistance = maxDistance;

  for (const cluster of signalClusters) {
    const clusterX = cluster.x * width;
    const clusterY = cluster.y * height;
    const distance = Math.hypot(x - clusterX, y - clusterY);

    if (distance <= closestDistance) {
      closestDistance = distance;
      closestCluster = cluster;
    }
  }

  return closestCluster;
}

function resolveParticleColor(
  particle: Particle,
  opacity: number,
  nearbyCluster: SignalCluster | null,
) {
  if (particle.tier === "deep") {
    return `rgba(180, 210, 230, ${opacity})`;
  }

  if (particle.tier === "mid") {
    if (nearbyCluster) {
      return withAlpha(nearbyCluster.color, opacity);
    }

    return `rgba(190, 222, 235, ${opacity})`;
  }

  if (nearbyCluster?.id === "cluster-amber" && particle.tintBias > 0.68) {
    return withAlpha(ARCHIVE_AMBER, opacity);
  }

  return `rgba(160, 220, 255, ${opacity})`;
}

function resolveStatusTagStyle(color: string, status: ClusterStatus) {
  const isDormant = status === "dormant";

  return {
    backgroundColor: isDormant ? "rgba(140, 180, 200, 0.08)" : withAlpha(color, 0.12),
    borderColor: isDormant ? "rgba(140, 180, 200, 0.2)" : withAlpha(color, 0.38),
    color: isDormant ? STATUS_MUTED : color,
  };
}

function resolveQueuePillStyle(color: string, status: ClusterStatus) {
  const isDormant = status === "dormant";
  const isStable = status === "stabilized" || status === "routed";

  return {
    backgroundColor: isDormant
      ? "rgba(140, 180, 200, 0.08)"
      : isStable
        ? withAlpha(color, 0.16)
        : withAlpha(color, 0.1),
    borderColor: isDormant
      ? "rgba(140, 180, 200, 0.16)"
      : isStable
        ? withAlpha(color, 0.56)
        : withAlpha(color, 0.3),
    color: isDormant ? STATUS_MUTED : isStable ? brightenHex(color, 0.24) : color,
  };
}

function drawRingArc(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  options: {
    dash?: number[];
    lineWidth: number;
    strokeStyle: string;
  },
) {
  context.save();
  context.setLineDash(options.dash ?? []);
  context.lineWidth = options.lineWidth;
  context.strokeStyle = options.strokeStyle;
  context.beginPath();
  context.arc(x, y, radius, startAngle, endAngle);
  context.stroke();
  context.restore();
}

function quadraticPoint(start: Point2D, control: Point2D, end: Point2D, t: number) {
  const inverse = 1 - t;

  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
}

function drawTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: CanvasTextAlign,
) {
  const totalWidth = measureTrackedText(context, text, tracking);
  let cursorX = x;

  if (align === "center") {
    cursorX -= totalWidth / 2;
  } else if (align === "right") {
    cursorX -= totalWidth;
  }

  for (const [index, character] of Array.from(text).entries()) {
    context.fillText(character, cursorX, y);
    cursorX += context.measureText(character).width;

    if (index < text.length - 1) {
      cursorX += tracking;
    }
  }
}

function measureTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  tracking: number,
) {
  const characters = Array.from(text);

  return characters.reduce((width, character, index) => {
    const nextWidth = width + context.measureText(character).width;
    return index < characters.length - 1 ? nextWidth + tracking : nextWidth;
  }, 0);
}

function distanceToSegment(
  pointX: number,
  pointY: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(pointX - startX, pointY - startY);
  }

  const t = Math.max(
    0,
    Math.min(1, ((pointX - startX) * dx + (pointY - startY) * dy) / lengthSquared),
  );
  const projectionX = startX + t * dx;
  const projectionY = startY + t * dy;

  return Math.hypot(pointX - projectionX, pointY - projectionY);
}

function parseHexColor(color: string) {
  const normalized = color.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : normalized;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return { blue, green, red };
}

function withAlpha(color: string, alpha: number) {
  const { blue, green, red } = parseHexColor(color);
  return `rgba(${red}, ${green}, ${blue}, ${clamp(alpha, 0, 1)})`;
}

function brightenHex(color: string, amount: number) {
  const { blue, green, red } = parseHexColor(color);
  return `rgb(${Math.round(lerp(red, 255, amount))}, ${Math.round(lerp(green, 255, amount))}, ${Math.round(lerp(blue, 255, amount))})`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomClusterId() {
  return signalClusters[Math.floor(Math.random() * signalClusters.length)].id;
}
