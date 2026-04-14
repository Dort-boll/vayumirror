export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_prevImage;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform int u_lensType;
uniform int u_filterType;
uniform bool u_isFrozen;
uniform int u_compareMode;
uniform float u_motionEnergy;

in vec2 v_texCoord;
out vec4 outColor;

#define PI 3.14159265359

// --- LENS EFFECTS ---

vec2 applyConvex(vec2 uv, float intensity) {
  vec2 center = vec2(0.5, 0.5);
  vec2 delta = uv - center;
  float dist = length(delta);
  float radius = 0.5;
  if (dist < radius) {
    float percent = 1.0 - (radius - dist) / radius * intensity;
    return center + delta * percent;
  }
  return uv;
}

vec2 applyConcave(vec2 uv, float intensity) {
  vec2 center = vec2(0.5, 0.5);
  vec2 delta = uv - center;
  float dist = length(delta);
  float radius = 0.5;
  if (dist < radius) {
    float percent = 1.0 + (radius - dist) / radius * intensity;
    return center + delta * percent;
  }
  return uv;
}

vec2 applyFisheye(vec2 uv, float intensity) {
  vec2 center = vec2(0.5, 0.5);
  vec2 delta = uv - center;
  float dist = length(delta);
  float radius = 1.0;
  float power = 1.0 + intensity * 2.0;
  
  if (dist < radius) {
    float percent = pow(dist / radius, power) * radius;
    return center + normalize(delta) * percent;
  }
  return uv;
}

vec2 applyHeatWave(vec2 uv, float intensity, float time) {
  float speed = 2.0;
  float frequency = 10.0;
  float amplitude = 0.02 * intensity;
  uv.x += sin(uv.y * frequency + time * speed) * amplitude;
  uv.y += cos(uv.x * frequency + time * speed) * amplitude;
  return uv;
}

vec2 applyCrystalSplit(vec2 uv, float intensity) {
  vec2 center = vec2(0.5, 0.5);
  vec2 delta = uv - center;
  float angle = atan(delta.y, delta.x);
  float dist = length(delta);
  float segments = 4.0 + floor(intensity * 12.0);
  angle = floor(angle / (2.0 * PI / segments)) * (2.0 * PI / segments);
  return center + vec2(cos(angle), sin(angle)) * dist;
}

vec2 applyLiquidMirror(vec2 uv, float intensity, float time, sampler2D prevTex) {
  vec4 prev = texture(prevTex, uv);
  float motion = length(texture(u_image, uv).rgb - prev.rgb);
  float distortion = motion * intensity * 0.1;
  uv.x += sin(time + uv.y * 10.0) * distortion;
  uv.y += cos(time + uv.x * 10.0) * distortion;
  return uv;
}

// --- FILTERS ---

vec3 applyNoir(vec3 color) {
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  return vec3(gray);
}

vec3 applySepia(vec3 color) {
  return vec3(
    dot(color, vec3(0.393, 0.769, 0.189)),
    dot(color, vec3(0.349, 0.686, 0.168)),
    dot(color, vec3(0.272, 0.534, 0.131))
  );
}

vec3 applyNeon(vec3 color, float energy) {
  vec3 neon = color * (1.5 + energy);
  neon = pow(neon, vec3(2.0));
  return mix(color, neon, 0.7);
}

vec3 applySoftFocus(vec3 color, vec2 uv) {
  vec3 blur = vec3(0.0);
  float count = 0.0;
  for(float x = -2.0; x <= 2.0; x++) {
    for(float y = -2.0; y <= 2.0; y++) {
      blur += texture(u_image, uv + vec2(x, y) * 0.002).rgb;
      count++;
    }
  }
  return mix(color, blur / count, 0.5);
}

vec3 applyHDR(vec3 color) {
  color = color * 1.2;
  color = color / (color + vec3(1.0));
  return pow(color, vec3(1.0 / 2.2));
}

vec3 applyCyberpunk(vec3 color, vec2 uv, float time, float energy) {
  float shift = (0.01 + energy * 0.02) * sin(time * 5.0);
  float r = texture(u_image, uv + vec2(shift, 0.0)).r;
  float g = texture(u_image, uv).g;
  float b = texture(u_image, uv - vec2(shift, 0.0)).b;
  vec3 shifted = vec3(r, g, b);
  vec3 pink = vec3(1.0, 0.0, 1.0);
  vec3 cyan = vec3(0.0, 1.0, 1.0);
  return mix(shifted, mix(pink, cyan, uv.x), 0.2 + energy * 0.3);
}

