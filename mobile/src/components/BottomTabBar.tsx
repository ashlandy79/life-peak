import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { BadgeService } from '../services/BadgeService';

interface TabItem {
  key: string;
  label: string;
  route: string;
}

export const TABS: TabItem[] = [
  { key: 'home', label: '首页', route: '/' },
  { key: 'tasks', label: '任务', route: '/tasks' },
  { key: 'album', label: '卡册', route: '/album' },
  { key: 'profile', label: '我的', route: '/profile' },
];

interface BottomTabBarProps {
  currentTab: string;
  onSelectTab: (key: string, route: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const [hasAlbumBadge, setHasAlbumBadge] = useState(BadgeService.getAlbumBadge());

  useEffect(() => {
    return BadgeService.subscribe(() => {
      setHasAlbumBadge(BadgeService.getAlbumBadge());
    });
  }, []);

  const handlePressTab = (key: string, route: string) => {
    if (key === 'album') {
      setTimeout(() => {
        BadgeService.setAlbumBadge(false);
      }, 50);
    }
    if (typeof onSelectTab === 'function') {
      try {
        onSelectTab(key, route);
      } catch (err) {
        console.warn('[BottomTabBar] onSelectTab error:', err);
      }
    }
  };

  const renderIcon = (key: string, active: boolean) => {
    const iconColor = active ? colors.moss : '#9C9384';
    const strokeWidth = active ? '2.4' : '2.0';

    switch (key) {
      case 'home':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M3 10.5 L12 3 L21 10.5 V20 C21 20.6 20.6 21 20 21 H4 C3.4 21 3 20.6 3 20 Z"
              fill={active ? 'rgba(45, 79, 56, 0.12)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 21 V12 H15 V21"
              fill="none"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'tasks':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="3"
              fill={active ? 'rgba(45, 79, 56, 0.12)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M8 12 L11 15 L16 9"
              fill="none"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'album':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Rect
              x="3"
              y="6"
              width="14"
              height="15"
              rx="2.5"
              fill={active ? 'rgba(45, 79, 56, 0.12)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M7 6 V4 C7 3.4 7.4 3 8 3 H19 C19.6 3 20 3.4 20 4 V17 C20 17.6 19.6 18 19 18 H17"
              fill="none"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="10"
              cy="12"
              r="2"
              fill={active ? colors.moss : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );
      case 'profile':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Circle
              cx="12"
              cy="8"
              r="4"
              fill={active ? 'rgba(45, 79, 56, 0.12)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M4 20 C4 16.5 7.5 15 12 15 C16.5 15 20 16.5 20 20"
              fill="none"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.barContainer,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => handlePressTab(tab.key, tab.route)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              {renderIcon(tab.key, isActive)}
              {tab.key === 'album' && hasAlbumBadge && (
                <View style={styles.albumBadge}>
                  <Text style={styles.albumBadgeText}>1</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE5D8',
    paddingTop: 8,
    shadowColor: '#2D2823',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8F8575',
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: colors.moss,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.moss,
    marginTop: 2,
  },
  albumBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  albumBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
