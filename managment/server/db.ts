import fs from 'node:fs';
import path from 'node:path';
import type {
  AssetRecord,
  CardDefinition,
  CardTemplate,
  ContentCategory,
  ContentSeries,
  DigitalPackDefinition,
  FrameTemplate,
  IpCharacter,
  TagLibraryItem,
} from '../src/core/lifepackTypes';
import { DEFAULT_LIFE_SEAL_META, DEFAULT_TCG_PARAMETERS } from '../src/core/parameters';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// 确保数据和上传目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface DatabaseSchema {
  cards: CardDefinition[];
  packs: DigitalPackDefinition[];
  frames: CardTemplate[];
  templates?: CardTemplate[];
  assets: AssetRecord[];
  series: ContentSeries[];
  categories: ContentCategory[];
  characters: IpCharacter[];
  tags: TagLibraryItem[];
}

const DEFAULT_SERIES: ContentSeries[] = [
  { id: 'series-life-moments', code: 'SERIES-01', name: '生活小瞬间', description: '发现日常中被忽略的温柔与诗意', color: '#67e8f9' },
  { id: 'series-forest', code: 'SERIES-02', name: '森林小奇遇', description: '走向户外，感受自然与光影', color: '#34d399' },
  { id: 'series-night', code: 'SERIES-03', name: '夜行观察家', description: '属于夜间漫步与自我对话的静谧时刻', color: '#818cf8' },
];

const DEFAULT_CATEGORIES: ContentCategory[] = [
  { id: 'category-food', code: 'food', name: '食物', icon: 'food', color: '#f97316' },
  { id: 'category-travel', code: 'travel', name: '出行', icon: 'travel', color: '#38bdf8' },
  { id: 'category-social', code: 'social', name: '社交', icon: 'social', color: '#a855f7' },
  { id: 'category-night', code: 'night', name: '夜间', icon: 'night', color: '#818cf8' },
  { id: 'category-self', code: 'self', name: '自我', icon: 'self', color: '#34d399' },
  { id: 'category-emotion', code: 'emotion', name: '情绪', icon: 'emotion', color: '#f43f5e' },
];

const DEFAULT_CHARACTERS: IpCharacter[] = [
  { id: 'char-paku', name: '帕库 (Paku)', description: '对世界充满好奇的森林守护精灵' },
  { id: 'char-luna', name: '露娜 (Luna)', description: '安静温和的夜行猫咪' },
  { id: 'char-mori', name: '森森 (Mori)', description: '热爱收集植物标本与落叶的小松鼠' },
];

export const DEFAULT_TAG_LIBRARY: TagLibraryItem[] = [
  { id: 'tag-door', label: '出门', icon: 'door', defaultStars: 4 },
  { id: 'tag-social', label: '社交', icon: 'social', defaultStars: 2 },
  { id: 'tag-absurd', label: '荒谬', icon: 'absurd', defaultStars: 5 },
  { id: 'tag-food', label: '食物', icon: 'food', defaultStars: 3 },
  { id: 'tag-travel', label: '出行', icon: 'travel', defaultStars: 3 },
  { id: 'tag-night', label: '夜间', icon: 'night', defaultStars: 4 },
  { id: 'tag-self', label: '自我', icon: 'self', defaultStars: 3 },
  { id: 'tag-emotion', label: '情绪', icon: 'emotion', defaultStars: 4 },
  { id: 'tag-sparkle', label: '奇遇', icon: 'sparkle', defaultStars: 5 },
];

