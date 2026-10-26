import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TaskRepository } from '../../services/TaskRepository';
import { CardRepository } from '../../services/CardRepository';
import { TaskItem } from '../../types/task';
import { CardDefinition } from '../../types/card';
import { colors } from '../../theme/colors';
import { DoodleSparkle, DoodlePuzzlePiece } from '../../components/DoodleDeco';

export default function TaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [task, setTask] = useState<TaskItem | null>(null);
  const [associatedCard, setAssociatedCard] = useState<CardDefinition | null>(null);

  useEffect(() => {
    async function load() {
      if (taskId) {
        const t = await TaskRepository.getTaskById(taskId);
        if (t) {
          setTask(t);
          if (t.associatedCardId) {
            const c = await CardRepository.getCardById(t.associatedCardId);
            if (c) setAssociatedCard(c);
          }
        }
      }
    }
    load();
  }, [taskId]);

  const handleToggleComplete = async () => {
    if (!task) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
    }
    const updatedTasks = await TaskRepository.toggleTask(task.id);
    const updated = updatedTasks.find((t) => t.id === task.id);
    if (updated) setTask(updated);

    if (task.status !== 'COMPLETED') {
      router.push({
        pathname: `/task/complete/temp-${task.id}` as any,
        params: { title: task.title },
      });
    }
  };

  if (!task) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loadingText}>任务加载中...</Text>
      </View>
    );
  }

  const isDone = task.status === 'COMPLETED';

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category & Duration */}
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{task.categoryLabel}</Text>
          </View>
          <Text style={styles.durationText}>预计用时：{task.durationMinutes} 分钟</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{task.title}</Text>
        {task.subtitle && <Text style={styles.subtitle}>{task.subtitle}</Text>}

        {/* Description Card */}
        <View style={styles.descCard}>
          <Text style={styles.descLabel}>体验指引</Text>
          <Text style={styles.descText}>{task.description}</Text>
        </View>

        {/* Reward Card */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <DoodlePuzzlePiece size={18} color={colors.bronze} filled />
            <Text style={styles.rewardTitle}>完成奖励</Text>
          </View>
          <Text style={styles.rewardDesc}>
            今日拼图片段 +1。记录完全自愿，即使不写手账也可以直接收获拼图与卡片。
          </Text>
        </View>

        {/* Associated Card preview if any */}
        {associatedCard && (
          <View style={styles.associatedCardBox}>
            <View style={styles.associatedHeader}>
              <DoodleSparkle size={16} color={colors.moss} />
              <Text style={styles.associatedLabel}>关联限定卡片</Text>
            </View>
            <Text style={styles.associatedCardTitle}>
              {associatedCard.cardCode} · {associatedCard.title}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.primaryButton, isDone && styles.primaryButtonDone]}
          onPress={handleToggleComplete}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, isDone && styles.buttonTextDone]}>
            {isDone ? '已完成这个小事 ✓' : '标记已完成体验 →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#F3EFE8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.moss,
  },
  durationText: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#ECE5D8',
    marginBottom: 16,
  },
  descLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.moss,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
  },
  rewardCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE3CB',
    marginBottom: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  rewardDesc: {
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  associatedCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  associatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  associatedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.moss,
  },
  associatedCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: '#ECE5D8',
  },
  primaryButton: {
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDone: {
    backgroundColor: '#E6DFC8',
  },
  buttonText: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonTextDone: {
    color: colors.moss,
  },
});
