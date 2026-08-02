precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_progress;
uniform float u_stage;
uniform float u_aperture;
uniform float u_assistance;
uniform float u_reduced;
uniform float u_rupture;
uniform float u_seed;
uniform float u_signal;

float hash21(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float segmentDistance(vec2 point, vec2 start, vec2 end) {
  vec2 direction = end - start;
  float projection = clamp(dot(point - start, direction) / dot(direction, direction), 0.0, 1.0);
  return length(point - (start + direction * projection));
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 point = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  float time = mix(u_time, 0.0, u_reduced);

  float grain = hash21(floor(gl_FragCoord.xy * 0.08) + u_seed) - 0.5;
  float turbulence = sin(point.x * 8.0 + time * 0.28 + u_seed * 5.0) * 0.018;
  turbulence += sin(point.y * 13.0 - time * 0.19) * 0.012;
  float edge = smoothstep(0.82, 0.2, length(point * vec2(0.82, 1.1)));

  vec3 color = vec3(0.018, 0.006, 0.028);
  color += vec3(0.07, 0.012, 0.055) * edge;
  color += vec3(0.018, 0.05, 0.075) * smoothstep(0.42, 0.0, abs(point.x + point.y * 0.7 + turbulence));

  float scan = smoothstep(0.018, 0.0, abs(fract((point.x * 0.4 + point.y * 0.9 + time * 0.04) * 4.0) - 0.5));
  color += vec3(0.26, 0.035, 0.13) * scan * (0.12 + u_stage * 0.06);

  float apertureRadius = 0.16 + u_aperture * 0.04 + u_assistance * 0.05;
  float aperture = smoothstep(0.012, 0.0, abs(length(point) - apertureRadius));
  color += vec3(0.42, 0.7, 0.9) * aperture * (0.28 + u_aperture * 0.35);

  float fracture = segmentDistance(point, vec2(-0.62, 0.28), vec2(0.42, -0.26));
  float branchA = segmentDistance(point, vec2(0.06, -0.08), vec2(0.42, 0.32));
  float branchB = segmentDistance(point, vec2(-0.12, -0.02), vec2(-0.34, -0.32));
  float branchC = segmentDistance(point, vec2(0.21, -0.16), vec2(0.56, -0.03));
  float fault = min(fracture, min(branchA, min(branchB, branchC)));
  float faultLine = smoothstep(0.012 + (1.0 - u_progress) * 0.012, 0.001, fault);
  color += vec3(0.78, 0.38, 0.17) * faultLine * (0.22 + u_progress * 0.68);

  float tear = smoothstep(0.06, 0.0, fault) * u_rupture;
  color = mix(color, vec3(0.01, 0.002, 0.016), tear * 0.55);
  color += vec3(0.52, 0.06, 0.22) * u_progress * 0.08;
  color += vec3(0.08, 0.04, 0.08) * grain;

  float carrier = smoothstep(0.03, 0.0, length(point + vec2(0.07 * (u_signal - 0.7), 0.0)));
  color += vec3(0.7, 0.82, 0.9) * carrier * (0.25 + u_progress * 0.12);

  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
