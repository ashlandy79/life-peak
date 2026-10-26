import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DoodleSparkle, DoodleStar } from './DoodleDeco';

interface SlashBurstEffectProps {
  active: boolean;
  onComplete?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SlashBurstEffect: React.FC<SlashBurstEffectProps> = ({
  active,
  onComplete,
}) => {
  // 1. Blade Slash Line Animation
  const slashScaleX = useSharedValue(0);
  const slashOpacity = useSharedValue(0);
  const slashTranslateX = useSharedValue(-SCREEN_WIDTH * 0.4);

  // 2. Shockwave Distortion Ring Animation
  const shockwaveScale = useSharedValue(0.1);
  const shockwaveOpacity = useSharedValue(0);

  // 3. Radial Sparks Animation
  const sparkDistance = useSharedValue(0);
  const sparkOpacity = useSharedValue(0);

  // 4. White Flash
  const flashOpacity = useSharedValue(0);

  const triggerHeavyHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (!active) return;

    triggerHeavyHaptic();

    // Flash
    flashOpacity.value = withSequence(
      withTiming(0.85, { duration: 60 }),
      withTiming(0, { duration: 320 })
    );

    // Diagonal Blade Slash (网感激光刀光破空)
    slashOpacity.value = withSequence(
      withTiming(1, { duration: 40 }),
      withTiming(0, { duration: 360, easing: Easing.out(Easing.quad) })
    );
    slashScaleX.value = withSequence(
      withTiming(1.6, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(2.2, { duration: 200 })
    );
    slashTranslateX.value = withTiming(SCREEN_WIDTH * 0.4, {
      duration: 380,
      easing: Easing.out(Easing.quad),
    });

    // Expanding Shockwave (超维能量冲击环)
    shockwaveOpacity.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(0, { duration: 480, easing: Easing.out(Easing.quad) })
    );
    shockwaveScale.value = withTiming(3.2, {
      duration: 520,
      easing: Easing.bezier(0.1, 0.9, 0.2, 1),
    });

    // Radial Sparks Burst (星芒微晶爆裂)
    sparkOpacity.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 500 })
    );
    sparkDistance.value = withTiming(
      SCREEN_WIDTH * 0.45,
      { duration: 550, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );
  }, [active]);

  const animatedSlashStyle = useAnimatedStyle(() => ({
    opacity: slashOpacity.value,
    transform: [
      { rotate: '-32deg' },
      { translateX: slashTranslateX.value },
      { scaleX: slashScaleX.value },
    ],
  }));

  const animatedShockwaveStyle = useAnimatedStyle(() => ({
    opacity: shockwaveOpacity.value,
    transform: [{ scale: shockwaveScale.value }],
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const animatedSpark1Style = useAnimatedStyle(() => ({
    opacity: sparkOpacity.value,
    transform: [
      { translateX: -sparkDistance.value },
      { translateY: -sparkDistance.value * 0.7 },
      { scale: 1.2 },
    ],
  }));

  const animatedSpark2Style = useAnimatedStyle(() => ({
    opacity: sparkOpacity.value,
    transform: [
      { translateX: sparkDistance.value * 0.9 },
      { translateY: -sparkDistance.value * 0.8 },
      { scale: 1.4 },
    ],
  }));

  const animatedSpark3Style = useAnimatedStyle(() => ({
    opacity: sparkOpacity.value,
    transform: [
      { translateX: -sparkDistance.value * 0.85 },
      { translateY: sparkDistance.value * 0.65 },
      { scale: 1.1 },
    ],
  }));

  const animatedSpark4Style = useAnimatedStyle(() => ({
    opacity: sparkOpacity.value,
    transform: [
      { translateX: sparkDistance.value * 0.8 },
      { translateY: sparkDistance.value * 0.75 },
      { scale: 1.3 },
    ],
  }));

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. White Fullscreen Flash */}
      <Animated.View style={[styles.flashScreen, animatedFlashStyle]} />

      {/* 2. Expanding Shockwave Ring */}
      <View style={styles.centerStage}>
        <Animated.View style={[styles.shockwaveRing, animatedShockwaveStyle]} />
      </View>

      {/* 3. High Impact Anime Laser Slash Line (网感补刀主光刃) */}
      <View style={styles.centerStage}>
        <Animated.View style={[styles.slashBeamContainer, animatedSlashStyle]}>
          <View style={styles.slashCore} />
          <View style={styles.slashAura} />
        </Animated.View>
      </View>

      {/* 4. Radial Sparks */}
      <View style={styles.centerStage}>
        <Animated.View style={[styles.sparkItem, animatedSpark1Style]}>
          <DoodleSparkle size={28} color="#67E8F9" />
        </Animated.View>
        <Animated.View style={[styles.sparkItem, animatedSpark2Style]}>
          <DoodleStar size={32} color="#F59E0B" />
        </Animated.View>
        <Animated.View style={[styles.sparkItem, animatedSpark3Style]}>
          <DoodleSparkle size={26} color="#EC4899" />
        </Animated.View>
        <Animated.View style={[styles.sparkItem, animatedSpark4Style]}>
          <DoodleStar size={30} color="#67E8F9" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerStage: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  flashScreen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 55,
  },
  shockwaveRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#67E8F9',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    backgroundColor: 'rgba(103, 232, 249, 0.15)',
  },
  slashBeamContainer: {
    width: SCREEN_WIDTH * 1.4,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slashCore: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#67E8F9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  slashAura: {
    position: 'absolute',
    width: '100%',
    height: 18,
    backgroundColor: 'rgba(103, 232, 249, 0.65)',
    borderRadius: 9,
  },
  sparkItem: {
    position: 'absolute',
  },
});
