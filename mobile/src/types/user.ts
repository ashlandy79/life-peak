export interface UserSettings {
  reduceMotion: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface UserProfile {
  userId: string;
  nickname: string;
  bio: string;
  avatar: any;
  joinedDate: string;
  totalCollectedCards: number;
  totalCompletedTasks: number;
  totalMemoryEntries: number;
  settings: UserSettings;
}
