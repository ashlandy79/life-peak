import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';

interface ShinyPillButtonProps {
  label: string;
  onPress: () => void;
  style?: any;
}

export const ShinyPillButton: React.FC<ShinyPillButtonProps> = ({
  label,
  onPress,
  style,
}) => {
  return (
    <View style={[styles.outerWrapper, style]}>
      {/* Left decorative sparkle */}
      <span className="shiny-btn-sparkle left-sparkle">✧</span>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={styles.touchable}
      >
        <div className="shiny-pill-button-content">
          <div className="shiny-pill-reflection" />
          <span className="shiny-pill-text">{label}</span>
        </div>
      </TouchableOpacity>

      {/* Right decorative sparkle */}
      <span className="shiny-btn-sparkle right-sparkle">✧</span>

      <style>{`
        .shiny-btn-sparkle {
          color: rgba(255, 255, 255, 0.85);
          font-size: 20px;
          user-select: none;
          text-shadow: 0 0 10px rgba(103, 232, 249, 0.8);
          animation: sparkle-twinkle 2.5s ease-in-out infinite alternate;
        }

        .left-sparkle {
          margin-right: 14px;
        }

        .right-sparkle {
          margin-left: 14px;
        }

        @keyframes sparkle-twinkle {
          0% {
            opacity: 0.6;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .shiny-pill-button-content {
          position: relative;
          overflow: hidden;
          width: 240px;
          height: 52px;
          border-radius: 26px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.96) 0%,
            rgba(224, 242, 254, 0.92) 50%,
            rgba(245, 243, 255, 0.94) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 1.5px rgba(255, 255, 255, 0.9),
            0 0 24px rgba(103, 232, 249, 0.65),
            0 0 45px rgba(168, 85, 247, 0.35),
            0 10px 25px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }

        .shiny-pill-button-content:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow:
            0 0 0 2px rgba(255, 255, 255, 1),
            0 0 32px rgba(103, 232, 249, 0.85),
            0 0 55px rgba(168, 85, 247, 0.45),
            0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .shiny-pill-button-content:active {
          transform: translateY(1px) scale(0.98);
        }

        .shiny-pill-reflection {
          position: absolute;
          top: 0;
          left: -120%;
          width: 80%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.75),
            transparent
          );
          transform: skewX(-24deg);
          animation: shiny-sweep 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes shiny-sweep {
          0% {
            left: -120%;
          }
          35% {
            left: 150%;
          }
          100% {
            left: 150%;
          }
        }

        .shiny-pill-text {
          position: relative;
          z-index: 2;
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1.2px;
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    borderRadius: 26,
  },
});
