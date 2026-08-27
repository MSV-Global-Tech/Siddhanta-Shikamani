import React, { useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layouts/Containers';
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
  const insets = useSafeAreaInsets();
  const readingProgress = useAppStore((state) => state.readingProgress);

  const parichhedaInfo = useMemo(() => {
    const chapter = CHAPTERS.find(c => c.parichheda?.id === id);
    return chapter?.parichheda;
  }, [id]);

  const chapters = useMemo(() => {
    return CHAPTERS.filter(c => c.parichheda?.id === id).sort((a, b) => a.number - b.number);
  }, [id]);

  const totalShlokas = chapters.reduce((sum, c) => sum + c.versesCount, 0);

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
    <View style={{ flex: 1, backgroundColor: '#FAF6F1' }}>
      {/* ── Hero gradient header ── */}
      <LinearGradient
        colors={['#5C1507', '#8A3324', '#B86040']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingBottom: 28 }}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.20)',
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>

        {/* Label pill */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginBottom: 10,
              backgroundColor: 'rgba(255,255,255,0.22)',
            }}
          >
            <AppText variant="caption" weight="bold" color="inverted" className="uppercase tracking-widest">
              {LOCAL_STRINGS.pariccheda}{parichhedaInfo.number ? ` ${toKannadaNumerals(parichhedaInfo.number)}` : ''}
            </AppText>
          </View>

          {/* Full title — no truncation */}
          <AppText
            variant="heading2"
            weight="bold"
            color="inverted"
            className="font-serif-kan-bold"
            style={{ lineHeight: 48 }}
          >
            {parichhedaInfo.title}
          </AppText>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.80)" />
              <AppText variant="caption" color="inverted" style={{ opacity: 0.85 }}>
                {toKannadaNumerals(chapters.length)} ಅಧ್ಯಾಯಗಳು
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="list-outline" size={14} color="rgba(255,255,255,0.80)" />
              <AppText variant="caption" color="inverted" style={{ opacity: 0.85 }}>
                {toKannadaNumerals(totalShlokas)} {LOCAL_STRINGS.shlokas}
              </AppText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* ── Chapter list ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      >
        {chapters.map((chapter) => renderChapterCard(chapter, readingProgress, handleOpen))}
      </ScrollView>
    </View>
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
    <Pressable
      key={chapter.id}
      onPress={() => handleOpen(chapter.id)}
      className="bg-white rounded-2xl border border-secondary-light/30 shadow-soft flex-row items-center px-4 py-4 mb-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {/* Number circle */}
      <View className="w-14 h-14 rounded-full border-2 border-secondary-light/60 items-center justify-center bg-secondary-subtle/60 mr-4 shrink-0">
        <View className="w-11 h-11 rounded-full border border-secondary-default/40 items-center justify-center bg-white">
          <AppText variant="title" weight="bold" className="text-primary-dark font-serif-kan-bold">
            {toKannadaNumerals(chapter.number)}
          </AppText>
        </View>
      </View>

      {/* Text block */}
      <View className="flex-1">
        <AppText variant="title" weight="semibold" className="text-primary-dark mb-0.5">
          {chapter.title}
        </AppText>
        <AppText variant="caption" color="muted" className="mb-1.5" numberOfLines={2}>
          {chapter.description}
        </AppText>
        <View className="flex-row items-center justify-between w-full mt-2">
          <View className="flex-row items-center gap-1.5">
            <AppText variant="body" weight="bold" style={{ color: '#000000' }}>
              {toKannadaNumerals(chapter.versesCount)} {LOCAL_STRINGS.shlokas}
            </AppText>
            {percent > 0 && (
              <AppText variant="bodySmall" weight="bold" color="primary" className="ml-2">
                {toKannadaNumerals(percent)}%
              </AppText>
            )}
          </View>

          <View className="flex-row items-center bg-secondary-subtle/40 px-3 py-1.5 rounded-full border border-secondary-light/20">
            <AppText variant="bodySmall" weight="bold" style={{ color: '#000000', marginRight: 4 }}>
              ಓದಿ
            </AppText>
            <Ionicons name="arrow-forward" size={14} color="#000000" />
          </View>
        </View>

        {percent > 0 && (
          <View className="h-1 bg-background-subtle rounded-full overflow-hidden mt-3 w-full">
            <View className="h-full bg-primary-default rounded-full" style={{ width: `${percent}%` }} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
