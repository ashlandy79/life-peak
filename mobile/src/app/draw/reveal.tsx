import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CardRepository } from '../../services/CardRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { colors } from '../../theme/colors';
import { DoodleSparkle, DoodleStar } from '../../components/DoodleDeco';
import { PearlBlueFoilCard } from '../../components/PearlBlueFoilCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 320);
const CARD_HEIGHT = CARD_WIDTH * (4 / 3);

export default function CardRevealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ instanceId: string; cardId: string }>();

  const [card, setCard] = useState<CardDefinition | null>(null);
  const [instance, setInstance] = useState<UserCardInstance | null>(null);

  // Entrance spring animation
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    async function load() {
      if (params.cardId) {
        const c = await CardRepository.getCardById(params.cardId);
        if (c) setCard(c);
      }
      if (params.instanceId) {
        const inst = await CollectionRepository.getInstanceById(params.instanceId);
        if (inst) setInstance(inst);
      }
    }
    load();

    scale.value = withSpring(1, { damping: 14, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, { damping: 14 });

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
    }
  }, [params.cardId, params.instanceId]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handleAcceptTask = async () => {
    if (params.instanceId) {
      await CollectionRepository.acceptTask(params.instanceId);
    }
    // Navigate to card detail or task detail
    router.replace({
      pathname: `/card/${params.instanceId}` as any,
    });
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  if (!card) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loadingText}>正在揭晓卡片...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
      {/* Header Tag */}
      <View style={styles.headerPill}>
        <DoodleSparkle size={16} color={colors.bronze} />
        <Text style={styles.headerPillText}>今日奇遇卡片揭晓</Text>
        <DoodleSparkle size={16} color={colors.bronze} />
      </View>

      {/* Main Card */}
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <PearlBlueFoilCard
          card={card}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
        />
      </Animated.View>

      {/* Task Preview Box */}
      <View style={styles.taskBox}>
        <View style={styles.taskBoxHeader}>
          <Text style={styles.taskBoxLabel}>关联生活奇遇任务</Text>
          <Text style={styles.taskBoxDuration}>约 {card.taskDurationMinutes} 分钟</Text>
        </View>
        <Text style={styles.taskBoxTitle}>{card.taskTitle}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAcceptTask}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptButtonText}>接受这个小奇遇 →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoHome}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>稍后再做 · 回到首页</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  center: {
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E1D5',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
  },
  headerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EAE1D3',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 228, 218, 0.8)',
  },
  cardCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardCode: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.moss,
  },
  seriesName: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  cardQuote: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  taskBox: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#EDE7DC',
  },
  taskBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.moss,
  },
  taskBoxDuration: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  taskBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  actionRow: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    width: '100%',
    backgroundColor: colors.moss,
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
