import type {
  LifeSealCardMeta,
  OpticalMaskType,
  RimColorType,
  StructureLightMode,
  TagIconType,
  TcgHoloParameters,
} from './types';

export type ProductionStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'READY_FOR_EXPORT'
  | 'ARCHIVED';

export type AssetType =
  | 'SOURCE_IMAGE'
  | 'BACKGROUND'
  | 'SUBJECT'
  | 'FOREGROUND_OCCLUDER'
  | 'FOREGROUND_ACCENT'
  | 'FRAME'
  | 'FRAME_BACK'
  | 'FRAME_FRONT'
  | 'CARD_BACK'
  | 'PACK_FRONT'
  | 'PACK_BACK'
  | 'PACK_OPENED'
  | 'PACK_LAYER'
  | 'PREVIEW'
  | 'OTHER';

export interface AssetRecord {
  id: string;
  name: string;
  assetType: AssetType;
  mimeType: string;
  width: number;
  height: number;
  hasAlpha: boolean;
  fileSize: number;
  checksum?: string;
  version: number;
  sourceFileName?: string;
  createdAt: string;
  updatedAt: string;
  validationStatus: 'PENDING' | 'PASSED' | 'WARNING' | 'FAILED';
  validationMessages: string[];
  storageKey: string;
  url: string;
}

export type TaskDifficulty = 'LIGHT' | 'NORMAL' | 'BOLD';
export type LocationType = 'ANY' | 'INDOOR' | 'OUTDOOR' | 'ONLINE';
export type BudgetLevel = 'FREE' | 'LOW' | 'MEDIUM';
export type SocialIntensity = 'NONE' | 'LIGHT' | 'BOLD';
export type RecordOption = 'TEXT' | 'IMAGE';
export type DefaultRecordVisibility = 'PRIVATE' | 'PUBLIC';

export interface TaskContent {
  title: string;
  description: string;
  steps: string[];
  completionCriteria: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
  locationType: LocationType;
  budgetLevel: BudgetLevel;
  socialIntensity: SocialIntensity;
  safetyNotes?: string;
  completionTitle: string;
  completionMessage: string;
  blessingTexts?: string[];
  recordPrompt?: string;
  recordOptions?: RecordOption[];
  recordRequired: boolean;
  allowCollectWithoutRecord: boolean;
  defaultRecordVisibility?: DefaultRecordVisibility;
  requiresPurchase: boolean;
  requiresStrangerInteraction: boolean;
}

export interface CardVisualConfig {
  canvasWidth: number;   // 默认母版 1200
  canvasHeight: number;  // 默认母版 1600
  aspectRatio: string;   // '3:4'
  sourceImageAssetId: string | null;
  backgroundAssetId: string | null;
  subjectAssetId: string | null;
  foregroundOccluderAssetId: string | null;
  foregroundAccentAssetId: string | null;
  frameAssetSnapshotId: string | null;
  stylePresetId: string | null;
  compositePreviewAssetId: string | null;
  thumbnailAssetId: string | null;
  cardBackTemplateId: string | null;
  renderConfig: {
    tcgParameters: TcgHoloParameters;
    lifeSealMeta: LifeSealCardMeta;
    rimColor: RimColorType;
  };
}

