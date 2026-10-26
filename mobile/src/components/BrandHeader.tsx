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
            stroke={colors.ink}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.73 21 A2 2 0 0 1 10.27 21"
            fill="none"
            stroke={colors.ink}
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
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 226, 217, 0.8)',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: '600',
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DFC8',
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.moss,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.ink,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 226, 217, 0.8)',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E06D53',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
});
