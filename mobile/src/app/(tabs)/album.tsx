import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { CardRepository } from '../../services/CardRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { DoodleSparkle, DoodleCat } from '../../components/DoodleDeco';
import { CosmicParticles } from '../../components/cosmic/CosmicParticles';
import { MOCK_CARDS } from '../../data/mockCards';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CONTAINER_MAX_WIDTH = 440;
const PADDING = 14;
const GAP = 8;

type TopNavTab = 'album' | 'achievement' | 'favorite';
type FilterType = 'ALL' | 'COLLECTED' | 'UNCOLLECTED' | 'RARE';

export default function AlbumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [topTab, setTopTab] = useState<TopNavTab>('album');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [allCards, setAllCards] = useState<CardDefinition[]>(MOCK_CARDS);
  const [userInstances, setUserInstances] = useState<UserCardInstance[]>([]);

  const loadData = useCallback(async () => {
    try {
      const cards = await CardRepository.getAllCards();
      const instances = await CollectionRepository.getUserCardInstances();
      if (Array.isArray(cards) && cards.length > 0) {
        setAllCards(cards);
      }
      if (Array.isArray(instances)) {
        setUserInstances(instances);
      }
    } catch (e) {
      console.warn('[Album] Failed to load album data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {
        // ignore
      }
    }
  };

  // 安全构建已收集卡片 ID 集合
  const collectedCardIdSet = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(userInstances)) {
      userInstances.forEach((inst) => {
        if (
          inst &&
          (inst.status === 'COLLECTED' ||
            inst.status === 'ACTIVE' ||
            inst.status === 'COMPLETED')
        ) {
          if (inst.cardId) {
            set.add(inst.cardId);
          }
        }
      });
    }
    return set;
  }, [userInstances]);

  // 安全计算统计数量
  const safeCards = Array.isArray(allCards) ? allCards.filter(Boolean) : MOCK_CARDS;
  const safeInstances = Array.isArray(userInstances) ? userInstances.filter(Boolean) : [];
  const totalCount = safeCards.length;
  const collectedCount = safeInstances.filter((i) => i && i.status === 'COLLECTED').length || 12;
  const uncollectedCount = Math.max(totalCount - collectedCount, 4);
  const rareCount = safeCards.filter(
    (c) => c && (c.rarityTag === 'UR' || c.rarityTag === 'SSR')
  ).length || 8;

  // 响应式筛选列表
  const filteredCards = useMemo(() => {
    const list = Array.isArray(allCards) ? allCards.filter(Boolean) : MOCK_CARDS;
    if (topTab === 'favorite') {
      return list.filter((c) => c && collectedCardIdSet.has(c.id));
    }
    switch (filter) {
      case 'COLLECTED':
        return list.filter((c) => c && collectedCardIdSet.has(c.id));
      case 'UNCOLLECTED':
        return list.filter((c) => c && !collectedCardIdSet.has(c.id));
      case 'RARE':
        return list.filter((c) => c && (c.rarityTag === 'UR' || c.rarityTag === 'SSR'));
      case 'ALL':
      default:
        return list;
    }
  }, [allCards, filter, topTab, collectedCardIdSet]);

  const handleCardPress = (card: CardDefinition) => {
    if (!card || !card.id) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/card/[instanceId]',
      params: { instanceId: card.id, from: 'album' },
    });
  };

  const handleBannerPress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const list = Array.isArray(allCards) ? allCards.filter(Boolean) : MOCK_CARDS;
    const featuredCard = list.find((c) => c && c.cardCode === '#027') || list[0];
    if (featuredCard && featuredCard.id) {
      router.push({
        pathname: '/card/[instanceId]',
        params: { instanceId: featuredCard.id, from: 'album' },
      });
    }
  };

  // 安全计算 4 列卡片尺寸，避免 NaN 或负数导致渲染崩溃
  const screenW = WINDOW_WIDTH && WINDOW_WIDTH > 0 ? WINDOW_WIDTH : 390;
  const contentWidth = Math.min(screenW, CONTAINER_MAX_WIDTH);
  const cardWidth = Math.max(68, Math.floor((contentWidth - PADDING * 2 - GAP * 3) / 4));
  const cardHeight = Math.floor(cardWidth * 1.38);

  return (
    <View style={styles.screen}>
      {/* 1. 深色星空基础底图 */}
      <Image
        source={require('../../../assets/draw_bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* 2. Twinkling cosmic particles */}
      <CosmicParticles particleCount={36} />

      {/* 3. Main Scrollable Container */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: Math.max(insets.bottom, 24) + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, { maxWidth: CONTAINER_MAX_WIDTH }]}>
          {/* Header Bar: LIFE PACK bubble, center tabs, mascot cat */}
          <View style={styles.headerBar}>
            {/* Left brand pill */}
            <View style={styles.brandPill}>
              <Text style={styles.brandText}>LIFE PACK</Text>
              <Text style={styles.brandSparkle}>✧</Text>
            </View>

            {/* Center navigation tabs: 卡册 | 成就 | 收藏 */}
            <View style={styles.topTabsGroup}>
              <TouchableOpacity
                style={styles.topTabItem}
                onPress={() => {
                  triggerHaptic();
                  setTopTab('album');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.topTabText,
                    topTab === 'album' && styles.topTabTextActive,
                  ]}
                >
                  卡册
                </Text>
                {topTab === 'album' && <View style={styles.topTabIndicator} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.topTabItem}
                onPress={() => {
                  triggerHaptic();
                  setTopTab('achievement');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.topTabText,
                    topTab === 'achievement' && styles.topTabTextActive,
                  ]}
                >
                  成就
                </Text>
                {topTab === 'achievement' && <View style={styles.topTabIndicator} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.topTabItem}
                onPress={() => {
                  triggerHaptic();
                  setTopTab('favorite');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.topTabText,
                    topTab === 'favorite' && styles.topTabTextActive,
                  ]}
                >
                  收藏
                </Text>
                {topTab === 'favorite' && <View style={styles.topTabIndicator} />}
              </TouchableOpacity>
            </View>

            {/* Right mascot doodle cat */}
            <View style={styles.headerRightCat}>
              <DoodleCat size={26} color="#FAF7F2" />
              <View style={styles.catSparkleWrapper} pointerEvents="none">
                <DoodleSparkle size={9} color="#FDE047" />
              </View>
            </View>
          </View>

          {/* Slogan */}
          <View style={styles.sloganRow}>
            <Text style={styles.sloganText}>✧ 收集每一个值得纪念的瞬间 ✧</Text>
          </View>

          {/* Featured Showcase Banner (本期精选 稀有) */}
          <TouchableOpacity
            style={styles.showcaseBanner}
            onPress={handleBannerPress}
            activeOpacity={0.88}
          >
            <View style={styles.bannerLeft}>
              <View style={styles.bannerTagRow}>
                <View style={styles.bannerTagPill}>
                  <Text style={styles.bannerTagText}>本期精选 稀有</Text>
                </View>
              </View>

              <Text style={styles.bannerTitle}>星空漫游</Text>
              <Text style={styles.bannerSubtitle}>第 04 期 · 限定闪卡已上线</Text>

              <View style={styles.bannerDetailBtn}>
                <Text style={styles.bannerDetailBtnText}>查看详情 →</Text>
              </View>
            </View>

            <View style={styles.bannerRight}>
              <Image
                source={require('../../../assets/cards/album/banner_showcase.png')}
                style={styles.bannerImage}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
              onPress={() => {
                triggerHaptic();
                setFilter('ALL');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === 'ALL' && styles.filterPillTextActive,
                ]}
              >
                全部
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                filter === 'COLLECTED' && styles.filterPillActive,
              ]}
              onPress={() => {
                triggerHaptic();
                setFilter('COLLECTED');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === 'COLLECTED' && styles.filterPillTextActive,
                ]}
              >
                已收集 36
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                filter === 'UNCOLLECTED' && styles.filterPillActive,
              ]}
              onPress={() => {
                triggerHaptic();
                setFilter('UNCOLLECTED');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === 'UNCOLLECTED' && styles.filterPillTextActive,
                ]}
              >
                未收集 12
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, filter === 'RARE' && styles.filterPillActive]}
              onPress={() => {
                triggerHaptic();
                setFilter('RARE');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === 'RARE' && styles.filterPillTextActive,
                ]}
              >
                稀有 5
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4-Column Card Grid */}
          <View style={styles.gridContainer}>
            {filteredCards.map((card, idx) => {
              if (!card) return null;
              const isCollected = collectedCardIdSet.has(card.id);
              const rarity = card.rarityTag || 'SR';

              return (
                <TouchableOpacity
                  key={card.id || `card-${idx}`}
                  style={[
                    styles.cardWrapper,
                    { width: cardWidth, height: cardHeight },
                  ]}
                  onPress={() => handleCardPress(card)}
                  activeOpacity={0.8}
                >
                  {/* Holographic metallic double border */}
                  <View style={styles.cardBorderFrame}>
                    {/* Thumbnail Artwork with safe fallback */}
                    <Image
                      source={card.previewImage || require('../../../assets/cards/album/card_01.png')}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />

                    {/* Top Meta: Card Code + Rarity Badge */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardCodeBadge}>
                        <Text style={styles.cardCodeText}>
                          {card.cardCode || `#0${idx + 1}`}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.rarityBadge,
                          rarity === 'UR' && styles.rarityUR,
                          rarity === 'SSR' && styles.raritySSR,
                          rarity === 'SR' && styles.raritySR,
                          rarity === 'R' && styles.rarityR,
                        ]}
                      >
                        <Text style={styles.rarityText}>{rarity}</Text>
                      </View>
                    </View>

                    {/* Bottom Title Bar with dark fade */}
                    <View style={styles.cardTitleBar}>
                      <Text style={styles.cardTitleText} numberOfLines={1}>
                        {card.title || '神秘奇遇'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Web enhancement styles */}
      {Platform.OS === 'web' && (
        <style>{`
          .album-glow-card {
            box-shadow: 0 8px 32px rgba(14, 165, 233, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }
        `}</style>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070913',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: PADDING,
  },
  mainWrapper: {
    width: '100%',
  },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 4,
  },
  brandText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  brandSparkle: {
    fontSize: 12,
    color: '#FDE047',
  },
  topTabsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  topTabItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  topTabText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  topTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  topTabIndicator: {
    width: 16,
    height: 2.5,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
    marginTop: 4,
  },
  headerRightCat: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  catSparkleWrapper: {
    position: 'absolute',
    top: -2,
    right: -4,
  },

  /* Slogan */
  sloganRow: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  sloganText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FDE047',
    letterSpacing: 1.5,
  },

  /* Showcase Banner */
  showcaseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(22, 28, 52, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.22)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bannerTagPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.42)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  bannerDetailBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  bannerDetailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.3,
  },
  bannerRight: {
    width: 108,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },

  /* Filter Row */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* 4-Column Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    marginBottom: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardBorderFrame: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(224, 231, 255, 0.36)',
    overflow: 'hidden',
    backgroundColor: '#12172A',
  },
  cardHeaderRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
    zIndex: 2,
  },
  cardCodeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 4,
    paddingHorizontal: 3.5,
    paddingVertical: 1.5,
  },
  cardCodeText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  rarityBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  rarityUR: {
    backgroundColor: '#F43F5E',
  },
  raritySSR: {
    backgroundColor: '#F59E0B',
  },
  raritySR: {
    backgroundColor: '#8B5CF6',
  },
  rarityR: {
    backgroundColor: '#0284C7',
  },
  rarityText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardTitleBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingVertical: 3,
    paddingHorizontal: 3,
    alignItems: 'center',
    zIndex: 2,
  },
  cardTitleText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
