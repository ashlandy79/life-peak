import type {
  CardAttributeCategory,
  CardRarityTier,
  LifeSealCardMeta,
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TcgHoloParameters,
  TcgPreset,
} from './tcgTypes';

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
    label: '稀有 (Rare)',
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

export const RIM_COLOR_OPTIONS: {
  value: RimColorType;
  label: string;
  desc: string;
}[] = [
  {
    value: 'pearl-blue',
    label: '珍珠蓝 (Pearl Blue)',
    desc: '冰川珍珠蓝 + 青紫霓虹全息泛光',
  },
  {
    value: 'rainbow',
    label: '彩色 (Rainbow)',
    desc: '全光谱高饱和七彩棱镜流光',
  },
  {
    value: 'gold',
    label: '金色 (Royal Gold)',
    desc: '皇家香槟流金基底 + 暖白耀斑折射',
  },
  {
    value: 'purple',
    label: '紫色 (Mystic Purple)',
    desc: '深邃星云紫罗兰 + 洋红电光边缘流转',
  },
  {
    value: 'silver',
    label: '银灰色 (Titanium Silver)',
    desc: '冷调钛金拉丝银灰 + 高对比金属冷光',
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
    desc: '动态多束斜向体积光柱穿透卡面，伴随暖金晨曦微尘',
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
    desc: 'RGB 三通道光学色散微偏移 + 菱形水晶切面折射',
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
    isSealed: true,
  },
  'popout-max': {
    depth: 1.6,
    contourBrightness: 0.45,
    power: 1.35,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.4,
    frostedBlur: 0.0,
    rimColor: 'pearl-blue',
    rimStrength: 0.95,
    structureLightMode: 'holo-rainbow',
    starIntensity: 1.3,
    bloomIntensity: 1.25,
    glareIntensity: 1.2,
    bgZoom: 1.8,
    isSealed: false,
  },
  shadowbox: {
    depth: -1.2,
    contourBrightness: 0.22,
    power: 0.85,
    opticalMask: 'prism-dispersion',
    maskIntensity: 0.9,
    frostedBlur: 0.0,
    rimColor: 'gold',
    rimStrength: 0.85,
    structureLightMode: 'tyndall-gold',
    starIntensity: 0.8,
    bloomIntensity: 0.9,
    glareIntensity: 0.9,
    bgZoom: 1.5,
    isSealed: false,
  },
  'sunbeam-unsealed': {
    depth: 0.85,
    contourBrightness: 0.35,
    power: 1.15,
    opticalMask: 'sunbeam',
    maskIntensity: 1.3,
    frostedBlur: 0.0,
    rimColor: 'gold',
    rimStrength: 0.9,
    structureLightMode: 'tyndall-gold',
    starIntensity: 1.0,
    bloomIntensity: 1.1,
    glareIntensity: 1.1,
    bgZoom: 1.65,
    isSealed: false,
  },
  'neon-bloom': {
    depth: 0.95,
    contourBrightness: 0.65,
    power: 1.45,
    opticalMask: 'holo-rainbow',
    maskIntensity: 1.35,
    frostedBlur: 0.0,
    rimColor: 'rainbow',
    rimStrength: 1.0,
    structureLightMode: 'holo-rainbow',
    starIntensity: 1.5,
    bloomIntensity: 1.6,
    glareIntensity: 1.3,
    bgZoom: 1.7,
    isSealed: false,
  },
};
