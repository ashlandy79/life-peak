import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { TaskItem } from '../types/task';
import { colors } from '../theme/colors';
import { DoodlePaperclip, DoodlePuzzlePiece } from './DoodleDeco';

interface DailyTasksPanelProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onPressTaskDetail?: (taskId: string) => void;
}

export const DailyTasksPanel: React.FC<DailyTasksPanelProps> = ({
  tasks,
  onToggleTask,
  onPressTaskDetail,
}) => {
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;

  const handleToggle = async (taskId: string) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // ignore
    }
    onToggleTask(taskId);
  };

  return (
    <View style={styles.container}>
      {/* 顶部金色流光层 (图1 金色外侧流光特效) */}
      <div className="golden-sheen-beam" />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>今日小事</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitleText}>完成小任务，积累你的小确幸</Text>

      {/* Task list */}
      <View style={styles.listContainer}>
        {tasks.map((task) => {
          const isDone = task.status === 'COMPLETED';
          return (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskItem, isDone && styles.taskItemDone]}
              onPress={() => (onPressTaskDetail ? onPressTaskDetail(task.id) : handleToggle(task.id))}
              activeOpacity={0.7}
            >
              {/* Checkbox (图1 圆形微光勾选框) */}
              <TouchableOpacity
                style={[styles.checkbox, isDone && styles.checkboxDone]}
                onPress={() => handleToggle(task.id)}
                activeOpacity={0.8}
              >
                {isDone ? (
                  <Svg width={13} height={13} viewBox="0 0 24 24">
                    <Path
                      d="M20 6 L9 17 L4 12"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : (
                  <View style={styles.checkboxInnerUnchecked} />
                )}
              </TouchableOpacity>

              {/* Task Title */}
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                  {task.title}
                </Text>
              </View>

              {/* Reward puzzle piece (图1 +1 ✦ 标志) */}
              <View style={styles.rewardContainer}>
                <Text style={[styles.rewardText, isDone && styles.rewardTextDone]}>
                  +1
                </Text>
                <Text style={styles.rewardSparkle}>✦</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <style>{`
        .golden-sheen-beam {
          position: absolute;
          top: -1.5px;
          left: 6%;
          width: 55%;
          height: 3px;
          border-radius: 3px;
          background: linear-gradient(90deg, rgba(253, 224, 71, 0) 0%, rgba(253, 224, 71, 0.95) 40%, rgba(245, 158, 11, 0.8) 80%, rgba(245, 158, 11, 0) 100%);
          box-shadow: 0 -2px 14px rgba(253, 224, 71, 0.65), 0 0 8px rgba(245, 158, 11, 0.5);
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
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
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FAF7F2',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  subtitleText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  listContainer: {
    gap: 9,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  taskItemDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    opacity: 0.75,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxInnerUnchecked: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  checkboxDone: {
    backgroundColor: '#1E293B',
    borderColor: '#FDE047',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FAF7F2',
    letterSpacing: 0.2,
  },
  taskTitleDone: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  rewardTextDone: {
    color: '#FDE047',
  },
  rewardSparkle: {
    color: '#FDE047',
    fontSize: 11,
    textShadowColor: 'rgba(253, 224, 71, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
