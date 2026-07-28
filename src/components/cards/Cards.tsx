import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { clsx } from 'clsx';
import { AppText } from '../typography/AppText';
import { Card, HStack, VStack } from '../layouts/Containers';
import { toKannadaNumerals, formatReadingTime, calculateProgress } from '@/utils';
import { LOCAL_STRINGS } from '@/localization';
import type { Chapter, Bookmark } from '@/types';
import { useRouter } from 'expo-router';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAppStore } from '@/store/useAppStore';

interface ChapterCardProps {
  chapter: Chapter;
  variant?: 'default' | 'horizontal' | 'compact' | 'featured';
  showProgress?: boolean;
  onPress?: () => void;
}

const categoryColors: Record<string, { bg: string; text: string; gradient: [string, string] }> = {
  ಸಂಖ್ಯಾ: { bg: 'bg-secondary-subtle', text: 'text-secondary-dark', gradient: ['#D4A24C', '#B4832E'] },
  ಕರ್ಮ: { bg: 'bg-primary-subtle', text: 'text-primary-dark', gradient: ['#A0522D', '#7A2E22'] },
  ಜ್ಞಾನ: { bg: 'bg-primary-subtle', text: 'text-primary-dark', gradient: ['#A0522D', '#7A2E22'] },
  ಯೋಗ: { bg: 'bg-[#F7ECD6]', text: 'text-[#8C6220]', gradient: ['#C0902F', '#8C6220'] },
  ಭಕ್ತಿ: { bg: 'bg-[#F2E0D4]', text: 'text-[#8A3324]', gradient: ['#B5654A', '#8A3324'] },
  ವೈರಾಗ್ಯ: { bg: 'bg-[#EAD7C7]', text: 'text-[#5E2116]', gradient: ['#8A6242', '#5E3A26'] },
};