export interface CardDefinition {
  schemaVersion: '1.0.0';
  id: string;
  cardCode: string;          // 唯一编号，如 'LP-0001'
  internalName: string;      // 内部管理名称
  title: string;             // 展示名称
  subtitle?: string;
  description?: string;
  locale: string;            // 'zh-CN'
  seriesId: string | null;
  primaryCategoryId: string | null;
  tags: string[];
  characterIds: string[];
  frameTemplateId: string | null;
  status: ProductionStatus;
  version: number;
  task: TaskContent;
  visual: CardVisualConfig;
  albumLabel?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FrameMode = 'PROGRAMMATIC' | 'OVERLAY_FRONT' | 'SPLIT_BACK_FRONT';

export interface SafeAreaRect {
  x: number;      // 0..1 归一化坐标
  y: number;
  width: number;
  height: number;
}

export interface TagLibraryItem {
  id: string;
  label: string;
  icon: TagIconType;
  defaultStars: number;
}

export interface BorderLayerConfig {
  mode: 'COLOR' | 'IMAGE';           // 颜色模式 vs 上传切片
  color: string;                     // RGBA 或 Hex 颜色，例如 'rgba(103, 232, 249, 0.9)'
  imageAssetUrl?: string | null;     // 上传的自定义图片切片 (透明PNG)
  thickness: number;                 // 边框粗细 (外边框 2~40px, 内边框 1~24px)
  radius: number;                    // 圆角半径 (外边框 12~64px, 内边框 8~48px)
  offset: number;                    // 外边距 / 内缩间距 (外边框 padding 0~40px, 内边框 offset 4~48px)
  glowStrength: number;              // 辉光强度 / 模糊半径 (0~50px)
}

export interface CardTemplate {
  id: string;
  templateCode: string;      // 如 'TPL-001'
  frameCode?: string;        // 兼容旧字段
  name: string;              // 如 '稀有·冰川珍珠蓝'
  description?: string;
  rarityTier: string;        // 'common' | 'advanced' | 'rare' 或自定义等级
  rarityBadge: string;       // 如 '普通' | '高级' | '稀有' | '典藏'
  
  // 双层边框独立配置
  outerBorder?: BorderLayerConfig;
  innerBorder?: BorderLayerConfig;

  // 边框渲染模式与贴图
  frameMode: FrameMode;
  frameAssetId?: string | null;
  frameAssetUrl?: string | null;
  frameBackAssetId?: string | null;
  frameFrontAssetId?: string | null;
  
  // 自定义画图式程序化边框色盘
  borderCustomColor: string; // 边框主色 HEX，如 '#67e8f9'
  borderSecondaryColor?: string; // 边框辅色 HEX
  rimColor: RimColorType;    // 辉光基调：pearl-blue, gold, silver, purple, rainbow, custom
  
  // 光学蒙版与光效配置
  opticalMask: OpticalMaskType; // 'holo-rainbow' | 'frosted-seal' | 'sunbeam' 等
  structureLightMode: StructureLightMode; // 'subtle-sun' | 'tyndall-gold' | 'holo-rainbow'
  renderParameters: TcgHoloParameters;
  
  canvasWidth: number;       // 1200
  canvasHeight: number;      // 1600
  aspectRatio: string;       // '3:4'
  safeArea: SafeAreaRect;
  previewAssetId?: string | null;
  version: number;
  status: 'DRAFT' | 'READY' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

// 兼容别名
export type FrameTemplate = CardTemplate;

export interface DigitalPackDefinition {
  schemaVersion: '1.0.0';
  id: string;
  packCode: string;          // 如 'LPP-0001'
  internalName: string;
  title: string;
  subtitle?: string;
  description?: string;
  locale: string;
  packType: 'DIGITAL_PACK';
  seriesId: string | null;
  tags: string[];
  stylePresetId: string | null;
  canvasWidth: number;       // 可独立设置
  canvasHeight: number;
  aspectRatio: string;
  linkedCardIds: string[];   // 关联卡片（仅用于编排展示，无概率/权重）
  packBaseAssetId: string | null;
  packFrontArtworkAssetId: string | null;
  packLogoAssetId: string | null;
  packSealAssetId: string | null;
  packAccentAssetIds: string[];
  packBackArtworkAssetId: string | null;
  packOpenedAssetId: string | null;
  frontCompositeAssetId: string | null;
  backCompositeAssetId: string | null;
  openedPreviewAssetId: string | null;
  thumbnailAssetId: string | null;
  status: ProductionStatus;
  version: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSeries {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
}

export interface ContentCategory {
  id: string;
  code: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface IpCharacter {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
}

export type StudioView =
  | 'dashboard'
  | 'cards'
  | 'card-editor'
  | 'packs'
  | 'pack-editor'
  | 'templates';
