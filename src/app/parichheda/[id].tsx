import React, { useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { CHAPTERS } from '@/data/chapters';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, calculateProgress } from '@/utils';
import type { Chapter } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function ParichhedaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const haptics = useHapticFeedback();
  const readingProgress = useAppStore((state) => state.readingProgress);

  // Get the parichheda info from the first chapter that has this ID
  const parichhedaInfo = useMemo(() => {
    const chapter = CHAPTERS.find(c => c.parichheda?.id === id);
    return chapter?.parichheda;
  }, [id]);

  const chapters = useMemo(() => {
    return CHAPTERS.filter(c => c.parichheda?.id === id).sort((a, b) => a.number - b.number);
  }, [id]);

  const handleOpen = (chapterId: string) => {
    haptics.medium();
    router.push(`/reading/${chapterId}`);
  };

  if (!parichhedaInfo) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-5">
          <AppText variant="title">Parichheda not found</AppText>
          <Pressable onPress={() => router.back()} className="mt-4 px-6 py-2 bg-primary-default rounded-full">
            <AppText color="inverted">Go Back</AppText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="px-5 pt-4 pb-2">
        <HStack justify="space-between" align="center" className="mb-5">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="w-11 h-11 rounded-full items-center justify-center bg-white shadow-sm border border-secondary-light/20"
          >
            <Ionicons name="arrow-back" size={24} color="#3D2314" />
          </Pressable>
          <AppText
            variant="heading3"
            weight="bold"
            align="center"
            className="text-primary-dark font-serif-kan-bold flex-1 mx-2"
            numberOfLines={2}
          >
            {parichhedaInfo.title}
          </AppText>
          <View className="w-11 h-11" />
        </HStack>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 100 }}
      >
        <View className="flex-row flex-wrap">
          {chapters.map((chapter) => renderChapterCard(chapter, readingProgress, handleOpen))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function renderChapterCard(chapter: Chapter, readingProgress: any[], handleOpen: (id: string) => void) {
  const progress = readingProgress.find((p) => p.chapterId === chapter.id);
  const percent = progress
    ? calculateProgress(
      progress.completed ? chapter.versesCount : progress.lastReadVerse,
      chapter.versesCount
    )
    : 0;

  return (
    <View key={chapter.id} className="w-1/3 p-1.5">
      <Pressable
        onPress={() => handleOpen(chapter.id)}
        className="bg-white rounded-3xl border border-secondary-light/40 shadow-soft items-center px-2 py-5"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <View className="w-14 h-14 rounded-full border-2 border-secondary-light/60 items-center justify-center mb-3 bg-secondary-subtle/60">
          <View className="w-11 h-11 rounded-full border border-secondary-default/40 items-center justify-center bg-white">
            <AppText
              variant="title"
              weight="bold"
              className="text-primary-dark font-serif-kan-bold"
            >
              {toKannadaNumerals(chapter.number)}
            </AppText>
          </View>
        </View>

        <AppText
          variant="bodySmall"
          weight="semibold"
          align="center"
          numberOfLines={2}
          className="text-primary-dark mb-1 h-9 flex-col justify-center"
        >
          {chapter.title}
        </AppText>
        <AppText variant="caption" color="muted" align="center" numberOfLines={1}>
          {LOCAL_STRINGS.shlokas} {toKannadaNumerals(chapter.versesCount)}
        </AppText>

        {percent > 0 && (
          <View className="h-1 w-12 bg-background-subtle rounded-full overflow-hidden mt-2.5">
            <View
              className="h-full bg-secondary-default rounded-full"
              style={{ width: `${percent}%` }}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}