void main() {
  vec2 uv = v_texCoord;
  
  if (u_compareMode == 1 && uv.x > 0.5) {
    outColor = texture(u_image, uv);
    return;
  }

  // Apply Lens Distortion
  if (u_lensType == 1) uv = applyConvex(uv, u_intensity);
  else if (u_lensType == 2) uv = applyConcave(uv, u_intensity);
  else if (u_lensType == 3) uv = applyFisheye(uv, u_intensity);
  else if (u_lensType == 4) {
    // Prism / Chromatic Aberration
    float shift = (0.02 + u_motionEnergy * 0.03) * u_intensity;
    float r = texture(u_image, uv + vec2(shift, 0.0)).r;
    float g = texture(u_image, uv).g;
    float b = texture(u_image, uv - vec2(shift, 0.0)).b;
    outColor = vec4(r, g, b, 1.0);
  } else if (u_lensType == 5) uv = applyHeatWave(uv, u_intensity, u_time);
  else if (u_lensType == 6) uv = applyCrystalSplit(uv, u_intensity);
  else if (u_lensType == 7) uv = applyLiquidMirror(uv, u_intensity, u_time, u_prevImage);

  // Sample texture if not already handled by Prism
  if (u_lensType != 4) {
    outColor = texture(u_image, uv);
  }

  // Apply Filters
  vec3 color = outColor.rgb;
  if (u_filterType == 1) color = applyNoir(color);
  else if (u_filterType == 2) color = applySepia(color);
  else if (u_filterType == 3) color = applyNeon(color, u_motionEnergy);
  else if (u_filterType == 4) color = applyCyberpunk(color, uv, u_time, u_motionEnergy);
  else if (u_filterType == 5) {
    // Vintage Grain
    float noise = fract(sin(dot(uv + u_time, vec2(12.9898, 78.233))) * 43758.5453);
    color = mix(color, vec3(noise), 0.1 + u_motionEnergy * 0.1);
    color *= vec3(0.9, 0.8, 0.7);
  }
  else if (u_filterType == 6) color = applySoftFocus(color, uv);
  else if (u_filterType == 7) color = applyHDR(color);
  
  // --- ELEGANT AI BORDER GLOW SYSTEM (VAYU PRO) ---
  float borderThickness = 0.012 + u_motionEnergy * 0.03;
  float pulse = sin(u_time * 2.5) * 0.5 + 0.5;
  float glowBase = 0.4 + u_motionEnergy * 0.6;
  
  // Calculate distance to nearest edge
  float distToEdge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float borderGlow = smoothstep(borderThickness, 0.0, distToEdge) * glowBase;
  
  // Subtle AI Scanning Effect
  float scanLine = smoothstep(0.015, 0.0, abs(fract(uv.y - u_time * 0.4) - 0.5)) * 0.1 * u_motionEnergy;
  float scanLineX = smoothstep(0.015, 0.0, abs(fract(uv.x + u_time * 0.2) - 0.5)) * 0.05 * u_motionEnergy;
  
  // Fluid multi-color spectrum logic
  float angle = atan(uv.y - 0.5, uv.x - 0.5);
  vec3 color1 = vec3(0.26, 0.52, 0.96); // Blue
  vec3 color2 = vec3(0.91, 0.26, 0.21); // Red
  vec3 color3 = vec3(0.98, 0.73, 0.01); // Yellow
  vec3 color4 = vec3(0.20, 0.65, 0.32); // Green
  
  float t = angle / 6.28318 + 0.5 + u_time * 0.05;
  vec3 spectrum = mix(color1, color2, smoothstep(0.0, 0.25, fract(t)));
  spectrum = mix(spectrum, color3, smoothstep(0.25, 0.5, fract(t)));
  spectrum = mix(spectrum, color4, smoothstep(0.5, 0.75, fract(t)));
  spectrum = mix(spectrum, color1, smoothstep(0.75, 1.0, fract(t)));
  
  // Combine glow and scanlines with soft blending
  vec3 finalGlow = spectrum * (borderGlow * 2.0 + scanLine + scanLineX);
  color += finalGlow * (0.8 + pulse * 0.2);
  
  outColor = vec4(color, 1.0);
}
`;
