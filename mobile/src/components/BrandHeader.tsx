import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface BrandHeaderProps {
  dateText?: string;
  onPressNotification?: () => void;
  hasUnreadNotifications?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  dateText = '9月20日 星期日',
  onPressNotification,
  hasUnreadNotifications = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Date Pill / Text */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{dateText}</Text>
      </View>

      {/* Brand Pill */}
      <View style={styles.brandPill}>
        <View style={styles.brandDot} />
        <Text style={styles.brandTitle}>LIFE PACK</Text>
      </View>

      {/* Notification Bell */}
      <TouchableOpacity
        style={styles.bellButton}
        onPress={onPressNotification}
        activeOpacity={0.7}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M18 8 A6 6 0 0 0 6 8 C6 15 3 17 3 17 H21 S18 15 18 8"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.73 21 A2 2 0 0 1 10.27 21"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
        {hasUnreadNotifications && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  dateContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    letterSpacing: 0.3,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#67E8F9',
    marginRight: 6,
    shadowColor: '#67E8F9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FAF7F2',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.2,
    borderColor: '#0F172A',
  },
});
