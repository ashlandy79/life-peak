import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, {
  Rect,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Circle,
  G,
} from 'react-native-svg';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { CardDefinition } from '../types/card';
import { AppIcon } from './AppIcon';

interface PearlBlueFoilCardProps {
  card?: CardDefinition;
  width?: number;
  height?: number;
  customSubject?: any;
  customBackground?: any;
  isSealed?: boolean;
  sealMaskOpacityShared?: SharedValue<number>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = Math.min(SCREEN_WIDTH - 64, 320);
const DEFAULT_HEIGHT = Math.round(DEFAULT_WIDTH * (4 / 3));

export const PearlBlueFoilCard: React.FC<PearlBlueFoilCardProps> = ({
  card,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  customSubject,
  customBackground,
  isSealed = false,
  sealMaskOpacityShared,
}) => {
  const outerRadius = 24;
  const innerRadius = 18;

  // Resolve assets
  const subjectSource = customSubject || card?.subjectImage || require('../../assets/cards/link_subject.png');
  const bgSource = customBackground || card?.backgroundImage || require('../../assets/cards/forest_bg.jpg');

  // Animated seal mask style if a SharedValue is provided
  const animatedSealStyle = useAnimatedStyle(() => {
    if (sealMaskOpacityShared !== undefined) {
      return {
        opacity: sealMaskOpacityShared.value,
      };
    }
    return {
      opacity: isSealed ? 1 : 0,
    };
  });

  const parsedTags = [
    { label: '出门', icon: 'location', stars: 4 },
    { label: '社交', icon: 'chat', stars: 2 },
    { label: '荒谬', icon: 'tag', stars: 5 },
  ];

  return (
    <View style={[styles.container, { width, height }]}>
      {/* 1. 环境背景层 (Background Layer - 苔藓秘境森林) */}
      <View style={[styles.layerFill, { borderRadius: outerRadius, overflow: 'hidden' }]}>
        <Image
          source={bgSource}
          style={styles.fullImage}
          contentFit="cover"
        />
        {/* 微弱暗角环境遮罩 */}
        <View style={styles.vignetteOverlay} />
      </View>

      {/* 2. 透明主体图层 (Subject Layer - 树桩上的林克与小精灵) */}
      <View style={[styles.layerFill, styles.subjectContainer]}>
        <Image
          source={subjectSource}
          style={styles.subjectImage}
          contentFit="contain"
        />
      </View>

      {/* 3. 经典珍珠蓝全息双层流光外框 (Classic Pearl Blue Double Foil Frame) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            {/* 珍珠蓝主色渐变：冰川珍珠蓝 -> 青紫霓虹 -> 洋红全息 */}
            <SvgLinearGradient id="pearlBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
              <Stop offset="35%" stopColor="#818cf8" stopOpacity="0.90" />
              <Stop offset="70%" stopColor="#ec4899" stopOpacity="0.92" />
              <Stop offset="100%" stopColor="#67e8f9" stopOpacity="0.95" />
            </SvgLinearGradient>

            {/* 内层轨道微光线 */}
            <SvgLinearGradient id="innerRailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <Stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.80" />
            </SvgLinearGradient>

            {/* 徽章三色渐变 (粉紫/冰青/暖橙) */}
            <SvgLinearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#a855f7" />
              <Stop offset="50%" stopColor="#ec4899" />
              <Stop offset="100%" stopColor="#f97316" />
            </SvgLinearGradient>

            {/* 棱镜折光长针渐变 */}
            <SvgLinearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#67e8f9" />
              <Stop offset="40%" stopColor="#ffffff" />
              <Stop offset="60%" stopColor="#c084fc" />
              <Stop offset="100%" stopColor="#38bdf8" />
            </SvgLinearGradient>
          </Defs>

          {/* 外边框 (厚度约 4pt) */}
          <Rect
            x={3}
            y={3}
            width={width - 6}
            height={height - 6}
            rx={outerRadius}
            fill="none"
            stroke="url(#pearlBlueGrad)"
            strokeWidth={4.5}
          />

          {/* 内层细线流光轨道 (厚度约 1.5pt) */}
          <Rect
            x={10}
            y={10}
            width={width - 20}
            height={height - 20}
            rx={innerRadius}
            fill="none"
            stroke="url(#innerRailGrad)"
            strokeWidth={1.5}
          />
        </Svg>
      </View>

      {/* 4. 左上角：属性徽章 (圆形发光渐变徽章 + 叉勺图标 + 食物文字) */}
      <View style={styles.topLeftBadgeWrapper} pointerEvents="none">
        <View style={styles.badgeCircle}>
          <Svg width={36} height={36} viewBox="0 0 48 48">
            <Circle cx="24" cy="24" r="23" fill="url(#badgeGrad)" stroke="#ffffff" strokeWidth="2.5" />
            {/* 叉勺矢量图标 */}
            <G fill="#ffffff" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              {/* 叉子 */}
              <Path d="M16 22 L16 38" strokeWidth="2.8" />
              <Path d="M12 12 L12 20 Q12 23 16 23 Q20 23 20 20 L20 12 M16 12 L16 23" strokeWidth="2.2" fill="none" />
              {/* 勺子 */}
              <Path d="M32 23 L32 38" strokeWidth="2.8" />
              <Path d="M32 12 C28 12 28 20 32 20 C36 20 36 12 32 12 Z" />
            </G>
          </Svg>
        </View>
        <Text style={styles.badgeLabel}>食物</Text>
      </View>

      {/* 5. 右上角：卡号标识 (#027) */}
      <View style={styles.topRightBadge} pointerEvents="none">
        <Text style={styles.cardNumberText}>{card?.cardCode || '#027'}</Text>
      </View>

      {/* 6. 中部核心：任务详情信息卡 (卡片工坊经典 Life Seal 规范) */}
      <View style={styles.taskInfoContainer} pointerEvents="none">
        {/* 6.1 今日奇遇小标头 */}
        <Text style={styles.taskHeader}>{card?.subtitle || '今日奇遇 #027'}</Text>

        {/* 6.2 主任务文案 (两行) */}
        <Text style={styles.taskMainText}>
          {card?.taskTitle || '去楼下便利店，\n买一瓶你没喝过的饮料。'}
        </Text>

        {/* 6.3 副标题限制 */}
        <Text style={styles.taskSubText}>
          {card?.taskDescription || '不准研究配料表。'}
        </Text>

        {/* 6.4 属性标签胶囊组 (出门 ★★★★ / 社交 ★★ / 荒谬 ★★★★★) */}
        <View style={styles.tagsPillRow}>
          {parsedTags.map((t, idx) => (
            <View key={idx} style={styles.tagPill}>
              <View style={styles.tagIconCircle}>
                <AppIcon name={t.icon as any} size={11} color="#1E293B" />
              </View>
              <Text style={styles.tagPillLabel}>{t.label}</Text>
              <Text style={styles.tagPillStars}>{'★'.repeat(t.stars)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 7. 底部状态与罕贵度 */}
      <View style={styles.bottomFooterRow} pointerEvents="none">
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{isSealed ? '已封印' : '已入册'}</Text>
        </View>
        <Text style={styles.rarityLabel}>{card?.tier ? `${card.tier.toUpperCase()} · LIFE EVENT` : 'RARE · LIFE EVENT'}</Text>
      </View>

      {/* 8. 封印状态蒙版覆层 (含中央 LIFE SEAL 星芒罗盘纹章) */}
      {(isSealed || sealMaskOpacityShared !== undefined) && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.sealMaskContainer, animatedSealStyle]}
          pointerEvents="none"
        >
          {/* 磨砂暗色渐变底板 */}
          <View style={styles.sealMaskBackdrop} />

          {/* 中央 LIFE SEAL 封印纹章 (复刻工坊中央彩色折光棱镜针与星芒罗盘) */}
          <View style={styles.sealCrestWrapper}>
            <Svg width={180} height={180} viewBox="0 0 200 200">
              {/* 外层纤细几何圆环 */}
              <Circle cx="100" cy="100" r="54" fill="none" stroke="rgba(226, 232, 240, 0.72)" strokeWidth="1.8" />
              {/* 内部菱形线框 */}
              <Path d="M100 28 L154 100 L100 172 L46 100 Z" fill="none" stroke="rgba(165, 243, 252, 0.45)" strokeWidth="1.4" />
              {/* 左右延伸细线 */}
              <Path d="M0 100 L46 100 M154 100 L200 100" stroke="rgba(226, 232, 240, 0.65)" strokeWidth="1.5" />
              {/* 上下棱镜长芒针 */}
              <Path d="M100 18 L107 82 L100 88 L93 82 Z" fill="url(#needleGrad)" stroke="#ffffff" strokeWidth="1" />
              <Path d="M100 182 L107 118 L100 112 L93 118 Z" fill="url(#needleGrad)" stroke="#ffffff" strokeWidth="1" />
            </Svg>
            <View style={styles.crestTextContainer}>
              <Text style={styles.crestTitle}>LIFE SEAL</Text>
              <View style={styles.sealBadgePill}>
                <Text style={styles.sealBadgeText}>已封印</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    position: 'relative',
    backgroundColor: '#0c0f17',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  layerFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 15, 25, 0.22)',
  },
  subjectContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    zIndex: 10,
  },
  subjectImage: {
    width: '92%',
    height: '92%',
  },

  // 4. 左上角属性徽章
  topLeftBadgeWrapper: {
    position: 'absolute',
    top: 16,
    left: 18,
    alignItems: 'center',
    zIndex: 30,
  },
  badgeCircle: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 5. 右上角卡号
  topRightBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 30,
  },
  cardNumberText: {
    color: 'rgba(248, 250, 252, 0.95)',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // 6. 中下部任务详情
  taskInfoContainer: {
    position: 'absolute',
    bottom: 44,
    left: 16,
    right: 16,
    zIndex: 25,
  },
  taskHeader: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  taskMainText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    letterSpacing: 0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  taskSubText: {
    color: 'rgba(226, 232, 240, 0.88)',
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 6.4 属性标签胶囊行
  tagsPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.45)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 4,
  },
  tagIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPillLabel: {
    color: '#FAF7F2',
    fontSize: 9.5,
    fontWeight: '700',
  },
  tagPillStars: {
    color: '#F59E0B',
    fontSize: 8.5,
  },

  // 7. 底部状态与罕贵度
  bottomFooterRow: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 25,
  },
  statusPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  statusPillText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rarityLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // 8. 封印蒙版
  sealMaskContainer: {
    zIndex: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealMaskBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 43, 0.76)',
  },
  sealCrestWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -20,
  },
  crestTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#67E8F9',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sealBadgePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: 4,
  },
  sealBadgeText: {
    color: '#F59E0B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
