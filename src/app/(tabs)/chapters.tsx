import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScreenContainer, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { CHAPTERS } from '@/data/chapters';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals } from '@/utils';
import type { Chapter } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function ChaptersScreen() {
  const haptics = useHapticFeedback();
  const [searchQuery, setSearchQuery] = useState('');

  const chapters = useMemo(() => {
    let list = [...CHAPTERS].sort((a, b) => a.number - b.number);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.number.toString() === q ||
        (c.parichheda && (
          c.parichheda.title.toLowerCase().includes(q) ||
          c.parichheda.number.toString() === q
        ))
      );
    }
    return list;
  }, [searchQuery]);

  // Group chapters by parichheda
  const groupedChapters = useMemo(() => {
    const groups: { parichheda: Chapter['parichheda']; chapters: Chapter[] }[] = [];
    const ungrouped: Chapter[] = [];

    chapters.forEach((chapter) => {
      if (chapter.parichheda) {
        let group = groups.find((g) => g.parichheda?.id === chapter.parichheda?.id);
        if (!group) {
          group = { parichheda: chapter.parichheda, chapters: [] };
          groups.push(group);
        }
        group.chapters.push(chapter);
      } else {
        ungrouped.push(chapter);
      }
    });

    return { groups, ungrouped };
  }, [chapters]);

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
            className="text-primary-dark font-kannada-bold flex-1 mx-2"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {LOCAL_STRINGS.chaptersPariccheda}
          </AppText>
          <View className="w-11 h-11" />
        </HStack>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-secondary-light/40 shadow-sm mb-4">
          <Ionicons name="search-outline" size={20} color="#A88C74" className="mr-3" />
          <TextInput
            className="flex-1 font-sans text-primary-dark ml-2 text-base"
            placeholder="ಅಧ್ಯಾಯಗಳು ಅಥವಾ ಶ್ಲೋಕಗಳನ್ನು ಹುಡುಕ..."
            placeholderTextColor="#A88C74"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 100 }}
      >
        {chapters.length > 0 ? (
          <View>
            <View className="flex-row flex-wrap">
              {groupedChapters.groups.map((group) => {
                const totalShlokas = group.chapters.reduce((sum, c) => sum + c.versesCount, 0);

                return (
                  <View key={group.parichheda?.id} className="w-1/3 p-1.5">
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        if (group.parichheda?.id) {
                          router.push(`/parichheda/${group.parichheda.id}` as any);
                        }
                      }}
                      className="bg-white rounded-3xl border border-secondary-light/40 shadow-soft items-center px-2 py-5"
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    >
                      <View className="w-14 h-14 rounded-full border-2 border-secondary-light/60 items-center justify-center mb-3 bg-secondary-subtle/60">
                        <View className="w-11 h-11 rounded-full border border-secondary-default/40 items-center justify-center bg-white">
                          <AppText
                            variant="title"
                            weight="bold"
                            className="text-primary-dark font-kannada-bold"
                          >
                            {group.parichheda?.number ? toKannadaNumerals(group.parichheda.number) : ''}
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
                        {LOCAL_STRINGS.pariccheda} {group.parichheda?.number ? toKannadaNumerals(group.parichheda.number) : ''}
                      </AppText>
                      <AppText variant="caption" color="muted" align="center" numberOfLines={1}>
                        {LOCAL_STRINGS.shlokas} {toKannadaNumerals(totalShlokas)}
                      </AppText>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {groupedChapters.ungrouped.length > 0 && (
              <View className="mb-6">
                {groupedChapters.groups.length > 0 && (
                  <View className="px-2 mb-3 mt-4">
                    <AppText variant="title" weight="bold" className="text-primary-dark font-kannada-bold">
                      ಇತರೆ ಪರಿಚ್ಛೇದಗಳು
                    </AppText>
                    <View className="w-12 h-0.5 bg-secondary-default mt-1 rounded-full" />
                  </View>
                )}
                <View className="flex-row flex-wrap">
                  {groupedChapters.ungrouped.map((chapter) => renderChapterCard(chapter, handleOpen))}
                </View>
              </View>
            )}
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

function renderChapterCard(chapter: Chapter, handleOpen: (id: string) => void) {
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
              className="text-primary-dark font-kannada-bold"
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
      </Pressable>
    </View>
  );
}