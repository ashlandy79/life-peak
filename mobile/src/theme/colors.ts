/**
 * LIFE PACK 设计规范 Token
 * 严格依据《首页 UI 素材规范板》(图 1) 整理定义
 */

export interface ThemeColors {
  // 规范板核心 8 大主色
  bg: string;               // 背景纸张 / 深色背景
  surface: string;          // 表面纸张 / 面板表面
  surfaceSecondary: string; // 次级纸张 / 次级面板
  textPrimary: string;      // 文字主色
  textSecondary: string;    // 文字次要
  border: string;           // 边框线
  accentGreen: string;      // 点缀绿
  holoAccent: string;       // 虹彩点缀

  // 扩展与兼容语义槽位
  paper: string;
  paperDark: string;
  paperWarm: string;
  ink: string;
  inkLight: string;
  inkMuted: string;
  mutedText: string;
  subtleText: string;
  moss: string;
  mossDark: string;
  mossLight: string;
  bronze: string;
  bronzeLight: string;
  surfaceOpaque: string;
  surfaceTranslucent: string;
  doodle: string;
}

export const lightTheme: ThemeColors = {
  // 01 色彩规范 (LIGHT)
  bg: '#F4F0EB',               // 背景纸张 #F4F0EB
  surface: '#FBF8F1',          // 表面纸张 #FBF8F1
  surfaceSecondary: '#EAE4D9', // 次级纸张 #EAE4D9
  textPrimary: '#191817',      // 文字主色 #191817
  textSecondary: '#89847B',    // 文字次要 #89847B
  border: '#D7D0C4',           // 边框线 #D7D0C4
  accentGreen: '#A8B39B',      // 点缀绿 #A8B39B
  holoAccent: '#D8C6FF',       // 虹彩点缀 #D8C6FF

  // 基础兼容映射
  paper: '#F4F0EB',
  paperDark: '#EAE4D9',
  paperWarm: '#FBF8F1',
  ink: '#191817',
  inkLight: '#47433E',
  inkMuted: '#89847B',
  mutedText: '#89847B',
  subtleText: '#A8A29E',
  moss: '#2D4F38',
  mossDark: '#1E3626',
  mossLight: '#E8EFEA',
  bronze: '#C89B58',
  bronzeLight: '#FDF8EF',
  surfaceOpaque: 'rgba(251, 248, 241, 0.95)',
  surfaceTranslucent: 'rgba(251, 248, 241, 0.78)',
  doodle: '#191817',
};

export const darkTheme: ThemeColors = {
  // 01 色彩规范 (DARK)
  bg: '#171715',               // 深色背景 #171715
  surface: '#24231F',          // 面板表面 #24231F
  surfaceSecondary: '#2F2D28', // 次级面板 #2F2D28
  textPrimary: '#F4EFE5',      // 文字主色 #F4EFE5
  textSecondary: '#B2ACA1',    // 文字次要 #B2ACA1
  border: '#3A3832',           // 边框线 #3A3832
  accentGreen: '#879681',      // 点缀绿 #879681
  holoAccent: '#9FD1FF',       // 虹彩点缀 #9FD1FF

  // 基础兼容映射
  paper: '#171715',
  paperDark: '#2F2D28',
  paperWarm: '#24231F',
  ink: '#F4EFE5',
  inkLight: '#D1CBC0',
  inkMuted: '#B2ACA1',
  mutedText: '#B2ACA1',
  subtleText: '#78736B',
  moss: '#879681',
  mossDark: '#1E241E',
  mossLight: '#263327',
  bronze: '#C89B58',
  bronzeLight: '#3A2E1A',
  surfaceOpaque: 'rgba(36, 35, 31, 0.95)',
  surfaceTranslucent: 'rgba(36, 35, 31, 0.78)',
  doodle: '#F4EFE5',
};

// 默认主题（默认使用图 1 浅色手账纸张规范）
export const colors = lightTheme;
export type ColorTheme = typeof lightTheme;
