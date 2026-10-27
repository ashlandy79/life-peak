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
      {/* Decorative Doodles behind pack */}
      <DoodleStar
        size={22}
        color={colors.bronze}
        style={styles.doodleStarTopRight}
      />
      <DoodleSparkle
        size={26}
        color="#E6C875"
        style={styles.doodleSparkleLeft}
      />
      <DoodlePlanet
        size={26}
        color="rgba(45, 79, 56, 0.4)"
        style={styles.doodlePlanetRight}
      />

      {/* Top Sticky Note Banner */}
      <View style={styles.stickyNoteWrapper}>
        <View style={styles.stickyNoteTape} />
        <View style={styles.stickyNote}>
          <DoodleCat size={20} color={colors.ink} style={styles.noteCat} />
          <Text style={styles.stickyNoteText}>
            {isSealedCard ? '今日已抽取 · 封印中的奇遇' : quote}
          </Text>
        </View>
      </View>

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

      {/* Pack Series Name & Subtitle */}
      <View style={styles.packMetaContainer}>
        <Text style={styles.packSubtitle}>
          {isSealedCard && sealedCard
            ? `${sealedCard.cardCode} · ${sealedCard.title}`
            : packTitle}
        </Text>
      </View>

      {/* Primary CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaButtonText}>
          {isSealedCard ? '查看封印卡片' : '拆开看看'}
        </Text>
        <Text style={styles.ctaArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingTop: 16,
    paddingBottom: 22,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    position: 'relative',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  touchableCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyNoteWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  stickyNoteTape: {
    width: 60,
    height: 12,
    backgroundColor: 'rgba(230, 200, 117, 0.45)',
    borderRadius: 3,
    marginBottom: -6,
    zIndex: 12,
  },
  stickyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DCB8',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteCat: {
    marginRight: 6,
  },
  stickyNoteText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(23, 23, 21, 0.12)',
    zIndex: -1,
  },
  packMetaContainer: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 16,
  },
  packSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkMuted,
    letterSpacing: 0.5,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    color: colors.paper,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 6,
  },
  ctaArrow: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: '700',
  },
  doodleStarTopRight: {
    position: 'absolute',
    top: 24,
    right: 22,
    zIndex: 1,
  },
  doodleSparkleLeft: {
    position: 'absolute',
    top: 140,
    left: 14,
    zIndex: 1,
  },
  doodlePlanetRight: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    zIndex: 1,
  },
});
