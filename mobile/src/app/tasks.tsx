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
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { TaskRepository } from '../services/TaskRepository';
import { TaskItem } from '../types/task';
import { DoodlePuzzlePiece, DoodleSparkle } from '../components/DoodleDeco';
import { CosmicParticles } from '../components/cosmic/CosmicParticles';

export default function StandaloneTasksScreen() {
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

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {}
    }
  };

  const handleBack = () => {
    triggerHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleToggle = async (taskId: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const updated = await TaskRepository.toggleTask(taskId);
    setTasks(updated);
  };

  return (
    <View style={styles.screen}>
      {/* 1. 深色星空基础底图 */}
      <Image
        source={require('../../assets/draw_bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* 2. 漂浮星尘粒子 */}
      <CosmicParticles particleCount={32} />

      {/* 3. 顶部导航栏 (带返回键) */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>任务中心</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* 4. 任务列表容器 */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header 区域 */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>生活任务</Text>
            <DoodleSparkle size={18} color="#FDE047" />
          </View>
          <Text style={styles.subtitle}>
            完成体验是核心，无需打卡压力，不留记录也可领取卡片。
          </Text>

          {/* 进度预览胶囊 */}
          <View style={styles.progressCapsule}>
            <View style={styles.progressCapsuleLeft}>
              <Text style={styles.progressCapsuleTitle}>今日任务完成度</Text>
              <Text style={styles.progressCapsuleSub}>累积拼图碎片可兑换限定卡片</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {completedCount} / {totalCount}
              </Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => {
              const labelMap = { ALL: '全部', ACTIVE: '进行中', COMPLETED: '已完成' };
              const isActive = filter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}
                  onPress={() => {
                    triggerHaptic();
                    setFilter(tab);
                  }}
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

        {/* Task Cards */}
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
                      color={isDone ? '#FDE047' : '#94A3B8'}
                      filled={isDone}
                    />
                    <Text style={[styles.rewardText, isDone && styles.rewardTextDone]}>
                      奖励拼图片段 +1
                    </Text>
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
    backgroundColor: '#060C17',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FAF7F2',
    fontSize: 18,
    fontWeight: '700',
  },
  topBarTitle: {
    color: '#FAF7F2',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 12,
  },
  header: {
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FAF7F2',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 5,
    marginBottom: 14,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  progressCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.22)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  progressCapsuleLeft: {
    flexDirection: 'column',
  },
  progressCapsuleTitle: {
    color: '#FAF7F2',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  progressCapsuleSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 3,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  progressBadgeText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 13,
  },
  filterTabActive: {
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#060C17',
    fontWeight: '800',
  },
  taskCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  taskCardDone: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  durationText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FAF7F2',
    marginBottom: 5,
    letterSpacing: 0.4,
  },
  cardTitleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  cardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  rewardTextDone: {
    color: '#FDE047',
  },
  actionButton: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  actionButtonDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  actionButtonTextDone: {
    color: '#94A3B8',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FAF7F2',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
