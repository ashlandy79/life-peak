import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CollectionRepository } from '../../services/CollectionRepository';
import { colors } from '../../theme/colors';
import { DoodleCat } from '../../components/DoodleDeco';

export default function MemoryRecordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();

  const [memoryText, setMemoryText] = useState('');

  const handleSave = async () => {
    if (instanceId) {
      await CollectionRepository.completeTask(instanceId, memoryText.trim() || undefined);
    }
    router.replace(`/card/${instanceId}` as any);
  };

  const handleSkip = async () => {
    if (instanceId) {
      await CollectionRepository.completeTask(instanceId);
    }
    router.replace(`/card/${instanceId}` as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 20) }]}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>写下手账记忆</Text>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Note Paper Card */}
          <View style={styles.paperCard}>
            <View style={styles.paperHeader}>
              <DoodleCat size={22} color={colors.ink} />
              <Text style={styles.paperHeaderText}>此刻的想法与感受</Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="写下关于这次小事的微小细节吧... 比如阳光的温度、奇怪的特饮口感，或者是当时的心情。"
              placeholderTextColor="#A89E8E"
              multiline
              numberOfLines={6}
              value={memoryText}
              onChangeText={setMemoryText}
              maxLength={200}
            />

            <Text style={styles.charCount}>{memoryText.length} / 200</Text>
          </View>

          {/* Optional Photo Box Placeholder */}
          <View style={styles.photoBox}>
            <Text style={styles.photoBoxIcon}>📷</Text>
            <Text style={styles.photoBoxTitle}>添加一张现场照片（选填）</Text>
            <Text style={styles.photoBoxSubtitle}>
              照片保存在本地卡片背面，仅你个人可见
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>保存记忆并入册</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE5D8',
  },
  cancelText: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.moss,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  paperCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#EAE1D3',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  paperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  paperHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  textInput: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#B5AA9A',
    textAlign: 'right',
    marginTop: 8,
  },
  photoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#DBD2C3',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBoxIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  photoBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  photoBoxSubtitle: {
    fontSize: 11,
    color: colors.inkMuted,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECE5D8',
  },
  saveButton: {
    backgroundColor: colors.moss,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
