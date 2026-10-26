import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { BrandHeader } from '../../components/BrandHeader';
import { HolographicPackCard } from '../../components/HolographicPackCard';
import { DailyTasksPanel } from '../../components/DailyTasksPanel';
import { PuzzlePreviewPanel } from '../../components/PuzzlePreviewPanel';
import { TaskRepository } from '../../services/TaskRepository';
import { PackRepository } from '../../services/PackRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardRepository } from '../../services/CardRepository';
import { TaskItem, PuzzleState } from '../../types/task';
import { PackDefinition } from '../../types/pack';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [pack, setPack] = useState<PackDefinition | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null);
  const [sealedCard, setSealedCard] = useState<CardDefinition | null>(null);
  const [sealedInstance, setSealedInstance] = useState<UserCardInstance | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const dailyPack = await PackRepository.getDailyPack();
      const dailyTasks = await TaskRepository.getDailyTasks();
      const puzzle = await TaskRepository.getPuzzleState();

      // Check if there is an active sealed card drawn today
      const latestInst = await CollectionRepository.getLatestSealedOrActiveInstance();
      if (latestInst && latestInst.status === 'SEALED') {
        const c = await CardRepository.getCardById(latestInst.cardId);
        if (c) {
          setSealedCard(c);
          setSealedInstance(latestInst);
        } else {
          setSealedCard(null);
          setSealedInstance(null);
        }
      } else {
        setSealedCard(null);
        setSealedInstance(null);
      }

      setPack(dailyPack);
      setTasks(dailyTasks);
      setPuzzleState(puzzle);
    } catch (err) {
      console.error('Failed to load home data', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenPack = () => {
    router.push('/pack/opening');
  };

  const handlePressSealedCard = () => {
    if (sealedInstance) {
      router.push(`/card/${sealedInstance.instanceId}` as any);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const updated = await TaskRepository.toggleTask(taskId);
    setTasks(updated);
    const updatedPuzzle = await TaskRepository.getPuzzleState();
    setPuzzleState(updatedPuzzle);
  };

  const handlePressTaskDetail = (taskId: string) => {
    router.push(`/task/${taskId}` as any);
  };

  const handlePressPuzzle = () => {
    Alert.alert(
      '今日拼图',
      '完成今日小事即可收集拼图片段！集齐 5 片将合成一张特别限定纪念海报。',
      [{ text: '知道了' }]
    );
  };

  return (
    <View style={styles.screen}>
      <BrandHeader
        dateText="9月20日 星期日"
        onPressNotification={() => {
          Alert.alert('每日奇遇提醒', '今天还有 2 个微习惯小事未完成，卡包等待开启！');
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.moss}
          />
        }
      >
        {/* Main Central Card: switches dynamically between unopened foil pack & sealed card */}
        <HolographicPackCard
          onOpenPack={handleOpenPack}
          packImage={pack?.sealedImage}
          quote={pack?.dailyQuote || '今天也会有好事发生吧'}
          packTitle={pack?.subtitle || '城市漫游 · 生活奇遇卡包'}
          isSealedCard={!!sealedCard}
          sealedCard={sealedCard || undefined}
          onPressCard={handlePressSealedCard}
        />

        {/* Daily Tasks Panel */}
        <DailyTasksPanel
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onPressTaskDetail={handlePressTaskDetail}
        />

        {/* Puzzle Progress Preview Panel */}
        {puzzleState && (
          <PuzzlePreviewPanel
            puzzleState={puzzleState}
            onPress={handlePressPuzzle}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
