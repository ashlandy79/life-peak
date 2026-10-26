import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export const PrismBeam: React.FC<{ style?: any }> = ({ style }) => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <div className="prism-beam-layer" />
      <style>{`
        .prism-beam-layer {
          position: absolute;
          inset: -20%;
          pointer-events: none;
          background:
            linear-gradient(
              128deg,
              transparent 25%,
              rgba(103, 232, 249, 0.22) 38%,
              rgba(129, 140, 248, 0.26) 45%,
              rgba(236, 72, 153, 0.24) 52%,
              rgba(251, 191, 36, 0.18) 58%,
              transparent 70%
            ),
            radial-gradient(
              ellipse at 80% 20%,
              rgba(56, 189, 248, 0.35) 0%,
              rgba(147, 51, 234, 0.20) 35%,
              transparent 65%
            ),
            radial-gradient(
              ellipse at 20% 80%,
              rgba(236, 72, 153, 0.18) 0%,
              rgba(245, 158, 11, 0.12) 30%,
              transparent 60%
            );
          filter: blur(28px);
          opacity: 0.85;
          mix-blend-mode: screen;
          transform: translate3d(0, 0, 0);
          animation: prism-beam-pulse 14s ease-in-out infinite alternate;
        }

        @keyframes prism-beam-pulse {
          0% {
            transform: translate3d(-1.5%, -1%, 0) rotate(-1deg) scale(0.98);
            opacity: 0.75;
          }
          50% {
            transform: translate3d(1%, 1.5%, 0) rotate(1deg) scale(1.02);
            opacity: 0.95;
          }
          100% {
            transform: translate3d(2%, -0.5%, 0) rotate(2.5deg) scale(1.0);
            opacity: 0.8;
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
  },
});
