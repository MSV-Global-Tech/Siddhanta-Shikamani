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
import { toKannadaNumerals } from '@/utils';
import type { Chapter } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function ParichhedaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const haptics = useHapticFeedback();
  const insets = useSafeAreaInsets();

  const parichhedaInfo = useMemo(() => {
    const chapter = CHAPTERS.find(c => c.parichheda?.id === id);
    return chapter?.parichheda;
  }, [id]);

  const { parichhedaOrdinal, parichhedaName } = useMemo(() => {
    if (!parichhedaInfo) return { parichhedaOrdinal: '', parichhedaName: '' };
    if (parichhedaInfo.title.includes(' - ')) {
      const parts = parichhedaInfo.title.split(' - ');
      return {
        parichhedaOrdinal: `${parts[0].trim()} (${toKannadaNumerals(parichhedaInfo.number)})`,
        parichhedaName: parts.slice(1).join(' - ').trim(),
      };
    }
    return {
      parichhedaOrdinal: `${LOCAL_STRINGS.pariccheda} (${toKannadaNumerals(parichhedaInfo.number)})`,
      parichhedaName: parichhedaInfo.title,
    };
  }, [parichhedaInfo]);

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
        style={{ paddingTop: insets.top + 4, paddingBottom: 16 }}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.20)',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Title Block */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* First: Parichheda (e.g. ಪ್ರಥಮಃ ಪರಿಚ್ಛೇದಃ (೧)) */}
          <AppText
            variant="body"
            weight="bold"
            color="inverted"
            style={{ fontSize: 16, lineHeight: 22, opacity: 0.95, marginBottom: 8 }}
          >
            {parichhedaOrdinal}
          </AppText>

          {/* Then: Name (e.g. ಮಂಗಲಾಚರಣಾನುಕ್ರಮಪ್ರಸಂಗಃ) */}
          <AppText
            variant="heading3"
            weight="bold"
            color="inverted"
            className="font-kannada-bold"
            style={{ lineHeight: 32, fontSize: 22 }}
          >
            {parichhedaName}
          </AppText>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="book-outline" size={13} color="rgba(255,255,255,0.80)" />
              <AppText variant="caption" color="inverted" style={{ opacity: 0.85 }}>
                {toKannadaNumerals(chapters.length)} ಅಧ್ಯಾಯಗಳು
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="list-outline" size={13} color="rgba(255,255,255,0.80)" />
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
      >
        {chapters.map((chapter) => renderChapterCard(chapter, handleOpen))}
      </ScrollView>
    </View>
  );
}

function renderChapterCard(chapter: Chapter, handleOpen: (id: string) => void) {
  return (
    <Pressable
      key={chapter.id}
      onPress={() => handleOpen(chapter.id)}
      className="bg-white rounded-2xl border border-secondary-light/30 shadow-soft flex-row items-center px-4 py-3 mb-2.5"
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {/* Number circle */}
      <View className="w-12 h-12 rounded-full border-2 border-secondary-light/60 items-center justify-center bg-secondary-subtle/60 mr-3.5 shrink-0">
        <View className="w-9 h-9 rounded-full border border-secondary-default/40 items-center justify-center bg-white">
          <AppText variant="body" weight="bold" className="text-primary-dark font-kannada-bold">
            {toKannadaNumerals(chapter.number)}
          </AppText>
        </View>
      </View>

      {/* Text block */}
      <View className="flex-1">
        <AppText variant="title" weight="semibold" className="text-primary-dark mb-0.5">
          {chapter.title}
        </AppText>
        <AppText variant="caption" color="muted" className="mb-1" numberOfLines={2}>
          {chapter.description}
        </AppText>
        <View className="flex-row items-center justify-between w-full mt-1">
          <View className="flex-row items-center gap-1.5">
            <AppText variant="bodySmall" weight="bold" style={{ color: '#000000' }}>
              {toKannadaNumerals(chapter.versesCount)} {LOCAL_STRINGS.shlokas}
            </AppText>
          </View>

          <View className="flex-row items-center bg-secondary-subtle/40 px-2.5 py-1 rounded-full border border-secondary-light/20">
            <AppText variant="caption" weight="bold" style={{ color: '#000000', marginRight: 4 }}>
              ಓದಿ
            </AppText>
            <Ionicons name="arrow-forward" size={12} color="#000000" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
