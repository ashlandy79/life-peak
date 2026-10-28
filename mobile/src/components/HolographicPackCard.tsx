import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { DoodleCat, DoodleSparkle, DoodleStar, DoodlePlanet } from './DoodleDeco';
import { CardDefinition } from '../types/card';
import { StaticCardView } from './StaticCardView';

interface HolographicPackCardProps {
  onOpenPack: () => void;
  packImage?: any;
  quote?: string;
  packTitle?: string;
  isSealedCard?: boolean;
  sealedCard?: CardDefinition;
  onPressCard?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 36, 380);
const PACK_WIDTH = Math.round(CARD_WIDTH * 0.65);
const PACK_HEIGHT = Math.round(PACK_WIDTH * (924 / 565));

export const HolographicPackCard: React.FC<HolographicPackCardProps> = ({
  onOpenPack,
  packImage = require('../../assets/packs/pack_sealed_norm.png'),
  quote = '今天也会有好事发生吧',
  packTitle = '城市漫游 · 生活奇遇卡包',
  isSealedCard = false,
  sealedCard,
  onPressCard,
}) => {
  const translateY = useSharedValue(0);
  const tiltDeg = useSharedValue(-0.5);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    tiltDeg.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        withTiming(-0.8, { duration: 3200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPackStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotateZ: `${tiltDeg.value}deg` },
      ],
    };
  });

  const handlePress = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // ignore
    }
    if (isSealedCard && onPressCard) {
      onPressCard();
    } else {
      onOpenPack();
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Central Floating Element: Sealed Card OR Sealed Foil Pack */}
      <TouchableOpacity
        style={styles.touchableCenter}
        onPress={handlePress}
        activeOpacity={0.92}
      >
        <Animated.View style={[styles.packWrapper, animatedPackStyle]}>
          {isSealedCard && sealedCard ? (
            <StaticCardView
              card={sealedCard}
              width={PACK_WIDTH}
              height={PACK_HEIGHT * 0.9}
              isSealed={true}
            />
          ) : (
            <Image
              source={packImage}
              style={styles.packImage}
              contentFit="contain"
              transition={300}
            />
          )}
          {/* Soft shadow */}
          <View style={styles.packShadow} />
        </Animated.View>
      </TouchableOpacity>

      {/* Primary Frosted Glass CTA Button (图1 毛玻璃药丸按钮) */}
      <TouchableOpacity
        style={[styles.ctaButton, { className: 'frosted-pill-btn' } as any]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaSparkle}>✦</Text>
        <Text style={styles.ctaButtonText}>
          {isSealedCard ? '查看封印卡片' : '拆开看看'}
        </Text>
        <Text style={styles.ctaArrow}>→</Text>
      </TouchableOpacity>

      <style>{`
        .frosted-pill-btn {
          backdrop-filter: blur(18px) saturate(180%);
          -webkit-backdrop-filter: blur(18px) saturate(180%);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(230, 240, 255, 0.78) 100%) !important;
          box-shadow: 0 8px 30px rgba(103, 232, 249, 0.32), 0 2px 10px rgba(0, 0, 0, 0.3) !important;
          transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease;
        }
        .frosted-pill-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 36px rgba(103, 232, 249, 0.45), 0 2px 12px rgba(0, 0, 0, 0.35) !important;
        }
        .frosted-pill-btn:active {
          transform: scale(0.97);
        }
      `}</style>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 16,
    position: 'relative',
  },
  touchableCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  packWrapper: {
    width: PACK_WIDTH,
    height: PACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  packImage: {
    width: PACK_WIDTH,
    height: PACK_HEIGHT,
  },
  packShadow: {
    position: 'absolute',
    bottom: -10,
    width: PACK_WIDTH * 0.7,
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: -1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#67E8F9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    marginTop: 20,
    minWidth: 190,
  },
  ctaSparkle: {
    color: '#18181B',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
  },
  ctaButtonText: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  ctaArrow: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
});
