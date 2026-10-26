import { TaskItem, PuzzleState } from '../types/task';

export const MOCK_DAILY_TASKS: TaskItem[] = [
  {
    id: 'task-daily-01',
    title: '好好刷牙',
    subtitle: '清爽开启全新一天',
    description: '认真刷牙两分钟，感受薄荷在齿间绽放的清新凉意。',
    category: 'DAILY_MICRO',
    categoryLabel: '晨间微习惯',
    durationMinutes: 2,
    status: 'COMPLETED',
    completedAt: '2026-09-20T08:10:00.000Z',
    rewardPuzzlePieceIndex: 0,
    difficulty: 'EASY',
  },
  {
    id: 'task-daily-02',
    title: '喝一杯水',
    subtitle: '给身体唤醒活力',
    description: '倒一杯温水，慢慢喝完，感受水流滋润身体的感觉。',
    category: 'DAILY_MICRO',
    categoryLabel: '晨间微习惯',
    durationMinutes: 1,
    status: 'COMPLETED',
    completedAt: '2026-09-20T08:15:00.000Z',
    rewardPuzzlePieceIndex: 1,
    difficulty: 'EASY',
  },
  {
    id: 'task-daily-03',
    title: '看1页书',
    subtitle: '哪怕只读一段文字',
    description: '随手翻开手边的一本书，读完一页即可，让思绪从屏幕中暂时抽离。',
    category: 'DAILY_MICRO',
    categoryLabel: '独处心流',
    durationMinutes: 3,
    status: 'ACTIVE',
    rewardPuzzlePieceIndex: 2,
    associatedCardId: 'card-lp-0012',
    difficulty: 'EASY',
  },
  {
    id: 'task-daily-04',
    title: '出门晒5分钟',
    subtitle: '接住大自然的馈赠',
    description: '站在窗边或走到户外，把脸庞朝向太阳，闭眼感受阳光洒在皮肤上的温度。',
    category: 'DAILY_MICRO',
    categoryLabel: '日光浴',
    durationMinutes: 5,
    status: 'AVAILABLE',
    rewardPuzzlePieceIndex: 3,
    associatedCardId: 'card-lp-0008',
    difficulty: 'EASY',
  },
];

export const MOCK_PUZZLE_STATE: PuzzleState = {
  currentSeriesId: 'series-01',
  name: '日光与猫咪的周日私语',
  totalPieces: 5,
  collectedPieceIndices: [0, 1, 2], // 3/5 collected
  previewImage: require('../../assets/cards/card_sample_01.png'),
};
