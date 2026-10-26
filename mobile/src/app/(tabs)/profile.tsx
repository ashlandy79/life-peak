import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER } from '../../data/mockUser';
import { colors } from '../../theme/colors';
import { DoodleCat, DoodleSparkle } from '../../components/DoodleDeco';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [reduceMotion, setReduceMotion] = useState(MOCK_USER.settings.reduceMotion);
  const [hapticsEnabled, setHapticsEnabled] = useState(MOCK_USER.settings.hapticsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(MOCK_USER.settings.soundEnabled);

  const handleResetData = () => {
    Alert.alert(
      '重置本地体验数据',
      '确认清空本地任务进度与收藏卡片状态并恢复初始体验吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定重置',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('已重置', '本地缓存已清空，返回首页重新加载体验即可。');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={MOCK_USER.avatar} style={styles.avatar} contentFit="cover" />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.nickname}>{MOCK_USER.nickname}</Text>
              <DoodleCat size={18} color={colors.ink} />
            </View>
            <Text style={styles.bio}>{MOCK_USER.bio}</Text>
            <Text style={styles.joinDate}>加入于 {MOCK_USER.joinedDate}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{MOCK_USER.totalCollectedCards}</Text>
            <Text style={styles.statLabel}>已收藏卡片</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{MOCK_USER.totalCompletedTasks}</Text>
            <Text style={styles.statLabel}>完成小事</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{MOCK_USER.totalMemoryEntries}</Text>
            <Text style={styles.statLabel}>手账记忆</Text>
          </View>
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionHeader}>偏好设置</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>减少动态效果</Text>
              <Text style={styles.settingDesc}>开启后开包动效和卡片翻转将简化</Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: '#DDD5C7', true: colors.moss }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>触感震动反馈</Text>
              <Text style={styles.settingDesc}>撕开封口与完成任务时的轻触微震</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#DDD5C7', true: colors.moss }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>音效反馈</Text>
              <Text style={styles.settingDesc}>卡包撕开声与清脆入册声效</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#DDD5C7', true: colors.moss }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Product philosophy info */}
        <Text style={styles.sectionHeader}>关于 LIFE PACK</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <DoodleSparkle size={18} color={colors.bronze} />
            <Text style={styles.infoTitle}>把生活，收藏成卡片</Text>
          </View>
          <Text style={styles.infoText}>
            不做打卡压力，不做连续签到惩罚。我们相信每一个微小瞬间的体验才是核心。只要你愿意，随时拆开一个卡包，去生活中遇见一段轻盈的奇遇。
          </Text>
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetData}
          activeOpacity={0.7}
        >
          <Text style={styles.resetText}>清空本地演示数据</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EAE3D6',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#EFE7DA',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  bio: {
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 16,
    marginBottom: 6,
  },
  joinDate: {
    fontSize: 11,
    color: '#A89E8E',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EAE3D6',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.moss,
  },
  statLabel: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ECE5D8',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAE3D6',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  settingDesc: {
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F3EDE4',
  },
  infoCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE3CB',
    marginBottom: 24,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  infoText: {
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 13,
    color: '#B08378',
    fontWeight: '600',
  },
});
