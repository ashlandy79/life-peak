import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CardRepository } from '../../services/CardRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { colors } from '../../theme/colors';
import { DoodleStar, DoodleSparkle } from '../../components/DoodleDeco';
import { UnsealRecordModal, UnsealRecordOption } from '../../components/UnsealRecordModal';
import { SlashBurstEffect } from '../../components/SlashBurstEffect';
import { TcgHoloCard, TcgHoloCardRef } from '../../components/TcgHoloCard';
import type { CardRarityTier } from '../../core/tcgTypes';
import { CARD_RARITY_TIERS } from '../../core/tcgParameters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);

export default function CardDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();

  const [instance, setInstance] = useState<UserCardInstance | null>(null);
  const [card, setCard] = useState<CardDefinition | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [triggerSlashBurst, setTriggerSlashBurst] = useState(false);
  const [currentTier, setCurrentTier] = useState<CardRarityTier>('rare');

  const tcgCardRef = useRef<TcgHoloCardRef | null>(null);

  const loadData = useCallback(async () => {
    if (!instanceId) return;
    const inst = await CollectionRepository.getInstanceById(instanceId);
    if (inst) {
      setInstance(inst);
      const c = await CardRepository.getCardById(inst.cardId);
      if (c) {
        setCard(c);
        if (c.tier) {
          setCurrentTier(c.tier as CardRarityTier);
        }
      }
    }
  }, [instanceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFlip = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
    tcgCardRef.current?.flipCard();
  };

  const handleRecenter = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
    tcgCardRef.current?.recenter();
  };

  const handleToggleFavorite = async () => {
    if (!instanceId) return;
    const updated = await CollectionRepository.toggleFavorite(instanceId);
    if (updated) setInstance({ ...updated });
  };

  const handlePressUnseal = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // ignore
      }
    }
    setModalVisible(true);
  };

  const handleConfirmRecord = (option: UnsealRecordOption, content?: string) => {
    setModalVisible(false);

    // 1. 屏幕中心给出动漫补刀光斩特效
    setTimeout(() => {
      setTriggerSlashBurst(true);
    }, 120);

    // 2. 触发 3D 全息卡片由封印态平滑解封至全息高光态
    tcgCardRef.current?.unsealCard();
  };

  const handleSlashBurstComplete = async () => {
    setTriggerSlashBurst(false);

    if (instanceId) {
      const updated = await CollectionRepository.unsealInstance(instanceId);
      if (updated) {
        setInstance({ ...updated });
      }
    }
  };

  const handleSelectTier = async (newTier: CardRarityTier) => {
    setCurrentTier(newTier);
    await tcgCardRef.current?.setTier(newTier);
  };

  if (!card || !instance) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loadingText}>卡片加载中...</Text>
      </View>
    );
  }

  const isSealedState = instance.status === 'SEALED';
  const tierInfo = CARD_RARITY_TIERS[currentTier] || CARD_RARITY_TIERS.rare;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.starButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
          >
            <DoodleStar
              size={22}
              color={instance.isFavorite ? '#F5A623' : '#B8AE9E'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 30) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 3D Holographic Card Stage (默认使用珍珠蓝，隐藏顶部测试切换栏) */}
        <View style={styles.cardWrapper}>
          <TcgHoloCard
            ref={tcgCardRef}
            card={card}
            isSealed={isSealedState}
            tier={currentTier}
            cardWidth={CARD_WIDTH}
            onFlipChange={(flipped) => setIsFlipped(flipped)}
          />
        </View>

        {/* Interactive Controls Bar */}
        <View style={styles.cardControlsRow}>
          <TouchableOpacity
            style={styles.controlPill}
            onPress={handleFlip}
            activeOpacity={0.75}
          >
            <Text style={styles.controlPillText}>
              {isFlipped ? '↺ 翻回正面' : '↻ 翻看卡背'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlPill}
            onPress={handleRecenter}
            activeOpacity={0.75}
          >
            <Text style={styles.controlPillText}>◎ 重置居中</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dragHintText}>
          {isSealedState
            ? '封印态：手指按住卡片滑动可 3D 旋转观察 · 点击翻看背面'
            : '解封态：滑动 3D 旋转卡面，全息虹彩光束将随倾角流转'}
        </Text>

        {/* Action Button: 解封 or 记录 */}
        <View style={styles.actionContainer}>
          {isSealedState ? (
            <TouchableOpacity
              style={styles.unsealButton}
              onPress={handlePressUnseal}
              activeOpacity={0.85}
            >
              <DoodleSparkle size={18} color="#FAF7F2" />
              <Text style={styles.unsealButtonText}>解封卡片</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.writeMemoryButton}
              onPress={() => router.push(`/memory/${instance.instanceId}` as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.writeMemoryText}>
                {instance.memoryText ? '修改手账记录' : '留下手账记忆'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Unseal Record Modal */}
      <UnsealRecordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmRecord}
      />

      {/* Center Stage Slash Burst Effect */}
      <SlashBurstEffect
        active={triggerSlashBurst}
        onComplete={handleSlashBurstComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F1219',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starButton: {
    padding: 6,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 4,
  },
  tierSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  tierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tierText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  cardControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  controlPill: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  controlPillText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  dragHintText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  actionContainer: {
    width: CARD_WIDTH,
    marginTop: 4,
  },
  unsealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#67E8F9',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  unsealButtonText: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  writeMemoryButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  writeMemoryText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
