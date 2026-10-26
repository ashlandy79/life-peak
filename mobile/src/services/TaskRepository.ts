import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem, PuzzleState } from '../types/task';
import { MOCK_DAILY_TASKS, MOCK_PUZZLE_STATE } from '../data/mockTasks';

const TASKS_STORAGE_KEY = 'lifepack_daily_tasks_v1';
const PUZZLE_STORAGE_KEY = 'lifepack_puzzle_state_v1';

class TaskRepositoryImpl {
  private tasks: TaskItem[] = [];
  private puzzle: PuzzleState = { ...MOCK_PUZZLE_STATE };
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        this.tasks = JSON.parse(storedTasks);
      } else {
        this.tasks = [...MOCK_DAILY_TASKS];
      }

      const storedPuzzle = await AsyncStorage.getItem(PUZZLE_STORAGE_KEY);
      if (storedPuzzle) {
        this.puzzle = JSON.parse(storedPuzzle);
      } else {
        this.puzzle = { ...MOCK_PUZZLE_STATE };
      }
    } catch {
      this.tasks = [...MOCK_DAILY_TASKS];
      this.puzzle = { ...MOCK_PUZZLE_STATE };
    }
    this.initialized = true;
  }

  async getDailyTasks(): Promise<TaskItem[]> {
    await this.init();
    return [...this.tasks];
  }

  async getTaskById(taskId: string): Promise<TaskItem | undefined> {
    await this.init();
    return this.tasks.find((t) => t.id === taskId);
  }

  async toggleTask(taskId: string): Promise<TaskItem[]> {
    await this.init();
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return [...this.tasks];

    if (task.status === 'COMPLETED') {
      task.status = 'ACTIVE';
      task.completedAt = undefined;
      if (
        task.rewardPuzzlePieceIndex !== undefined &&
        this.puzzle.collectedPieceIndices.includes(task.rewardPuzzlePieceIndex)
      ) {
        this.puzzle.collectedPieceIndices = this.puzzle.collectedPieceIndices.filter(
          (idx) => idx !== task.rewardPuzzlePieceIndex
        );
      }
    } else {
      task.status = 'COMPLETED';
      task.completedAt = new Date().toISOString();
      if (
        task.rewardPuzzlePieceIndex !== undefined &&
        !this.puzzle.collectedPieceIndices.includes(task.rewardPuzzlePieceIndex)
      ) {
        this.puzzle.collectedPieceIndices.push(task.rewardPuzzlePieceIndex);
      }
    }

    await this.persist();
    return [...this.tasks];
  }

  async getPuzzleState(): Promise<PuzzleState> {
    await this.init();
    return { ...this.puzzle };
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
      await AsyncStorage.setItem(PUZZLE_STORAGE_KEY, JSON.stringify(this.puzzle));
    } catch {
      // ignore in dev/fallback
    }
  }
}

export const TaskRepository = new TaskRepositoryImpl();
