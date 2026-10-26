import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TaskRepository } from '../../services/TaskRepository';
import { TaskItem } from '../../types/task';
import { colors } from '../../theme/colors';
import { DoodlePuzzlePiece, DoodleSparkle } from '../../components/DoodleDeco';

export default function TasksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const loadTasks = useCallback(async () => {
    const list = await TaskRepository.getDailyTasks();
    setTasks(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ACTIVE') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const handleToggle = async (taskId: string) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // ignore
    }
    const updated = await TaskRepository.toggleTask(taskId);
    setTasks(updated);
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>生活任务</Text>
          <DoodleSparkle size={18} color={colors.bronze} />
        </View>
        <Text style={styles.subtitle}>
          完成体验是核心，无需打卡压力，不留记录也可领取卡片。
        </Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => {
            const labelMap = { ALL: '全部', ACTIVE: '进行中', COMPLETED: '已完成' };
            const isActive = filter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setFilter(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {labelMap[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>暂无相关任务</Text>
            <Text style={styles.emptySubtitle}>去卡包里抽取一张今日奇遇任务吧</Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, isDone && styles.taskCardDone]}
                onPress={() => router.push(`/task/${task.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{task.categoryLabel}</Text>
                  </View>
                  <Text style={styles.durationText}>
                    约 {task.durationMinutes} 分钟
                  </Text>
                </View>

                <Text style={[styles.cardTitle, isDone && styles.cardTitleDone]}>
                  {task.title}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {task.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.rewardRow}>
                    <DoodlePuzzlePiece
                      size={16}
                      color={isDone ? colors.bronze : '#B3A897'}
                      filled={isDone}
                    />
                    <Text style={styles.rewardText}>奖励拼图片段 +1</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isDone && styles.actionButtonDone,
                    ]}
                    onPress={() => handleToggle(task.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        isDone && styles.actionButtonTextDone,
                      ]}
                    >
                      {isDone ? '已完成 ✓' : '标记完成'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#ECE5D8',
    borderRadius: 14,
    padding: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 11,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  filterTabTextActive: {
    color: colors.moss,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#EAE3D6',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  taskCardDone: {
    backgroundColor: '#F7F4EE',
    opacity: 0.88,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3EFE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.moss,
  },
  durationText: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  cardTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9C9384',
  },
  cardDesc: {
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2EDE4',
    paddingTop: 10,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rewardText: {
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: colors.moss,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  actionButtonDone: {
    backgroundColor: '#E6DFC8',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonTextDone: {
    color: colors.moss,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.inkMuted,
  },
});
