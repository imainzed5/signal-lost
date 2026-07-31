#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;
uniform float u_stage;
uniform float u_resistance;
uniform float u_intro;
uniform float u_settled;

// New mechanic uniforms
uniform float u_scanPhase;
uniform float u_scanCount;
uniform vec2  u_fracturePos;
uniform float u_fractureIntensity;
uniform float u_counterPulse;
uniform float u_deflectWindow;
uniform float u_rupture;
uniform float u_ruptureProgress;
uniform vec2  u_ruptureOrigin;
uniform float u_pulseWindow;
uniform float u_absorbed;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
    (c - a) * u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(st);
    st *= 2.1;
    amplitude *= 0.52;
  }

  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

  float time = u_time * 0.18;
  float radial = length(centeredUv);
  float angle = atan(centeredUv.y, centeredUv.x);
  float stage = clamp(u_stage, 0.0, 3.0);
  float resist = clamp(u_resistance, 0.0, 1.0);
  float intensity = clamp(u_intensity, 0.0, 1.4);
  float intro = clamp(u_intro, 0.0, 1.0);

  // --- Intro phases (mapped from 0-1 intro progress) ---
  // Phase 1 (0.0-0.3): dark with faint noise, scan beam begins
  // Phase 2 (0.3-0.6): scan reveals slices, rings start forming
  // Phase 3 (0.6-0.85): constriction tightens, field assembles
  // Phase 4 (0.85-1.0): lock-in pulse, settle to playable state
  // introReveal now reaches 1.0 at 0.85 so the lock pulse (0.82-1.0) is the
  // moment the scene fully brightens — not half way through the intro.
  float introReveal = smoothstep(0.0, 0.85, intro);
  float introScanStrength = smoothstep(0.05, 0.25, intro) * (1.0 - smoothstep(0.75, 1.0, intro));
  float introRingForm = smoothstep(0.25, 0.65, intro);
  float introConstrict = smoothstep(0.3, 0.85, intro);
  float introLock = smoothstep(0.82, 1.0, intro);
  // settled: 1.0 once intro is fully done, 0.0 during intro
  float settled = clamp(u_settled, 0.0, 1.0);

  // --- Intro scan beam: a hard horizontal sweep that reveals the scene ---
  float introScanY = mix(-0.6, 0.6, fract(intro * 3.0));
  float introScanWidth = mix(0.04, 0.12, intro);
  float introScanLine = 1.0 - smoothstep(0.0, introScanWidth, abs(centeredUv.y - introScanY));
  // Second pass at different angle for cross-scan
  float introScanX = mix(-0.8, 0.8, fract(intro * 2.3 + 0.4));
  float introScanLineV = 1.0 - smoothstep(0.0, introScanWidth * 0.7, abs(centeredUv.x - introScanX));
  float introScanCombined = max(introScanLine, introScanLineV * 0.7) * introScanStrength;

  // --- Intro vignette: starts extremely tight, opens as scene resolves ---
  float introVigRadius = mix(0.15, 1.2, introConstrict);
  float introVig = smoothstep(introVigRadius, introVigRadius * 0.2, radial);

  // --- Layer A: organic drift ---
  float driftScale = mix(3.5, 5.8, stage / 3.0);
  float layerA = fbm(centeredUv * driftScale + vec2(time, -time * 0.7));

  // --- Layer B: secondary turbulence ---
  float turbScale = mix(5.4, 8.2, stage / 3.0);
  float layerB = fbm(centeredUv * turbScale - vec2(time * 0.6, time * 0.95));

  // --- Containment rings ---
  float ringCount = mix(3.0, 7.0, stage / 3.0);
  float ringTight = mix(0.08, 0.22, stage / 3.0);
  float rings = sin(radial * ringCount * 6.2832 - u_time * 1.8) * 0.5 + 0.5;
  rings = smoothstep(0.5 - ringTight, 0.5 + ringTight, rings);
  // Stage-0 rings: only visible during intro, not in settled playable state.
  // introRingForm carryover is zeroed once settled so stage-0 doesn't
  // permanently show the orange ring halo the intro built up.
  float introRingCarryover = introRingForm * (1.0 - settled) * 0.2;
  float stageRingPresence = mix(0.0, 0.38, stage / 3.0);
  float ringPresence = stageRingPresence + introRingCarryover;

  // --- Intro-specific pressure rings: tight concentric bands forming ---
  float introPressureRings = sin(radial * 12.0 - u_time * 3.5) * 0.5 + 0.5;
  introPressureRings = smoothstep(0.35, 0.65, introPressureRings);
  introPressureRings *= introRingForm * (1.0 - introLock) * 0.3;

  // --- Scanning beam: directional sweep ---
  float scanAngle = u_time * 0.4 + sin(u_time * 0.13) * 1.2;
  float scanWidth = mix(3.14159, 0.6, stage / 3.0);
  float angleDiff = mod(angle - scanAngle + 6.2832, 6.2832);
  if (angleDiff > 3.14159) angleDiff = 6.2832 - angleDiff;
  float scanBeam = 1.0 - smoothstep(0.0, scanWidth, angleDiff);
  scanBeam *= smoothstep(0.0, 0.3, radial);
  // Stage 0 settled: scan beam is nearly invisible (0.03), suggesting presence
  // not yet resolved into a directional threat. Grows with stage.
  float scanPresence = mix(0.03, 0.25, stage / 3.0);

  // --- Pulse window: localized brightness opening at field center ---
  float pulseWindow = clamp(u_pulseWindow, 0.0, 1.0);
  // Radial bloom: full effect at center, fades to zero at 35% viewport radius
  float windowBloom = pulseWindow * smoothstep(0.35, 0.0, radial) * settled;
  // Closed-state pressure: center darkens, vignette deepens
  float closedFactor = (1.0 - pulseWindow) * settled;
  float closedDarken = closedFactor * 0.10;
  float closedVigDeepen = closedFactor * 0.08;
  // Legacy pulseGlow feeds into plasma composition (kept for continuity)
  float pulseGlow = windowBloom * 0.18;

  // --- Scan vectors (Direction D): sweeping bright lines ---
  float scanVectorEffect = 0.0;
  float scanVectorPresence = 0.0;
  int scanCount = int(clamp(u_scanCount, 0.0, 3.0));
  float scanPhase = u_scanPhase;
  if (scanCount > 0) {
    for (int i = 0; i < 3; i++) {
      if (i >= scanCount) break;
      float offset = float(i) * 2.094; // 2π/3 spacing
      float vecAngle = scanPhase * 6.2832 + offset + u_time * 0.12;
      float vecPos = sin(vecAngle) * 0.5;
      // Alternate between horizontal and vertical sweep
      float sweep;
      if (i == 0) {
        sweep = 1.0 - smoothstep(0.0, 0.06, abs(centeredUv.y - vecPos));
      } else if (i == 1) {
        sweep = 1.0 - smoothstep(0.0, 0.06, abs(centeredUv.x - vecPos));
      } else {
        // Diagonal sweep
        float diagVal = (centeredUv.x + centeredUv.y) * 0.7071;
        sweep = 1.0 - smoothstep(0.0, 0.06, abs(diagVal - vecPos));
      }
      sweep *= smoothstep(0.0, 0.15, radial); // fade near center
      scanVectorEffect += sweep;
    }
    scanVectorPresence = min(scanVectorEffect, 1.0);
  }

  // --- Fracture point: stress crack in containment ---
  float fractureEffect = 0.0;
  float fractureIntensity = clamp(u_fractureIntensity, 0.0, 1.0);
  if (fractureIntensity > 0.0) {
    vec2 fractureUv = (u_fracturePos - 0.5) * vec2(aspect, 1.0);
    float fractureDist = length(centeredUv - fractureUv);

    // Crack core: bright stress point
    float crackCore = smoothstep(0.08, 0.0, fractureDist) * fractureIntensity;

    // Crack branches: radial lines from fracture point
    vec2 toFracture = centeredUv - fractureUv;
    float crackAngle = atan(toFracture.y, toFracture.x);
    float crackBranch = abs(sin(crackAngle * 4.0 + u_time * 0.5));
    crackBranch = smoothstep(0.7, 1.0, crackBranch);
    crackBranch *= smoothstep(0.25, 0.02, fractureDist) * fractureIntensity * 0.6;

    // High-frequency noise at crack location
    float crackNoise = noise(centeredUv * 40.0 + u_time * 2.0) * smoothstep(0.12, 0.0, fractureDist) * fractureIntensity * 0.3;

    fractureEffect = crackCore + crackBranch + crackNoise;
  }

  // --- Counter-pulse ring (Direction F) ---
  float counterPulse = clamp(u_counterPulse, 0.0, 1.0);
  float counterPulseRing = 0.0;
  if (counterPulse > 0.01) {
    float ringRadius = counterPulse * 0.8; // expands outward
    float ringEdge = smoothstep(0.04, 0.0, abs(radial - ringRadius));
    counterPulseRing = ringEdge * (1.0 - counterPulse) * 0.6; // fades as it expands
  }

  // --- Deflect window visual: brief inward ripple ---
  float deflectWindow = clamp(u_deflectWindow, 0.0, 1.0);
  float deflectVisual = 0.0;
  if (deflectWindow > 0.01) {
    float deflectRadius = (1.0 - deflectWindow) * 0.7;
    float deflectEdge = smoothstep(0.05, 0.0, abs(radial - deflectRadius));
    deflectVisual = deflectEdge * deflectWindow * 0.35;
  }

  // --- Rupture sequence ---
  float rupture = clamp(u_rupture, 0.0, 1.0);
  float ruptureProgress = clamp(u_ruptureProgress, 0.0, 1.0);
  float ruptureEffect = 0.0;
  float ruptureDarkening = 0.0;

  if (rupture > 0.5) {
    vec2 ruptureOriginUv = (u_ruptureOrigin - 0.5) * vec2(aspect, 1.0);
    float ruptureDist = length(centeredUv - ruptureOriginUv);

    // Phase 1 (0.0-0.22): crack opens from fracture point
    float crackOpen = smoothstep(0.0, 0.22, ruptureProgress);
    float crackWidth = crackOpen * 0.15;
    vec2 toRupture = centeredUv - ruptureOriginUv;
    float ruptureAngle = atan(toRupture.y, toRupture.x);

    // Branching cracks
    float crackLine = abs(sin(ruptureAngle * 3.0));
    crackLine = smoothstep(0.85, 1.0, crackLine);
    float crackReach = crackOpen * 1.2;
    crackLine *= smoothstep(crackReach, 0.0, ruptureDist);

    // Phase 2 (0.22-0.55): cracks reach corners, field brightens at crack
    float crackSpread = smoothstep(0.22, 0.55, ruptureProgress);
    float crackBrightness = crackLine * mix(0.4, 1.0, crackSpread);

    // Phase 3 (0.55-0.78): field tears open — silence along cracks
    float tearOpen = smoothstep(0.55, 0.78, ruptureProgress);
    float tearSilence = crackLine * tearOpen;

    // Phase 4 (0.78-1.0): hold and fade
    float fadeFactor = smoothstep(0.78, 1.0, ruptureProgress);

    // Bright amber-white at rupture origin
    float originGlow = smoothstep(0.15, 0.0, ruptureDist) * crackOpen;

    ruptureEffect = (crackBrightness * 0.7 + originGlow * 0.8) * (1.0 - fadeFactor * 0.6);
    ruptureDarkening = tearSilence * 0.7 + fadeFactor * 0.4;
  }

  // --- Plasma composition ---
  float plasma = mix(layerA, layerB, 0.6);
  plasma += rings * ringPresence;
  plasma += introPressureRings;
  plasma += scanBeam * scanPresence;
  plasma += pulseGlow;
  // Radial center glow: very faint at stage 0 (searching), grows with stage
  float radialGlowStrength = mix(0.06, 0.28, stage / 3.0);
  plasma += smoothstep(1.1, 0.1, radial) * radialGlowStrength;

  // --- Resistance tear ---
  float tearRadius = resist * mix(0.5, 0.3, stage / 3.0);
  float tear = smoothstep(tearRadius, tearRadius * 0.3, radial);
  tear *= resist;
  float healEdge = smoothstep(tearRadius * 0.3, tearRadius, radial) * resist * 0.5;

  // --- Flicker ---
  float flicker = sin(u_time * 9.0 + plasma * 8.0) * 0.04;
  float stageFlicker = sin(u_time * 14.0 + angle * 3.0) * 0.02 * (stage / 3.0);

  // --- Intro static: high-frequency noise during early intro ---
  float introStatic = random(centeredUv * 80.0 + u_time * 5.0) * 0.15;
  introStatic *= (1.0 - smoothstep(0.3, 0.75, intro));

  // --- Color palette ---
  vec3 base = vec3(0.06, 0.0, mix(0.02, 0.04, stage / 3.0));
  vec3 glow = vec3(0.82, 0.08, 0.16);
  vec3 hot = mix(
    vec3(1.0, 0.42, 0.2),
    vec3(1.0, 0.62, 0.38),
    stage / 3.0
  );
  vec3 scanColor = vec3(1.0, 0.72, 0.2);

  // Stage-0 settled: apply an additional darkness multiplier so the scene
  // stays dim after intro instead of riding the rising pressure value.
  // At stage 1+ this factor dissolves to 1.0 so no effect there.
  float stage0Damper = mix(0.48, 1.0, clamp(min(stage, 1.0) + (1.0 - settled) * 0.4, 0.0, 1.0));

  float plasmaI = plasma * intensity * stage0Damper + flicker + stageFlicker;
  vec3 color = mix(base, glow, plasmaI);
  color = mix(color, hot, smoothstep(0.62, 1.16, plasmaI));

  // Scan beam tints toward amber
  color = mix(color, scanColor, scanBeam * scanPresence * 0.4 * intensity);

  // Ring edges glow
  color += vec3(0.12, 0.02, 0.04) * rings * ringPresence * intensity;

  // --- Scan vector overlay: warm orange-red tint ---
  vec3 scanVectorColor = vec3(1.0, 0.45, 0.18);
  color = mix(color, scanVectorColor, scanVectorPresence * 0.35 * settled);

  // --- Pulse window breathing: amber-white bloom when open, darkening when closed ---
  // Open: 12% color blend toward amber-white + 18% luminance boost at center
  vec3 windowWarmth = vec3(1.0, 0.85, 0.6);
  color = mix(color, windowWarmth, windowBloom * 0.12);
  color *= (1.0 + windowBloom * 0.18);
  // Closed: center darkens below base luminance
  color *= (1.0 - closedDarken * smoothstep(0.4, 0.0, radial));

  // --- Absorbed attempt ripple: field asserts itself ---
  float absorbed = clamp(u_absorbed, 0.0, 1.0);
  if (absorbed < 0.99) {
    float absorbedAge = absorbed; // 0.0 = just happened, 1.0 = fully faded
    float rippleRadius = absorbedAge * 0.40;
    float rippleEdge = smoothstep(0.06, 0.0, abs(radial - rippleRadius));
    float rippleStrength = (1.0 - absorbedAge) * 0.25;
    // Use the field's own base red — not rose, not amber
    color += rippleEdge * rippleStrength * glow;
  }

  // --- Fracture point: amber glow at stress point ---
  vec3 fractureColor = vec3(1.0, 0.78, 0.28);
  color = mix(color, fractureColor, fractureEffect * 0.65);

  // --- Counter-pulse ring: deep rose color ---
  vec3 counterPulseColor = vec3(0.88, 0.38, 0.56);
  color = mix(color, counterPulseColor, counterPulseRing);

  // --- Deflect window: cooler blue-white ripple ---
  vec3 deflectColor = vec3(0.55, 0.72, 1.0);
  color = mix(color, deflectColor, deflectVisual);

  // --- Resistance tear effect ---
  vec3 tearColor = vec3(0.04, 0.06, 0.12);
  vec3 tearEdgeColor = vec3(0.5, 0.7, 1.0);
  color = mix(color, tearColor, tear * 0.85);
  color = mix(color, tearEdgeColor, healEdge * 0.6);

  // --- Intro scan line glow: bright amber line sweeping ---
  vec3 introScanGlow = vec3(1.0, 0.65, 0.15);
  color = mix(color, introScanGlow, introScanCombined * 0.6);

  // --- Intro static noise overlay ---
  color += introStatic * vec3(0.4, 0.05, 0.08);

  // --- Rupture effects ---
  if (rupture > 0.5) {
    // Bright rupture glow
    vec3 ruptureGlowColor = vec3(1.0, 0.85, 0.5);
    color = mix(color, ruptureGlowColor, ruptureEffect);
    // Tear darkening — silence where cracks opened
    color *= (1.0 - ruptureDarkening);
  }

  // --- Scan lines ---
  float scan = sin(gl_FragCoord.y * 1.25 + u_time * 8.0) * 0.02;
  color += scan * intensity;

  // --- Vignette ---
  // Stage 0 settled: tighten vignette more aggressively so edges stay dark
  float vignetteRadius = mix(1.2, 0.7, stage / 3.0);
  // Extra constriction at stage 0 once settled — makes frame feel closed-in
  float stage0VigBoost = (1.0 - min(stage, 1.0)) * settled * 0.25;
  float vignetteInner = vignetteRadius - stage0VigBoost - closedVigDeepen;
  float vignette = smoothstep(vignetteInner, vignetteInner * 0.35, radial);
  color *= mix(0.38, 1.0, vignette);

  // --- Intro visibility: multiply by intro vignette and reveal ---
  color *= mix(introVig * 0.15, 1.0, introReveal);
  // Intro constriction: extra darkening at edges during formation
  color *= mix(introVig, 1.0, introConstrict);

  // --- Lock-in pulse: brief brightness spike at the end of intro ---
  float lockPulse = introLock * (1.0 - smoothstep(0.92, 1.0, intro)) * 0.35;
  color += lockPulse * vec3(0.6, 0.12, 0.08);

  // --- Intensity spike during scan vector contact ---
  // (handled via u_intensity from JS side)

  gl_FragColor = vec4(color, 1.0);
}
