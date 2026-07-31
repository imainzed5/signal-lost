"use client";

import type { BootLineTone } from "@/chapters/Chapter0Boot/script";

export type BootAudioStatus = "standby" | "active" | "unavailable";
type BootTypingVariant = "opening" | "terminal";

export type BootAudioController = {
  activate: () => void;
  dispose: () => void;
  playGlitchRise: () => void;
  playAdvance: () => void;
  playCompletion: () => void;
  playInterferenceBurst: () => void;
  playLineResolved: (tone: BootLineTone, variant?: BootTypingVariant) => void;
  playLineStart: (
    tone: BootLineTone,
    content: string,
    variant?: BootTypingVariant,
  ) => void;
  playSkip: (tone: BootLineTone) => void;
  startWarningPulse: () => void;
  stopWarningPulse: () => void;
  setAmbientLevel: (value: number) => void;
};

type BootAudioRuntime = {
  ambientGain: GainNode;
  context: AudioContext;
  drone: OscillatorNode;
  harmonic: OscillatorNode;
  master: GainNode;
  noiseBuffer: AudioBuffer;
  noiseSource: AudioBufferSourceNode;
  wobble: OscillatorNode;
  wobbleDepth: GainNode;
};

export function createBootAudioController(
  onStatusChange?: (status: BootAudioStatus) => void,
): BootAudioController {
  let runtime: BootAudioRuntime | null = null;
  let isActivated = false;
  let status: BootAudioStatus = "standby";
  let typingTimeouts: number[] = [];
  let completionTimeouts: number[] = [];
  let warningPulseInterval: number | null = null;

  function setStatus(nextStatus: BootAudioStatus) {
    if (status === nextStatus) {
      return;
    }

    status = nextStatus;
    onStatusChange?.(nextStatus);
  }

  function ensureRuntime() {
    if (runtime) {
      void runtime.context.resume();
      return runtime;
    }

    const AudioContextConstructor = window.AudioContext;

    if (!AudioContextConstructor) {
      setStatus("unavailable");
      return null;
    }

    try {
      const context = new AudioContextConstructor();
      const ambientGain = context.createGain();
      const drone = context.createOscillator();
      const harmonic = context.createOscillator();
      const master = context.createGain();
      const noiseSource = context.createBufferSource();
      const noiseGain = context.createGain();
      const noiseFilter = context.createBiquadFilter();
      const noiseBuffer = createNoiseBuffer(context);
      const lowpass = context.createBiquadFilter();
      const wobble = context.createOscillator();
      const wobbleDepth = context.createGain();

      master.gain.value = 0.18;
      master.connect(context.destination);

      ambientGain.gain.value = 0.0001;
      ambientGain.connect(master);

      lowpass.type = "lowpass";
      lowpass.frequency.value = 580;
      lowpass.Q.value = 0.85;
      lowpass.connect(ambientGain);

      drone.type = "triangle";
      drone.frequency.value = 58;
      drone.detune.value = -7;
      drone.connect(lowpass);

      harmonic.type = "sine";
      harmonic.frequency.value = 116;
      harmonic.detune.value = 3;
      harmonic.connect(lowpass);

      wobble.type = "sine";
      wobble.frequency.value = 0.14;
      wobbleDepth.gain.value = 5;
      wobble.connect(wobbleDepth);
      wobbleDepth.connect(drone.detune);

      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 820;
      noiseFilter.Q.value = 0.22;
      noiseGain.gain.value = 0.0038;
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ambientGain);

      drone.start();
      harmonic.start();
      wobble.start();
      noiseSource.start();
      void context.resume();

      ambientGain.gain.setTargetAtTime(0.028, context.currentTime, 1.6);

      runtime = {
        ambientGain,
        context,
        drone,
        harmonic,
        master,
        noiseBuffer,
        noiseSource,
        wobble,
        wobbleDepth,
      };
      setStatus("active");

      return runtime;
    } catch {
      setStatus("unavailable");
      return null;
    }
  }

  function clearTypingLoop() {
    for (const timeoutId of typingTimeouts) {
      window.clearTimeout(timeoutId);
    }

    typingTimeouts = [];
  }

  function clearCompletionTimers() {
    for (const timeoutId of completionTimeouts) {
      window.clearTimeout(timeoutId);
    }

    completionTimeouts = [];
  }

  function clearWarningPulse() {
    if (warningPulseInterval !== null) {
      window.clearInterval(warningPulseInterval);
      warningPulseInterval = null;
    }
  }

  function emitPulse(
    activeRuntime: BootAudioRuntime,
    options: {
      attack?: number;
      duration?: number;
      endFrequency?: number;
      startFrequency: number;
      type: OscillatorType;
      volume: number;
    },
  ) {
    const attack = options.attack ?? 0.004;
    const duration = options.duration ?? 0.12;
    const oscillator = activeRuntime.context.createOscillator();
    const gain = activeRuntime.context.createGain();
    const filter = activeRuntime.context.createBiquadFilter();
    const now = activeRuntime.context.currentTime;
    const releaseTime = duration + attack;

    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(options.startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(options.endFrequency ?? options.startFrequency, 40),
      now + duration,
    );

    filter.type = "lowpass";
    filter.frequency.value = 4200;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(options.volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(activeRuntime.master);

    oscillator.start(now);
    oscillator.stop(now + releaseTime + 0.04);
  }

  function emitNoiseBurst(
    activeRuntime: BootAudioRuntime,
    options: {
      duration?: number;
      frequency: number;
      q?: number;
      volume: number;
    },
  ) {
    const duration = options.duration ?? 0.05;
    const source = activeRuntime.context.createBufferSource();
    const filter = activeRuntime.context.createBiquadFilter();
    const gain = activeRuntime.context.createGain();
    const now = activeRuntime.context.currentTime;

    source.buffer = activeRuntime.noiseBuffer;
    filter.type = "bandpass";
    filter.frequency.value = options.frequency;
    filter.Q.value = options.q ?? 1.4;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(options.volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(activeRuntime.master);

    source.start(now);
    source.stop(now + duration + 0.02);
  }

  function playTypingTick(
    activeRuntime: BootAudioRuntime,
    tone: BootLineTone,
    variant: BootTypingVariant,
  ) {
    const isOpening = variant === "opening";

    emitPulse(activeRuntime, {
      attack: 0.001,
      duration: isOpening ? 0.015 : 0.02,
      endFrequency:
        tone === "warning"
          ? isOpening
            ? 1510
            : 1580
          : tone === "sable"
            ? isOpening
              ? 1320
              : 1380
            : isOpening
              ? 1390
              : 1450,
      startFrequency:
        tone === "warning"
          ? isOpening
            ? 1730
            : 1840
          : tone === "sable"
            ? isOpening
              ? 1450
              : 1540
            : isOpening
              ? 1560
              : 1660,
      type: "square",
      volume:
        tone === "warning"
          ? isOpening
            ? 0.033
            : 0.048
          : tone === "sable"
            ? isOpening
              ? 0.029
              : 0.042
            : isOpening
              ? 0.03
              : 0.045,
    });
    emitNoiseBurst(activeRuntime, {
      duration: isOpening ? 0.016 : 0.02,
      frequency:
        tone === "warning"
          ? isOpening
            ? 2120
            : 2240
          : tone === "sable"
            ? isOpening
            ? 1860
              : 1980
            : isOpening
              ? 1960
              : 2080,
      q: isOpening ? 3.2 : 3.8,
      volume: tone === "warning" ? (isOpening ? 0.017 : 0.027) : isOpening ? 0.016 : 0.024,
    });
    emitPulse(activeRuntime, {
      attack: 0.001,
      duration: isOpening ? 0.009 : 0.012,
      endFrequency:
        tone === "warning"
          ? isOpening
            ? 1050
            : 1120
          : tone === "sable"
            ? isOpening
              ? 920
              : 980
            : isOpening
              ? 980
              : 1040,
      startFrequency:
        tone === "warning"
          ? isOpening
            ? 1240
            : 1340
          : tone === "sable"
            ? isOpening
            ? 1100
              : 1180
            : isOpening
              ? 1160
              : 1240,
      type: "square",
      volume: tone === "warning" ? (isOpening ? 0.016 : 0.024) : isOpening ? 0.014 : 0.022,
    });
  }

  function playToneSignature(activeRuntime: BootAudioRuntime, tone: BootLineTone) {
    if (tone === "warning") {
      emitPulse(activeRuntime, {
        duration: 0.085,
        endFrequency: 216,
        startFrequency: 312,
        type: "sawtooth",
        volume: 0.026,
      });
      emitNoiseBurst(activeRuntime, {
        duration: 0.06,
        frequency: 1760,
        volume: 0.016,
      });
      return;
    }

    if (tone === "sable") {
      emitPulse(activeRuntime, {
        duration: 0.12,
        endFrequency: 352,
        startFrequency: 292,
        type: "sine",
        volume: 0.018,
      });
      return;
    }

    emitPulse(activeRuntime, {
      duration: 0.05,
      endFrequency: 430,
      startFrequency: 520,
      type: "triangle",
      volume: 0.012,
    });
  }

  function startTypingLoop(
    activeRuntime: BootAudioRuntime,
    tone: BootLineTone,
    content: string,
    variant: BootTypingVariant,
  ) {
    clearTypingLoop();

    const sanitizedLength = content.replace(/\s+/g, "").length;
    const tickCount =
      variant === "opening"
        ? Math.max(3, Math.min(Math.ceil(sanitizedLength * 0.55), 16))
        : Math.max(4, Math.min(sanitizedLength, 30));
    const typingDuration =
      variant === "opening"
        ? Math.min(Math.max(content.length * 24, 620), 1600)
        : Math.min(Math.max(content.length * 38, 900), 2900);
    const cadence = typingDuration / tickCount;

    for (let index = 0; index < tickCount; index += 1) {
      const timeoutId = window.setTimeout(() => {
        playTypingTick(activeRuntime, tone, variant);
      }, Math.round(index * cadence));

      typingTimeouts.push(timeoutId);
    }
  }

  return {
    activate() {
      isActivated = true;
      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      activeRuntime.ambientGain.gain.setTargetAtTime(
        0.028,
        activeRuntime.context.currentTime,
        1.2,
      );
    },

    dispose() {
      clearTypingLoop();
      clearCompletionTimers();
      clearWarningPulse();

      if (!runtime) {
        return;
      }

      const activeRuntime = runtime;

      isActivated = false;
      runtime = null;
      activeRuntime.ambientGain.gain.setTargetAtTime(
        0.0001,
        activeRuntime.context.currentTime,
        0.2,
      );
      activeRuntime.drone.stop(activeRuntime.context.currentTime + 0.4);
      activeRuntime.harmonic.stop(activeRuntime.context.currentTime + 0.4);
      activeRuntime.wobble.stop(activeRuntime.context.currentTime + 0.4);
      activeRuntime.noiseSource.stop(activeRuntime.context.currentTime + 0.4);
      void activeRuntime.context.close();
      setStatus("standby");
    },

    playGlitchRise() {
      if (!isActivated) {
        return;
      }

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      emitNoiseBurst(activeRuntime, {
        duration: 0.18,
        frequency: 1480,
        q: 1.9,
        volume: 0.016,
      });
      emitPulse(activeRuntime, {
        attack: 0.006,
        duration: 0.16,
        startFrequency: 242,
        endFrequency: 496,
        type: "sawtooth",
        volume: 0.012,
      });
    },

    playAdvance() {
      if (!isActivated) {
        return;
      }

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      emitPulse(activeRuntime, {
        duration: 0.045,
        endFrequency: 630,
        startFrequency: 740,
        type: "square",
        volume: 0.013,
      });
    },

    playCompletion() {
      if (!isActivated) {
        return;
      }

      clearTypingLoop();

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      emitPulse(activeRuntime, {
        attack: 0.012,
        duration: 0.3,
        endFrequency: 220,
        startFrequency: 168,
        type: "triangle",
        volume: 0.03,
      });
      const secondaryPulseTimeout = window.setTimeout(() => {
        emitPulse(activeRuntime, {
          attack: 0.01,
          duration: 0.38,
          endFrequency: 464,
          startFrequency: 344,
          type: "sine",
          volume: 0.028,
        });
      }, 90);
      completionTimeouts.push(secondaryPulseTimeout);
      activeRuntime.ambientGain.gain.setTargetAtTime(
        0.0001,
        activeRuntime.context.currentTime,
        0.9,
      );
    },

    playInterferenceBurst() {
      if (!isActivated) {
        return;
      }

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      emitNoiseBurst(activeRuntime, {
        duration: 0.055,
        frequency: 2360,
        q: 2.4,
        volume: 0.016,
      });
      emitPulse(activeRuntime, {
        attack: 0.001,
        duration: 0.03,
        startFrequency: 980,
        endFrequency: 620,
        type: "square",
        volume: 0.01,
      });
    },

    playLineResolved(tone, variant = "terminal") {
      if (!isActivated) {
        return;
      }

      clearTypingLoop();

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      if (tone === "warning") {
        emitNoiseBurst(activeRuntime, {
          duration: variant === "opening" ? 0.045 : 0.06,
          frequency: variant === "opening" ? 1080 : 960,
          q: variant === "opening" ? 1.1 : 0.8,
          volume: variant === "opening" ? 0.008 : 0.012,
        });
        return;
      }

      if (tone === "sable") {
        emitPulse(activeRuntime, {
          attack: 0.008,
          duration: variant === "opening" ? 0.09 : 0.12,
          endFrequency: variant === "opening" ? 452 : 482,
          startFrequency: variant === "opening" ? 404 : 428,
          type: "sine",
          volume: variant === "opening" ? 0.009 : 0.012,
        });
        return;
      }

      emitPulse(activeRuntime, {
        duration: variant === "opening" ? 0.04 : 0.05,
        endFrequency: variant === "opening" ? 490 : 520,
        startFrequency: variant === "opening" ? 530 : 560,
        type: "triangle",
        volume: variant === "opening" ? 0.006 : 0.008,
      });
    },

    playLineStart(tone, content, variant = "terminal") {
      if (!isActivated) {
        return;
      }

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      playToneSignature(activeRuntime, tone);
      startTypingLoop(activeRuntime, tone, content, variant);
    },

    playSkip(tone) {
      if (!isActivated) {
        return;
      }

      clearTypingLoop();
      clearWarningPulse();

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      emitNoiseBurst(activeRuntime, {
        duration: 0.045,
        frequency: tone === "warning" ? 2100 : 1650,
        q: 2.2,
        volume: 0.018,
      });
      emitPulse(activeRuntime, {
        duration: 0.04,
        endFrequency: tone === "sable" ? 410 : 350,
        startFrequency: tone === "sable" ? 520 : 470,
        type: "square",
        volume: 0.012,
      });
    },

    startWarningPulse() {
      if (!isActivated) {
        return;
      }

      const activeRuntime = ensureRuntime();

      if (!activeRuntime || warningPulseInterval !== null) {
        return;
      }

      const playPulse = () => {
        emitPulse(activeRuntime, {
          attack: 0.004,
          duration: 0.11,
          startFrequency: 168,
          endFrequency: 146,
          type: "triangle",
          volume: 0.009,
        });
      };

      playPulse();
      warningPulseInterval = window.setInterval(playPulse, 860);
    },

    stopWarningPulse() {
      clearWarningPulse();
    },

    setAmbientLevel(value) {
      if (!isActivated) {
        return;
      }

      const activeRuntime = ensureRuntime();

      if (!activeRuntime) {
        return;
      }

      activeRuntime.ambientGain.gain.setTargetAtTime(
        Math.max(value, 0.0001),
        activeRuntime.context.currentTime,
        0.6,
      );
    },
  };
}

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * 0.85;
  }

  return buffer;
}
