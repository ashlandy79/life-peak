import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DrawService, DrawResult } from '../../services/DrawService';
import { DoodleSparkle, DoodleCat, DoodleStar } from '../../components/DoodleDeco';
import { TcgHoloCard, TcgHoloCardRef } from '../../components/TcgHoloCard';
import { ThreePackStage } from '../../components/ThreePackStage';
import { CosmicParticles } from '../../components/cosmic/CosmicParticles';
import { CosmicBackdropOverlay } from '../../components/cosmic/CosmicBackdropOverlay';
import { PrismBeam } from '../../components/cosmic/PrismBeam';
import { GroundEnergyRing } from '../../components/cosmic/GroundEnergyRing';
import { ShinyPillButton } from '../../components/cosmic/ShinyPillButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PACK_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);
const PACK_HEIGHT = Math.round(PACK_WIDTH * (924 / 565));
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 345);

export default function PackOpeningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tearProgress, setTearProgress] = useState<number>(0);
  const [stage, setStage] = useState<'SEALED' | 'CARD_BACK' | 'REVEALED'>('SEALED');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const lastReportedProgressRef = useRef<number>(0);
  const tcgCardRef = useRef<TcgHoloCardRef | null>(null);

  const handleTearProgress = useCallback((p: number) => {
    const rounded = Math.round(p * 10) / 10;
    if (rounded !== lastReportedProgressRef.current || p === 1 || p === 0) {
      lastReportedProgressRef.current = rounded;
      setTearProgress(p);
    }
  }, []);

  // Card emergence & reveal animation (拆包前强制 0 隐藏，拆开瞬间平滑淡入)
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.96);
  const cardTranslateY = useSharedValue(12);

  // Bottom action buttons fade-in
  const controlsOpacity = useSharedValue(0);
  const controlsTranslateY = useSharedValue(24);

  useEffect(() => {
    // Preload draw result from card pool
    DrawService.drawFromPack('pack-series-01').then((res) => {
      setDrawResult(res);
    });
  }, []);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Heavy) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {
        // ignore
      }
    }
  };

  // 安全返回，彻底避免路由历史为空时触发 GO_BACK 报错
  const handleSafeBack = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  }, [router]);

  // 收下这张卡 -> 持久化入库并返回首页，触发飞星入卡册特效
  const handleAcceptCard = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (drawResult) {
      await DrawService.commitDraw(drawResult.pack.id, {
        ...drawResult.instance,
        status: 'SEALED',
      });
      router.replace({
        pathname: '/(tabs)',
        params: { flyStar: '1' },
      } as any);
    } else {
      router.replace('/(tabs)');
    }
  };

  // 再抽一张 -> 自动入库当前卡片，重置舞台并抽取新卡
  const handleDrawAgain = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (drawResult) {
      await DrawService.commitDraw(drawResult.pack.id, {
        ...drawResult.instance,
        status: 'SEALED',
      });
    }
    const newRes = await DrawService.drawFromPack('pack-series-01');
    setDrawResult(newRes);
    cardOpacity.value = 0;
    cardScale.value = 0.96;
    cardTranslateY.value = 12;
    controlsOpacity.value = 0;
    controlsTranslateY.value = 24;
    lastReportedProgressRef.current = 0;
    setTearProgress(0);
    setIsFlipping(false);
    setStage('SEALED');
  };

  // Three.js 物理撕开完成：卡包滑落溶解，无缝露出居中卡背与能量法阵，随后顺畅翻转
  const handleThreeTearComplete = useCallback(() => {
    setStage('CARD_BACK');
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

    // 卡包消散，卡片以背面平滑淡入浮现 (240ms)
    cardOpacity.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) });
    cardScale.value = withSpring(1.0, { damping: 15, stiffness: 90 });
    cardTranslateY.value = withSpring(0, { damping: 15, stiffness: 85 });

    // 稍作停顿 (160ms) 感知真实卡背与法阵，随后立即触发 180° -> 0° 顺畅 3D 翻转
    setTimeout(() => {
      setIsFlipping(true);
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);

      let isFinished = false;
      const finishReveal = () => {
        if (isFinished) return;
        isFinished = true;
        setIsFlipping(false);
        setStage('REVEALED');
        runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);

        // 翻转完成，揭晓页底部操作按钮与提示平滑升起浮现
        controlsOpacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
        controlsTranslateY.value = withSpring(0, { damping: 14 });
      };

      // 触发 3D 翻转至正面
      if (tcgCardRef.current?.flipToFront) {
        tcgCardRef.current.flipToFront(850, finishReveal);
      }
      setTimeout(finishReveal, 900);
    }, 160);
  }, [triggerHaptic]);

  const animatedCardContainerStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
  }));

  const animatedControlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    transform: [{ translateY: controlsTranslateY.value }],
  }));

  // 格式化当前日期为设计图样式（例：10月27日 星期二）
  const getFormattedDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const day = dayNames[now.getDay()];
    return `${month}月${date}日  ${day}`;
  };

  return (
    <View style={styles.screen}>
      {/* 1. 深色星空基础底图 */}
      <Image
        source={require('../../../assets/draw_bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* 2. 宇宙全景：宽幅对角线虹彩棱镜光束 (图1至图3全程连贯常驻) */}
      <PrismBeam />

      {/* 3. 宇宙全景：漂浮星尘粒子与四角菱形星芒 (图1至图3全程连贯常驻) */}
      <CosmicParticles particleCount={stage === 'REVEALED' ? 55 : 42} />

      {/* 4. 宇宙全景：深空天体轨道环与光束纹理 (图1至图3全程连贯常驻) */}
      <CosmicBackdropOverlay opacity={stage === 'SEALED' ? 0.9 : 1.0} />

      {/* 5. 顶部状态栏与品牌区 */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        {stage !== 'REVEALED' ? (
          // 撕包阶段与卡背展示阶段（图1 & 图2）：安全返回按钮
          <View style={styles.tearTopBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleSafeBack}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 揭晓阶段（图3）：1:1 复刻手绘品牌气泡与解锁提示
          <View style={styles.revealTopBar}>
            {/* 左侧：LIFE PACK 手绘气泡 + 日期 */}
            <View style={styles.brandDateGroup}>
              <View style={styles.brandBubbleRow}>
                <View style={styles.lifePackBubble}>
                  <Text style={styles.lifePackText}>LIFE PACK</Text>
                </View>
                <span className="brand-bubble-sparkles">✧ ✧</span>
              </View>
              <Text style={styles.dateSubtitleText}>{getFormattedDate()}</Text>
            </View>

            {/* 右侧：新卡片已解锁 / 01 + 小猫手绘 */}
            <View style={styles.unlockGroup}>
              <View style={styles.unlockTextWrapper}>
                <Text style={styles.unlockText}>新卡片已解锁  /  01</Text>
                <div className="unlock-underline" />
              </View>
              <View style={styles.catWithSparkles}>
                <DoodleCat size={26} color="#FAF7F2" />
                <DoodleSparkle size={10} color="#FDE047" style={styles.catSparkle1} />
                <DoodleSparkle size={8} color="#67E8F9" style={styles.catSparkle2} />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 6. 撕包中提示 Pill (图1 & 图2 阶段) */}
      {stage !== 'REVEALED' && (
        <View style={styles.instructionContainer}>
          <View style={styles.instructionPill}>
            <DoodleSparkle size={16} color="#67E8F9" />
            <Text style={styles.instructionText}>
              {tearProgress >= 1
                ? '卡包已撕开 ✧'
                : tearProgress > 0
                ? `正在撕裂卡包 ${Math.round(tearProgress * 100)}%`
                : '向右滑动卡包即可拆包 ▶'}
            </Text>
          </View>
        </View>
      )}

      {/* 7. 中央舞台区域 */}
      <View style={styles.stageArea}>
        {/* 常驻中央全息卡片舞台：提前预热挂载，拆包前 opacity: 0 隐形，拆开瞬间平滑淡入 */}
        <Animated.View
          style={[
            styles.cosmicCardStage,
            animatedCardContainerStyle,
          ]}
          pointerEvents={stage === 'SEALED' ? 'none' : 'auto'}
        >
          {/* 卡片正下方地面能量法阵：全程旋转点亮 */}
          <View style={styles.groundRingWrapper}>
            <GroundEnergyRing width={CARD_WIDTH * 1.08} height={85} />
          </View>

          {/* 3D 全息卡片本体（初始以背面 180° 居中，随后无缝翻转至正面 0°） */}
          <View style={styles.holoCardContainer}>
            <TcgHoloCard
              ref={tcgCardRef}
              card={drawResult?.card}
              isSealed={true}
              initialRotationY={180}
              tier={drawResult?.card?.tier || 'rare'}
              cardWidth={CARD_WIDTH}
            />
            {/* 翻转过程中的高光掠影扫光特效 */}
            {isFlipping && <div className="card-flip-sheen" />}
          </View>

          {/* 卡片下方全息提示语（翻至正面后浮现） */}
          {stage === 'REVEALED' && (
            <View style={styles.holoHintRow}>
              <Text style={styles.holoHintSparkle}>✧</Text>
              <Text style={styles.holoHintText}>轻触卡片查看全息效果</Text>
              <Text style={styles.holoHintSparkle}>✧</Text>
            </View>
          )}
        </Animated.View>

        {/* 阶段 A：物理卡包撕开舞台（图1），覆盖在卡片正前方 */}
        {stage === 'SEALED' && (
          <View
            style={[styles.threeStageWrapper, { position: 'absolute' }]}
            pointerEvents={tearProgress >= 1 ? 'none' : 'auto'}
          >
            <ThreePackStage
              width={PACK_WIDTH}
              height={PACK_HEIGHT}
              onTearProgress={handleTearProgress}
              onTearComplete={handleThreeTearComplete}
            />
          </View>
        )}
      </View>

      {/* 8. 统一高度与垂直基准的底部区域：让卡包与卡片垂直中心在同一直线上，彻底根除位置突跳 */}
      <View
        style={[
          styles.bottomFixedContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 12 },
        ]}
      >
        {stage !== 'REVEALED' ? (
          <View style={styles.preRevealContent}>
            <Text style={styles.preRevealQuoteLine1}>今天也没啥事。</Text>
            <View style={styles.preRevealQuoteRow}>
              <Text style={styles.preRevealQuoteLine2}>那就抽一张吧。</Text>
              <Text style={styles.quoteSparkle}>✧</Text>
              <View style={styles.preRevealLine} />
            </View>
            <View style={styles.preRevealCatCorner}>
              <DoodleCat size={32} color="#CBD5E1" />
              <Text style={styles.lifePackTinyText}>LIFE PACK</Text>
            </View>
          </View>
        ) : (
          <Animated.View style={[styles.bottomRevealArea, animatedControlsStyle]}>
            {/* 主按钮：收下这张卡 -> */}
            <ShinyPillButton
              label="收下这张卡 →"
              onPress={handleAcceptCard}
              style={styles.mainActionBtn}
            />

            {/* 次级链接：再抽一张 */}
            <TouchableOpacity
              onPress={handleDrawAgain}
              activeOpacity={0.75}
              style={styles.albumLinkBtn}
            >
              <Text style={styles.albumLinkText}>再抽一张</Text>
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
          </Animated.View>
        )}
      </View>

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

        .card-flip-sheen {
          position: absolute;
          inset: -15%;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(255, 255, 255, 0.65) 48%,
            rgba(103, 232, 249, 0.85) 52%,
            transparent 75%
          );
          filter: blur(8px);
          mix-blend-mode: screen;
          animation: flip-sheen-sweep 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          z-index: 50;
        }

        @keyframes flip-sheen-sweep {
          0% {
            transform: translateX(-120%) skewX(-20deg);
            opacity: 0;
          }
          35% {
            opacity: 0.95;
          }
          70% {
            opacity: 0.75;
          }
          100% {
            transform: translateX(140%) skewX(-20deg);
            opacity: 0;
          }
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
  topBar: {
    paddingHorizontal: 20,
    zIndex: 50,
  },
  tearTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  revealTopBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 4,
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
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 10,
    zIndex: 40,
    minHeight: 38,
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.35)',
  },
  instructionText: {
    color: '#FAF7F2',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  threeStageWrapper: {
    width: PACK_WIDTH,
    height: PACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
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
    position: 'relative',
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
  bottomFixedContainer: {
    width: '100%',
    minHeight: 124,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 50,
  },
  preRevealContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'relative',
  },
  preRevealQuoteLine1: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    textAlign: 'center',
  },
  preRevealQuoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    position: 'relative',
  },
  preRevealQuoteLine2: {
    color: '#FAF7F2',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  preRevealLine: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 18,
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  preRevealCatCorner: {
    position: 'absolute',
    right: 0,
    bottom: -4,
    alignItems: 'center',
  },
  lifePackTinyText: {
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
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
