import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { DoodleSparkle, DoodleStar } from './DoodleDeco';

interface FlyingStarToAlbumProps {
  onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FlyingStarToAlbum: React.FC<FlyingStarToAlbumProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();

  // Starting position (Center card position on home screen)
  const startX = SCREEN_WIDTH * 0.5;
  const startY = SCREEN_HEIGHT * 0.36;

  // Target position: The "卡册" (Album) tab icon in BottomTabBar
  // 4 tabs total: Home(0.125), Tasks(0.375), Album(0.625), Profile(0.875)
  const targetX = SCREEN_WIDTH * 0.625;
  const targetY = SCREEN_HEIGHT - Math.max(insets.bottom, 12) - 34;

  // Animation values
  const progress = useSharedValue(0);
  const starScale = useSharedValue(1.4);
  const starOpacity = useSharedValue(0);
  const starRotate = useSharedValue(0);

  // Burst effect at target
  const burstScale = useSharedValue(0.1);
  const burstOpacity = useSharedValue(0);

  const [hasLanded, setHasLanded] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // ignore
      }
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  useEffect(() => {
    // 1. Star spawns at screen center with rapid fade-in and bloom
    starOpacity.value = withTiming(1, { duration: 180 });
    starRotate.value = withTiming(360, { duration: 850, easing: Easing.linear });

    // 2. Parabolic arc flight from start to target
    progress.value = withTiming(1, { duration: 850, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, (finished) => {
      if (finished) {
        runOnJS(triggerHaptic)();
        runOnJS(setHasLanded)(true);

        // 3. Shockwave burst on arrival at album tab icon
        burstOpacity.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(0, { duration: 320 })
        );
        burstScale.value = withTiming(2.4, { duration: 400, easing: Easing.out(Easing.cubic) }, (done) => {
          if (done) {
            runOnJS(handleFinish)();
          }
        });
      }
    });

    // Scale shrinks from 1.4 down to 0.35 as it nears the tab bar
    starScale.value = withTiming(0.35, { duration: 850, easing: Easing.in(Easing.cubic) });
  }, []);

  const animatedStarStyle = useAnimatedStyle(() => {
    // Parabolic Bezier Curve:
    // X goes from startX to targetX
    const currentX = startX + (targetX - startX) * progress.value;
    
    // Y arches slightly up/flat then accelerates down into tab bar
    const p = progress.value;
    // Bezier control formula: (1-p)^2 * P0 + 2*(1-p)*p * P1 + p^2 * P2
    const controlY = startY - 40; // slight upward initial arc
    const currentY = (1 - p) * (1 - p) * startY + 2 * (1 - p) * p * controlY + p * p * targetY;

    return {
      opacity: starOpacity.value,
      transform: [
        { translateX: currentX - 24 },
        { translateY: currentY - 24 },
        { scale: starScale.value },
        { rotate: `${starRotate.value}deg` },
      ],
    };
  });

  const animatedBurstStyle = useAnimatedStyle(() => {
    return {
      opacity: burstOpacity.value,
      transform: [
        { translateX: targetX - 25 },
        { translateY: targetY - 25 },
        { scale: burstScale.value },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Flying glowing star entity */}
      {!hasLanded && (
        <Animated.View style={[styles.starContainer, animatedStarStyle]}>
          {/* Intense Outer Halo Glow */}
          <View style={styles.outerHalo} />
          {/* Inner Cyan Glow */}
          <View style={styles.innerHalo} />
          {/* Golden Core Star */}
          <DoodleStar size={44} color="#FDE047" />
          <DoodleSparkle size={20} color="#67E8F9" style={styles.sparkleDeco} />
        </Animated.View>
      )}

      {/* Burst Ripple at Album Tab when landed */}
      <Animated.View style={[styles.burstRing, animatedBurstStyle]}>
        <View style={styles.burstCore} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  outerHalo: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(253, 224, 71, 0.35)',
    filter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
  },
  innerHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(103, 232, 249, 0.65)',
    filter: Platform.OS === 'web' ? 'blur(4px)' : undefined,
  },
  sparkleDeco: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  burstRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FDE047',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    filter: Platform.OS === 'web' ? 'drop-shadow(0 0 10px rgba(253, 224, 71, 0.9))' : undefined,
  },
  burstCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#67E8F9',
  },
});
