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
    try {
      router.push(`/card/${card.id}?from=album` as any);
    } catch {
      router.navigate(`/card/${card.id}?from=album` as any);
    }
  };

  const handleBannerPress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const list = Array.isArray(allCards) ? allCards.filter(Boolean) : MOCK_CARDS;
    const featuredCard = list.find((c) => c && c.cardCode === '#027') || list[0];
    if (featuredCard && featuredCard.id) {
      try {
        router.push(`/card/${featuredCard.id}?from=album` as any);
      } catch {
        router.navigate(`/card/${featuredCard.id}?from=album` as any);
      }
    }
  };

  // 安全计算 3 列卡片尺寸 (图4 3列全景大图鉴展示)
  const screenW = WINDOW_WIDTH && WINDOW_WIDTH > 0 ? WINDOW_WIDTH : 390;
  const contentWidth = Math.min(screenW, CONTAINER_MAX_WIDTH);
  const cardWidth = Math.max(90, Math.floor((contentWidth - PADDING * 2 - GAP * 2) / 3));
  const cardHeight = Math.floor(cardWidth * 1.44);

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
          {/* Header Bar (图4 大标题卡册 + 寄语 + 右侧星芒) */}
          <View style={styles.headerBar}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.albumMainTitle}>卡册</Text>
              <Text style={styles.albumSubtitle}>收藏每一个值得纪念的瞬间</Text>
            </View>

            <View style={styles.headerRightSparkle}>
              <Text style={styles.bigSparkleIcon}>✦</Text>
            </View>
          </View>

          {/* Featured Showcase Banner (图4 本期精选 3D玻璃钟罩展台) */}
          <TouchableOpacity
            style={styles.showcaseBanner}
            onPress={handleBannerPress}
            activeOpacity={0.88}
          >
            {/* 左侧：3D玻璃钟罩展示台 (Cloche Bell Jar) */}
            <View style={styles.showcaseLeft}>
              <Image
                source={require('../../../assets/cloche_jar.png')}
                style={styles.clocheJarImage}
                contentFit="contain"
              />
            </View>

            {/* 右侧：本期精选 / 夜间漫步 / 标签 / 诗意寄语 / 查看详情 */}
            <View style={styles.showcaseRight}>
              <Text style={styles.showcaseTopTag}>本期精选</Text>
              <Text style={styles.showcaseCardTitle}>夜间漫步</Text>

              <View style={styles.showcasePillRow}>
                <View style={styles.pillGold}>
                  <Text style={styles.pillGoldText}>限定</Text>
                </View>
                <View style={styles.pillDark}>
                  <Text style={styles.pillDarkText}>SSR</Text>
                </View>
              </View>

              <Text style={styles.showcaseQuoteText}>
                在星光下，{'\n'}把所有的烦恼{'\n'}都变成星星。
              </Text>

              <View style={styles.showcaseActionBtn}>
                <Text style={styles.showcaseActionBtnText}>查看详情 →</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Filter Pills (图4 4个圆角胶囊药丸：全部 / 已收集 / 未收集 / 稀有) */}
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
                已收集
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
                未收集
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
                稀有
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3-Column Card Grid (图4 大卡片 + 彩虹全息边框 + 底部居中编号与标题) */}
          <View style={styles.gridContainer}>
            {filteredCards.map((card, idx) => {
              if (!card) return null;
              const isCollected = collectedCardIdSet.has(card.id);

              return (
                <TouchableOpacity
                  key={card.id || `card-${idx}`}
                  style={[
                    styles.cardColumnItem,
                    { width: cardWidth },
                  ]}
                  onPress={() => handleCardPress(card)}
                  activeOpacity={0.82}
                >
                  {/* Holographic Prismatic Frame */}
                  <View
                    style={[
                      styles.cardBorderFrame,
                      { width: cardWidth, height: cardHeight },
                    ]}
                  >
                    {/* Thumbnail Artwork with safe fallback */}
                    <Image
                      source={card.previewImage || require('../../../assets/cards/album/card_01.png')}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />

                    {/* 彩虹流光外框光影遮罩 */}
                    <div className="holo-rainbow-sheen" />
                  </View>

                  {/* 图4 底部信息排版：上方微缩卡号 #027，下方卡名 */}
                  <View style={styles.cardBottomMeta}>
                    <Text style={styles.cardCodeBottomText}>
                      {card.cardCode || `#0${idx + 1}`}
                    </Text>
                    <Text style={styles.cardTitleBottomText} numberOfLines={1}>
                      {card.title || '神秘奇遇'}
                    </Text>
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
          .holo-rainbow-sheen {
            position: absolute;
            inset: 0;
            border-radius: 13px;
            pointer-events: none;
            box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.42),
                        0 0 12px rgba(103, 232, 249, 0.28);
          }
        `}</style>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#060C17',
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

  /* Header (图4 纯粹现代深空排版) */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  headerTitleGroup: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  albumMainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FAF7F2',
    letterSpacing: 0.8,
  },
  albumSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  headerRightSparkle: {
    paddingTop: 6,
  },
  bigSparkleIcon: {
    fontSize: 24,
    color: '#FAF7F2',
    textShadowColor: 'rgba(255, 255, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  /* Showcase Banner (图4 3D 玻璃钟罩展台) */
  showcaseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 19, 36, 0.82)',
    borderWidth: 1.2,
    borderColor: 'rgba(56, 189, 248, 0.22)',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  showcaseLeft: {
    width: 145,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clocheJarImage: {
    width: '100%',
    height: '100%',
  },
  showcaseRight: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 6,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  showcaseTopTag: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  showcaseCardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FAF7F2',
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 6,
  },
  showcasePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pillGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillGoldText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.3,
  },
  pillDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillDarkText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.3,
  },
  showcaseQuoteText: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 17,
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  showcaseActionBtn: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    borderWidth: 1.2,
    borderColor: '#38BDF8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5.5,
  },
  showcaseActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },

  /* Filter Row (图4 药丸按钮) */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 7.5,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#F1ECE1',
    borderColor: '#F1ECE1',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#18181B',
    fontWeight: '800',
  },

  /* 3-Column Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    justifyContent: 'flex-start',
  },
  cardColumnItem: {
    marginBottom: 16,
    alignItems: 'center',
  },
  cardBorderFrame: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  cardBottomMeta: {
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
  },
  cardCodeBottomText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  cardTitleBottomText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FAF7F2',
    marginTop: 2,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
