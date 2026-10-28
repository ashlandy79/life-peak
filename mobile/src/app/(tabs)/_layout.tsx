import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { BottomTabBar } from '../../components/BottomTabBar';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: any) => {
        const { navigation, state } = props;
        const currentRouteName = state?.routes?.[state?.index]?.name || 'index';
        const currentKey = currentRouteName === 'index' ? 'home' : currentRouteName;

        return (
          <BottomTabBar
            currentTab={currentKey}
            onSelectTab={(key, route) => {
              // 优先尝试 Expo Router 编程式路由跳转，避免 navigation 对象未初始化导致 navigate 报错
              const targetRoute = route || (key === 'home' ? '/' : `/${key}`);
              try {
                if (navigation && typeof navigation.navigate === 'function') {
                  navigation.navigate(key === 'home' ? 'index' : key);
                  return;
                }
              } catch {
                // 回退到 router.navigate
              }
              try {
                router.navigate(targetRoute as any);
              } catch (e) {
                console.warn('[TabsLayout] router.navigate failed:', e);
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

