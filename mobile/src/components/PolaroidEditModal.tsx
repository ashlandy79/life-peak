import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface PolaroidEditModalProps {
  visible: boolean;
  initialNote: string;
  initialDate?: string;
  onSave: (note: string, date: string) => void;
  onClose: () => void;
}

const QUICK_TAGS = ['#晚风微凉', '#咖啡与阳光', '#今日好运', '#偶遇一只猫', '#放空时刻', '#小确幸'];

export const PolaroidEditModal: React.FC<PolaroidEditModalProps> = ({
  visible,
  initialNote,
  initialDate,
  onSave,
  onClose,
}) => {
  const [note, setNote] = useState(initialNote);
  const [date, setDate] = useState(
    initialDate ||
      `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(
        new Date().getDate()
      ).padStart(2, '0')}`
  );

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {}
    }
  };

  const handleSelectTag = (tag: string) => {
    triggerHaptic();
    if (note.includes(tag)) return;
    setNote((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSave = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    onSave(note, date);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.modalTitle}>随手记 · 拍立得瞬间</Text>
              <Text style={styles.modalSubtitle}>定格此刻的心情，刻印在卡片背后</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Date Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>记录日期</Text>
            <TextInput
              style={styles.inputSingle}
              value={date}
              onChangeText={setDate}
              placeholder="例如：2026.10.28 · 晚风微凉"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Mood Note Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>生活随笔与心情</Text>
            <TextInput
              style={styles.inputMulti}
              value={note}
              onChangeText={setNote}
              placeholder="写下这一刻微小的感动、看见的天空或偶遇的趣事..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={styles.wordCount}>{note.length}/150</Text>
          </View>

          {/* Quick Tags */}
          <View style={styles.tagsRow}>
            {QUICK_TAGS.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.tagPill}
                onPress={() => handleSelectTag(t)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>✦ 保存并镌刻卡背</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(103, 232, 249, 0.3)',
    shadowColor: '#67E8F9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleGroup: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FAF7F2',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputSingle: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FAF7F2',
    fontSize: 13,
  },
  inputMulti: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FAF7F2',
    fontSize: 13,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  wordCount: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  confirmBtnText: {
    color: '#18181B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
