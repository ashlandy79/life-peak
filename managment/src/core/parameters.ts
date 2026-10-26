import type {
  CardAttributeCategory,
  CardRarityTier,
  LifeSealCardMeta,
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TcgHoloParameters,
  TcgPreset,
} from './types';

export interface CardTierSpec {
  tier: CardRarityTier;
  label: string;
  badge: string;
  desc: string;
  rimColor: RimColorType;
  structureLightMode: StructureLightMode;
  structureLightLabel: string;
  defaultRarityText: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

export const CARD_RARITY_TIERS: Record<CardRarityTier, CardTierSpec> = {
  common: {
    tier: 'common',
    label: '普通 (Common)',
    badge: '银灰色',
    desc: '冷调拉丝银灰框 · 微弱白暖日光线条 · 统一全息虹彩蒙版',
    rimColor: 'silver',
    structureLightMode: 'subtle-sun',
    structureLightLabel: '微弱阳光',
    defaultRarityText: 'COMMON · LIFE EVENT',
    palette: {
      primary: '#cbd5e1',
      secondary: '#94a3b8',
      accent: '#64748b',
      glow: 'rgba(203, 213, 225, 0.45)',
    },
  },
  advanced: {
    tier: 'advanced',
    label: '高级 (Advanced)',
    badge: '流金色',
    desc: '皇家香槟流金框 · 暖金丁达尔圣光光束 · 统一全息虹彩蒙版',
    rimColor: 'gold',
    structureLightMode: 'tyndall-gold',
    structureLightLabel: '暖金丁达尔',
    defaultRarityText: 'ADVANCED · LIFE EVENT',
    palette: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#d97706',
      glow: 'rgba(245, 158, 11, 0.65)',
    },
  },
  rare: {
    tier: 'rare',
    label: '稀有 (Rare / 图1)',
    badge: '珍珠蓝',
    desc: '图 1 标志性珍珠蓝全息双层框 · 全息虹彩 HDR 超频发光 · 统一全息虹彩蒙版',
    rimColor: 'pearl-blue',
    structureLightMode: 'holo-rainbow',
    structureLightLabel: '全息虹彩',
    defaultRarityText: 'RARE · LIFE EVENT',
    palette: {
      primary: '#67e8f9',
      secondary: '#818cf8',
      accent: '#ec4899',
      glow: 'rgba(56, 189, 248, 0.65)',
    },
  },
};

export interface ParameterControlSpec {
  label: string;
  description: string;
  max: number;
  min: number;
  step: number;
  unit?: string;
}

export const RIM_COLOR_OPTIONS: {
  value: RimColorType;
  label: string;
  desc: string;
  previewGradient: string;
}[] = [
  {
    value: 'pearl-blue',
    label: '珍珠蓝 (Pearl Blue)',
    desc: '图 1 同款：冰川珍珠蓝 + 青紫霓虹全息泛光',
    previewGradient: 'from-cyan-400 via-blue-400 to-purple-400',
  },
  {
    value: 'rainbow',
    label: '彩色 (Rainbow)',
    desc: '全光谱高饱和七彩棱镜流光',
    previewGradient: 'from-pink-500 via-amber-400 to-cyan-400',
  },
  {
    value: 'gold',
    label: '金色 (Royal Gold)',
    desc: '皇家香槟流金基底 + 暖白耀斑折射',
    previewGradient: 'from-amber-300 via-yellow-500 to-amber-600',
  },
  {
    value: 'purple',
    label: '紫色 (Mystic Purple)',
    desc: '深邃星云紫罗兰 + 洋红电光边缘流转',
    previewGradient: 'from-purple-500 via-fuchsia-500 to-indigo-500',
  },
  {
    value: 'silver',
    label: '银灰色 (Titanium Silver)',
    desc: '冷调钛金拉丝银灰 + 高对比金属冷光',
    previewGradient: 'from-slate-300 via-zinc-400 to-slate-500',
  },
];

export const OPTICAL_MASK_OPTIONS: {
  value: OpticalMaskType;
  label: string;
  badge: string;
  desc: string;
}[] = [
  {
    value: 'frosted-seal',
    label: '封印毛玻璃蒙版',
    badge: '图1同款',
    desc: '黄金角螺旋磨砂模糊 + 微表面法线扰动 + 全息彩色噪点，核心画面半透可见',
  },
  {
    value: 'sunbeam',
    label: '丁达尔阳光蒙版',
    badge: '体积光柱',
    desc: '动态多束斜向体积光柱 (Volumetric God Rays) 穿透卡面，伴随暖金晨曦微尘',
  },
  {
    value: 'holo-rainbow',
    label: '全息虹彩蒙版',
    badge: '经典干涉',
    desc: '双频斜向干涉彩虹光带扫光 + 背景十字四角星芒闪烁',
  },
  {
    value: 'prism-dispersion',
    label: '棱镜色散蒙版',
    badge: '水晶折光',
    desc: 'RGB 三通道光学色散微偏移 (Chromatic Aberration) + 菱形水晶切面折射',
  },
  {
    value: 'cosmic-stardust',
    label: '星云流沙蒙版',
    badge: '极光星尘',
    desc: '双层深度视差极光星云薄雾 + 随倾角缓慢流动的细密流沙金粉',
  },
  {
    value: 'etched-foil',
    label: '金属蚀刻蒙版',
    badge: '放射闪纹',
    desc: '模拟实体高罕卡牌微雕放射状金属光栅纹理，产生锐利的各向异性反光',
  },
];

