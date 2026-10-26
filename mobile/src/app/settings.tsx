import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>系统设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>LIFE PACK v1.0.0 (Native Expo)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  content: {
    padding: 20,
  },
  infoText: {
    fontSize: 13,
    color: colors.inkMuted,
  },
});
