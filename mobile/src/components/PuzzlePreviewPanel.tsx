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
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <DoodleSparkle size={16} color={colors.bronze} style={styles.sparkleIcon} />
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
                  size={20}
                  color={isUnlocked ? '#FFFFFF' : '#C2B8A8'}
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
          <DoodleCat size={32} color={colors.ink} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginVertical: 10,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EDE7DC',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: '#F3EFE8',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DFC8',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.bronze,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 4,
    marginBottom: 14,
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBoxUnlocked: {
    backgroundColor: colors.bronze,
    shadowColor: colors.bronze,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  slotBoxLocked: {
    backgroundColor: '#F7F4EE',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#DBD2C3',
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
    color: '#B0A696',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  mascotBubble: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE2C1',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink,
  },
});