const DEFAULT_FRAMES: CardTemplate[] = [
  {
    id: 'frame-pearl-blue',
    templateCode: 'TPL-RARE',
    frameCode: 'FRAME-001',
    name: '稀有·冰川珍珠蓝 (图1标志款)',
    description: '图 1 标志性双层内嵌流光边框，带有冰川珍珠蓝与全息虹彩光束',
    rarityTier: 'rare',
    rarityBadge: '稀有',
    outerBorder: {
      mode: 'COLOR',
      color: 'rgba(103, 232, 249, 0.95)',
      thickness: 10,
      radius: 48,
      offset: 22,
      glowStrength: 18,
    },
    innerBorder: {
      mode: 'COLOR',
      color: 'rgba(255, 255, 255, 0.78)',
      thickness: 2.5,
      radius: 42,
      offset: 10,
      glowStrength: 4,
    },
    frameMode: 'PROGRAMMATIC',
    frameAssetId: null,
    borderCustomColor: '#67e8f9',
    borderSecondaryColor: '#818cf8',
    rimColor: 'pearl-blue',
    opticalMask: 'holo-rainbow',
    structureLightMode: 'holo-rainbow',
    renderParameters: {
      ...DEFAULT_TCG_PARAMETERS,
      rimColor: 'pearl-blue',
      structureLightMode: 'holo-rainbow',
      opticalMask: 'holo-rainbow',
    },
    canvasWidth: 1200,
    canvasHeight: 1600,
    aspectRatio: '3:4',
    safeArea: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    previewAssetId: null,
    version: 1,
    status: 'READY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'frame-gold',
    templateCode: 'TPL-ADVANCED',
    frameCode: 'FRAME-002',
    name: '高级·皇家香槟金',
    description: '奢华细腻的流金色泽，搭配暖金丁达尔圣光光束',
    rarityTier: 'advanced',
    rarityBadge: '高级',
    outerBorder: {
      mode: 'COLOR',
      color: 'rgba(251, 191, 36, 0.95)',
      thickness: 11,
      radius: 48,
      offset: 22,
      glowStrength: 20,
    },
    innerBorder: {
      mode: 'COLOR',
      color: 'rgba(254, 240, 138, 0.82)',
      thickness: 2.5,
      radius: 42,
      offset: 10,
      glowStrength: 6,
    },
    frameMode: 'PROGRAMMATIC',
    frameAssetId: null,
    borderCustomColor: '#fbbf24',
    borderSecondaryColor: '#f59e0b',
    rimColor: 'gold',
    opticalMask: 'holo-rainbow',
    structureLightMode: 'tyndall-gold',
    renderParameters: {
      ...DEFAULT_TCG_PARAMETERS,
      rimColor: 'gold',
      structureLightMode: 'tyndall-gold',
      opticalMask: 'holo-rainbow',
    },
    canvasWidth: 1200,
    canvasHeight: 1600,
    aspectRatio: '3:4',
    safeArea: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    previewAssetId: null,
    version: 1,
    status: 'READY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'frame-silver',
    templateCode: 'TPL-COMMON',
    frameCode: 'FRAME-003',
    name: '普通·冷调钛金灰',
    description: '低调克制的纯粹金属冷光质感，搭配微弱阳光光效',
    rarityTier: 'common',
    rarityBadge: '普通',
    outerBorder: {
      mode: 'COLOR',
      color: 'rgba(203, 213, 225, 0.90)',
      thickness: 9,
      radius: 48,
      offset: 22,
      glowStrength: 12,
    },
    innerBorder: {
      mode: 'COLOR',
      color: 'rgba(248, 250, 252, 0.75)',
      thickness: 2.0,
      radius: 42,
      offset: 10,
      glowStrength: 0,
    },
    frameMode: 'PROGRAMMATIC',
    frameAssetId: null,
    borderCustomColor: '#94a3b8',
    borderSecondaryColor: '#cbd5e1',
    rimColor: 'silver',
    opticalMask: 'holo-rainbow',
    structureLightMode: 'subtle-sun',
    renderParameters: {
      ...DEFAULT_TCG_PARAMETERS,
      rimColor: 'silver',
      structureLightMode: 'subtle-sun',
      opticalMask: 'holo-rainbow',
    },
    canvasWidth: 1200,
    canvasHeight: 1600,
    aspectRatio: '3:4',
    safeArea: { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    previewAssetId: null,
    version: 1,
    status: 'READY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'frame-split-depth',
    templateCode: 'TPL-SPLIT',
    frameCode: 'FRAME-004',
    name: '前后分层探出立体框',
    description: '支持主体从卡框前沿穿透而出，具有真实前后深度层叠关系',
    rarityTier: 'rare',
    rarityBadge: '立体穿透',
    frameMode: 'SPLIT_BACK_FRONT',
    frameAssetId: null,
    borderCustomColor: '#a855f7',
    borderSecondaryColor: '#6366f1',
    rimColor: 'purple',
    opticalMask: 'holo-rainbow',
    structureLightMode: 'holo-rainbow',
    renderParameters: {
      ...DEFAULT_TCG_PARAMETERS,
      depth: 1.8,
      rimColor: 'purple',
    },
    canvasWidth: 1200,
    canvasHeight: 1600,
    aspectRatio: '3:4',
    safeArea: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    previewAssetId: null,
    version: 1,
    status: 'READY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_SAMPLE_CARD: CardDefinition = {
  schemaVersion: '1.0.0',
  id: 'card-sample-027',
  cardCode: 'LP-0027',
  internalName: '便利店未知风味奇遇',
  title: '今日奇遇 #027',
  subtitle: '去楼下便利店，买一瓶你没喝过的饮料',
  description: '跳出日常惯性，给味蕾一次没有预设的冒险。不准研究配料表。',
  locale: 'zh-CN',
  seriesId: 'series-life-moments',
  primaryCategoryId: 'category-food',
  tags: ['出门', '社交', '荒谬 4', '新奇尝试'],
  characterIds: ['char-paku'],
  frameTemplateId: 'frame-pearl-blue',
  status: 'DRAFT',
  version: 1,
  task: {
    title: '去楼下便利店，买一瓶你没喝过的饮料。',
    description: '挑选时只看包装第一感觉，不看热量与成分，直接走向收银台。',
    steps: [
      '走进最近的便利店冷柜前',
      '闭上眼倒数三秒，抓起视线第一眼看到的陌生饮品',
      '一口气喝掉第一口并给它起一个专属味道名字',
    ],
    completionCriteria: '买下并喝掉至少一口即可完成。',
    estimatedMinutes: 15,
    difficulty: 'LIGHT',
    locationType: 'OUTDOOR',
    budgetLevel: 'LOW',
    socialIntensity: 'LIGHT',
    safetyNotes: '如遇严重过敏原请根据常识安全处置。',
    completionTitle: '今日味蕾冒险达成！',
    completionMessage: '恭喜你打破了一次生活常规！新味道会成为今天独一无二的注脚。',
    blessingTexts: ['愿每一次意料之外，都能带给你意料之喜。'],
    recordPrompt: '这瓶饮料喝起来像什么？（选填）',
    recordOptions: ['TEXT', 'IMAGE'],
    recordRequired: false,
    allowCollectWithoutRecord: true,
    defaultRecordVisibility: 'PRIVATE',
    requiresPurchase: true,
    requiresStrangerInteraction: false,
  },
  visual: {
    canvasWidth: 1200,
    canvasHeight: 1600,
    aspectRatio: '3:4',
    sourceImageAssetId: null,
    backgroundAssetId: null,
    subjectAssetId: null,
    foregroundOccluderAssetId: null,
    foregroundAccentAssetId: null,
    frameAssetSnapshotId: 'frame-pearl-blue',
    stylePresetId: 'style-holo-collectible',
    compositePreviewAssetId: null,
    thumbnailAssetId: null,
    cardBackTemplateId: null,
    renderConfig: {
      tcgParameters: DEFAULT_TCG_PARAMETERS,
      lifeSealMeta: DEFAULT_LIFE_SEAL_META,
      rimColor: 'pearl-blue',
    },
  },
  albumLabel: '生活奇遇册',
  notes: '官方预置 LIFE PACK 示范卡片',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SAMPLE_PACK: DigitalPackDefinition = {
  schemaVersion: '1.0.0',
  id: 'pack-sample-001',
  packCode: 'LPP-0001',
  internalName: 'LIFE PACK 森林小奇遇数字卡包',
  title: 'LIFE PACK',
  subtitle: '森林小奇遇 (Forest Adventure)',
  description: '以自然观察、日常慢下来与微小冒险为主题的精美数字卡包视觉资产。',
  locale: 'zh-CN',
  packType: 'DIGITAL_PACK',
  seriesId: 'series-forest',
  tags: ['自然', '观察', '治愈', '奇遇'],
  stylePresetId: 'style-forest-gold',
  canvasWidth: 1200,
  canvasHeight: 1600,
  aspectRatio: '3:4',
  linkedCardIds: ['card-sample-027'],
  packBaseAssetId: '/packs/pack_sealed_norm.png',
  packFrontArtworkAssetId: null,
  packLogoAssetId: null,
  packSealAssetId: null,
  packAccentAssetIds: [],
  packBackArtworkAssetId: null,
  packOpenedAssetId: '/packs/pack_opened_norm.png',
  frontCompositeAssetId: null,
  backCompositeAssetId: null,
  openedPreviewAssetId: null,
  thumbnailAssetId: null,
  status: 'DRAFT',
  version: 1,
  notes: '官方示例数字卡包资产，包含正反面与包装组合。',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function getInitialDb(): DatabaseSchema {
  return {
    cards: [DEFAULT_SAMPLE_CARD],
    packs: [DEFAULT_SAMPLE_PACK],
    frames: DEFAULT_FRAMES,
    assets: [],
    series: DEFAULT_SERIES,
    categories: DEFAULT_CATEGORIES,
    characters: DEFAULT_CHARACTERS,
    tags: DEFAULT_TAG_LIBRARY,
  };
}

let dbCache: DatabaseSchema | null = null;

export function loadDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      
      // 平滑升级字段
      if (!dbCache!.tags || dbCache!.tags.length === 0) {
        dbCache!.tags = [...DEFAULT_TAG_LIBRARY];
      }

      // 平滑补齐模板的光学与边框色盘字段
      if (dbCache!.frames && Array.isArray(dbCache!.frames)) {
        dbCache!.frames = dbCache!.frames.map((f: any) => {
          const matchDefault = DEFAULT_FRAMES.find((df) => df.id === f.id);
          return {
            ...matchDefault,
            ...f,
            templateCode: f.templateCode || f.frameCode || matchDefault?.templateCode || 'TPL-CUSTOM',
            rarityTier: f.rarityTier || matchDefault?.rarityTier || 'common',
            rarityBadge: f.rarityBadge || matchDefault?.rarityBadge || '模组',
            frameMode: f.frameMode || (f.frameAssetId ? 'OVERLAY_FRONT' : 'PROGRAMMATIC'),
            borderCustomColor: f.borderCustomColor || matchDefault?.borderCustomColor || '#67e8f9',
            borderSecondaryColor: f.borderSecondaryColor || matchDefault?.borderSecondaryColor || '#818cf8',
            rimColor: f.rimColor || matchDefault?.rimColor || 'pearl-blue',
            opticalMask: f.opticalMask || matchDefault?.opticalMask || 'holo-rainbow',
            structureLightMode: f.structureLightMode || matchDefault?.structureLightMode || 'holo-rainbow',
            renderParameters: f.renderParameters || matchDefault?.renderParameters || DEFAULT_TCG_PARAMETERS,
          };
        });
      }

      return dbCache!;
    } catch (err) {
      console.error('加载 db.json 失败，使用初始数据:', err);
    }
  }

  dbCache = getInitialDb();
  saveDatabase(dbCache);
  return dbCache;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('保存 db.json 失败:', err);
  }
}

export { DATA_DIR, UPLOADS_DIR };
