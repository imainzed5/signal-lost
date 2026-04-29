#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;

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
  vec2 centeredUv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

  float time = u_time * 0.18;
  float radial = length(centeredUv);
  float layerA = fbm(centeredUv * 3.5 + vec2(time, -time * 0.7));
  float layerB = fbm(centeredUv * 5.4 - vec2(time * 0.6, time * 0.95));
  float layerC = sin((centeredUv.x + centeredUv.y + time * 4.0) * 7.0) * 0.5 + 0.5;

  float plasma = mix(layerA, layerB, 0.6) + layerC * 0.18;
  plasma += smoothstep(1.1, 0.1, radial) * 0.32;

  float flicker = sin(u_time * 9.0 + plasma * 8.0) * 0.04;
  float intensity = clamp(u_intensity, 0.0, 1.4);

  vec3 base = vec3(0.06, 0.0, 0.02);
  vec3 glow = vec3(0.82, 0.08, 0.16);
  vec3 hot = vec3(1.0, 0.42, 0.2);
  vec3 color = mix(base, glow, plasma * intensity + flicker);
  color = mix(color, hot, smoothstep(0.62, 1.16, plasma * intensity));

  float scan = sin(gl_FragCoord.y * 1.25 + u_time * 8.0) * 0.02;
  color += scan * intensity;

  gl_FragColor = vec4(color, 1.0);
}
