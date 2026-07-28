import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenContainer, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { SearchBar } from '@/components/inputs/Inputs';
import { CHAPTERS } from '@/data/chapters';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, calculateProgress } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import { useSearch } from '@/hooks/useSearch';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function ChaptersScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const readingProgress = useAppStore((state) => state.readingProgress);

  const search = useSearch(CHAPTERS, (chapter, query) => {
    return (
      chapter.title.toLowerCase().includes(query) ||
      chapter.subtitle.toLowerCase().includes(query) ||
      chapter.description.toLowerCase().includes(query) ||
      chapter.category.toLowerCase().includes(query) ||
      chapter.number.toString().includes(query)
    );
  });

  const chapters = useMemo(
    () => [...search.results].sort((a, b) => a.number - b.number),
    [search.results]
  );

  const handleOpen = (chapterId: string) => {
    haptics.medium();
    router.push(`/reading/${chapterId}`);
  };

  return (
    <ScreenContainer>
      <View className="px-5 pt-4">
        {/* ಶೀರ್ಷಿಕೆ ಪಟ್ಟಿ */}
        <HStack justify="space-between" align="center" className="mb-5">
          <Pressable
            onPress={() => router.push('/')}
            hitSlop={10}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#3D2314" />
          </Pressable>
          <AppText
            variant="title"
            weight="bold"
            align="center"
            className="text-primary-dark font-serif-kan-bold flex-1 mx-2"
            numberOfLines={1}
          >
            {LOCAL_STRINGS.chaptersPariccheda}
          </AppText>
          <View className="w-11 h-11" />
        </HStack>

        <View className="mb-5">
          <SearchBar
            value={search.query}
            onChangeText={search.setQuery}
            onClear={search.clearSearch}
            placeholder={LOCAL_STRINGS.searchPlaceholder}
            variant="default"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 100 }}
      >
        {chapters.length > 0 ? (
          <View className="flex-row flex-wrap">
            {chapters.map((chapter) => {
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
                    {/* ಅಲಂಕಾರಿಕ ಸಂಖ್ಯಾ ಚಕ್ರ */}
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
                      numberOfLines={1}
                      className="text-primary-dark mb-1"
                    >
                      {LOCAL_STRINGS.pariccheda} {toKannadaNumerals(chapter.number)}
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
            })}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-3xl bg-background-soft items-center justify-center mb-5">
              <Ionicons name="search-outline" size={36} color="#A88C74" />
            </View>
            <AppText variant="title" weight="semibold" className="mb-2">
              {LOCAL_STRINGS.noResults}
            </AppText>
            <AppText variant="body" color="muted" align="center" className="max-w-xs">
              {LOCAL_STRINGS.tryDifferent}
            </AppText>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
