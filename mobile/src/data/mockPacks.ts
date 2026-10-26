import { PackDefinition } from '../types/pack';

export const MOCK_PACKS: PackDefinition[] = [
  {
    id: 'pack-series-01',
    seriesId: 'series-01',
    title: 'LIFE PACK 01',
    subtitle: '城市漫游 · 生活奇遇卡包',
    description: '内含 1 张生活奇遇任务卡与隐藏光效卡面。把微小的日常，拆封成独一无二的闪光收藏。',
    sealedImage: require('../../assets/packs/pack_sealed_norm.png'),
    openedImage: require('../../assets/packs/pack_opened_norm.png'),
    stripImage: require('../../assets/packs/pack_strip_norm.png'),
    totalCards: 48,
    unlockedCount: 8,
    availableDraws: 1,
    dailyQuote: '今天也会有好事发生吧',
    tag: '今日份生活卡包',
  },
];
