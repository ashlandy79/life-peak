import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface DoodleProps {
  size?: number;
  color?: string;
  style?: any;
}

export const DoodleCat: React.FC<DoodleProps> = ({ size = 28, color = '#2D2823', style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" style={style}>
      {/* Cat head outline */}
      <Path
        d="M10 16 L6 6 L16 11 C18 10 22 10 24 11 L34 6 L30 16 C35 21 35 29 29 33 C25 36 15 36 11 33 C5 29 5 21 10 16 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <Circle cx="15" cy="21" r="1.8" fill={color} />
      <Circle cx="25" cy="21" r="1.8" fill={color} />
      {/* Nose */}
      <Path
        d="M19 25 L21 25 L20 26.5 Z"
        fill={color}
      />
      {/* Mouth */}
      <Path
        d="M20 26.5 C18.5 28 17 28 16 27 M20 26.5 C21.5 28 23 28 24 27"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Whiskers */}
      <Path
        d="M9 22 L4 21 M9 25 L3 26 M31 22 L36 21 M31 25 L37 26"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const DoodleSparkle: React.FC<DoodleProps> = ({ size = 20, color = '#C89B58', style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path
        d="M12 2 C12 7.5 16.5 12 22 12 C16.5 12 12 16.5 12 22 C12 16.5 7.5 12 2 12 C7.5 12 12 7.5 12 2 Z"
        fill={color}
      />
    </Svg>
  );
};

export const DoodleStar: React.FC<DoodleProps> = ({ size = 18, color = '#C89B58', style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path
        d="M12 2 L14.5 9 L22 9.5 L16.5 14.5 L18.5 22 L12 17.5 L5.5 22 L7.5 14.5 L2 9.5 L9.5 9 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const DoodlePlanet: React.FC<DoodleProps> = ({ size = 24, color = '#2D4F38', style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" style={style}>
      <Circle cx="16" cy="16" r="9" fill="none" stroke={color} strokeWidth="2" />
      <Path
        d="M4 17 C6 11 26 11 28 17 C26 23 6 23 4 17"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const DoodlePaperclip: React.FC<DoodleProps> = ({ size = 20, color = '#9E9485', style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path
        d="M7 11 L15 3 C17 1 20 4 18 6 L9 15 C7.5 16.5 5 15 6.5 13.5 L14 6"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const DoodlePuzzlePiece: React.FC<DoodleProps & { filled?: boolean }> = ({
  size = 22,
  color = '#C89B58',
  filled = false,
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" style={style}>
      <Path
        d="M6 6 H11 C11 8.5 14 8.5 14 6 H22 V11 C19.5 11 19.5 14 22 14 V22 H17 C17 19.5 14 19.5 14 22 H6 V17 C8.5 17 8.5 14 6 14 Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
