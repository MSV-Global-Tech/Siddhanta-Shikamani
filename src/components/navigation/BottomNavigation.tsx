import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { LOCAL_STRINGS } from '@/localization';

interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const tabs: TabItem[] = [
  {
    key: 'home',
    label: LOCAL_STRINGS.home,
    icon: 'home-outline',
    activeIcon: 'home',
    route: '/',
  },
  {
    key: 'chapters',
    label: LOCAL_STRINGS.chapters,
    icon: 'book-outline',
    activeIcon: 'book',
    route: '/chapters',
  },
  {
    key: 'profile',
    label: LOCAL_STRINGS.more,
    icon: 'ellipsis-horizontal-circle-outline',
    activeIcon: 'ellipsis-horizontal-circle',
    route: '/profile',
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const haptics = useHapticFeedback();
  const insets = useSafeAreaInsets();


  // ಸಿಸ್ಟಂ ನ್ಯಾವಿಗೇಶನ್‌ಗೆ ತಕ್ಕಂತೆ ಕೆಳ ಅಂತರ — ಬಟನ್/ಗೆಸ್ಚರ್ ಮೇಲೆ ಸರಿಯಾಗಿ ಕೂರುತ್ತದೆ
  const bottomPadding = Math.max(insets.bottom, 8);

  const handleTabPress = (route: string) => {
    haptics.selection();
    router.push(route as any);
  };

  const isRouteActive = (route: string): boolean => {
    if (route === '/') {
      return pathname === '/' || pathname === '' || pathname === undefined;
    }
    return pathname === route || pathname?.startsWith(route + '/');
  };

  return (
    <View
      className="flex-row items-stretch justify-around bg-[#FFFDF9] border-t border-border-default px-2 pt-2"
      style={{ paddingBottom: bottomPadding }}
    >
      {tabs.map((tab) => {
        const isActive = isRouteActive(tab.route);
        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.route)}
            className="flex-1 flex-col items-center justify-center py-1.5 px-1"
            hitSlop={{ top: 8, bottom: 8 }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View className="relative items-center justify-center mb-1">
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? '#8A3324' : '#A88C74'}
              />
            </View>
            <AppText
              variant="caption"
              weight={isActive ? 'bold' : 'medium'}
              align="center"
              numberOfLines={1}
              className={isActive ? 'text-primary-default' : 'text-text-subtle'}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

interface TabLayoutProps {
  children: React.ReactNode;
}

export function TabLayout({ children }: TabLayoutProps) {
  return (
    <View className="flex-1 bg-background-soft">
      <View className="flex-1">{children}</View>
      <BottomNavigation />
    </View>
  );
}