export const ATTRIBUTE_CATEGORIES: {
  value: CardAttributeCategory;
  label: string;
  color: string;
}[] = [
  { value: 'food', label: '食物', color: '#f97316' },
  { value: 'travel', label: '出行', color: '#38bdf8' },
  { value: 'social', label: '社交', color: '#a855f7' },
  { value: 'night', label: '夜间', color: '#818cf8' },
  { value: 'self', label: '自我', color: '#34d399' },
  { value: 'emotion', label: '情绪', color: '#f43f5e' },
];

export type TcgNumericParamKey = Exclude<
  keyof TcgHoloParameters,
  | 'useExtractedStructure'
  | 'opticalMask'
  | 'rimColor'
  | 'structureLightMode'
  | 'customRimColor'
  | 'customBeamColor'
  | 'useCustomColors'
  | 'isSealed'
>;

export const TCG_PARAMETER_CONTROLS: Record<TcgNumericParamKey, ParameterControlSpec> = {
  depth: {
    label: '正负双向景深 (Depth)',
    description: '负值 (-3~0) 向卡内退缩形成立体橱窗；正值 (0~+3) 突破卡框悬浮而出',
    min: -3,
    max: 3,
    step: 0.05,
    unit: '×',
  },
  frostedBlur: {
    label: '封印磨砂与噪点浓度 (Frosted Seal)',
    description: '控制核心画面的磨砂毛玻璃模糊度与全息彩色颗粒感（0 为完全解封清晰）',
    min: 0,
    max: 1.5,
    step: 0.05,
    unit: '×',
  },
  maskIntensity: {
    label: '光学蒙版强度 (Mask Intensity)',
    description: '调节当前所选光学蒙版（阳光/棱镜/毛玻璃/流沙/蚀刻）的显色权重',
    min: 0,
    max: 2,
    step: 0.05,
    unit: '×',
  },
  contourBrightness: {
    label: '结构线流光 (Contour Glow)',
    description: '沿着核心画面轮廓与线条触发的 40× RGBM HDR 彩虹自发光亮度',
    min: 0,
    max: 1,
    step: 0.01,
    unit: '×',
  },
  power: {
    label: '全息虹彩总强度 (Foil Power)',
    description: '斜向全息流光带对底板、边框与核心画面的折射总增益',
    min: 0,
    max: 2,
    step: 0.05,
    unit: '×',
  },
  rimStrength: {
    label: '内嵌流光框亮度 (Border Rim)',
    description: '调节卡片四周稀有度流光边框与扇形切角的全息反光强度',
    min: 0,
    max: 1,
    step: 0.05,
    unit: '×',
  },
  beamAngle: {
    label: '扫光束偏转角度 (Beam Angle)',
    description: '调节卡面动态扫光与丁达尔光束的投射倾角（-45° ~ +45°）',
    min: -45,
    max: 45,
    step: 1,
    unit: '°',
  },
  beamWidth: {
    label: '扫光束宽度 (Beam Width)',
    description: '调节光束凝聚度与宽度范围（0.5 聚焦窄束 ~ 2.5 柔和宽幅）',
    min: 0.5,
    max: 2.5,
    step: 0.05,
    unit: '×',
  },
  beamIntensity: {
    label: '扫光强度 (Beam Intensity)',
    description: '调节卡面扫光光线强度（调低可防止强光覆盖导致主体看不清）',
    min: 0,
    max: 2,
    step: 0.05,
    unit: '×',
  },
  bloomIntensity: {
    label: '双尺度辉光扩散 (HDR Bloom)',
    description: '半分辨率与 1/4 分辨率 4-Pass 离屏高斯模糊辉光强度',
    min: 0,
    max: 2,
    step: 0.05,
    unit: '×',
  },
  starIntensity: {
    label: '十字星芒闪点 (Cross Stars)',
    description: '背景与边框区域的程序化四角星芒与全息微晶闪烁强度',
    min: 0,
    max: 2,
    step: 0.05,
    unit: '×',
  },
  glareIntensity: {
    label: '聚光灯高光 (Glare)',
    description: '随倾角移动的宽幅镜面聚光反射强度',
    min: 0,
    max: 2,
    step: 0.05,
    unit: '×',
  },
  bgZoom: {
    label: '背景视差缩放 (BG Crop)',
    description: '背景底板放大倍率（默认 1.6×），确保大幅度倾斜时不漏黑边',
    min: 1.0,
    max: 2.5,
    step: 0.05,
    unit: '×',
  },
};

