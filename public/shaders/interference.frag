#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// INTERFERENCE — "corridors, not walls".
// The host is a set of emitters whose waves stack into pressure bands and cancel
// into dark corridors. The field breathes; SABLE (the ember core) strikes through
// the corridors on the out-breath and cracks the authored fault, one segment per unit.

uniform vec2 u_resolution;
uniform float u_time;       // field time (freezes on rupture hit-stop)
uniform float u_frame;      // real time, grain only
uniform float u_open;       // 0 = in-breath (pressure), 1 = out-breath (corridors)
uniform float u_pressure;   // stage 0..3
uniform float u_units;      // resistance units 0..8
uniform float u_assist;     // corridors widened after repeated misses
uniform float u_reduced;
uniform float u_rupture;    // 0..1 fault tearing open
uniform float u_seed;
uniform float u_signal;
uniform vec2 u_emit[4];
uniform vec4 u_pulse;       // target xy, age (s, <0 none), absorbed
uniform float u_hit;        // strike flash, decays
uniform vec3 u_ghost[6];    // host copies of absorbed strikes: xy, strength
uniform float u_ghostShape; // 0 ring (contact), 1 card (memory)
uniform float u_preview;    // -1 slip .. +1 push (smoothed)
uniform float u_commit;     // aftermath progress 0..1
uniform float u_commitKind; // +1 push, -1 slip

const vec3 STEEL = vec3(0.56, 0.72, 0.83);
const vec3 ALARM = vec3(1.0, 0.43, 0.5);
const vec3 EMBER = vec3(1.0, 0.61, 0.37);
const vec3 HOT = vec3(1.0, 0.88, 0.76);

float hash21(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float segmentDistance(vec2 point, vec2 start, vec2 end) {
  vec2 direction = end - start;
  float projection = clamp(dot(point - start, direction) / max(dot(direction, direction), 1e-5), 0.0, 1.0);
  return length(point - (start + direction * projection));
}

// Signed interference sum of the host emitters.
float waveSum(vec2 point) {
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    float distanceToEmitter = length(point - u_emit[i]);
    float phase = float(i) * 1.7 + u_seed * 6.2831;
    sum += sin(distanceToEmitter * 62.0 - u_time * 2.6 + phase) / (0.7 + distanceToEmitter * 1.4);
  }
  return sum * 0.55;
}

float bandsAt(vec2 point, float amplitude) {
  float crest = smoothstep(0.35, 1.05, abs(waveSum(point)) * amplitude);
  return crest * crest;
}

