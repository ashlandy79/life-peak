import type {
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TcgCardAssets,
  TcgCardHandle,
  TcgHoloParameters,
  TcgInspectionMode,
} from './tcgTypes';
import { DEFAULT_TCG_PARAMETERS } from './tcgParameters';

function injectTcgHoloStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tcg-holo-card-styles')) return;
  const style = document.createElement('style');
  style.id = 'tcg-holo-card-styles';
  style.textContent = `
.tcg-stage {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
  isolation: isolate;
  padding: 12px 8px;
}

.tcg-card {
  position: relative;
  width: min(84vw, 360px);
  aspect-ratio: 3 / 4;
  transform-style: preserve-3d;
  will-change: transform;
  cursor: grab;
  touch-action: none;
  user-select: none;
  outline: none;
}

.tcg-card:active {
  cursor: grabbing;
}

.tcg-card:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 12px;
  border-radius: 18px;
}

.tcg-face {
  position: absolute;
  inset: 0;
  border-radius: 4.5% / 3.4%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.tcg-front {
  transform: translateZ(0.2px);
  overflow: visible;
  background: transparent;
  box-shadow: 0 25px 55px rgba(0, 0, 0, 0.65);
}

/* 160% 超宽透明画布：让正值 Depth 下的角色与 UI 可以直接突破卡框悬浮在半空中 */
.tcg-front canvas {
  position: absolute;
  width: 160%;
  height: 160%;
  max-width: none;
  left: -30%;
  top: -30%;
  display: block;
  border-radius: 0;
  pointer-events: none;
}

.tcg-back {
  visibility: hidden;
  transform: rotateY(180deg) translateZ(0.2px);
  background: #13216a;
  overflow: hidden;
  border-radius: 4.5% / 3.4%;
  box-shadow:
    0 0 0 1px #202329,
    0 25px 55px rgba(0, 0, 0, 0.7);
}

.tcg-back img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
  border-radius: inherit;
  pointer-events: none;
  user-select: none;
}
  `;
  document.head.appendChild(style);
}

const vertexShaderSource = `attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentShaderSource = `precision highp float;
varying vec2 uv;
uniform sampler2D art, bg, uiTex, bloomNear, bloomWide, structureTex;
uniform float extracted, cardAspect;
uniform vec2 view;
uniform float depth, contourBrightness, power, glowPass, pixelWidth;
uniform float starIntensity, bloomIntensity, glareIntensity, bgZoom, rimStrength;
uniform float maskIntensity, frostedBlur;
uniform int maskType;
uniform int rimColorType;
uniform int structureLightType;
uniform int inspectMode;
uniform float isSealed;
uniform vec3 customRimColor;
uniform vec3 customBeamColor;
uniform float useCustomColors;
uniform float beamAngle;
uniform float beamWidth;
uniform float beamIntensity;

#define GOLDEN_ANGLE 2.39996323

vec4 encodeHDR(vec3 c) {
  float m = clamp(ceil(max(max(c.r, c.g), c.b) / 64.0 * 255.0) / 255.0, 1.0 / 255.0, 1.0);
  return vec4(c / (64.0 * m), m);
}

vec3 decodeHDR(vec4 c) {
  return c.rgb * c.a * 64.0;
}

vec3 hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 0.00001)), d / (q.x + 0.00001), q.x);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float ink(vec2 p) {
  vec4 c = texture2D(art, p);
  vec3 h = hsv(pow(c.rgb, vec3(2.2)));
  return smoothstep(0.035, 0.065, h.x) * (1.0 - smoothstep(0.17, 0.21, h.x)) *
         smoothstep(0.4, 0.67, h.y) * smoothstep(0.065, 0.25, h.z) * c.a;
}

float structure(vec2 p) {
  if (extracted > 0.5) return texture2D(structureTex, p).a;
  float a = ink(p);
  float b = min(
    min(ink(p + vec2(0.0025, 0.0)), ink(p - vec2(0.0025, 0.0))),
    min(ink(p + vec2(0.0, 0.0018)), ink(p - vec2(0.0, 0.0018)))
  );
  return smoothstep(0.025, 0.22, max(0.0, a - b));
}

