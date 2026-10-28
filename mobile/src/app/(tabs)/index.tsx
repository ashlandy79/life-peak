import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
      {/* 1. 首页上半部分背景：图2 深空宇宙轨道与水面涟漪 (仅占约1/2位置) */}
      <View style={styles.cosmicTopBgContainer}>
        <Image
          source={require('../../../assets/home_cosmic_bg.jpg')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top center"
        />
        {/* 底部平滑渐变过度至下半部分深蓝色底色 */}
        <div className="cosmic-bg-fade-mask" />
      </View>

      {/* 2. 顶部手绘品牌与日期状态栏 */}
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
            tintColor="#67E8F9"
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
          onPressAllTasks={() => {
            try {
              router.push('/tasks' as any);
            } catch {
              router.navigate('/tasks' as any);
            }
          }}
        />

        {/* Puzzle Progress Preview Panel */}
        {puzzleState && (
          <PuzzlePreviewPanel
            puzzleState={puzzleState}
            onPress={handlePressPuzzle}
          />
        )}

        {/* 今日抽卡快捷长条卡片 (图3 快捷入口) */}
        <TouchableOpacity
          style={styles.todayDrawBanner}
          onPress={handleOpenPack}
          activeOpacity={0.85}
        >
          <View style={styles.todayDrawLeft}>
            <Image
              source={require('../../../assets/today_draw_minicard.png')}
              style={styles.todayDrawMiniCard}
              contentFit="cover"
            />
          </View>
          <View style={styles.todayDrawContent}>
            <Text style={styles.todayDrawTitle}>今日抽卡</Text>
            <Text style={styles.todayDrawSubtitle}>让生活成为一种收藏</Text>
          </View>
          <View style={styles.todayDrawArrowBtn}>
            <Text style={styles.todayDrawArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Flying Star into Album TabBar Animation */}
      {showFlyingStar && (
        <FlyingStarToAlbum onComplete={handleFlyingStarComplete} />
      )}

      {/* 渐变遮罩动画与微光 */}
      <style>{`
        .cosmic-bg-fade-mask {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(6, 12, 23, 0) 0%,
            rgba(6, 12, 23, 0) 65%,
            rgba(6, 12, 23, 0.75) 88%,
            #060c17 100%
          );
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#060C17',
    overflow: 'hidden',
    position: 'relative',
  },
  cosmicTopBgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    overflow: 'hidden',
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  todayDrawBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(13, 23, 42, 0.88)',
    borderWidth: 1.2,
    borderColor: 'rgba(103, 232, 249, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  todayDrawLeft: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(253, 224, 71, 0.6)',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  todayDrawMiniCard: {
    width: '100%',
    height: '100%',
  },
  todayDrawContent: {
    flex: 1,
    marginLeft: 14,
  },
  todayDrawTitle: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  todayDrawSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  todayDrawArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  todayDrawArrow: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
});
