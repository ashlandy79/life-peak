export type TaskStatus = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';

export interface TaskItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: 'DAILY_MICRO' | 'ADVENTURE' | 'REFLECTIVE';
  categoryLabel: string;
  durationMinutes: number;
  status: TaskStatus;
  completedAt?: string;
  rewardPuzzlePieceIndex?: number;
  associatedCardId?: string;
  iconName?: string;
  difficulty?: 'EASY' | 'MEDIUM';
}

export interface PuzzleState {
  currentSeriesId: string;
  totalPieces: number;
  collectedPieceIndices: number[]; // e.g. [0, 1, 3] for 3/5
  previewImage?: any;
  name: string;
}
