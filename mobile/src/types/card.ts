export type UserCardStatus =
  | 'SEALED'           // 刚抽出/待接受
  | 'ACTIVE'           // 进行中任务
  | 'COMPLETED'        // 任务完成（待留记忆或直接领取）
  | 'COLLECTED';       // 已正式入册

export interface CardDefinition {
  id: string;
  cardCode: string;           // 如 LP-0027 或 #027
  title: string;              // 标题：奇遇特饮、夜宵猫行者等
  subtitle: string;
  seriesId: string;
  seriesName: string;
  quote: string;              // 卡面短句：生活很荒唐，但你可以很酷
  taskTitle: string;          // 关联任务标题
  taskDescription: string;    // 关联任务详细说明
  taskDurationMinutes?: number;// 建议时间（如 15 分钟）
  tags: string[];             // 标签：自然、独处、美食
  previewImage: any;          // 本地 require 或远程 url
  backgroundImage?: any;      // 环境背景图
  subjectImage?: any;        // 透明主体图
  backLiningImage?: any;
  tier?: 'rare' | 'advanced' | 'common';
  rarityTag?: 'UR' | 'SSR' | 'SR' | 'R';
}

export interface UserCardInstance {
  instanceId: string;
  cardId: string;
  status: UserCardStatus;
  obtainedAt: string;         // ISO 时间
  acceptedAt?: string;
  completedAt?: string;
  memoryText?: string;        // 用户写的个人手账记忆
  memoryPhotoUri?: string;    // 用户相册选图
  isFavorite?: boolean;
}
