import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../../theme/colors';
import { DoodleSparkle, DoodlePuzzlePiece } from '../../../components/DoodleDeco';

export default function TaskCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { instanceId, title } = useLocalSearchParams<{ instanceId: string; title?: string }>();

  const handleRecordMemory = () => {
    router.replace(`/memory/${instanceId}` as any);
  };

  const handleSkipToCollection = () => {
    router.replace('/(tabs)/album');
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      {/* Top Section */}
      <View style={styles.topContent}>
        {/* Checkmark circle */}
        <View style={styles.checkCircle}>
          <Svg width={40} height={40} viewBox="0 0 24 24">
            <Path
              d="M20 6 L9 17 L4 12"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={styles.congratsTitle}>小奇遇已达成！</Text>
        <Text style={styles.congratsSubtitle}>
          {title ? `“${title}”` : '今日微小的改变'}
        </Text>

        {/* Puzzle piece reward badge */}
        <View style={styles.rewardPill}>
          <DoodlePuzzlePiece size={18} color={colors.bronze} filled />
          <Text style={styles.rewardText}>获得拼图片段 +1</Text>
          <DoodleSparkle size={16} color={colors.bronze} />
        </View>
      </View>

      {/* Middle Card: Philosophy note */}
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>记录完全自愿</Text>
        <Text style={styles.noteBody}>
          每一份真实的完成体验本身就是最珍贵的。你可以留下几句随笔或照片，也可以直接收下卡片入册，纯粹由你决定。
        </Text>
      </View>

      {/* Action Buttons: 2 equal choices */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={handleRecordMemory}
          activeOpacity={0.85}
        >
          <Text style={styles.recordButtonText}>留下这次手账回忆 ✎</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipToCollection}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>直接领取卡片入册 →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topContent: {
    alignItems: 'center',
    marginTop: 30,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.moss,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  congratsSubtitle: {
    fontSize: 15,
    color: colors.inkMuted,
    marginTop: 6,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE2C1',
    marginTop: 18,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.bronze,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.2,
    borderColor: '#ECE5D8',
    width: '100%',
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  noteBody: {
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  actionGroup: {
    width: '100%',
    gap: 12,
  },
  recordButton: {
    backgroundColor: colors.moss,
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  recordButtonText: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#E2DAD0',
  },
  skipButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
});
