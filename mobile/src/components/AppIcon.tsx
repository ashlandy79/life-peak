import React from 'react';
import Svg, { Path, Circle, Rect, Polygon, G } from 'react-native-svg';
import { colors } from '../theme/colors';

export type NavigationIconName =
  | 'home'
  | 'calendar'
  | 'tasks'
  | 'messages'
  | 'profile'
  | 'search'
  | 'add'
  | 'settings';

export type StatusIconName =
  | 'check'
  | 'cancel'
  | 'warning'
  | 'chat'
  | 'loading'
  | 'refresh'
  | 'share'
  | 'minus';

export type ContentIconName =
  | 'image'
  | 'camera'
  | 'edit'
  | 'mic'
  | 'mail'
  | 'video'
  | 'audio'
  | 'location'
  | 'clock'
  | 'tag'
  | 'favorite'
  | 'more';

export type DecoIconName =
  | 'star'
  | 'heart'
  | 'flower'
  | 'moon'
  | 'sun'
  | 'cloud'
  | 'cat'
  | 'arrowRight';

export type AppIconName =
  | NavigationIconName
  | StatusIconName
  | ContentIconName
  | DecoIconName;

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: any;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = colors.textPrimary,
  style,
}) => {
  const strokeW = 1.9;

  switch (name) {
    // -------------------------------------------------------------
    // 第 1 组：导航与系统功能 (Navigation & System)
    // -------------------------------------------------------------
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M3 10.5 L12 3 L21 10.5 V20 C21 20.6 20.6 21 20 21 H4 C3.4 21 3 20.6 3 20 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9 21 V12 H15 V21"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="3"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
          />
          <Path d="M3 10 H21 M8 3 V6 M16 3 V6" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <Circle cx="12" cy="15" r="1.5" fill={color} />
        </Svg>
      );

    case 'tasks':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Rect
            x="4"
            y="4"
            width="16"
            height="17"
            rx="2.5"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
          />
          <Path d="M8 3 V6 M16 3 V6 M8 10 H16 M8 14 H13" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'messages':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M21 11.5 A8.5 8.5 0 0 1 6.5 18 L3 20 L4.5 16.5 A8.5 8.5 0 1 1 21 11.5 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
          <Circle cx="8.5" cy="11.5" r="1" fill={color} />
          <Circle cx="12" cy="11.5" r="1" fill={color} />
          <Circle cx="15.5" cy="11.5" r="1" fill={color} />
        </Svg>
      );

    case 'profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path
            d="M5 20 C5 16.5 8 14.5 12 14.5 C16 14.5 19 16.5 19 20"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M16 16 L21 21" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'add':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M12 8 V16 M8 12 H16" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="3.2" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path
            d="M19.4 15 A1.65 1.65 0 0 0 19.7 17.5 L20 18 A2 2 0 1 1 17.2 20.8 L16.8 20.5 A1.65 1.65 0 0 0 14.3 20.8 L14 21 A2 2 0 1 1 10 21 L9.7 20.8 A1.65 1.65 0 0 0 7.2 20.5 L6.8 20.8 A2 2 0 1 1 4 18 L4.3 17.5 A1.65 1.65 0 0 0 4 15 L3.8 14.7 A2 2 0 1 1 3.8 10.7 L4 10.3 A1.65 1.65 0 0 0 4.3 7.8 L4 7.3 A2 2 0 1 1 6.8 4.5 L7.2 4.8 A1.65 1.65 0 0 0 9.7 4.5 L10 4.3 A2 2 0 1 1 14 4.3 L14.3 4.5 A1.65 1.65 0 0 0 16.8 4.8 L17.2 4.5 A2 2 0 1 1 20 7.3 L19.7 7.8 A1.65 1.65 0 0 0 20 10.3 L20.2 10.7 A2 2 0 1 1 20.2 14.7 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // 第 2 组：状态与交互操作 (Status & Actions)
    // -------------------------------------------------------------
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M8.5 12 L11 14.5 L16 9" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'cancel':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M9 9 L15 15 M15 9 L9 15" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'warning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M12 3 L22 20 H2 L12 3 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
          <Path d="M12 9 V13 M12 16.5 V17" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'chat':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M20 12 A8 8 0 0 1 7 18 L3 20 L4.5 16 A8 8 0 1 1 20 12 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'loading':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M12 3 A9 9 0 1 1 3 12"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'refresh':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M20 12 A8 8 0 0 1 6 18 M4 12 A8 8 0 0 1 18 6"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <Path d="M18 2 V6 H22 M6 22 V18 H2" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="18" cy="5" r="3" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="6" cy="12" r="3" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="18" cy="19" r="3" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M8.5 10.8 L15.5 6.2 M8.5 13.2 L15.5 17.8" stroke={color} strokeWidth={strokeW} />
        </Svg>
      );

    case 'minus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M8 12 H16" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    // -------------------------------------------------------------
    // 第 3 组：内容与信息标签 (Content & Tags)
    // -------------------------------------------------------------
    case 'image':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="8.5" cy="8.5" r="1.8" fill={color} />
          <Path d="M21 15 L16 10 L5 21" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'camera':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="13" r="4" fill="none" stroke={color} strokeWidth={strokeW} />
        </Svg>
      );

    case 'edit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'mic':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Rect x="9" y="2" width="6" height="12" rx="3" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'mail':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'video':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Rect x="3" y="5" width="13" height="14" rx="2.5" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M16 10 L21 7 V17 L16 14 Z" fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" />
        </Svg>
      );

    case 'audio':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path d="M12 3 V17 A4 4 0 1 1 9 13 H12" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M16 8 A4 4 0 0 1 16 16" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'location':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M12 21 C12 21 19 14.5 19 9.5 A7 7 0 0 0 5 9.5 C5 14.5 12 21 12 21 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="9.5" r="2.5" fill="none" stroke={color} strokeWidth={strokeW} />
        </Svg>
      );

    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path d="M12 7 V12 L15.5 14" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </Svg>
      );

    case 'tag':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M20.5 13 L12.5 21 L3 11.5 V3 H11.5 L20.5 13 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
          <Circle cx="7.5" cy="7.5" r="1.5" fill={color} />
        </Svg>
      );

    case 'favorite':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M12 21.35 L10.55 20.03 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 C9.24 3 10.91 3.81 12 5.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 C22 12.28 18.6 15.36 13.45 20.04 L12 21.35 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'more':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="6" cy="12" r="1.8" fill={color} />
          <Circle cx="12" cy="12" r="1.8" fill={color} />
          <Circle cx="18" cy="12" r="1.8" fill={color} />
        </Svg>
      );

    // -------------------------------------------------------------
    // 第 4 组：趣味装饰与 Mascot (Decorations & Mascot)
    // -------------------------------------------------------------
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M12 2 L14.5 9 L22 9.5 L16.5 14.5 L18.5 22 L12 17.5 L5.5 22 L7.5 14.5 L2 9.5 L9.5 9 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M12 21 L10.55 19.8 C5.4 15.1 2 12 2 8.5 C2 5.5 4.5 3 7.5 3 C9.2 3 10.9 3.8 12 5.1 C13.1 3.8 14.8 3 16.5 3 C19.5 3 22 5.5 22 8.5 C22 12 18.6 15.1 13.45 19.8 L12 21 Z"
            fill="#FCE7F3"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'flower':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="12" cy="6" r="2.5" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="12" cy="18" r="2.5" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="6" cy="12" r="2.5" fill="none" stroke={color} strokeWidth={strokeW} />
          <Circle cx="18" cy="12" r="2.5" fill="none" stroke={color} strokeWidth={strokeW} />
        </Svg>
      );

    case 'moon':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M21 12.8 A9 9 0 1 1 11.2 3 A7 7 0 0 0 21 12.8 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'sun':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth={strokeW} />
          <Path
            d="M12 2 V4 M12 20 V22 M2 12 H4 M20 12 H22 M4.9 4.9 L6.3 6.3 M17.7 17.7 L19.1 19.1 M4.9 19.1 L6.3 17.7 M17.7 6.3 L19.1 4.9"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'cloud':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M17.5 19 C19.5 19 21 17.4 21 15.5 C21 13.7 19.6 12.2 17.8 12.1 C17.3 9.2 14.8 7 11.7 7 C8.9 7 6.5 8.8 5.8 11.4 C4.2 11.8 3 13.2 3 15 C3 17.2 4.8 19 7 19 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'cat':
      return (
        <Svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <Path
            d="M10 16 L6 6 L16 11 C18 10 22 10 24 11 L34 6 L30 16 C35 21 35 29 29 33 C25 36 15 36 11 33 C5 29 5 21 10 16 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="15" cy="21" r="1.8" fill={color} />
          <Circle cx="25" cy="21" r="1.8" fill={color} />
          <Path d="M20 26.5 C18.5 28 17 28 16 27 M20 26.5 C21.5 28 23 28 24 27" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'arrowRight':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
          <Path
            d="M5 12 H19 M13 6 L19 12 L13 18"
            fill="none"
            stroke={color}
            strokeWidth={strokeW + 0.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    default:
      return null;
  }
};
