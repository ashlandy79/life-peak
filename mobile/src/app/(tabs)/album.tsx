import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardRepository } from '../../services/CardRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { CardGridItem } from '../../components/CardGridItem';
import { colors } from '../../theme/colors';
import { DoodleSparkle } from '../../components/DoodleDeco';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export default function AlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [allCards, setAllCards] = useState<CardDefinition[]>([]);
  const [userInstances, setUserInstances] = useState<UserCardInstance[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'FAVORITE'>('ALL');

  const loadData = useCallback(async () => {
    const cards = await CardRepository.getAllCards();
    const instances = await CollectionRepository.getUserCardInstances();
    setAllCards(cards);
    setUserInstances(instances);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const collectedInstanceMap = new Map<string, UserCardInstance>();
  userInstances.forEach((inst) => {
    if (inst.status === 'COLLECTED' || inst.status === 'ACTIVE' || inst.status === 'COMPLETED') {
      collectedInstanceMap.set(inst.cardId, inst);
    }
  });

  const collectedCount = userInstances.filter((i) => i.status === 'COLLECTED').length;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>我的卡册</Text>
          <DoodleSparkle size={18} color={colors.bronze} />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              已集 {collectedCount} / 48
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          每一张卡片，都是一段值得珍藏的慢速生活碎片。
        </Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
            onPress={() => setFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
              全部图鉴
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'FAVORITE' && styles.filterPillActive]}
            onPress={() => setFilter('FAVORITE')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'FAVORITE' && styles.filterTextActive]}>
              已点亮收藏
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid */}
      <ScrollView
        style={styles.gridScroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridRow}>
          {allCards.map((card) => {
            const instance = collectedInstanceMap.get(card.id);
            const isUnlocked = !!instance;

            if (filter === 'FAVORITE' && !isUnlocked) {
              return null;
            }

            return (
              <CardGridItem
                key={card.id}
                card={card}
                instance={instance}
                isLocked={!isUnlocked}
                width={CARD_WIDTH}
                onPress={() => {
                  if (instance) {
                    router.push(`/card/${instance.instanceId}` as any);
                  }
                }}
              />
            );
          })}

          {/* Fill with a couple empty slots to show collection album feel */}
          {filter === 'ALL' && (
            <>
              <CardGridItem isLocked width={CARD_WIDTH} onPress={() => {}} />
              <CardGridItem isLocked width={CARD_WIDTH} onPress={() => {}} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#F3EFE8',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DFC8',
    marginLeft: 'auto',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.moss,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ECE5D8',
  },
  filterPillActive: {
    backgroundColor: colors.moss,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