vec3 rainbow(float t) {
  return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

float band(vec2 p) {
  float ang = 0.55 + beamAngle * 0.01745329;
  vec2 dir = vec2(cos(ang), sin(ang));
  float coord = dot(p, dir) + view.x * 1.9 + view.y * 0.85;
  float widthFactor = max(0.2, beamWidth);
  float dist = abs(fract(coord + 0.16) - 0.5) * 2.0;
  return pow(max(0.0, 1.0 - dist / widthFactor), 3.0) * max(0.0, beamIntensity);
}

// 黄金角螺旋磨砂采样（固着于卡牌表面空间，消除漂浮脱离感）
vec4 sampleFrostedOrPrism(sampler2D tex, vec2 coord, float blurAmt, float dispersionAmt) {
  if (blurAmt <= 0.001 && dispersionAmt <= 0.001) {
    return texture2D(tex, coord);
  }
  float radius = 0.009 * blurAmt;
  vec3 accum = vec3(0.0);
  float alphaAccum = 0.0;
  float theta = 0.0;

  for (int i = 0; i < 6; i++) {
    float r = sqrt(float(i) + 0.5) / sqrt(6.0);
    theta += GOLDEN_ANGLE;
    vec2 offset = r * vec2(cos(theta), sin(theta)) * radius;
    vec2 disp = offset * 0.35 * dispersionAmt;

    float sr = texture2D(tex, clamp(coord + offset + disp, 0.0, 1.0)).r;
    vec4 sg = texture2D(tex, clamp(coord + offset, 0.0, 1.0));
    float sb = texture2D(tex, clamp(coord + offset - disp, 0.0, 1.0)).b;

    accum += vec3(sr, sg.g, sb);
    alphaAccum += sg.a;
  }
  return vec4(accum / 6.0, alphaAccum / 6.0);
}

// 5 种可选内嵌流光框配色计算
vec3 computeRimColor(int rimType, vec3 spectrum, float phase) {
  if (rimType == 0) {
    // 0: 珍珠蓝 (Pearl Blue - 图 1 主打)
    vec3 pearlBase = mix(vec3(0.32, 0.78, 0.98), vec3(0.58, 0.42, 0.96), 0.5 + 0.5 * sin(phase * 3.0));
    return mix(pearlBase, spectrum * 0.65 + vec3(0.35), 0.38);
  } else if (rimType == 1) {
    // 1: 彩色 (Rainbow)
    return spectrum * 0.82 + vec3(0.18);
  } else if (rimType == 2) {
    // 2: 金色 (Royal Gold)
    vec3 goldBase = mix(vec3(0.92, 0.74, 0.26), vec3(1.0, 0.93, 0.65), 0.5 + 0.5 * cos(phase * 2.5));
    return mix(goldBase, spectrum, 0.16);
  } else if (rimType == 3) {
    // 3: 紫色 (Mystic Purple)
    vec3 purpleBase = mix(vec3(0.58, 0.24, 0.94), vec3(0.92, 0.32, 0.78), 0.5 + 0.5 * sin(phase * 2.8));
    return mix(purpleBase, spectrum, 0.25);
  } else {
    // 4: 银灰色 (Titanium Silver)
    vec3 silverBase = mix(vec3(0.76, 0.80, 0.86), vec3(0.95, 0.97, 1.0), 0.5 + 0.5 * cos(phase * 4.0));
    return mix(silverBase, spectrum, 0.12);
  }
}

void main() {
  // 160% 超宽透明画布映射回卡牌 0..1 坐标系
  vec2 p = (uv - 0.5) * 1.6 + 0.5;
  vec2 u = p;

  vec2 edge = abs((p - 0.5) * vec2(1.0, cardAspect)) - (vec2(0.5, cardAspect * 0.5) - vec2(0.045));
  float edgeDistance = length(max(edge, 0.0)) + min(max(edge.x, edge.y), 0.0) - 0.045;
  float cardMask = 1.0 - smoothstep(-pixelWidth, pixelWidth, edgeDistance);

  float effDepth = isSealed > 0.5 ? 0.0 : depth;
  float foregroundMask = effDepth > 0.0 ? 1.0 : cardMask;
  float cropScale = isSealed > 0.5 ? 1.0 : (1.0 / max(1.0, bgZoom));
  vec2 a = isSealed > 0.5 ? p : (p - view * (effDepth < 0.0 ? 0.06 : 0.08) * effDepth);
  u = isSealed > 0.5 ? p : (p - view * 0.14 * max(effDepth, 0.0));
  vec2 b = isSealed > 0.5 ? p : ((p - 0.5) * cropScale + 0.5 - view * 0.25);

  // 判断当前是否启用磨砂模糊或棱镜色散（封印状态下固定使用封印毛玻璃蒙版）
  float effectiveFrosted = (isSealed > 0.5 && frostedBlur < 0.05) ? 0.65 : frostedBlur;
  float activeBlur = (glowPass < 0.5) ? (isSealed > 0.5 ? effectiveFrosted : frostedBlur) : 0.0;
  float activeDisp = (glowPass < 0.5 && maskType == 3 && isSealed <= 0.5) ? maskIntensity : (activeBlur * 0.35);

  vec4 ch = sampleFrostedOrPrism(art, a, activeBlur, activeDisp);
  ch.a *= step(0.0, a.x) * step(a.x, 1.0) * step(0.0, a.y) * step(a.y, 1.0);
  ch.a *= foregroundMask;

  vec4 background = sampleFrostedOrPrism(bg, b, activeBlur * 0.85, activeDisp * 0.5);
  background.a *= cardMask;
  background.a *= step(0.0, b.x) * step(b.x, 1.0) * step(0.0, b.y) * step(b.y, 1.0);

  vec4 uiSample = texture2D(uiTex, u);
  float um = uiSample.a * step(0.0, u.x) * step(u.x, 1.0) * step(0.0, u.y) * step(u.y, 1.0);
  vec2 uiEdge = abs((u - 0.5) * vec2(1.0, cardAspect)) - (vec2(0.5, cardAspect * 0.5) - vec2(0.045));
  float uiDistance = length(max(uiEdge, 0.0)) + min(max(uiEdge.x, uiEdge.y), 0.0) - 0.045;
  float uiMask = 1.0 - smoothstep(-pixelWidth, pixelWidth, uiDistance);
  um *= uiMask * foregroundMask;

  if (glowPass < 0.5) {
    if (inspectMode == 3) {
      float sLine = structure(a) * ch.a;
      gl_FragColor = vec4(vec3(sLine), max(cardMask, ch.a));
      return;
    }
    if (inspectMode == 4) {
      gl_FragColor = vec4(background.rgb * cardMask, cardMask);
      return;
    }
    if (inspectMode == 5) {
      gl_FragColor = vec4(ch.rgb * ch.a, ch.a);
      return;
    }
    if (inspectMode == 6) {
      gl_FragColor = vec4(uiSample.rgb * um, um);
      return;
    }
  }

  float baseAlpha = cardMask + (1.0 - cardMask) * ch.a;
  vec3 base = mix(background.rgb * cardMask, ch.rgb, ch.a);
  float finalAlpha = clamp(baseAlpha + (1.0 - baseAlpha) * um, 0.0, 1.0);

  if (finalAlpha <= 0.0) {
    gl_FragColor = glowPass > 0.5 ? encodeHDR(vec3(0.0)) : vec4(0.0);
    return;
  }

  // 需求 1：封印状态下全息虹彩总强度为 0，结构线光效为 0，光学蒙版强度为 0
  float effectivePower = (isSealed > 0.5 || inspectMode == 1) ? 0.0 : power;
  float effectiveContour = (isSealed > 0.5 || inspectMode == 1) ? 0.0 : contourBrightness;
  float effectiveMaskIntensity = (isSealed > 0.5) ? 0.0 : maskIntensity;
  int effectiveMaskType = (isSealed > 0.5) ? 0 : maskType;

  float phase = p.x * 0.62 + p.y * 0.36 + view.x * 1.9 + view.y * 0.8;
  vec3 spectrum = rainbow(phase * 2.2);
  float light = band(p);
  float micro = pow(hash(floor(p * vec2(620.0, 868.0))), 28.0);

  // 需求 6：普通默认微弱阳光，高级默认暖金丁达尔，稀有默认全息虹彩；旋转卡片时打在卡片上的光束对应改变
  vec3 beamColor;
  if (useCustomColors > 0.5) {
    beamColor = customBeamColor;
  } else if (structureLightType == 0) {
    beamColor = vec3(1.0, 0.97, 0.91); // 普通卡片：微弱白暖日光束
  } else if (structureLightType == 1) {
    beamColor = mix(vec3(1.0, 0.84, 0.35), vec3(1.0, 0.97, 0.72), light); // 高级卡片：暖金丁达尔光束
  } else {
    beamColor = spectrum; // 稀有卡片：全息虹彩光束
  }

  // 基础全息扫光混色
  base = mix(base, base * (0.66 + beamColor * 0.68) + beamColor * 0.06 * baseAlpha, light * 0.44 * effectivePower);

  // ============================================================================
  // 需求 1：封印状态下的低饱和度深墨黑层 + 牢固贴合卡面的毛玻璃微表面 (消除悬浮分离感)
  // ============================================================================
  if (effectiveFrosted > 0.02) {
    // 1. 降低画面饱和度，并以低饱和深墨黑/深黑曜石层覆盖压暗 (复刻图 1 细节：“核心画面被封印，仍有部分隐约可见”)
    float lum = dot(base, vec3(0.299, 0.587, 0.114));
    vec3 desat = mix(base, vec3(lum), 0.72);
    // 深黑曜石低饱和暗黑色 (约 #0f1217)
    vec3 obsidianBlack = vec3(0.06, 0.07, 0.09);
    float sealDarkenWeight = clamp(effectiveFrosted * 0.82, 0.0, 0.88);
    base = mix(desat, obsidianBlack * (0.42 + 0.58 * lum), sealDarkenWeight * cardMask);

    // 2. 牢固贴在卡牌前表面几何坐标 (p) 上的毛玻璃微晶微粒 (Surface Micro-Grain)
    // 关键：绝对不随 view 视差偏移，使眼睛明确感知这层磨砂覆盖在卡片表面，旋转时绝无脱落分离感！
    float surfaceGrain1 = hash(floor(p * vec2(560.0, 750.0)));
    float surfaceGrain2 = hash(floor(p * vec2(280.0, 375.0)));
    vec3 microHolo = rainbow(surfaceGrain1 * 2.8 + phase) * step(0.78, surfaceGrain2) * (0.10 + 0.18 * light);
    float surfaceFrostedSheen = (surfaceGrain1 - 0.5) * 0.07 * effectiveFrosted;
    base += (vec3(surfaceFrostedSheen) + microHolo * 0.5 * effectivePower) * cardMask;
  }

  // ============================================================================
  // 光学蒙版效果叠加 (解封状态下按选定蒙版生效；封印状态下光学蒙版强度固定为 0)
  // ============================================================================
  if (effectivePower > 0.0 && effectiveMaskIntensity > 0.0) {
    float mGain = effectiveMaskIntensity * effectivePower;

    if (effectiveMaskType == 1) {
      // [1] 全息虹彩蒙版 (Holo Rainbow - 需求 2 指定默认蒙版): 经典全光谱干涉扫光
      base = mix(base, base * (0.75 + spectrum * 0.55) + spectrum * 0.14 * baseAlpha, light * 0.55 * mGain);
    } else if (effectiveMaskType == 2) {
      // [2] 丁达尔阳光蒙版 (Volumetric Sunbeams / God Rays)
      vec2 sunOrigin = vec2(0.18 + view.x * 0.38, -0.08 + view.y * 0.28);
      vec2 dir = p - sunOrigin;
      float angle = atan(dir.y, dir.x);
      float dist = length(dir);
      float rays =
        pow(0.5 + 0.5 * sin(angle * 11.0 + view.x * 4.5), 4.0) * 0.6 +
        pow(0.5 + 0.5 * cos(angle * 23.0 - view.y * 5.5), 6.0) * 0.4;
      float attenuation = exp(-dist * 1.15) * smoothstep(0.0, 0.35, dist);
      vec3 sunColor = mix(vec3(1.0, 0.92, 0.72), spectrum * 0.4 + vec3(0.7, 0.65, 0.5), 0.28);
      float dust = pow(hash(floor((p + view * 0.08) * vec2(180.0, 240.0))), 22.0) * rays;
      base += (sunColor * rays * attenuation * 0.52 + vec3(1.0, 0.95, 0.8) * dust * 0.45) * mGain * baseAlpha;
    } else if (effectiveMaskType == 3) {
      // [3] 棱镜色散蒙版 (Prism Crystal Facets)
      vec2 uvFacet = (p - 0.5) * vec2(7.0, 9.5) + view * 1.2;
      vec2 gv = abs(fract(uvFacet) - 0.5);
      float diamond = smoothstep(0.48, 0.05, gv.x + gv.y);
      float facetEdge = smoothstep(0.06, 0.0, abs(gv.x + gv.y - 0.42));
      vec3 facetCol = rainbow(floor(uvFacet.x) * 0.17 + floor(uvFacet.y) * 0.23 + phase);
      base += (facetCol * diamond * 0.16 + facetCol * facetEdge * 0.38) * mGain * light * baseAlpha;
    } else if (effectiveMaskType == 4) {
      // [4] 星云流沙蒙版 (Cosmic Stardust & Flowing Quicksand)
      float neb1 = valueNoise(p * 6.5 + view * 1.6);
      float neb2 = valueNoise(p * 13.0 - view * 2.2);
      float nebula = smoothstep(0.32, 0.82, neb1 * 0.6 + neb2 * 0.4);
      float sandSeed = hash(floor((p + view * 0.06) * vec2(380.0, 510.0)));
      float quicksand = step(0.955, sandSeed) * pow(0.5 + 0.5 * sin(sandSeed * 40.0 + phase * 8.0), 4.0);
      vec3 cosmicTint = mix(vec3(0.28, 0.68, 0.98), vec3(0.88, 0.42, 0.96), neb2);
      base += (cosmicTint * nebula * 0.24 + mix(vec3(1.0, 0.88, 0.55), spectrum, 0.5) * quicksand * 0.75) * mGain * baseAlpha;
    } else if (effectiveMaskType == 5) {
      // [5] 金属蚀刻蒙版 (Anisotropic Etched Foil)
      vec2 center = vec2(0.5 + view.x * 0.25, 0.45 + view.y * 0.25);
      vec2 rel = (p - center) * vec2(1.0, cardAspect);
      float rad = length(rel);
      float ang = atan(rel.y, rel.x);
      float etch = sin(rad * 160.0 - ang * 8.0 + phase * 6.0) * 0.5 + 0.5;
      float etchSpec = pow(etch, 6.0) * light;
      base += (spectrum * 0.75 + vec3(0.25)) * etchSpec * 0.42 * mGain * baseAlpha;
    }
  }

  // ============================================================================
  // 需求 2：结构线贴图专属光效 (普通: 微弱阳光 / 高级: 暖金丁达尔 / 稀有: 全息虹彩)
  // 需求 1：封印状态下移除结构线光效
  // ============================================================================
  float line = structure(a) * ch.a;
  float envelope = smoothstep(0.025, 0.42, light);
  vec3 emission = vec3(0.0);
  if (isSealed <= 0.5) {
    if (structureLightType == 0) {
      // 0: 普通级 · 微弱白暖阳光 (Subtle Soft Sunlight) - 低调柔和、不晃眼的素雅线条
      vec3 sunWhite = vec3(1.0, 0.98, 0.92);
      emission = sunWhite * line * envelope * effectivePower * 16.0 * effectiveContour;
    } else if (structureLightType == 1) {
      // 1: 高级 · 暖金丁达尔圣光 (Warm Golden Tyndall Beam) - 饱满大气的斜向金光束轮廓
      vec3 tyndallGold = mix(vec3(1.0, 0.82, 0.32), vec3(1.0, 0.96, 0.72), light);
      float ray = pow(max(0.0, 0.5 + 0.5 * sin((p.x * 0.75 - p.y * 1.1 + view.x * 2.2) * 18.0)), 2.6);
      emission = (tyndallGold * 1.15 + vec3(ray * 0.42)) * line * envelope * effectivePower * 36.0 * effectiveContour;
    } else {
      // 2: 稀有级 · 全息虹彩全光谱 (Full Holo Rainbow HDR) - 图 1 标志性七彩超频辉光
      emission = (spectrum * 0.85 + vec3(0.15)) * line * envelope * effectivePower * 42.0 * effectiveContour;
    }
  }

  // 十字四角星芒与微晶闪点
  vec2 cell = fract(p * vec2(24.0, 32.0)) - 0.5;
  float seed = hash(floor(p * vec2(24.0, 32.0)));
  float star =
    pow(max(0.0, 1.0 - abs(cell.x) * 18.0), 14.0) * pow(max(0.0, 1.0 - abs(cell.y) * 2.0), 6.0) +
    pow(max(0.0, 1.0 - abs(cell.y) * 18.0), 14.0) * pow(max(0.0, 1.0 - abs(cell.x) * 2.0), 6.0);

  base += beamColor * (star * step(0.962, seed) * light * 0.68 + micro * light * 0.14) *
          effectivePower * starIntensity * (1.0 - um * 0.6) * cardMask;

  // 叠加图 1 风格清晰 UI 文字、徽章、胶囊与扇形按钮层
  // 对 UI 中的边框与扇形按钮区域施加额外的流光全息高光
  vec3 uiHolo = uiSample.rgb + beamColor * light * 0.22 * effectivePower * step(0.65, max(uiSample.r, uiSample.b));
  base = mix(base, clamp(uiHolo, 0.0, 1.0), um);

  float glare = pow(max(0.0, 1.0 - length((p - vec2(0.5 + view.x, 0.55 + view.y)) * vec2(1.0, 0.75))), 5.0);
  base += vec3(glare * 0.13 * effectivePower * glareIntensity) * finalAlpha;
  base /= max(finalAlpha, 0.0001);

  // ============================================================================
  // 内嵌流光边框 (支持 5 种预设稀有度颜色或色盘自定义配置)
  // ============================================================================
  vec2 corner = abs((p - 0.5) * vec2(1.0, cardAspect)) - (vec2(0.482, cardAspect * 0.5 - 0.018) - vec2(0.032));
  float distanceToInner = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - 0.032;
  float inside = 1.0 - smoothstep(-pixelWidth * 1.5, pixelWidth * 1.5, distanceToInner);
  float rim = (1.0 - inside) * cardMask * rimStrength;

  vec3 chosenRimColor;
  if (useCustomColors > 0.5) {
    chosenRimColor = customRimColor;
  } else {
    chosenRimColor = computeRimColor(rimColorType, spectrum, phase);
  }
  float rimSparkle = (star * step(0.92, seed) * 0.55 + micro * 0.25) * starIntensity;
  vec3 rimFinal = chosenRimColor + vec3(glare * 0.24 + light * 0.22 * effectivePower + rimSparkle);
  base = mix(base, clamp(rimFinal, 0.0, 1.0), rim * 0.85);

  emission *= (1.0 - um) * foregroundMask;

  if (glowPass > 0.5) {
    gl_FragColor = encodeHDR(max(emission - vec3(1.0), vec3(0.0)));
    return;
  }

  vec3 bloom = (decodeHDR(texture2D(bloomNear, uv)) * 0.55 + decodeHDR(texture2D(bloomWide, uv)) * 0.8) * bloomIntensity;
  bloom *= foregroundMask * (1.0 - um) * line;

  if (inspectMode == 2) {
    vec3 glowOnly = 1.0 - exp(-(emission * 0.38 + bloom * 0.85));
    gl_FragColor = vec4(pow(clamp(glowOnly, 0.0, 1.0), vec3(1.0 / 2.2)), max(cardMask, ch.a));
    return;
  }

  vec3 linear = pow(clamp(base, 0.0, 1.0), vec3(2.2));
  vec3 combined = 1.0 - (1.0 - linear) * exp(-(emission * 0.38 + bloom * 0.85));
  gl_FragColor = vec4(pow(clamp(combined, 0.0, 1.0), vec3(1.0 / 2.2)) * finalAlpha, finalAlpha);
}`;

const blurFragmentSource = `precision highp float;
varying vec2 uv;
uniform sampler2D source;
uniform vec2 stepSize;

vec3 decodeHDR(vec4 c) {
  return c.rgb * c.a * 64.0;
}

vec4 encodeHDR(vec3 c) {
  float m = clamp(ceil(max(max(c.r, c.g), c.b) / 64.0 * 255.0) / 255.0, 1.0 / 255.0, 1.0);
  return vec4(c / (64.0 * m), m);
}

void main() {
  vec3 c = vec3(0.0);
  float total = 0.0;
  for (int i = -4; i <= 4; i++) {
    float f = float(i);
    float w = exp(-f * f / 8.0);
    c += decodeHDR(texture2D(source, uv + stepSize * f)) * w;
    total += w;
  }
  gl_FragColor = encodeHDR(c / total);
}`;

const INSPECT_MODE_MAP: Record<TcgInspectionMode, number> = {
  composite: 0,
  'no-glow': 1,
  'bloom-only': 2,
  'structure-mask': 3,
  'background-only': 4,
  'character-only': 5,
  'ui-only': 6,
};

const MASK_TYPE_MAP: Record<OpticalMaskType, number> = {
  'frosted-seal': 0,
  'holo-rainbow': 1,
  sunbeam: 2,
  'prism-dispersion': 3,
  'cosmic-stardust': 4,
  'etched-foil': 5,
};

const RIM_COLOR_MAP: Record<RimColorType, number> = {
  'pearl-blue': 0,
  rainbow: 1,
  gold: 2,
  purple: 3,
  silver: 4,
};

const STRUCTURE_LIGHT_MAP: Record<StructureLightMode, number> = {
  'subtle-sun': 0,
  'tyndall-gold': 1,
  'holo-rainbow': 2,
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return [r, g, b];
  }
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [1, 1, 1];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function loadAlignedImage(src: string, width: number, height: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (img.naturalWidth === width && img.naturalHeight === height) {
        resolve(img);
      } else {
        const off = document.createElement('canvas');
        off.width = width;
        off.height = height;
        const ctx = off.getContext('2d');
        if (!ctx) {
          resolve(img);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const scaled = new Image();
        scaled.onload = () => resolve(scaled);
        scaled.onerror = () => reject(new Error('图层尺寸缩放失败'));
        scaled.src = off.toDataURL('image/png');
      }
    };
    img.onerror = () => reject(new Error('资源加载失败: ' + src.slice(0, 64)));
    img.src = src;
  });
}

export interface ExtendedTcgCardHandle extends TcgCardHandle {
  updateLayerTexture(
    kind: 'character' | 'background' | 'ui' | 'structure' | 'back',
    src: string
  ): Promise<void>;
  flipToFront(durationMs?: number, onComplete?: () => void): void;
  setRotation(x: number, y: number): void;
  isFlipped(): boolean;
}

export async function mountTcgHoloCard(
  host: HTMLElement,
  assets: TcgCardAssets,
  initialParams: Partial<TcgHoloParameters> = {},
  onError?: (err: Error) => void,
  onFlipChange?: (flipped: boolean) => void,
  cardWidth?: number
): Promise<ExtendedTcgCardHandle> {
  injectTcgHoloStyles();
  let params: TcgHoloParameters = { ...DEFAULT_TCG_PARAMETERS, ...initialParams };
  let inspectMode: TcgInspectionMode = 'composite';
  let freeDrag = true;

  const stage = document.createElement('div');
  stage.className = 'tcg-stage';

  const card = document.createElement('div');
  card.className = 'tcg-card';
  if (cardWidth && cardWidth > 0) {
    card.style.width = `${cardWidth}px`;
    card.style.maxWidth = '100%';
  }
  card.tabIndex = 0;
  const aspect = assets.height / assets.width;
  card.style.setProperty('--card-aspect', String(aspect));
  card.style.aspectRatio = `${assets.width} / ${assets.height}`;

  const front = document.createElement('div');
  front.className = 'tcg-face tcg-front';
  const canvas = document.createElement('canvas');
  front.append(canvas);

  const back = document.createElement('div');
  back.className = 'tcg-face tcg-back';
  const backImg = document.createElement('img');
  backImg.alt = 'Card Back';
  backImg.src = assets.back || '/back.png';
  back.append(backImg);

  card.append(front, back);
  stage.append(card);
  host.replaceChildren(stage);

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });

  if (!gl) {
    const err = new Error('当前浏览器环境不支持 WebGL');
    onError?.(err);
    throw err;
  }

  const shaders: WebGLShader[] = [];
  const programs: WebGLProgram[] = [];
  const textures: WebGLTexture[] = [];
  const frames: WebGLFramebuffer[] = [];

  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  function compile(type: number, source: string): WebGLShader {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      throw new Error(gl!.getShaderInfoLog(shader) || 'Shader 编译错误');
    }
    shaders.push(shader);
    return shader;
  }

  function createProgram(fragSource: string): WebGLProgram {
    const p = gl!.createProgram()!;
    gl!.attachShader(p, compile(gl!.VERTEX_SHADER, vertexShaderSource));
    gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fragSource));
    gl!.linkProgram(p);
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
      throw new Error(gl!.getProgramInfoLog(p) || 'Shader 链接错误');
    }
    programs.push(p);
    return p;
  }

  const sceneProg = createProgram(fragmentShaderSource);
  const blurProg = createProgram(blurFragmentSource);

  function useProgram(p: WebGLProgram) {
    gl!.useProgram(p);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
    const a = gl!.getAttribLocation(p, 'position');
    gl!.enableVertexAttribArray(a);
    gl!.vertexAttribPointer(a, 2, gl!.FLOAT, false, 0, 0);
  }

  function createTex(filter: number): WebGLTexture {
    const t = gl!.createTexture()!;
    textures.push(t);
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    return t;
  }

  const loadedImages = await Promise.all([
    loadAlignedImage(assets.character, assets.width, assets.height),
    loadAlignedImage(assets.background, assets.width, assets.height),
    loadAlignedImage(assets.ui, assets.width, assets.height),
    loadAlignedImage(assets.structure, assets.width, assets.height),
  ]);

  const artTextures = loadedImages.map((image) => {
    const t = createTex(gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return t;
  });

  canvas.width = window.innerWidth < 640 ? 1036 : 1280;
  canvas.height = Math.round(canvas.width * aspect);

  interface RenderTarget {
    t: WebGLTexture;
    f: WebGLFramebuffer;
    w: number;
    h: number;
  }

  function createTarget(scale: number): RenderTarget {
    const w = Math.round(canvas.width * scale);
    const h = Math.round(canvas.height * scale);
    const t = createTex(gl!.LINEAR);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    const f = gl!.createFramebuffer()!;
    frames.push(f);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, f);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, t, 0);
    if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) !== gl!.FRAMEBUFFER_COMPLETE) {
      throw new Error('HDR Bloom 离屏帧缓冲初始化失败');
    }
    return { t, f, w, h };
  }

  const emissionTarget = createTarget(0.5);
  const tempTarget = createTarget(0.5);
  const nearTarget = createTarget(0.5);
  const wideTempTarget = createTarget(0.25);
  const wideTarget = createTarget(0.25);

  const sceneU = {
    view: gl.getUniformLocation(sceneProg, 'view'),
    power: gl.getUniformLocation(sceneProg, 'power'),
    depth: gl.getUniformLocation(sceneProg, 'depth'),
    contourBrightness: gl.getUniformLocation(sceneProg, 'contourBrightness'),
    pass: gl.getUniformLocation(sceneProg, 'glowPass'),
    extracted: gl.getUniformLocation(sceneProg, 'extracted'),
    starIntensity: gl.getUniformLocation(sceneProg, 'starIntensity'),
    bloomIntensity: gl.getUniformLocation(sceneProg, 'bloomIntensity'),
    glareIntensity: gl.getUniformLocation(sceneProg, 'glareIntensity'),
    bgZoom: gl.getUniformLocation(sceneProg, 'bgZoom'),
    rimStrength: gl.getUniformLocation(sceneProg, 'rimStrength'),
    maskIntensity: gl.getUniformLocation(sceneProg, 'maskIntensity'),
    frostedBlur: gl.getUniformLocation(sceneProg, 'frostedBlur'),
    maskType: gl.getUniformLocation(sceneProg, 'maskType'),
    rimColorType: gl.getUniformLocation(sceneProg, 'rimColorType'),
    structureLightType: gl.getUniformLocation(sceneProg, 'structureLightType'),
    inspectMode: gl.getUniformLocation(sceneProg, 'inspectMode'),
    isSealed: gl.getUniformLocation(sceneProg, 'isSealed'),
    customRimColor: gl.getUniformLocation(sceneProg, 'customRimColor'),
    customBeamColor: gl.getUniformLocation(sceneProg, 'customBeamColor'),
    useCustomColors: gl.getUniformLocation(sceneProg, 'useCustomColors'),
    beamAngle: gl.getUniformLocation(sceneProg, 'beamAngle'),
    beamWidth: gl.getUniformLocation(sceneProg, 'beamWidth'),
    beamIntensity: gl.getUniformLocation(sceneProg, 'beamIntensity'),
  };

  useProgram(sceneProg);
  gl.uniform1f(gl.getUniformLocation(sceneProg, 'cardAspect'), aspect);
  gl.uniform1i(gl.getUniformLocation(sceneProg, 'structureTex'), 5);
  gl.uniform1f(gl.getUniformLocation(sceneProg, 'pixelWidth'), 1 / canvas.width);
  ['art', 'bg', 'uiTex', 'bloomNear', 'bloomWide'].forEach((name, i) =>
    gl.uniform1i(gl.getUniformLocation(sceneProg, name), i)
  );

  useProgram(blurProg);
  gl.uniform1i(gl.getUniformLocation(blurProg, 'source'), 0);
  const blurStepLoc = gl.getUniformLocation(blurProg, 'stepSize');

  function bindTex(t: WebGLTexture, unit = 0) {
    gl!.activeTexture(gl!.TEXTURE0 + unit);
    gl!.bindTexture(gl!.TEXTURE_2D, t);
  }

  function blurPass(src: RenderTarget, dst: RenderTarget, x: number, y: number) {
    useProgram(blurProg);
    bindTex(src.t, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, dst.f);
    gl!.viewport(0, 0, dst.w, dst.h);
    gl!.uniform2f(blurStepLoc, x / src.w, y / src.h);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
  }

  function drawShader(degX: number, degY: number) {
    useProgram(sceneProg);
    artTextures.forEach((t, i) => bindTex(t, i === 3 ? 5 : i));
    bindTex(nearTarget.t, 3);
    bindTex(wideTarget.t, 4);

    gl!.uniform2f(
      sceneU.view,
      Math.sin((degY * Math.PI) / 180) * 0.65,
      Math.sin((degX * Math.PI) / 180) * 0.65
    );
    gl!.uniform1f(sceneU.power, params.power);
    gl!.uniform1f(sceneU.depth, params.depth);
    gl!.uniform1f(sceneU.contourBrightness, params.contourBrightness);
    gl!.uniform1f(sceneU.extracted, params.useExtractedStructure ? 1.0 : 0.0);
    gl!.uniform1f(sceneU.starIntensity, params.starIntensity);
    gl!.uniform1f(sceneU.bloomIntensity, params.bloomIntensity);
    gl!.uniform1f(sceneU.glareIntensity, params.glareIntensity);
    gl!.uniform1f(sceneU.bgZoom, params.bgZoom);
    gl!.uniform1f(sceneU.rimStrength, params.rimStrength);
    gl!.uniform1f(sceneU.maskIntensity, params.maskIntensity);
    gl!.uniform1f(sceneU.frostedBlur, params.frostedBlur);
    gl!.uniform1i(sceneU.maskType, MASK_TYPE_MAP[params.opticalMask] ?? 0);
    gl!.uniform1i(sceneU.rimColorType, RIM_COLOR_MAP[params.rimColor] ?? 0);
    gl!.uniform1i(
      sceneU.structureLightType,
      STRUCTURE_LIGHT_MAP[params.structureLightMode] ?? 2
    );
    gl!.uniform1i(sceneU.inspectMode, INSPECT_MODE_MAP[inspectMode] ?? 0);
    gl!.uniform1f(sceneU.isSealed, params.isSealed ? 1.0 : 0.0);
    const rimRgb = hexToRgb(params.customRimColor || '#67e8f9');
    gl!.uniform3f(sceneU.customRimColor, rimRgb[0], rimRgb[1], rimRgb[2]);
    const beamRgb = hexToRgb(params.customBeamColor || '#ffffff');
    gl!.uniform3f(sceneU.customBeamColor, beamRgb[0], beamRgb[1], beamRgb[2]);
    gl!.uniform1f(sceneU.useCustomColors, params.useCustomColors ? 1.0 : 0.0);
    gl!.uniform1f(sceneU.beamAngle, params.beamAngle ?? 0);
    gl!.uniform1f(sceneU.beamWidth, params.beamWidth ?? 1.0);
    gl!.uniform1f(sceneU.beamIntensity, params.beamIntensity ?? 0.65);

    // Pass 1: 渲染 RGBM 自发光到 1/2 分辨率 FBO
    gl!.uniform1f(sceneU.pass, 1);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, emissionTarget.f);
    gl!.viewport(0, 0, emissionTarget.w, emissionTarget.h);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);

    // Pass 2~5: 双尺度 4 次高斯模糊
    blurPass(emissionTarget, tempTarget, 1.2, 0);
    blurPass(tempTarget, nearTarget, 0, 1.2);
    blurPass(nearTarget, wideTempTarget, 5, 0);
    blurPass(wideTempTarget, wideTarget, 0, 2.5);

    // Pass 6: 最终主屏合成
    useProgram(sceneProg);
    artTextures.forEach((t, i) => bindTex(t, i === 3 ? 5 : i));
    bindTex(nearTarget.t, 3);
    bindTex(wideTarget.t, 4);
    gl!.uniform1f(sceneU.pass, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
  }

  const initRotationY = (initialParams as any)?.initialRotationY !== undefined
    ? (initialParams as any).initialRotationY
    : -10;
  const initBaseY = (initialParams as any)?.initialRotationY !== undefined
    ? (initialParams as any).initialRotationY
    : 0;

  const m = {
    x: initRotationY === 180 ? 0 : -4,
    y: initRotationY,
    tx: initRotationY === 180 ? 0 : -4,
    ty: initRotationY,
    base: initBaseY,
    down: false,
    px: 0,
    py: 0,
    moved: false,
    pointer: null as number | null,
    startX: 0,
    startY: 0,
  };

  let dirty = true;
  let disposed = false;
  let raf = 0;
  let lastX = 999;
  let lastY = 999;

  let motionEnabled = false;
  let origin: { beta: number; gamma: number } | null = null;
  let sensorX = 0;
  let sensorY = 0;
  let orientationSeen = false;

  const wrap = (v: number) => (((v + 180) % 360) + 360) % 360 - 180;
  const clampAngle = (v: number) => Math.max(-28, Math.min(28, v));

  function calibrate() {
    origin = null;
    sensorX = 0;
    sensorY = 0;
    m.tx = 0;
    m.ty = m.base;
    dirty = true;
  }

  function onOrientation(e: DeviceOrientationEvent) {
    if (!motionEnabled || document.hidden || e.beta === null || e.gamma === null) return;
    if (!Number.isFinite(e.beta) || !Number.isFinite(e.gamma)) return;
    orientationSeen = true;
    if (!origin) origin = { beta: e.beta, gamma: e.gamma };
    const b = wrap(e.beta - origin.beta);
    const g = wrap(e.gamma - origin.gamma);
    const a = ((window.screen?.orientation?.angle ?? 0) * Math.PI) / 180;
    sensorX = clampAngle(-(b * Math.cos(a) + g * Math.sin(a)) * 0.85);
    sensorY = clampAngle((g * Math.cos(a) - b * Math.sin(a)) * 0.85);
  }

  function onMotion(e: DeviceMotionEvent) {
    if (orientationSeen || !motionEnabled || document.hidden) return;
    const g = e.accelerationIncludingGravity;
    if (!g || g.x === null || g.y === null || g.z === null) return;
    if (Math.hypot(g.x, g.y, g.z) < 1) return;
    onOrientation({
      beta: (Math.atan2(-g.y, Math.hypot(g.x, g.z)) * 180) / Math.PI,
      gamma: (Math.atan2(g.x, -g.z) * 180) / Math.PI,
    } as DeviceOrientationEvent);
    orientationSeen = false;
  }

  const flip = () => {
    m.base += 180;
    m.tx = 0;
    m.ty = m.base;
    dirty = true;
    const isNowBack = Math.abs(Math.round(m.base / 180) % 2) === 1;
    onFlipChange?.(isNowBack);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flip();
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      if (e.key === 'ArrowLeft') m.ty -= 8;
      if (e.key === 'ArrowRight') m.ty += 8;
      if (e.key === 'ArrowUp') m.tx = Math.min(45, m.tx + 8);
      if (e.key === 'ArrowDown') m.tx = Math.max(-45, m.tx - 8);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (m.pointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    m.pointer = e.pointerId;
    m.startX = e.clientX;
    m.startY = e.clientY;
    m.down = true;
    m.px = e.clientX;
    m.py = e.clientY;
    m.moved = false;
    card.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (m.down && m.pointer === e.pointerId && freeDrag) {
      const dx = e.clientX - m.px;
      const dy = e.clientY - m.py;
      if (Math.hypot(e.clientX - m.startX, e.clientY - m.startY) > 5) m.moved = true;
      m.ty += dx * 0.62;
      m.tx = Math.max(-50, Math.min(50, m.tx - dy * 0.3));
      m.px = e.clientX;
      m.py = e.clientY;
    } else if (!m.down && !motionEnabled) {
      const rect = stage.getBoundingClientRect();
      const relX = (e.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width);
      const relY = (e.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height);
      m.tx = Math.max(-30, Math.min(30, -relY * 36));
      m.ty = m.base + Math.max(-35, Math.min(35, relX * 44));
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (m.pointer !== e.pointerId) return;
    m.pointer = null;
    m.down = false;
    if (card.hasPointerCapture(e.pointerId)) {
      card.releasePointerCapture(e.pointerId);
    }
    if (!m.moved) {
      flip();
    } else {
      m.base = Math.round(m.ty / 180) * 180;
      const isNowBack = Math.abs(Math.round(m.base / 180) % 2) === 1;
      onFlipChange?.(isNowBack);
    }
  };

  const cancelDrag = () => {
    m.pointer = null;
    m.down = false;
    m.base = Math.round(m.ty / 180) * 180;
  };

  const onPointerLeave = () => {
    if (!m.down && !motionEnabled) {
      m.tx = 0;
      m.ty = m.base;
    }
  };

  card.addEventListener('keydown', onKeyDown);
  card.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointerup', onPointerUp);
  card.addEventListener('pointercancel', cancelDrag);
  stage.addEventListener('pointerleave', onPointerLeave);

  function frameLoop() {
    if (disposed) return;
    if (motionEnabled && !m.down) {
      m.tx = sensorX;
      m.ty = m.base + sensorY;
    }
    const ease = 0.115;
    m.x += (m.tx - m.x) * ease;
    m.y += (m.ty - m.y) * ease;
    card.style.transform = `rotateX(${m.x}deg) rotateY(${m.y}deg)`;

    const visible =
      Math.cos((m.y * Math.PI) / 180) * Math.cos((m.x * Math.PI) / 180) > 0.001;
    front.style.visibility = visible ? 'visible' : 'hidden';
    back.style.visibility = visible ? 'hidden' : 'visible';

    if (
      !document.hidden &&
      visible &&
      (dirty || Math.abs(m.x - lastX) > 0.015 || Math.abs(m.y - lastY) > 0.015)
    ) {
      drawShader(m.x, m.y);
      dirty = false;
      lastX = m.x;
      lastY = m.y;
    }

    raf = requestAnimationFrame(frameLoop);
  }

  raf = requestAnimationFrame(frameLoop);

  return {
    async updateLayerTexture(kind, src) {
      if (disposed) return;
      if (kind === 'back') {
        backImg.src = src || '/back.png';
        return;
      }
      const idxMap: Record<'character' | 'background' | 'ui' | 'structure', number> = {
        character: 0,
        background: 1,
        ui: 2,
        structure: 3,
      };
      const idx = idxMap[kind];
      const img = await loadAlignedImage(src, assets.width, assets.height);
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, artTextures[idx]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      dirty = true;
    },
    setParameters(value: Partial<TcgHoloParameters>) {
      params = { ...params, ...value };
      dirty = true;
    },
    getParameters() {
      return { ...params };
    },
    setInspection(mode: TcgInspectionMode) {
      inspectMode = mode;
      dirty = true;
    },
    flipCard() {
      flip();
    },
    flipToFront(durationMs = 850, onComplete?: () => void) {
      const startY = m.y;
      const targetY = 0;
      const startTime = performance.now();
      m.base = 0;
      m.tx = 0;
      m.ty = 0;

      let isDone = false;
      function step(now: number) {
        if (isDone || disposed) return;
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / durationMs);
        const t = progress;
        const eased = 1 - Math.pow(1 - t, 3);
        m.y = startY + (targetY - startY) * eased;
        m.ty = m.y;
        dirty = true;

        if (progress < 1.0) {
          requestAnimationFrame(step);
        } else {
          isDone = true;
          m.y = 0;
          m.ty = 0;
          m.base = 0;
          dirty = true;
          onFlipChange?.(false);
          onComplete?.();
        }
      }
      requestAnimationFrame(step);
    },
    setRotation(x: number, y: number) {
      m.tx = x;
      m.ty = y;
      m.x = x;
      m.y = y;
      dirty = true;
    },
    setFlipped(flipped: boolean) {
      const currentBack = Math.abs(Math.round(m.base / 180) % 2) === 1;
      if (currentBack !== flipped) {
        flip();
      }
    },
    isFlipped() {
      return Math.abs(Math.round(m.base / 180) % 2) === 1;
    },
    recenter() {
      calibrate();
    },
    setFreeDrag(enabled: boolean) {
      freeDrag = enabled;
    },
    async enableGyroscope(): Promise<boolean> {
      if (motionEnabled) return true;
      try {
        const DOEvent = globalThis.DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<string>;
        };
        const DMEvent = globalThis.DeviceMotionEvent as unknown as {
          requestPermission?: () => Promise<string>;
        };
        const reqs = [DOEvent, DMEvent]
          .filter(Boolean)
          .map((api) =>
            typeof api.requestPermission === 'function'
              ? api.requestPermission()
              : Promise.resolve('granted')
          );
        const results = await Promise.allSettled(reqs);
        if (!results.some((r) => r.status === 'fulfilled' && r.value === 'granted')) {
          return false;
        }
        orientationSeen = false;
        calibrate();
        motionEnabled = true;
        window.addEventListener('deviceorientation', onOrientation);
        window.addEventListener('devicemotion', onMotion);
        return true;
      } catch {
        return false;
      }
    },
    disableGyroscope() {
      motionEnabled = false;
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('devicemotion', onMotion);
    },
    isGyroscopeEnabled() {
      return motionEnabled;
    },
    async exportPng(): Promise<Blob> {
      drawShader(m.x, m.y);
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('闪卡 PNG 导出失败'));
        }, 'image/png');
      });
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('devicemotion', onMotion);
      card.removeEventListener('keydown', onKeyDown);
      card.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerup', onPointerUp);
      card.removeEventListener('pointercancel', cancelDrag);
      stage.removeEventListener('pointerleave', onPointerLeave);
      frames.forEach((f) => gl.deleteFramebuffer(f));
      textures.forEach((t) => gl.deleteTexture(t));
      shaders.forEach((s) => gl.deleteShader(s));
      programs.forEach((p) => gl.deleteProgram(p));
      gl.deleteBuffer(buffer);
      host.replaceChildren();
    },
  };
}
