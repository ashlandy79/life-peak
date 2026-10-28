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
    const iconColor = active ? '#FAF7F2' : '#7E8B9B';
    const strokeWidth = active ? '2.2' : '1.8';

    switch (key) {
      case 'home':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M12 3 L2.5 11.5 H6 V20.5 C6 21 6.5 21.5 7 21.5 H10.5 V15.5 H13.5 V21.5 H17 C17.5 21.5 18 21 18 20.5 V11.5 H21.5 Z"
              fill={active ? '#FAF7F2' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
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
              rx="4"
              fill={active ? 'rgba(250, 247, 242, 0.15)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M8.5 12 L11 14.5 L15.5 9.5"
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
            <Path
              d="M4 19.5 C4 18.1 5.1 17 6.5 17 H20"
              fill="none"
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <Path
              d="M6.5 2.5 H20 V21.5 H6.5 C5.1 21.5 4 20.4 4 19 V5 C4 3.6 5.1 2.5 6.5 2.5 Z"
              fill={active ? 'rgba(250, 247, 242, 0.15)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            <Path
              d="M11.5 5.5 V10 L13.5 8.5 L15.5 10 V5.5"
              fill={active ? '#FAF7F2' : 'none'}
              stroke={iconColor}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'profile':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Circle
              cx="12"
              cy="8"
              r="4.2"
              fill={active ? 'rgba(250, 247, 242, 0.15)' : 'none'}
              stroke={iconColor}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M4.5 20 C4.5 16.2 7.8 14 12 14 C16.2 14 19.5 16.2 19.5 20"
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
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    backgroundColor: '#050B16',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
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
    color: '#7E8B9B',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#FAF7F2',
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
    borderColor: '#050B16',
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
