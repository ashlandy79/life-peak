import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Ellipse, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export const CosmicBackdropOverlay: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      {/* 1. 轨道星环与深空光线 (1:1 复刻设计图背景中的优雅椭圆光环) */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <SvgGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#67E8F9" stopOpacity="0.35" />
            <Stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="80%" stopColor="#F472B6" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </SvgGradient>

          <SvgGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </SvgGradient>
        </Defs>

        {/* 主轨道椭圆环 1：斜向贯穿卡包背后的优雅大星环 */}
        <Ellipse
          cx="200"
          cy="420"
          rx="220"
          ry="110"
          stroke="url(#ringGrad1)"
          strokeWidth="1.2"
          fill="none"
          transform="rotate(-18, 200, 420)"
          strokeDasharray="6 2"
        />

        {/* 伴生弱星环 2 */}
        <Ellipse
          cx="200"
          cy="420"
          rx="245"
          ry="125"
          stroke="url(#ringGrad2)"
          strokeWidth="0.8"
          fill="none"
          transform="rotate(-14, 200, 420)"
          opacity="0.6"
        />

        {/* 远景微妙斜向星轨线 */}
        <Path
          d="M -50 180 Q 200 320 450 360"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1"
          fill="none"
        />
        <Path
          d="M -20 620 Q 180 540 430 680"
          stroke="rgba(103, 232, 249, 0.2)"
          strokeWidth="1.2"
          fill="none"
        />
      </Svg>

      {/* 2. 背景中的自然微光脉动 */}
      <div className="cosmic-backdrop-pulse" />
      <style>{`
        .cosmic-backdrop-pulse {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 45%,
            rgba(56, 189, 248, 0.08) 0%,
            transparent 65%
          );
          animation: cosmic-bg-pulse 8s ease-in-out infinite alternate;
        }

        @keyframes cosmic-bg-pulse {
          0% {
            opacity: 0.6;
            transform: scale(0.96);
          }
          100% {
            opacity: 1.0;
            transform: scale(1.04);
          }
        }
      `}</style>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 1,
  },
});
