"use client";

/**
 * Synthesized interface sound for the shell. No assets: every cue is built
 * from oscillators and filtered noise so it stays tiny and tunable. The
 * context is only created after a user gesture, and every call is a silent
 * no-op when audio is unavailable, blocked, or disabled.
 */

const STORAGE_KEY = "signal-lost:interface-sound";
const MASTER_LEVEL = 0.32;

type SoundState = {
  context: AudioContext | null;
  master: GainNode | null;
  noise: AudioBuffer | null;
  enabled: boolean;
  lastHoverAt: number;
};

const state: SoundState = {
  context: null,
  master: null,
  noise: null,
  enabled: true,
  lastHoverAt: 0,
};

let primed = false;

export function primeInterfaceSound() {
  if (primed || typeof window === "undefined") {
    return;
  }

  primed = true;

  try {
    state.enabled = window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    state.enabled = true;
  }

  const unlock = () => {
    ensureContext();
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };

  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

export function isInterfaceSoundEnabled() {
  return state.enabled;
}

export function setInterfaceSoundEnabled(enabled: boolean) {
  state.enabled = enabled;

  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Preference simply won't persist.
  }
}

/** A glassy tick for hover and focus. Rate-limited so sweeps don't chatter. */
export function playHover() {
  const now = performance.now();

  if (now - state.lastHoverAt < 45) {
    return;
  }

  state.lastHoverAt = now;
  withContext((context, master, time) => {
    const pitch = 2100 + Math.random() * 500;
    tone(context, master, time, { type: "sine", from: pitch, to: pitch * 1.18, duration: 0.05, level: 0.05 });
    tone(context, master, time, { type: "triangle", from: pitch / 2, to: pitch / 2, duration: 0.03, level: 0.02 });
  });
}

/** A weighted confirm: low thump under a bright click. */
export function playPress() {
  withContext((context, master, time) => {
    tone(context, master, time, { type: "sine", from: 150, to: 48, duration: 0.22, level: 0.34 });
    tone(context, master, time, { type: "square", from: 1400, to: 900, duration: 0.03, level: 0.04 });
    noiseBurst(context, master, time, { duration: 0.06, level: 0.09, filter: 3200, q: 0.8 });
  });
}

/** SABLE answering a touch on the void: sub boom and a detuned shimmer. */
export function playPulse(strength = 1) {
  withContext((context, master, time) => {
    tone(context, master, time, { type: "sine", from: 90, to: 32, duration: 0.9, level: 0.38 * strength });
    tone(context, master, time, { type: "sine", from: 660, to: 640, duration: 1.1, level: 0.05 * strength, attack: 0.02 });
    tone(context, master, time, { type: "sine", from: 663, to: 651, duration: 1.1, level: 0.05 * strength, attack: 0.02 });
    noiseBurst(context, master, time, { duration: 0.35, level: 0.05 * strength, filter: 900, q: 1.4, sweepTo: 180 });
  });
}

/** The frame folding shut: a falling filtered rush into a hard stop. */
export function playShutterClose() {
  withContext((context, master, time) => {
    noiseBurst(context, master, time, { duration: 0.42, level: 0.16, filter: 5200, q: 1.2, sweepTo: 260 });
    tone(context, master, time + 0.38, { type: "sine", from: 110, to: 40, duration: 0.18, level: 0.3 });
  });
}

/** The seam igniting and the lids parting: a rising bright tone. */
export function playShutterOpen() {
  withContext((context, master, time) => {
    tone(context, master, time, { type: "sawtooth", from: 220, to: 880, duration: 0.5, level: 0.03, filter: 2400 });
    tone(context, master, time, { type: "sine", from: 1760, to: 1760, duration: 0.7, level: 0.035, attack: 0.05 });
    noiseBurst(context, master, time + 0.22, { duration: 0.8, level: 0.07, filter: 600, q: 0.7, sweepTo: 6000 });
  });
}

/** The title cold open: a slow ember ignition. */
export function playIgnite() {
  withContext((context, master, time) => {
    tone(context, master, time, { type: "sine", from: 55, to: 55, duration: 2.4, level: 0.22, attack: 0.9 });
    tone(context, master, time + 0.4, { type: "triangle", from: 440, to: 880, duration: 1.6, level: 0.025, attack: 0.6 });
    noiseBurst(context, master, time + 0.1, { duration: 1.8, level: 0.04, filter: 400, q: 2, sweepTo: 3200 });
  });
}

function withContext(play: (context: AudioContext, master: GainNode, time: number) => void) {
  if (!state.enabled) {
    return;
  }

  const context = state.context;
  const master = state.master;

  if (!context || !master || context.state !== "running") {
    return;
  }

  try {
    play(context, master, context.currentTime + 0.005);
  } catch {
    // Audio is decoration; never let it break interaction.
  }
}

function ensureContext() {
  if (state.context) {
    void state.context.resume().catch(() => undefined);
    return;
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {
    const context = new AudioContextClass();
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    master.gain.value = MASTER_LEVEL;
    compressor.threshold.value = -18;
    compressor.ratio.value = 4;
    master.connect(compressor);
    compressor.connect(context.destination);

    const length = Math.floor(context.sampleRate * 1.5);
    const noise = context.createBuffer(1, length, context.sampleRate);
    const channel = noise.getChannelData(0);

    for (let index = 0; index < length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }

    state.context = context;
    state.master = master;
    state.noise = noise;
    void context.resume().catch(() => undefined);
  } catch {
    state.context = null;
  }
}

type ToneOptions = {
  type: OscillatorType;
  from: number;
  to: number;
  duration: number;
  level: number;
  attack?: number;
  filter?: number;
};

function tone(context: AudioContext, destination: AudioNode, time: number, options: ToneOptions) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = options.attack ?? 0.004;

  oscillator.type = options.type;
  oscillator.frequency.setValueAtTime(options.from, time);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.to), time + options.duration);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(options.level, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + options.duration);

  if (options.filter) {
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = options.filter;
    oscillator.connect(filter);
    filter.connect(gain);
  } else {
    oscillator.connect(gain);
  }

  gain.connect(destination);
  oscillator.start(time);
  oscillator.stop(time + options.duration + 0.05);
}

type NoiseOptions = {
  duration: number;
  level: number;
  filter: number;
  q: number;
  sweepTo?: number;
};

function noiseBurst(context: AudioContext, destination: AudioNode, time: number, options: NoiseOptions) {
  if (!state.noise) {
    return;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = state.noise;
  filter.type = "bandpass";
  filter.Q.value = options.q;
  filter.frequency.setValueAtTime(options.filter, time);

  if (options.sweepTo) {
    filter.frequency.exponentialRampToValueAtTime(options.sweepTo, time + options.duration);
  }

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(options.level, time + Math.min(0.02, options.duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + options.duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(time, Math.random() * 0.5);
  source.stop(time + options.duration + 0.05);
}
