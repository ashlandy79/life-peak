import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Rect, Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import type { CardDefinition } from '../types/card';

interface StaticCardViewProps {
  card?: CardDefinition | null;
  width?: number;
  height?: number;
  isSealed?: boolean;
  style?: any;
}

export const StaticCardView: React.FC<StaticCardViewProps> = ({
  card,
  width = 240,
  height = 320,
  isSealed = true,
  style,
}) => {
  const bgSource = card?.backgroundImage || require('../../assets/cards/forest_bg.jpg');
  const subjectSource = card?.subjectImage || require('../../assets/cards/link_subject.png');

  const cardCode = card?.cardCode || '#027';
  const title = card?.title || '去楼下便利店，\n买一瓶你没喝过的饮料。';
  const subtitle = card?.subtitle || card?.taskDescription || '不准研究配料表。';
  const tags = card?.tags && card.tags.length > 0 ? card.tags : ['出门', '社交', '荒谬'];

  return (
    <View style={[styles.cardContainer, { width, height }, style]}>
      {/* 1. 环境背景层 */}
      <Image
        source={bgSource}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* 2. 透明主体立绘层 */}
      <Image
        source={subjectSource}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
      />

      {/* 3. 封印态纯平暗化遮罩与微晶磨砂感 */}
      {isSealed && <View style={styles.sealedDarkenOverlay} />}

      {/* 4. 纯静态 SVG 边框与双层全息流光线条 */}
      <Svg style={StyleSheet.absoluteFill} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgLinearGradient id="pearlBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
            <Stop offset="35%" stopColor="#818cf8" stopOpacity="0.95" />
            <Stop offset="70%" stopColor="#ec4899" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#67e8f9" stopOpacity="0.95" />
          </SvgLinearGradient>
        </Defs>

        {/* 外框 */}
        <Rect
          x={4}
          y={4}
          width={width - 8}
          height={height - 8}
          rx={14}
          ry={14}
          fill="none"
          stroke="url(#pearlBorderGrad)"
          strokeWidth={4.5}
        />

        {/* 内框细线 */}
        <Rect
          x={8.5}
          y={8.5}
          width={width - 17}
          height={height - 17}
          rx={10}
          ry={10}
          fill="none"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth={1}
        />
      </Svg>

      {/* 5. 顶栏信息：左上角类别徽章 + 右上角卡号 */}
      <View style={styles.topInfoRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>🍴</Text>
          <Text style={styles.categoryText}>食物</Text>
        </View>
        <Text style={styles.cardCodeText}>{cardCode}</Text>
      </View>

      {/* 6. 中央 LIFE SEAL 封印罗盘印章 */}
      {isSealed && (
        <View style={styles.centerSealContainer} pointerEvents="none">
          <View style={styles.sealCompass}>
            <View style={styles.sealCircle} />
            <View style={styles.sealDiamond} />
            <Text style={styles.sealTitle}>LIFE SEAL</Text>
          </View>
        </View>
      )}

      {/* 7. 底部任务与属性信息 */}
      <View style={styles.bottomInfoArea}>
        <Text style={styles.taskTitleText} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.taskSubtitleText} numberOfLines={1}>
          {subtitle}
        </Text>

        {/* 标签栏 */}
        <View style={styles.tagsRow}>
          {tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 底部状态徽章 */}
        <View style={styles.footerStateRow}>
          <View style={styles.stateBadge}>
            <Text style={styles.stateBadgeText}>
              {isSealed ? '已封印 🌙' : '已解封 ✨'}
            </Text>
          </View>
          <Text style={styles.rarityText}>RARE · LIFE EVENT</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0a0d14',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  sealedDarkenOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  topInfoRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(236, 72, 153, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  categoryIcon: {
    fontSize: 10,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardCodeText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowRadius: 4,
  },
  centerSealContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
    top: -24,
  },
  sealCompass: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sealCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(103, 232, 249, 0.85)',
  },
  sealDiamond: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.75)',
    transform: [{ rotate: '45deg' }],
  },
  sealTitle: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(15, 23, 42, 0.9)',
    textShadowRadius: 6,
  },
  bottomInfoArea: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    zIndex: 15,
  },
  taskTitleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowRadius: 6,
  },
  taskSubtitleText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowRadius: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  tagPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  tagText: {
    color: '#f59e0b',
    fontSize: 8,
    fontWeight: '700',
  },
  footerStateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stateBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.45)',
  },
  stateBadgeText: {
    color: '#67e8f9',
    fontSize: 8,
    fontWeight: '800',
  },
  rarityText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