// One lit crack segment; lit grows the segment from its start.
void crack(vec2 point, vec2 start, vec2 end, float lit, inout float nearest) {
  if (lit <= 0.0) return;
  vec2 tip = mix(start, end, clamp(lit, 0.0, 1.0));
  nearest = min(nearest, segmentDistance(point, start, tip));
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 point = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float open = clamp(u_open, 0.0, 1.0);
  float inhale = 1.0 - open;
  float push = max(u_preview, 0.0) + (u_commitKind > 0.0 ? u_commit : 0.0);
  float slip = max(-u_preview, 0.0) + (u_commitKind < 0.0 ? u_commit : 0.0);

  // SABLE's core; on SLIP it slides down the fault toward the far end and compresses.
  vec2 coreCenter = mix(vec2(0.0), vec2(0.34, -0.21), (u_commitKind < 0.0 ? u_commit : 0.0));
  vec2 fromCore = point - coreCenter;
  float coreRadius = length(fromCore);

  // PUSH bows the field outward around her.
  vec2 fieldPoint = point + normalize(fromCore + 1e-4) * push * 0.09 * exp(-coreRadius * 2.4);

  // --- host field -----------------------------------------------------------
  float amplitude = mix(1.08, 0.74, open) + u_pressure * 0.05;
  float chroma = u_hit * 0.012 * (1.0 - u_reduced);
  vec3 bands = vec3(bandsAt(fieldPoint, amplitude));
  if (chroma > 0.0005) {
    bands.r = bandsAt(fieldPoint + vec2(chroma, 0.0), amplitude);
    bands.b = bandsAt(fieldPoint - vec2(chroma, 0.0), amplitude);
  }

  float membraneRadius = 0.2 + open * 0.03 + u_assist * 0.035 - slip * 0.05;
  // Her pocket of clarity: the host's bands thin inside the membrane.
  bands *= mix(0.25, 1.0, smoothstep(membraneRadius * 0.6, membraneRadius * 1.15, coreRadius));

  float corridorWidth = 0.04 + open * 0.05 + u_assist * 0.06;
  float corridor = (1.0 - smoothstep(0.0, corridorWidth, abs(waveSum(fieldPoint)))) * open;

  // In-breath: a pressure front sweeps inward from the frame edges.
  float frontRadius = mix(1.0, 0.26, inhale);
  float front = smoothstep(0.035, 0.0, abs(length(point * vec2(0.85, 1.25)) - frontRadius)) * inhale * (1.0 - u_reduced);

  float alarmMix = clamp(u_pressure / 3.0, 0.0, 1.0) * (0.35 + inhale * 0.65);
  vec3 hostColor = mix(STEEL, ALARM, alarmMix * 0.85);

  vec3 color = vec3(0.006, 0.008, 0.013);
  color += hostColor * bands * (0.13 + inhale * 0.13);
  color += hostColor * front * 0.42;
  // Out-breath: SABLE reads the openings; the corridors trace warm.
  color += mix(vec3(0.7, 0.66, 0.62), EMBER, 0.45 + u_assist * 0.55) * corridor * (0.1 + u_assist * 0.06);

  // Emitters: the host's sources, small hard steel points.
  for (int i = 0; i < 4; i++) {
    float emitterDistance = length(point - u_emit[i]);
    color += hostColor * (0.0018 / (emitterDistance * emitterDistance + 0.0018)) * 0.35;
    color += hostColor * smoothstep(0.0025, 0.0, abs(emitterDistance - 0.03 - inhale * 0.012)) * 0.4;
  }

  // Containment membrane around the core.
  float membrane = smoothstep(0.0035, 0.0, abs(coreRadius - membraneRadius));
  color += hostColor * membrane * (0.12 + inhale * 0.3) * (1.0 - u_rupture * 0.7);

  // --- host copies of her (absorbed strikes) --------------------------------
  for (int i = 0; i < 6; i++) {
    vec3 ghost = u_ghost[i];
    if (ghost.z > 0.001) {
      vec2 offset = point - ghost.xy;
      float size = 0.026 + inhale * 0.006;
      float ring = abs(length(offset) - size);
      float card = abs(max(abs(offset.x) * 0.8, abs(offset.y)) - size);
      float outline = mix(ring, card, u_ghostShape);
      vec3 ghostColor = mix(STEEL, ALARM, slip * 0.8);
      color += ghostColor * smoothstep(0.003, 0.0, outline) * ghost.z * 0.75;
      color += ghostColor * exp(-dot(offset, offset) * 900.0) * ghost.z * 0.12;
      // SLIP: the host's containment closes on the decoys instead of her.
      float closing = abs(length(offset) - mix(0.32, size, clamp(slip, 0.0, 1.0)));
      color += ALARM * smoothstep(0.004, 0.0, closing) * slip * ghost.z * 0.5;
    }
  }

  // --- the fault: eight segments, one per resistance unit ---------------------
  float nearest = 10.0;
  vec2 f0 = vec2(-0.62, 0.28);
  vec2 f1 = vec2(-0.412, 0.172);
  vec2 f2 = vec2(-0.204, 0.064);
  vec2 f3 = vec2(0.004, -0.044);
  vec2 f4 = vec2(0.212, -0.152);
  vec2 f5 = vec2(0.42, -0.26);
  crack(point, f3, f2, u_units, nearest);
  crack(point, f3, f4, u_units - 1.0, nearest);
  crack(point, vec2(-0.12, -0.02), vec2(-0.34, -0.32), u_units - 2.0, nearest);
  crack(point, f2, f1, u_units - 3.0, nearest);
  crack(point, vec2(0.06, -0.08), vec2(0.42, 0.32), u_units - 4.0, nearest);
  crack(point, f4, f5, u_units - 5.0, nearest);
  crack(point, vec2(0.21, -0.16), vec2(0.56, -0.03), u_units - 6.0, nearest);
  crack(point, f1, f0, u_units - 7.0, nearest);

  float crackWidth = 0.0018 + u_rupture * 0.005 + push * 0.002;
  float crackCore = smoothstep(crackWidth, crackWidth * 0.3, nearest);
  float crackGlow = exp(-nearest * 90.0);
  float crackBloom = exp(-nearest * 26.0);
  color += HOT * crackCore * (1.0 + u_rupture * 0.8);
  color += EMBER * crackGlow * (0.2 + u_units * 0.015 + u_rupture * 0.25);
  color += EMBER * crackBloom * u_rupture * 0.07;
  // The rupture pushes the host's bands back from the tear.
  color = mix(color, color * smoothstep(0.0, 0.14, nearest), u_rupture * 0.6);

  // --- strike pulse -----------------------------------------------------------
  if (u_pulse.z >= 0.0) {
    float travel = clamp(u_pulse.z / 0.42, 0.0, 1.0);
    float eased = 1.0 - pow(1.0 - travel, 3.0);
    vec2 head = u_pulse.xy * eased;
    float fade = 1.0 - smoothstep(0.42, 1.3, u_pulse.z);
    float trail = segmentDistance(point, head * 0.45, head);
    vec3 pulseColor = mix(EMBER, STEEL, u_pulse.w * travel);
    color += pulseColor * smoothstep(0.004, 0.0, trail) * 0.6 * fade;
    color += HOT * exp(-dot(point - head, point - head) * 3200.0) * fade * 1.2;
    float after = max(u_pulse.z - 0.42, 0.0);
    if (after > 0.0) {
      float impact = length(point - u_pulse.xy);
      // Landed: an ember ring blooms outward. Absorbed: a steel ring swallows it.
      float radius = mix(after * 0.55, max(0.11 - after * 0.22, 0.0), u_pulse.w);
      float ring = smoothstep(0.004, 0.0, abs(impact - radius)) * (1.0 - smoothstep(0.0, 0.7, after));
      color += mix(EMBER, STEEL, u_pulse.w) * ring * 0.8;
    }
  }

  // --- SABLE: the core as light ------------------------------------------------
  float coreScale = max(0.2, 1.0 + push * 0.6 - slip * 0.62);
  float scaledRadius = coreRadius / coreScale;
  float nucleus = exp(-scaledRadius * scaledRadius * 5200.0);
  float halo = exp(-scaledRadius * scaledRadius * 80.0);
  float coreRing = smoothstep(0.0028, 0.0, abs(scaledRadius - 0.036));
  float breathing = 1.0 + 0.08 * sin(u_frame * 1.4) * (1.0 - u_reduced);
  color += HOT * nucleus * 1.6;
  color += EMBER * halo * (0.3 + u_units * 0.02 + push * 0.25) * breathing;
  color += EMBER * coreRing * 0.55;
  float streak = exp(-abs(fromCore.y) * 420.0) * exp(-abs(fromCore.x) * (2.4 + slip * 6.0));
  color += mix(STEEL, HOT, exp(-abs(fromCore.x) * 5.0)) * streak * 0.55 * coreScale;

  // --- aftermath ---------------------------------------------------------------
  if (u_commitKind > 0.0) {
    float shock = smoothstep(0.03, 0.0, abs(coreRadius - u_commit * 1.5)) * (1.0 - u_commit);
    color += EMBER * shock * 1.2;
    color += EMBER * 0.08 * (1.0 - smoothstep(0.0, u_commit * 1.4 + 0.01, coreRadius)) * u_commit;
  }
  color += HOT * u_hit * 0.035;

  // Film response, vignette, fine per-pixel grain.
  color = 1.0 - exp(-color * 1.35);
  float vignette = smoothstep(1.25, 0.3, length((uv - 0.5) * vec2(1.25, 1.0)));
  color *= mix(0.55, 1.0, vignette);
  float grainTime = floor(u_frame * 24.0) * (1.0 - u_reduced);
  float grain = hash21(gl_FragCoord.xy + vec2(grainTime * 17.0, grainTime * 31.0) + u_seed * 100.0) - 0.5;
  color += grain * 0.045;

  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
