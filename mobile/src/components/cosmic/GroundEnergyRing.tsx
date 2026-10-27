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
        {/* 1. 核心地面辉光池 */}
        <div className="energy-ground-pool" />

        {/* 2. 外层全息彩虹环 */}
        <div className="energy-ring-outer" />

        {/* 3. 旋转魔法阵刻度虚线环 (法阵纹理) */}
        <div className="energy-ring-runes" />

        {/* 4. 内层高光聚焦环 */}
        <div className="energy-ring-inner" />

        {/* 5. 四极星芒能量节点 */}
        <div className="energy-node node-north">✦</div>
        <div className="energy-node node-south">✦</div>
        <div className="energy-node node-east">✦</div>
        <div className="energy-node node-west">✦</div>
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
          width: 92%;
          height: 82%;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(56, 189, 248, 0.5) 0%,
            rgba(168, 85, 247, 0.3) 45%,
            transparent 74%
          );
          filter: blur(14px);
        }

        .energy-ring-outer {
          position: absolute;
          width: 96%;
          height: 74%;
          border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(
            90deg,
            rgba(103, 232, 249, 0.95) 0%,
            rgba(244, 114, 182, 0.9) 30%,
            rgba(251, 191, 36, 0.85) 60%,
            rgba(147, 51, 234, 0.9) 85%,
            rgba(103, 232, 249, 0.95) 100%
          ) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          box-shadow:
            0 0 18px rgba(103, 232, 249, 0.8),
            0 0 36px rgba(168, 85, 247, 0.55);
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.85));
        }

        .energy-ring-runes {
          position: absolute;
          width: 90%;
          height: 66%;
          border-radius: 50%;
          border: 1.2px dashed rgba(103, 232, 249, 0.65);
          box-shadow: 0 0 8px rgba(103, 232, 249, 0.5);
          animation: energy-runes-rotate 24s linear infinite;
        }

        .energy-ring-inner {
          position: absolute;
          width: 82%;
          height: 56%;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow:
            0 0 12px rgba(255, 255, 255, 0.9),
            inset 0 0 10px rgba(103, 232, 249, 0.65);
        }

        .energy-node {
          position: absolute;
          color: #fde047;
          font-size: 8px;
          line-height: 1;
          filter: drop-shadow(0 0 4px #fde047);
          pointer-events: none;
        }

        .node-north { top: 6%; left: 50%; transform: translateX(-50%); }
        .node-south { bottom: 6%; left: 50%; transform: translateX(-50%); }
        .node-east { right: 2%; top: 50%; transform: translateY(-50%); }
        .node-west { left: 2%; top: 50%; transform: translateY(-50%); }

        @keyframes energy-ring-breathe {
          0% {
            transform: scale(0.96);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.04);
            opacity: 1.0;
          }
        }

        @keyframes energy-runes-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
