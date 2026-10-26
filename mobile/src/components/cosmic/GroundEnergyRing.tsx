import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export const GroundEnergyRing: React.FC<{
  width?: number;
  height?: number;
  style?: any;
}> = ({ width = 340, height = 90, style }) => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, { width, height }, style]} pointerEvents="none">
      <div className="energy-ring-wrapper">
        <div className="energy-ground-pool" />
        <div className="energy-ring-outer" />
        <div className="energy-ring-inner" />
      </div>

      <style>{`
        .energy-ring-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: energy-ring-breathe 4s ease-in-out infinite alternate;
        }

        .energy-ground-pool {
          position: absolute;
          width: 90%;
          height: 80%;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(56, 189, 248, 0.45) 0%,
            rgba(168, 85, 247, 0.25) 45%,
            transparent 72%
          );
          filter: blur(14px);
        }

        .energy-ring-outer {
          position: absolute;
          width: 96%;
          height: 72%;
          border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(
            90deg,
            rgba(103, 232, 249, 0.9) 0%,
            rgba(244, 114, 182, 0.85) 30%,
            rgba(251, 191, 36, 0.8) 60%,
            rgba(147, 51, 234, 0.85) 85%,
            rgba(103, 232, 249, 0.9) 100%
          ) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          box-shadow:
            0 0 16px rgba(103, 232, 249, 0.75),
            0 0 32px rgba(168, 85, 247, 0.5);
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.8));
        }

        .energy-ring-inner {
          position: absolute;
          width: 86%;
          height: 58%;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            0 0 10px rgba(255, 255, 255, 0.85),
            inset 0 0 8px rgba(103, 232, 249, 0.6);
        }

        @keyframes energy-ring-breathe {
          0% {
            transform: scale(0.97);
            opacity: 0.82;
          }
          100% {
            transform: scale(1.03);
            opacity: 1.0;
          }
        }
      `}</style>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
