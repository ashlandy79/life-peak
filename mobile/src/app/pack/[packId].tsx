import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { PackRepository } from '../../services/PackRepository';
import { PackDefinition } from '../../types/pack';
import { colors } from '../../theme/colors';
import { DoodleSparkle, DoodleStar } from '../../components/DoodleDeco';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PACK_WIDTH = Math.min(SCREEN_WIDTH * 0.65, 260);
const PACK_HEIGHT = PACK_WIDTH * (924 / 565);

export default function PackDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const [pack, setPack] = useState<PackDefinition | null>(null);

  useEffect(() => {
    async function load() {
      if (packId) {
        const p = await PackRepository.getPackById(packId) || await PackRepository.getDailyPack();
        setPack(p);
      }
    }
    load();
  }, [packId]);

  if (!pack) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loadingText}>卡包加载中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) }]}>
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

      {/* Main Pack Preview */}
      <View style={styles.content}>
        <View style={styles.packWrapper}>
          <Image
            source={pack.sealedImage}
            style={styles.packImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.titleRow}>
            <DoodleSparkle size={18} color={colors.bronze} />
            <Text style={styles.title}>{pack.title}</Text>
          </View>
          <Text style={styles.subtitle}>{pack.subtitle}</Text>
          <Text style={styles.desc}>{pack.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>系列全套</Text>
              <Text style={styles.statValue}>{pack.totalCards} 张</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>今日开启次数</Text>
              <Text style={styles.statValue}>{pack.availableDraws} 次</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.openButton}
          onPress={() => router.push('/pack/opening')}
          activeOpacity={0.85}
        >
          <Text style={styles.openButtonText}>撕开这个卡包 →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'space-between',
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
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  packWrapper: {
    width: PACK_WIDTH,
    height: PACK_HEIGHT,
    marginBottom: 20,
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  packImage: {
    width: '100%',
    height: '100%',
  },
  metaContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.moss,
    fontWeight: '600',
    marginTop: 4,
  },
  desc: {
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  statPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE5D8',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.inkMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  actionContainer: {
    paddingHorizontal: 24,
  },
  openButton: {
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
  openButtonText: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
