import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { CardDefinition, UserCardInstance } from '../types/card';
import { colors } from '../theme/colors';
import { DoodleStar } from './DoodleDeco';

interface CardGridItemProps {
  card?: CardDefinition;
  instance?: UserCardInstance;
  isLocked?: boolean;
  onPress: () => void;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = (SCREEN_WIDTH - 36 - 12) / 2; // 2 column grid

export const CardGridItem: React.FC<CardGridItemProps> = ({
  card,
  instance,
  isLocked = false,
  onPress,
  width = DEFAULT_CARD_WIDTH,
}) => {
  const height = width * (4 / 3);

  if (isLocked || !card) {
    return (
      <View style={[styles.cardContainer, { width, height }, styles.lockedContainer]}>
        <View style={styles.lockedInner}>
          <Text style={styles.questionMark}>?</Text>
          <Text style={styles.lockedText}>等待奇遇探索</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { width, height }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {card.backgroundImage && card.subjectImage ? (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={card.backgroundImage}
            style={styles.cardImage}
            contentFit="cover"
          />
          <View style={[StyleSheet.absoluteFill, styles.gridSubjectLayer]}>
            <Image
              source={card.subjectImage}
              style={styles.gridSubjectImage}
              contentFit="contain"
            />
          </View>
        </View>
      ) : (
        <Image
          source={card.previewImage}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      )}

      {/* Card Overlay Info */}
      <View style={styles.bottomInfoOverlay}>
        <View style={styles.badgeRow}>
          <Text style={styles.cardCode}>{card.cardCode}</Text>
          {instance?.isFavorite && (
            <DoodleStar size={14} color="#F5A623" style={styles.starIcon} />
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {card.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#ECE4D8',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 14,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gridSubjectLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 22,
  },
  gridSubjectImage: {
    width: '88%',
    height: '88%',
  },
  bottomInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235, 228, 218, 0.8)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCode: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.moss,
    letterSpacing: 0.5,
  },
  starIcon: {
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  lockedContainer: {
    backgroundColor: '#F5F1E9',
    borderStyle: 'dashed',
    borderColor: '#DDD4C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    fontSize: 28,
    fontWeight: '700',
    color: '#B5AA9A',
    marginBottom: 4,
  },
  lockedText: {
    fontSize: 11,
    color: '#A89E8E',
    fontWeight: '500',
  },
});
