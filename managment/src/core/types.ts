export type RimColorType = 'pearl-blue' | 'rainbow' | 'gold' | 'purple' | 'silver';

export type OpticalMaskType =
  | 'frosted-seal'
  | 'holo-rainbow'
  | 'sunbeam'
  | 'prism-dispersion'
  | 'cosmic-stardust'
  | 'etched-foil';

export type CardAttributeCategory =
  | 'food'
  | 'travel'
  | 'social'
  | 'night'
  | 'self'
  | 'emotion';

export type TagIconType =
  | 'door'
  | 'social'
  | 'absurd'
  | 'food'
  | 'travel'
  | 'night'
  | 'self'
  | 'emotion'
  | 'sparkle';

export interface AttributePillTag {
  id: string;
  icon: TagIconType;
  label: string;
  stars: number; // 1 ~ 5
}

export type SectorButtonState = 'sealed' | 'redeemed';

export type CardRarityTier = 'common' | 'advanced' | 'rare';

export type StructureLightMode = 'subtle-sun' | 'tyndall-gold' | 'holo-rainbow';

export interface LifeSealCardMeta {
  tier: CardRarityTier;
  enableOverlay: boolean;
  badgeCategory: CardAttributeCategory;
  badgeCustomText: string;
  cardNumber: string;
  showSealCrest: boolean;
  sealTitle: string;
  taskHeader: string;
  taskMainText: string;
  taskSubText: string;
  tags: AttributePillTag[];
  sectorState: SectorButtonState;
  sectorCustomText: string;
  rarityText: string;
}

export interface TcgHoloParameters {
  depth: number;                  // -3.0 ~ +3.0 (负值内凹橱窗，正值破框而出)
  contourBrightness: number;      // 0.0 ~ 1.0 (结构线 40× HDR 自发光强度)
  power: number;                  // 0.0 ~ 2.0 (全息虹彩扫光总强度)
  opticalMask: OpticalMaskType;   // 6 种光学蒙版类型
  maskIntensity: number;          // 0.0 ~ 2.0 (光学蒙版效果强度)
  frostedBlur: number;            // 0.0 ~ 1.5 (核心画面磨砂封印模糊度与全息噪点)
  rimColor: RimColorType;         // 5 种内嵌流光边框配色
  rimStrength: number;            // 0.0 ~ 1.0 (内嵌流光框显示强度)
  structureLightMode: StructureLightMode; // 结构线专属光效 (微弱阳光 / 暖金丁达尔 / 全息虹彩)
  starIntensity: number;          // 0.0 ~ 2.0 (十字星芒与微晶强度)
  bloomIntensity: number;         // 0.0 ~ 2.0 (双尺度 RGBM 高斯辉光强度)
  glareIntensity: number;         // 0.0 ~ 2.0 (移动聚光高光强度)
  bgZoom: number;                 // 1.0 ~ 2.5 (背景视差裁剪倍率)
  useExtractedStructure: boolean; // 是否使用提取的 structure 贴图
  // 色盘与光束自定义细化参数
  customRimColor: string;         // 自定义流光边框十六进制颜色 (例如 #67e8f9)
  customBeamColor: string;        // 自定义卡面扫光光束十六进制颜色 (例如 #ffffff)
  useCustomColors: boolean;       // 是否启用自定义色盘颜色
  beamAngle: number;              // 光束旋转倾角 (-45° ~ +45°)
  beamWidth: number;              // 光束宽度 (0.5 ~ 2.5)
  beamIntensity: number;          // 光束强度 (0.0 ~ 2.0，调节扫光亮度避免覆盖主体)
  isSealed: boolean;              // 是否处于封印状态 (封印态下深度置0纯平、关闭结构光与虹彩)
}

export type TcgPreset =
  | 'life-seal-default'
  | 'popout-max'
  | 'shadowbox'
  | 'sunbeam-unsealed'
  | 'neon-bloom'
  | 'custom';

export type TcgInspectionMode =
  | 'composite'
  | 'no-glow'
  | 'bloom-only'
  | 'structure-mask'
  | 'background-only'
  | 'character-only'
  | 'ui-only';

export interface TcgCardAssets {
  background: string;
  character: string;
  ui: string;
  structure: string;
  back: string;
  width: number;
  height: number;
}

export interface TcgCardHandle {
  setParameters(value: Partial<TcgHoloParameters>): void;
  getParameters(): TcgHoloParameters;
  setInspection(mode: TcgInspectionMode): void;
  flipCard(): void;
  setFlipped(flipped: boolean): void;
  isFlipped(): boolean;
  recenter(): void;
  setFreeDrag(enabled: boolean): void;
  enableGyroscope(): Promise<boolean>;
  disableGyroscope(): void;
  isGyroscopeEnabled(): boolean;
  exportPng(): Promise<Blob>;
  dispose(): void;
}
