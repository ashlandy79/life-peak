import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { AppIcon } from './AppIcon';

export type UnsealRecordOption = 'photo' | 'text' | 'voice' | 'none';

interface UnsealRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (option: UnsealRecordOption, content?: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const UnsealRecordModal: React.FC<UnsealRecordModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedOption, setSelectedOption] = useState<UnsealRecordOption>('text');
  const [inputText, setInputText] = useState('');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
  };

  const handleSelect = (option: UnsealRecordOption) => {
    triggerHaptic();
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    triggerHaptic();
    onConfirm(selectedOption, selectedOption === 'text' ? inputText : undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Header Title from Ref Image 3 */}
          <Text style={styles.modalTitle}>要不要留下这一刻？</Text>

          {/* 4 Options Row */}
          <View style={styles.optionsRow}>
            {/* 1. 拍照 */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleSelect('photo')}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedOption === 'photo' && styles.iconCircleActive,
                ]}
              >
                <AppIcon
                  name="camera"
                  size={24}
                  color={selectedOption === 'photo' ? '#171715' : '#73706B'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedOption === 'photo' && styles.optionLabelActive,
                ]}
              >
                拍照
              </Text>
            </TouchableOpacity>

            {/* 2. 写文案 */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleSelect('text')}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedOption === 'text' && styles.iconCircleActive,
                ]}
              >
                <AppIcon
                  name="edit"
                  size={24}
                  color={selectedOption === 'text' ? '#171715' : '#73706B'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedOption === 'text' && styles.optionLabelActive,
                ]}
              >
                写文案
              </Text>
            </TouchableOpacity>

            {/* 3. 录言 */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleSelect('voice')}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedOption === 'voice' && styles.iconCircleActive,
                ]}
              >
                <AppIcon
                  name="mic"
                  size={24}
                  color={selectedOption === 'voice' ? '#171715' : '#73706B'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedOption === 'voice' && styles.optionLabelActive,
                ]}
              >
                录言
              </Text>
            </TouchableOpacity>

            {/* 4. 不留 */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleSelect('none')}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedOption === 'none' && styles.iconCircleActive,
                ]}
              >
                <AppIcon
                  name="mail"
                  size={24}
                  color={selectedOption === 'none' ? '#171715' : '#73706B'}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedOption === 'none' && styles.optionLabelActive,
                ]}
              >
                不留
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conditional Note Input if 写文案 */}
          {selectedOption === 'text' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="记录这一刻的随想、温度或心境..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={2}
                value={inputText}
                onChangeText={setInputText}
              />
            </View>
          )}

          {/* Confirm Button from Ref Image 3 */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>确认记录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FAF7F2',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#EAE5DB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#171715',
    textAlign: 'center',
    marginBottom: 22,
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionItem: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D7D0C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    borderColor: '#171715',
    borderWidth: 2,
    backgroundColor: '#F4EFE5',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#73706B',
  },
  optionLabelActive: {
    color: '#171715',
    fontWeight: '800',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#171715',
    borderWidth: 1,
    borderColor: '#D7D0C4',
    minHeight: 52,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#171715',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  confirmButtonText: {
    color: '#FAF7F2',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
