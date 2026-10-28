import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { DoodleCat, DoodleSparkle, DoodlePuzzlePiece } from './DoodleDeco';
import { PuzzleState } from '../types/task';

interface PuzzlePreviewPanelProps {
  puzzleState: PuzzleState;
  onPress?: () => void;
}

export const PuzzlePreviewPanel: React.FC<PuzzlePreviewPanelProps> = ({
  puzzleState,
  onPress,
}) => {
  const { totalPieces, collectedPieceIndices, name } = puzzleState;
  const collectedCount = collectedPieceIndices.length;
  const remainingCount = Math.max(0, totalPieces - collectedCount);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* 顶部金色流光层 */}
      <div className="golden-sheen-beam" />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <DoodleSparkle size={16} color="#FDE047" style={styles.sparkleIcon} />
          <Text style={styles.titleText}>今日拼图</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {collectedCount}/{totalPieces}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitleText}>{name}</Text>

      {/* Main Puzzle Row with Slots & Mascot */}
      <View style={styles.contentRow}>
        {/* 5 Puzzle Slots */}
        <View style={styles.slotsContainer}>
          {Array.from({ length: totalPieces }).map((_, index) => {
            const isUnlocked = collectedPieceIndices.includes(index);
            return (
              <View
                key={index}
                style={[
                  styles.slotBox,
                  isUnlocked ? styles.slotBoxUnlocked : styles.slotBoxLocked,
                ]}
              >
                <DoodlePuzzlePiece
                  size={18}
                  color={isUnlocked ? '#FFFFFF' : '#64748B'}
                  filled={isUnlocked}
                />
                <Text
                  style={[
                    styles.slotIndexText,
                    isUnlocked ? styles.slotTextUnlocked : styles.slotTextLocked,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Mascot Cat & Bubble */}
        <View style={styles.mascotContainer}>
          <View style={styles.mascotBubble}>
            <Text style={styles.bubbleText}>
              {remainingCount === 0 ? '已集齐✨' : `还差 ${remainingCount} 片~`}
            </Text>
          </View>
          <DoodleCat size={32} color="#FAF7F2" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(10, 19, 35, 0.88)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    marginRight: 6,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FAF7F2',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: 'rgba(253, 224, 71, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.25)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FDE047',
  },
  subtitleText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  slotBox: {
    width: 44,
    height: 48,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBoxUnlocked: {
    backgroundColor: '#F59E0B',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  slotBoxLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  slotIndexText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  slotTextUnlocked: {
    color: '#FFFFFF',
  },
  slotTextLocked: {
    color: '#64748B',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  mascotBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FAF7F2',
  },
});
