import { UserProfile } from '../types/user';

export const MOCK_USER: UserProfile = {
  userId: 'user-7788',
  nickname: '小岛收集家',
  bio: '在喧闹日常里，慢悠悠收集微小的奇迹与闪光。',
  avatar: require('../../assets/cards/card_hero.png'),
  joinedDate: '2026年9月',
  totalCollectedCards: 8,
  totalCompletedTasks: 16,
  totalMemoryEntries: 5,
  settings: {
    reduceMotion: false,
    soundEnabled: true,
    hapticsEnabled: true,
  },
};
