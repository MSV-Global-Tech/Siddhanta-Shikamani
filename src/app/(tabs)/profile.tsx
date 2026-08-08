import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { clsx } from 'clsx';
import { ScreenContainer, VStack, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { StatCard, AchievementCard } from '@/components/cards/Cards';
import { IconButton } from '@/components/buttons/Button';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, formatDate } from '@/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function ProfileScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const [profile, setProfile] = useState(() => useAppStore.getState().profile);
  const [readingProgress, setReadingProgress] = useState(() => useAppStore.getState().readingProgress);
  const [bookmarks, setBookmarks] = useState(() => useAppStore.getState().bookmarks);

  useFocusEffect(
    useCallback(() => {
      const state = useAppStore.getState();
      setProfile(state.profile);
      setReadingProgress(state.readingProgress);
      setBookmarks(state.bookmarks);
    }, [])
  );

  const totalChaptersRead = readingProgress.filter((p) => p.completed).length;
  const unlockedAchievements = profile.achievements.filter((a) => a.unlocked).length;
  const totalAchievements = profile.achievements.length;
  const achievementProgress = Math.round((unlockedAchievements / totalAchievements) * 100);

  const totalHours = Math.floor(profile.totalReadingMinutes / 60);
  const remainingMinutes = profile.totalReadingMinutes % 60;

  const joinedDate = formatDate(profile.joinedDate);

  return (
    <ScreenContainer scroll edges={['top']}>
      <View className="relative">
        <LinearGradient
          colors={['#A0522D', '#7A2E22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-56 absolute top-0 left-0 right-0"
        />
        <View className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -mr-20 -mt-20" />
        <View className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/5 -ml-16 -mb-10" />
      </View>

      <View className="px-6 pt-6 relative z-10">
        <HStack justify="space-between" className="mb-24">
          <Pressable
            onPress={() => {
              haptics.light();
              router.push('/settings');
            }}
            hitSlop={8}
          >
            <AppText variant="caption" color="inverted" weight="semibold" className="opacity-90">
              ಸೆಟ್ಟಿಂಗ್‌ಗಳು
            </AppText>
          </Pressable>
          <IconButton
            icon="settings-outline"
            variant="default"
            color="#FFFFFF"
            onPress={() => router.push('/settings')}
          />
        </HStack>

        <View className="bg-white rounded-3xl shadow-elevated p-6 mb-7">
          <HStack spacing="md" className="mb-6">
            <LinearGradient
              colors={['#B5654A', '#8A3324']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-20 h-20 rounded-[28px] items-center justify-center"
              style={{
                shadowColor: '#8A3324',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <Ionicons name="person" size={36} color="#FFFFFF" />
            </LinearGradient>

            <VStack spacing="xs" className="flex-1 justify-center">
              <AppText variant="heading2" weight="bold">
                {profile.name}
              </AppText>
              <HStack spacing="xs">
                <Ionicons name="calendar-outline" size={13} color="#A88C74" />
                <AppText variant="caption" color="muted">
                  ಸೇರಿದ ದಿನಾಂಕ: {joinedDate}
                </AppText>
              </HStack>
            </VStack>
          </HStack>

          <View className="h-px bg-border-light mb-6" />

          <HStack spacing="md">
            <StatCard
              icon="book-outline"
              label="ಪೂರ್ಣಗೊಂಡ ಅಧ್ಯಾಯಗಳು"
              value={totalChaptersRead}
              iconBg="bg-primary-subtle"
              iconColor="#8A3324"
            />
            <StatCard
              icon="ribbon-outline"
              label="ಸಾಧನೆಗಳು"
              value={`${toKannadaNumerals(unlockedAchievements)}/${toKannadaNumerals(totalAchievements)}`}
              iconBg="bg-secondary-subtle"
              iconColor="#B4832E"
              trend={achievementProgress > 50 ? 12 : undefined}
            />
          </HStack>
        </View>

        <View className="mb-7">
          <HStack justify="space-between" className="mb-4">
            <AppText variant="title" weight="bold">
              {LOCAL_STRINGS.stats}
            </AppText>
          </HStack>
          <View className="grid grid-cols-2 gap-4">
            <View className="bg-white rounded-2xl p-5 shadow-soft border border-border-light">
              <View className="w-10 h-10 rounded-xl bg-secondary-subtle items-center justify-center mb-3">
                <Ionicons name="document-text-outline" size={20} color="#B4832E" />
              </View>
              <AppText variant="heading2" weight="bold" className="mb-1">
                {toKannadaNumerals(profile.totalVersesRead)}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={2}>
                {LOCAL_STRINGS.versesRead}
              </AppText>
            </View>

            <View className="bg-white rounded-2xl p-5 shadow-soft border border-border-light">
              <View className="w-10 h-10 rounded-xl bg-secondary-subtle items-center justify-center mb-3">
                <Ionicons name="flame-outline" size={20} color="#B4832E" />
              </View>
              <AppText variant="heading2" weight="bold" className="mb-1">
                {toKannadaNumerals(profile.readingStreak)}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={2}>
                {LOCAL_STRINGS.readingStreak} ({LOCAL_STRINGS.days})
              </AppText>
            </View>

            <View className="bg-white rounded-2xl p-5 shadow-soft border border-border-light">
              <View className="w-10 h-10 rounded-xl bg-[#F2E0D4] items-center justify-center mb-3">
                <Ionicons name="bookmark-outline" size={20} color="#B5654A" />
              </View>
              <AppText variant="heading2" weight="bold" className="mb-1">
                {toKannadaNumerals(bookmarks.length)}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={2}>
                {LOCAL_STRINGS.bookmarks} ಸೇರಿಸಲಾಗಿದೆ
              </AppText>
            </View>

            <View className="bg-white rounded-2xl p-5 shadow-soft border border-border-light">
              <View className="w-10 h-10 rounded-xl bg-[#EAD7C7] items-center justify-center mb-3">
                <Ionicons name="time-outline" size={20} color="#5E2116" />
              </View>
              <AppText variant="heading2" weight="bold" className="mb-1">
                {totalHours > 0 ? `${toKannadaNumerals(totalHours)} ಘಂಟೆ` : ''} {remainingMinutes > 0 ? `${toKannadaNumerals(remainingMinutes)} ನಿಮಿಷ` : totalHours === 0 ? '0 ನಿಮಿಷ' : ''}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={2}>
                ಒಟ್ಟು ಓದುವ ಸಮಯ
              </AppText>
            </View>
          </View>
        </View>

        <View className="mb-7">
          <HStack justify="space-between" className="mb-4">
            <AppText variant="title" weight="bold">
              {LOCAL_STRINGS.achievements}
            </AppText>
            <View className="bg-primary-subtle rounded-xl px-3 py-1.5">
              <AppText variant="caption" weight="bold" color="primary">
                {toKannadaNumerals(achievementProgress)}%
              </AppText>
            </View>
          </HStack>

          {profile.achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              icon={achievement.icon as any}
              unlocked={achievement.unlocked}
              unlockedAt={achievement.unlockedAt}
            />
          ))}
        </View>

        <View className="mb-7">
          <HStack justify="space-between" className="mb-4">
            <AppText variant="title" weight="bold">
              ತ್ವರಿತ ಮಾರ್ಗಗಳು
            </AppText>
          </HStack>
          <View className="bg-white rounded-3xl shadow-soft border border-border-light overflow-hidden">
            {[
              {
                icon: 'library-outline',
                label: LOCAL_STRINGS.allChapters,
                desc: 'ಬಲ್ಲ ಅಧ್ಯಾಯಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ',
                color: '#8A3324',
                bg: 'bg-primary-subtle',
                onPress: () => router.push('/chapters'),
              },
              {
                icon: 'bookmark-outline',
                label: 'ಬುಕ್ಮಾರ್ಕ್‌ಗಳು',
                desc: 'ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಶ್ಲೋಕಗಳನ್ನು ನೋಡಿ',
                color: '#B4832E',
                bg: 'bg-secondary-subtle',
                onPress: () => router.push('/bookmarks'),
              },
              {
                icon: 'search-outline',
                label: LOCAL_STRINGS.search,
                desc: 'ಶ್ಲೋಕಗಳನ್ನು ಹುಡುಕಿ',
                color: '#8C6220',
                bg: 'bg-secondary-subtle',
                onPress: () => router.push('/search'),
              },
              {
                icon: 'settings-outline',
                label: LOCAL_STRINGS.settingsTitle,
                desc: 'ಅಪ್ಲಿಕೇಶನ್ ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ',
                color: '#5E2116',
                bg: 'bg-[#EAD7C7]',
                onPress: () => router.push('/settings'),
              },
            ].map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  haptics.light();
                  item.onPress();
                }}
                className={clsx(
                  'flex-row items-center px-5 py-4',
                  idx !== 3 && 'border-b border-border-light',
                )}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#FBF3E7' : '#FFFFFF',
                })}
              >
                <View className={clsx('w-11 h-11 rounded-xl items-center justify-center mr-4', item.bg)}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <VStack spacing="xs" className="flex-1">
                  <AppText variant="body" weight="semibold">
                    {item.label}
                  </AppText>
                  <AppText variant="bodySmall" color="muted">
                    {item.desc}
                  </AppText>
                </VStack>
                <Ionicons name="chevron-forward" size={18} color="#A88C74" />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="items-center mb-8 pt-4">
          <AppText variant="caption" color="subtle" align="center">
            {LOCAL_STRINGS.madeWithLove} ♥
          </AppText>
          <AppText variant="caption" color="subtle" align="center">
            {LOCAL_STRINGS.version} 1.0.0
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}
