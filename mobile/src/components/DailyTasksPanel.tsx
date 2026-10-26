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
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <DoodlePaperclip size={18} color={colors.inkMuted} style={styles.clipIcon} />
          <Text style={styles.titleText}>今日小事</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      <Text style={styles.subtitleText}>微小的改变，是奇迹的起点</Text>

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
              {/* Checkbox */}
              <TouchableOpacity
                style={[styles.checkbox, isDone && styles.checkboxDone]}
                onPress={() => handleToggle(task.id)}
                activeOpacity={0.8}
              >
                {isDone && (
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <Path
                      d="M20 6 L9 17 L4 12"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>

              {/* Task Title */}
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                  {task.title}
                </Text>
              </View>

              {/* Reward puzzle piece */}
              <View style={styles.rewardContainer}>
                <DoodlePuzzlePiece
                  size={16}
                  color={isDone ? colors.bronze : '#BDB4A5'}
                  filled={isDone}
                />
                <Text style={[styles.rewardText, isDone && styles.rewardTextDone]}>
                  +1
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginVertical: 10,
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
  clipIcon: {
    marginRight: 6,
    transform: [{ rotate: '15deg' }],
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
    color: colors.moss,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  listContainer: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  taskItemDone: {
    backgroundColor: '#F6F3ED',
    opacity: 0.85,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#C4BCAD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxDone: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  taskTitleDone: {
    color: '#9C9384',
    textDecorationLine: 'line-through',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9C9384',
    marginLeft: 3,
  },
  rewardTextDone: {
    color: colors.bronze,
  },
});
