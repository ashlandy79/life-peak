import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import * as Haptics from 'expo-haptics';
import { CardRepository } from '../../services/CardRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { DoodleSparkle, DoodleCat } from '../../components/DoodleDeco';
import { UnsealRecordModal, UnsealRecordOption } from '../../components/UnsealRecordModal';
import { SlashBurstEffect } from '../../components/SlashBurstEffect';
import { TcgHoloCard, TcgHoloCardRef } from '../../components/TcgHoloCard';
import { CosmicParticles } from '../../components/cosmic/CosmicParticles';
import { PrismBeam } from '../../components/cosmic/PrismBeam';
import { GroundEnergyRing } from '../../components/cosmic/GroundEnergyRing';
import { ShinyPillButton } from '../../components/cosmic/ShinyPillButton';
import type { CardRarityTier } from '../../core/tcgTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 345);

export default function CardDetailCosmicScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { instanceId, from } = useLocalSearchParams<{ instanceId: string; from?: string }>();
  const isFromAlbum = from === 'album';

  const [instance, setInstance] = useState<UserCardInstance | null>(null);
  const [card, setCard] = useState<CardDefinition | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [triggerSlashBurst, setTriggerSlashBurst] = useState(false);
  const [currentTier, setCurrentTier] = useState<CardRarityTier>('rare');

  const tcgCardRef = useRef<TcgHoloCardRef | null>(null);

  const loadData = useCallback(async () => {
    if (!instanceId) return;
    let inst = await CollectionRepository.getInstanceById(instanceId);
    let cardDef: CardDefinition | null = null;
    if (inst) {
      cardDef = (await CardRepository.getCardById(inst.cardId)) || null;
    } else {
      cardDef = (await CardRepository.getCardById(instanceId)) || null;
      if (cardDef) {
        inst = {
          instanceId: `inst-${cardDef.id}`,
          cardId: cardDef.id,
          status: 'COLLECTED',
          obtainedAt: new Date().toISOString(),
          unsealedAt: new Date().toISOString(),
        } as UserCardInstance;
      }
    }
    if (inst && cardDef) {
      setInstance(inst);
      setCard(cardDef);
      if (cardDef.tier) {
        setCurrentTier(cardDef.tier as CardRarityTier);
      }
    }
  }, [instanceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {
        // ignore
      }
    }
  };

  const handleSafeBack = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (isFromAlbum) {
        router.replace('/(tabs)/album');
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace(isFromAlbum ? '/(tabs)/album' : '/(tabs)');
    }
  }, [router, isFromAlbum]);

  const handlePressUnseal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const handleConfirmRecord = (option: UnsealRecordOption, content?: string) => {
    setModalVisible(false);

    // 1. 触发动漫斩击补刀特效
    setTimeout(() => {
      setTriggerSlashBurst(true);
    }, 120);

    // 2. 触发 3D 全息卡片由封印态原地平滑解封至 2.5D 高光浮动态
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

  const getFormattedDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const day = dayNames[now.getDay()];
    return `${month}月${date}日  ${day}`;
  };

  if (!card || !instance) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loadingText}>卡片加载中...</Text>
      </View>
    );
  }

  const isSealedState = isFromAlbum ? false : instance.status === 'SEALED';

  return (
    <View style={styles.screen}>
      {/* 1. 深色星空基础底图 */}
      <Image
        source={require('../../../assets/draw_bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* 2. 宇宙揭晓页：宽幅对角线虹彩棱镜光束 (Prism Beam) */}
      <PrismBeam />

      {/* 3. 宇宙揭晓页：漂浮星尘粒子与四角菱形星芒 (Cosmic Particles) */}
      <CosmicParticles particleCount={55} />

      {/* 4. 顶部状态栏与品牌区 (1:1 复刻设计稿) */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <View style={styles.revealTopBar}>
          {/* 左侧：返回按钮 + LIFE PACK 手绘气泡 + 日期 */}
          <View style={styles.leftNavGroup}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleSafeBack}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>←</Text>
            </TouchableOpacity>

            <View style={styles.brandDateGroup}>
              <View style={styles.brandBubbleRow}>
                <View style={styles.lifePackBubble}>
                  <Text style={styles.lifePackText}>LIFE PACK</Text>
                </View>
                <span className="brand-bubble-sparkles">✧ ✧</span>
              </View>
              <Text style={styles.dateSubtitleText}>{getFormattedDate()}</Text>
            </View>
          </View>

          {/* 右侧：卡片状态 / 01 + 小猫手绘 */}
          <View style={styles.unlockGroup}>
            <View style={styles.unlockTextWrapper}>
              <Text style={styles.unlockText}>
                {isFromAlbum ? '卡片珍藏鉴赏' : isSealedState ? '封印中的奇遇' : '已解封纪念'}
              </Text>
              <div className="unlock-underline" />
            </View>
            <View style={styles.catWithSparkles}>
              <DoodleCat size={26} color="#FAF7F2" />
              <DoodleSparkle size={10} color="#FDE047" style={styles.catSparkle1} />
              <DoodleSparkle size={8} color="#67E8F9" style={styles.catSparkle2} />
            </View>
          </View>
        </View>
      </View>

      {/* 5. 中央舞台区域 */}
      <View style={styles.stageArea}>
        <View style={styles.cosmicCardStage}>
          {/* 地面能量光环 */}
          <View style={styles.groundRingWrapper}>
            <GroundEnergyRing width={CARD_WIDTH * 1.08} height={85} />
          </View>

          {/* 3D 全息卡片本体（封印态或解封态，支持 3D 旋转与翻看） */}
          <View style={styles.holoCardContainer}>
            <TcgHoloCard
              ref={tcgCardRef}
              card={card}
              isSealed={isSealedState}
              tier={currentTier}
              cardWidth={CARD_WIDTH}
            />
          </View>

          {/* 卡片下方全息提示语 */}
          <View style={styles.holoHintRow}>
            <Text style={styles.holoHintSparkle}>✧</Text>
            <Text style={styles.holoHintText}>轻触卡片查看全息效果</Text>
            <Text style={styles.holoHintSparkle}>✧</Text>
          </View>
        </View>
      </View>

      {/* 6. 底部操作与装饰区域 (1:1 复刻设计稿) */}
      <View
        style={[
          styles.bottomRevealArea,
          { paddingBottom: Math.max(insets.bottom, 28) + 20 },
        ]}
      >
        {/* 主按钮：来自卡册时展示「翻看卡背 ↺」，不显示收藏到卡册 */}
        {isFromAlbum ? (
          <ShinyPillButton
            label="翻看卡背 ↺"
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              tcgCardRef.current?.flipCard();
            }}
            style={styles.mainActionBtn}
          />
        ) : isSealedState ? (
          <ShinyPillButton
            label="✦ 解封卡片"
            onPress={handlePressUnseal}
            style={styles.mainActionBtn}
          />
        ) : (
          <ShinyPillButton
            label="★ 卡片已解封"
            onPress={() => {}}
            style={[styles.mainActionBtn, { opacity: 0.92 }]}
          />
        )}

        {/* 次级链接 */}
        <TouchableOpacity
          onPress={handleSafeBack}
          activeOpacity={0.75}
          style={styles.albumLinkBtn}
        >
          <Text style={styles.albumLinkText}>{isFromAlbum ? '← 返回卡册' : '返回首页'}</Text>
          <div className="album-link-underline" />
        </TouchableOpacity>

        {/* 底部角落装饰 */}
        <View style={styles.footerCornerGroup} pointerEvents="none">
          {/* 左下小猫咪涂鸦 */}
          <View style={styles.footerLeftCat}>
            <DoodleCat size={28} color="#CBD5E1" />
            <DoodleSparkle size={10} color="#FDE047" style={{ position: 'absolute', top: -4, right: -6 }} />
          </View>

          {/* 右下生活寄语 */}
          <View style={styles.footerRightQuote}>
            <Text style={styles.footerQuoteLine}>一张卡</Text>
            <Text style={styles.footerQuoteLine}>就是一次</Text>
            <View style={styles.quoteLastRow}>
              <Text style={styles.footerQuoteLine}>小小的出发。</Text>
              <Text style={styles.quoteSparkle}>✧</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 7. 解封心境/打卡记录弹窗 */}
      <UnsealRecordModal
        visible={modalVisible}
        onConfirm={handleConfirmRecord}
        onClose={() => setModalVisible(false)}
      />

      {/* 8. 动漫全屏补刀斩裂冲击波特效 */}
      <SlashBurstEffect
        active={triggerSlashBurst}
        onComplete={handleSlashBurstComplete}
      />

      {/* 页面全局样式补充 */}
      <style>{`
        .brand-bubble-sparkles {
          color: #fde047;
          font-size: 13px;
          margin-left: 6px;
          letter-spacing: 2px;
          filter: drop-shadow(0 0 6px rgba(253, 224, 71, 0.7));
        }

        .unlock-underline {
          width: 100%;
          height: 1.5px;
          background: linear-gradient(90deg, rgba(203, 213, 225, 0.8), transparent);
          margin-top: 3px;
          border-radius: 1px;
        }

        .album-link-underline {
          width: 52px;
          height: 1.5px;
          background: rgba(255, 255, 255, 0.7);
          margin-top: 4px;
          border-radius: 1px;
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070a12',
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  topBar: {
    paddingHorizontal: 16,
    zIndex: 50,
  },
  revealTopBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  leftNavGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  closeText: {
    color: '#FAF7F2',
    fontSize: 18,
    fontWeight: '700',
  },
  brandDateGroup: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  brandBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lifePackBubble: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FAF7F2',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '-4deg' }],
  },
  lifePackText: {
    color: '#FAF7F2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dateSubtitleText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  unlockGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  unlockTextWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  unlockText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  catWithSparkles: {
    position: 'relative',
    padding: 2,
  },
  catSparkle1: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  catSparkle2: {
    position: 'absolute',
    bottom: -2,
    left: -4,
  },
  stageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cosmicCardStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 35,
  },
  groundRingWrapper: {
    position: 'absolute',
    bottom: 22,
    zIndex: 1,
  },
  holoCardContainer: {
    zIndex: 10,
    marginBottom: 4,
  },
  holoHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    zIndex: 20,
  },
  holoHintSparkle: {
    color: '#67E8F9',
    fontSize: 11,
    textShadowColor: 'rgba(103, 232, 249, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  holoHintText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(103, 232, 249, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bottomRevealArea: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 45,
    paddingHorizontal: 20,
    position: 'relative',
    minHeight: 140,
  },
  mainActionBtn: {
    marginBottom: 14,
  },
  albumLinkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginBottom: 6,
  },
  albumLinkText: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  footerCornerGroup: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  footerLeftCat: {
    position: 'absolute',
    bottom: 12,
    left: 20,
  },
  footerRightQuote: {
    position: 'absolute',
    bottom: 14,
    right: 20,
    alignItems: 'flex-end',
  },
  footerQuoteLine: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  quoteLastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quoteSparkle: {
    color: '#FDE047',
    fontSize: 9,
  },
});
