import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { BrandHeader } from '../../components/BrandHeader';
import { HolographicPackCard } from '../../components/HolographicPackCard';
import { DailyTasksPanel } from '../../components/DailyTasksPanel';
import { PuzzlePreviewPanel } from '../../components/PuzzlePreviewPanel';
import { FlyingStarToAlbum } from '../../components/FlyingStarToAlbum';
import { TaskRepository } from '../../services/TaskRepository';
import { PackRepository } from '../../services/PackRepository';
import { CollectionRepository } from '../../services/CollectionRepository';
import { CardRepository } from '../../services/CardRepository';
import { BadgeService } from '../../services/BadgeService';
import { TaskItem, PuzzleState } from '../../types/task';
import { PackDefinition } from '../../types/pack';
import { CardDefinition, UserCardInstance } from '../../types/card';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ flyStar?: string }>();
  const [pack, setPack] = useState<PackDefinition | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null);
  const [sealedCard, setSealedCard] = useState<CardDefinition | null>(null);
  const [sealedInstance, setSealedInstance] = useState<UserCardInstance | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFlyingStar, setShowFlyingStar] = useState(false);

  useEffect(() => {
    if (searchParams.flyStar === '1') {
      setShowFlyingStar(true);
    }
  }, [searchParams.flyStar]);

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

  const handleFlyingStarComplete = () => {
    setShowFlyingStar(false);
    BadgeService.setAlbumBadge(true);
    // Clear the flyStar query parameter without re-rendering or navigating away
    router.setParams({ flyStar: undefined } as any);
  };

  return (
    <View style={styles.screen}>
      {/* 1. 首页背景：图3 温暖波光日光折射原图 */}
      <Image
        source={require('../../../assets/home_bg.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* 2. 柔和波光粼粼流转微光层 (Shimmer Caustics) */}
      <div className="home-caustic-shimmer" />

      {/* 3. 顶部手绘品牌与日期状态栏 */}
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

      {/* Flying Star into Album TabBar Animation */}
      {showFlyingStar && (
        <FlyingStarToAlbum onComplete={handleFlyingStarComplete} />
      )}

      {/* 首页波光粼粼流光动画 */}
      <style>{`
        .home-caustic-shimmer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse at 75% 25%,
              rgba(255, 255, 255, 0.42) 0%,
              rgba(254, 240, 138, 0.15) 35%,
              transparent 70%
            ),
            radial-gradient(
              ellipse at 25% 65%,
              rgba(255, 255, 255, 0.3) 0%,
              rgba(103, 232, 249, 0.12) 40%,
              transparent 75%
            );
          mix-blend-mode: soft-light;
          animation: caustic-sway 10s ease-in-out infinite alternate;
        }

        @keyframes caustic-sway {
          0% {
            opacity: 0.7;
            transform: scale(1.0);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.03) translate3d(1%, -1%, 0);
          }
          100% {
            opacity: 0.75;
            transform: scale(0.99) translate3d(-1%, 1%, 0);
          }
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