export const DEFAULT_LIFE_SEAL_META: LifeSealCardMeta = {
  tier: 'rare',
  enableOverlay: true,
  badgeCategory: 'food',
  badgeCustomText: '食物',
  cardNumber: '#027',
  showSealCrest: true,
  sealTitle: 'LIFE SEAL',
  taskHeader: '今日奇遇 #027',
  taskMainText: '去楼下便利店，\n买一瓶你没喝过的饮料。',
  taskSubText: '不准研究配料表。',
  tags: [
    { id: 'tag-1', icon: 'door', label: '出门', stars: 4 },
    { id: 'tag-2', icon: 'social', label: '社交', stars: 2 },
    { id: 'tag-3', icon: 'absurd', label: '荒谬', stars: 5 },
  ],
  sectorState: 'sealed',
  sectorCustomText: '已封印',
  rarityText: 'RARE · LIFE EVENT',
};

export const DEFAULT_TCG_PARAMETERS: TcgHoloParameters = {
  depth: 0.85,
  contourBrightness: 0.28,
  power: 1.05,
  opticalMask: 'holo-rainbow',
  maskIntensity: 1.15,
  frostedBlur: 0.65,
  rimColor: 'pearl-blue',
  rimStrength: 0.9,
  structureLightMode: 'holo-rainbow',
  starIntensity: 1.1,
  bloomIntensity: 1.0,
  glareIntensity: 1.0,
  bgZoom: 1.65,
  useExtractedStructure: true,
  customRimColor: '#67e8f9',
  customBeamColor: '#ffffff',
  useCustomColors: false,
  beamAngle: 0,
  beamWidth: 1.0,
  beamIntensity: 0.65,
  isSealed: true,
};

export const TCG_PRESETS: Record<Exclude<TcgPreset, 'custom'>, Partial<TcgHoloParameters>> = {
  'life-seal-default': {
    depth: 0.85,
    contourBrightness: 0.28,
    power: 1.05,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.15,
    frostedBlur: 0.65,
    rimColor: 'pearl-blue',
    rimStrength: 0.9,
    structureLightMode: 'holo-rainbow',
    starIntensity: 1.1,
    bloomIntensity: 1.0,
    glareIntensity: 1.0,
    bgZoom: 1.65,
  },
  'sunbeam-unsealed': {
    depth: 1.35,
    contourBrightness: 0.38,
    power: 1.15,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.4,
    frostedBlur: 0.0,
    rimColor: 'gold',
    rimStrength: 0.95,
    structureLightMode: 'tyndall-gold',
    starIntensity: 1.25,
    bloomIntensity: 1.2,
    glareIntensity: 1.3,
    bgZoom: 1.75,
  },
  'popout-max': {
    depth: 2.4,
    contourBrightness: 0.45,
    power: 1.3,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.3,
    frostedBlur: 0.15,
    rimColor: 'rainbow',
    rimStrength: 1.0,
    structureLightMode: 'holo-rainbow',
    starIntensity: 1.45,
    bloomIntensity: 1.35,
    glareIntensity: 1.2,
    bgZoom: 1.9,
  },
  shadowbox: {
    depth: -2.1,
    contourBrightness: 0.22,
    power: 1.0,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.25,
    frostedBlur: 0.35,
    rimColor: 'purple',
    rimStrength: 0.95,
    structureLightMode: 'subtle-sun',
    starIntensity: 1.3,
    bloomIntensity: 1.0,
    glareIntensity: 1.0,
    bgZoom: 2.0,
  },
  'neon-bloom': {
    depth: 1.5,
    contourBrightness: 0.78,
    power: 1.4,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.35,
    frostedBlur: 0.0,
    rimColor: 'rainbow',
    rimStrength: 0.85,
    structureLightMode: 'holo-rainbow',
    starIntensity: 1.5,
    bloomIntensity: 1.7,
    glareIntensity: 1.0,
    bgZoom: 1.8,
  },
};

export function resolveTcgParameters(
  values: Partial<TcgHoloParameters> = {},
  preset: TcgPreset = 'life-seal-default'
): TcgHoloParameters {
  const result: TcgHoloParameters = { ...DEFAULT_TCG_PARAMETERS };
  if (preset !== 'custom' && TCG_PRESETS[preset]) {
    Object.assign(result, TCG_PRESETS[preset]);
  }
  Object.assign(result, values);
  return result;
}