export function ChapterCard({ chapter, variant = 'default', showProgress = true, onPress }: ChapterCardProps) {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const progressData = useAppStore((state) => state.getReadingProgress(chapter.id));
  const settings = useAppStore((state) => state.settings);

  const completedVerses = progressData?.completed
    ? chapter.versesCount
    : progressData?.lastReadVerse || 0;

  const progressPercent = calculateProgress(completedVerses, chapter.versesCount);
  const categoryConfig = categoryColors[chapter.category] || categoryColors.ಜ್ಞಾನ;

  const handlePress = () => {
    haptics.medium();
    if (onPress) {
      onPress();
    } else {
      router.push(`/reading/${chapter.id}`);
    }
  };

  if (variant === 'featured') {
    return (
      <Pressable onPress={handlePress}>
        <View className="rounded-3xl overflow-hidden shadow-elevated">
          <LinearGradient
            colors={categoryConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6"
          >
            <HStack justify="space-between" align="flex-start" className="mb-6">
              <View className="bg-white/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <AppText variant="caption" color="inverted" weight="semibold">
                  {LOCAL_STRINGS.chapter} {toKannadaNumerals(chapter.number)}
                </AppText>
              </View>
              <View className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                <Ionicons name="book-outline" size={18} color="#FFFFFF" />
              </View>
            </HStack>

            <VStack spacing="sm" className="mb-6">
              <AppText variant="heading2" weight="bold" color="inverted">
                {chapter.title}
              </AppText>
              <AppText variant="body" color="inverted" className="opacity-90">
                {chapter.subtitle}
              </AppText>
            </VStack>

            {showProgress && (
              <View className="mb-5">
                <HStack justify="space-between" className="mb-2">
                  <AppText variant="caption" color="inverted" className="opacity-90">
                    {LOCAL_STRINGS.readingProgress}
                  </AppText>
                  <AppText variant="caption" weight="semibold" color="inverted">
                    {toKannadaNumerals(progressPercent)}%
                  </AppText>
                </HStack>
                <View className="h-2 bg-white/25 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </View>
              </View>
            )}

            <HStack justify="space-between">
              <HStack spacing="sm">
                <View className="bg-white/20 rounded-xl px-3 py-1.5 flex-row items-center gap-1.5">
                  <Ionicons name="bookmarks-outline" size={14} color="#FFFFFF" />
                  <AppText variant="caption" color="inverted" weight="semibold">
                    {toKannadaNumerals(chapter.versesCount)} {LOCAL_STRINGS.verses}
                  </AppText>
                </View>
                <View className="bg-white/20 rounded-xl px-3 py-1.5 flex-row items-center gap-1.5">
                  <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                  <AppText variant="caption" color="inverted" weight="semibold">
                    {formatReadingTime(chapter.readingTime)}
                  </AppText>
                </View>
              </HStack>
              <View className="bg-white rounded-full p-2.5 shadow-soft">
                <Ionicons name="arrow-forward" size={16} color={categoryConfig.gradient[1]} />
              </View>
            </HStack>
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Pressable onPress={handlePress}>
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <HStack align="stretch" className="p-4">
            <LinearGradient
              colors={categoryConfig.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-18 h-24 rounded-2xl items-center justify-center mr-4"
            >
              <AppText variant="heading1" weight="bold" color="inverted">
                {toKannadaNumerals(chapter.number)}
              </AppText>
            </LinearGradient>

            <View className="flex-1 justify-center py-1">
              <View className={clsx('self-start rounded-lg px-2.5 py-1 mb-2', categoryConfig.bg)}>
                <AppText variant="caption" weight="semibold" className={categoryConfig.text}>
                  {chapter.category}
                </AppText>
              </View>

              <AppText variant="title" weight="semibold" numberOfLines={1} className="mb-1">
                {chapter.title}
              </AppText>
              <AppText variant="bodySmall" color="muted" numberOfLines={1} className="mb-3">
                {chapter.subtitle}
              </AppText>

              <HStack justify="space-between">
                <HStack spacing="xs">
                  <Ionicons name="bookmarks-outline" size={13} color="#7A5C48" />
                  <AppText variant="caption" color="muted">
                    {toKannadaNumerals(chapter.versesCount)}
                  </AppText>
                  <Ionicons name="time-outline" size={13} color="#7A5C48" className="ml-2" />
                  <AppText variant="caption" color="muted">
                    {toKannadaNumerals(chapter.readingTime)}
                  </AppText>
                </HStack>
                {showProgress && progressPercent > 0 && (
                  <AppText variant="caption" weight="semibold" color="primary">
                    {toKannadaNumerals(progressPercent)}%
                  </AppText>
                )}
              </HStack>
            </View>
          </HStack>

          {showProgress && progressPercent > 0 && (
            <View className="h-1 w-full bg-background-soft">
              <View
                className="h-full bg-primary-default"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          )}
        </Card>
      </Pressable>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable onPress={handlePress} className="mb-3">
        <View className="bg-white rounded-2xl p-4 border border-border-light shadow-soft">
          <HStack justify="space-between">
            <HStack spacing="sm">
              <View className={clsx('w-10 h-10 rounded-xl items-center justify-center', categoryConfig.bg)}>
                <AppText variant="body" weight="bold" className={categoryConfig.text}>
                  {toKannadaNumerals(chapter.number)}
                </AppText>
              </View>
              <VStack spacing="xs" className="justify-center">
                <AppText variant="body" weight="semibold" numberOfLines={1}>
                  {chapter.title}
                </AppText>
                <AppText variant="caption" color="muted">
                  {toKannadaNumerals(chapter.versesCount)} {LOCAL_STRINGS.verses}
                </AppText>
              </VStack>
            </HStack>
            <Ionicons name="chevron-forward" size={18} color="#A88C74" />
          </HStack>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      <Card variant="elevated" className="mb-4">
        <HStack justify="space-between" align="flex-start" className="mb-4">
          <HStack spacing="sm">
            <View className={clsx('w-12 h-12 rounded-2xl items-center justify-center', categoryConfig.bg)}>
              <AppText variant="heading3" weight="bold" className={categoryConfig.text}>
                {toKannadaNumerals(chapter.number)}
              </AppText>
            </View>
            <VStack spacing="xs" className="justify-center">
              <AppText variant="title" weight="semibold">
                {chapter.title}
              </AppText>
              <View className={clsx('self-start rounded-md px-2 py-0.5 mt-1', categoryConfig.bg)}>
                <AppText variant="caption" weight="semibold" className={categoryConfig.text}>
                  {chapter.category}
                </AppText>
              </View>
            </VStack>
          </HStack>
          {showProgress && (
            <View className="bg-primary-subtle rounded-full w-11 h-11 items-center justify-center">
              <AppText variant="caption" weight="bold" color="primary">
                {toKannadaNumerals(progressPercent)}%
              </AppText>
            </View>
          )}
        </HStack>

        <AppText variant="body" color="muted" numberOfLines={2} className="mb-4">
          {chapter.description}
        </AppText>

        <HStack justify="space-between">
          <HStack spacing="md">
            <HStack spacing="xs">
              <Ionicons name="bookmarks-outline" size={15} color="#7A5C48" />
              <AppText variant="bodySmall" color="muted" weight="medium">
                {toKannadaNumerals(chapter.versesCount)} {LOCAL_STRINGS.verses}
              </AppText>
            </HStack>
            <HStack spacing="xs">
              <Ionicons name="time-outline" size={15} color="#7A5C48" />
              <AppText variant="bodySmall" color="muted" weight="medium">
                {formatReadingTime(chapter.readingTime)}
              </AppText>
            </HStack>
          </HStack>
          <View className="bg-primary-default rounded-full p-2">
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        </HStack>
      </Card>
    </Pressable>
  );
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
  trend?: number;
}

export function StatCard({ icon, label, value, iconBg = 'bg-primary-subtle', iconColor = '#8A3324', trend }: StatCardProps) {
  return (
    <Card variant="elevated" padding="md" className="flex-1">
      <View className={clsx('w-10 h-10 rounded-xl items-center justify-center mb-3', iconBg)}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <AppText variant="heading2" weight="bold" className="mb-1">
        {typeof value === 'number' ? toKannadaNumerals(value) : value}
      </AppText>
      <HStack justify="space-between" align="center">
        <AppText variant="caption" color="muted" numberOfLines={1} className="flex-1 mr-2">
          {label}
        </AppText>
        {trend !== undefined && (
          <HStack spacing="xs">
            <Ionicons name={trend >= 0 ? 'trending-up' : 'trending-down'} size={12} color={trend >= 0 ? '#4B8B3B' : '#C0392B'} />
            <AppText variant="caption" weight="semibold" color={trend >= 0 ? 'success' : 'error'}>
              {trend >= 0 ? '+' : ''}{toKannadaNumerals(Math.abs(trend))}%
            </AppText>
          </HStack>
        )}
      </HStack>
    </Card>
  );
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onPress?: () => void;
  onRemove?: () => void;
}

export function BookmarkCard({ bookmark, onPress, onRemove }: BookmarkCardProps) {
  const router = useRouter();
  const haptics = useHapticFeedback();

  const handlePress = () => {
    haptics.light();
    if (onPress) {
      onPress();
    } else {
      router.push(`/reading/${bookmark.chapterId}`);
    }
  };

  const handleRemove = () => {
    haptics.warning();
    onRemove?.();
  };

  return (
    <Card variant="elevated" className="mb-3" onPress={handlePress}>
      <HStack justify="space-between" align="flex-start" className="mb-3">
        <HStack spacing="sm">
          <View className="w-11 h-11 rounded-xl bg-secondary-subtle items-center justify-center">
            <Ionicons name="bookmark" size={20} color="#B4832E" />
          </View>
          <VStack spacing="xs" className="justify-center flex-1">
            <AppText variant="bodySmall" color="muted">
              {LOCAL_STRINGS.chapter} {toKannadaNumerals(bookmark.verseNumber)} • {LOCAL_STRINGS.verse} {toKannadaNumerals(bookmark.verseNumber)}
            </AppText>
            <AppText variant="title" weight="semibold" numberOfLines={1}>
              {bookmark.chapterTitle}
            </AppText>
          </VStack>
        </HStack>
        <Pressable
          hitSlop={12}
          onPress={handleRemove}
          className="w-9 h-9 rounded-full items-center justify-center bg-background-soft"
        >
          <Ionicons name="trash-outline" size={17} color="#C0392B" />
        </Pressable>
      </HStack>

      {bookmark.note && (
        <View className="bg-background-soft rounded-xl p-3 mb-3">
          <HStack spacing="xs" className="mb-1.5">
            <Ionicons name="create-outline" size={13} color="#7A5C48" />
            <AppText variant="caption" color="muted" weight="semibold">
              {LOCAL_STRINGS.note}
            </AppText>
          </HStack>
          <AppText variant="bodySmall" numberOfLines={3}>
            {bookmark.note}
          </AppText>
        </View>
      )}

      <AppText variant="caption" color="subtle">
        {new Date(bookmark.createdAt).toLocaleDateString('kn-IN')}
      </AppText>
    </Card>
  );
}

interface AchievementCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
  unlockedAt?: number;
}

export function AchievementCard({ title, description, icon, unlocked, unlockedAt }: AchievementCardProps) {
  return (
    <Card variant={unlocked ? 'elevated' : 'outline'} className={clsx('mb-3', !unlocked && 'opacity-60')}>
      <HStack spacing="sm">
        <View className={clsx(
          'w-14 h-14 rounded-2xl items-center justify-center',
          unlocked ? 'bg-gradient-to-br from-warning to-[#8C6220]' : 'bg-background-subtle'
        )}>
          <Ionicons name={icon} size={26} color={unlocked ? '#FFFFFF' : '#A88C74'} />
        </View>
        <VStack spacing="xs" className="flex-1 justify-center">
          <AppText variant="title" weight="semibold">
            {title}
          </AppText>
          <AppText variant="bodySmall" color="muted" numberOfLines={2}>
            {description}
          </AppText>
          {unlocked && unlockedAt && (
            <AppText variant="caption" color="success" weight="semibold" className="mt-1">
              {new Date(unlockedAt).toLocaleDateString('kn-IN')} • ಪಡೆದುಕೊಂಡಿದೆ
            </AppText>
          )}
        </VStack>
        {!unlocked && (
          <View className="self-center">
            <Ionicons name="lock-closed" size={20} color="#A88C74" />
          </View>
        )}
      </HStack>
    </Card>
  );
}
