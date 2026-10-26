import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../components/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: any) => {
        const { navigation, state } = props;
        const currentRouteName = state.routes[state.index]?.name || 'index';
        const currentKey = currentRouteName === 'index' ? 'home' : currentRouteName;

        return (
          <BottomTabBar
            currentTab={currentKey}
            onSelectTab={(key) => {
              if (key === 'home') {
                navigation.navigate('index');
              } else {
                navigation.navigate(key);
              }
            }}
          />
        );
      }}
    >
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="tasks" options={{ title: '任务' }} />
      <Tabs.Screen name="album" options={{ title: '卡册' }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}
