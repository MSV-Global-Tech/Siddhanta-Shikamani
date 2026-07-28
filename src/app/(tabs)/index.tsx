import React from 'react';
import { View, Pressable, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScreenContainer, VStack, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { CHAPTERS } from '@/data/chapters';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, calculateProgress } from '@/utils';

interface QuickAccessItem {
  key: string;
  label: string;
  sub: string;
  count: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { readingProgress, recentChapters, bookmarks } = useAppStore();

  // ಗುರುವಾಣಿ ಚಿತ್ರದ ನಿಖರ ಗಾತ್ರ — 1277×603 ಅನುಪಾತದಲ್ಲಿ ಪರದೆಯ ಅಗಲಕ್ಕೆ ಹೊಂದಿಸಿ
  const quoteImageWidth = screenWidth - 40; // px-5 ಅಂಚು (20 + 20)
  const quoteImageHeight = quoteImageWidth * (603 / 1277);

  const totalVerses = CHAPTERS.reduce((sum, c) => sum + c.versesCount, 0);
  const notesCount = bookmarks.filter((b) => !!b.note).length;

  const continueChapterId =
    recentChapters[0] || readingProgress.find((p) => !p.completed)?.chapterId || CHAPTERS[0].id;
  const continueChapter = CHAPTERS.find((c) => c.id === continueChapterId) || CHAPTERS[0];
  const continueProgress = useAppStore.getState().getReadingProgress(continueChapterId);
  const continueVerseNumber = continueProgress?.lastReadVerse || 1;

  // ದೈನಂದಿನ ಶ್ಲೋಕ — ದಿನಕ್ಕೊಂದು ಶ್ಲೋಕ ಆಯ್ಕೆ
  const allVerses = CHAPTERS.flatMap((c) =>
    c.content.map((v) => ({ chapterId: c.id, verse: v }))
  );
  const dayIndex = Math.floor(Date.now() / 86400000) % Math.max(allVerses.length, 1);
  const dailyShloka = allVerses[dayIndex] || allVerses[0];

  const quickAccessItems: QuickAccessItem[] = [
    {
      key: 'chapters',
      label: LOCAL_STRINGS.chapters,
      sub: 'Parichchedas',
      count: toKannadaNumerals(CHAPTERS.length),
      icon: 'book-outline',
      route: '/chapters',
    },
    {
      key: 'shlokas',
      label: LOCAL_STRINGS.shlokas,
      sub: 'Shlokas',
      count: toKannadaNumerals(totalVerses),
      icon: 'document-text-outline',
      route: `/reading/${continueChapter.id}`,
    },
    {
      key: 'bookmarks',
      label: LOCAL_STRINGS.bookmarks,
      sub: 'Bookmarks',
      count: toKannadaNumerals(bookmarks.length),
      icon: 'bookmark-outline',
      route: '/bookmarks',
    },
    {
      key: 'notes',
      label: LOCAL_STRINGS.notes,
      sub: 'Notes',
      count: toKannadaNumerals(notesCount),
      icon: 'create-outline',
      route: '/bookmarks',
    },
  ];

  return (
    <ScreenContainer scroll>
      <View className="px-5 pt-4 pb-8">
        {/* ಶೀರ್ಷಿಕೆ ಪಟ್ಟಿ — ಮೆನು, ಹೆಸರು, ಗಂಟೆ */}
        <HStack justify="space-between" align="center" className="mb-6">
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={10}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="menu" size={26} color="#3D2314" />
          </Pressable>
          <AppText
            variant="heading3"
            weight="bold"
            align="center"
            className="text-primary-dark font-serif-kan-bold flex-1 mx-2"
            numberOfLines={1}
          >
            {LOCAL_STRINGS.appName}
          </AppText>
          <Pressable
            hitSlop={10}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={24} color="#3D2314" />
          </Pressable>
        </HStack>

        {/* ಗುರುವಾಣಿ ಕಾರ್ಡ್ — ಬಸವಣ್ಣನವರ ವಾಣಿ ಚಿತ್ರ (1277×603 ಪೂರ್ಣ ಚಿತ್ರ) */}
        <View className="mb-7 items-center">
          <Image
            source={require('../../../assets/front.jpg')}
            resizeMode="contain"
            style={{ width: quoteImageWidth, height: quoteImageHeight, borderRadius: 14 }}
          />
        </View>

        {/* ತ್ವರಿತ ಪ್ರವೇಶ */}
        <HStack justify="space-between" align="center" className="mb-4">
          <AppText variant="heading3" weight="bold">
            Quick Access
          </AppText>
          <Pressable onPress={() => router.push('/chapters')} hitSlop={8}>
            <AppText variant="caption" weight="bold" color="secondary-dark">
              View All
            </AppText>
          </Pressable>
        </HStack>

        <View className="flex-row -mx-1 mb-7">
          {quickAccessItems.map((item) => (
            <View key={item.key} className="flex-1 px-1">
              <Pressable
                onPress={() => router.push(item.route as any)}
                className="bg-white rounded-2xl border border-border-light shadow-soft items-center px-1 py-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <View className="w-11 h-11 rounded-xl bg-secondary-subtle border border-secondary-light/40 items-center justify-center mb-2">
                  <Ionicons name={item.icon} size={22} color="#8A3324" />
                </View>
                <AppText
                  variant="caption"
                  weight="semibold"
                  align="center"
                  numberOfLines={1}
                  className="text-text-default"
                >
                  {item.label}
                </AppText>
                <AppText
                  align="center"
                  numberOfLines={1}
                  color="muted"
                  style={{ fontSize: 9, lineHeight: 13 }}
                >
                  ({item.sub})
                </AppText>
              </Pressable>
            </View>
          ))}
        </View>

        {/* ದೈನಂದಿನ ಶ್ಲೋಕ */}
        <View className="bg-white rounded-3xl border border-secondary-light/40 shadow-soft overflow-hidden mb-6">
          <LinearGradient
            colors={['#FFFDF9', '#F7ECD6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="p-6"
          >
            <HStack spacing="sm" align="center" className="mb-4">
              <View className="w-10 h-10 rounded-full bg-secondary-subtle border border-secondary-light/50 items-center justify-center">
                <Ionicons name="flame" size={20} color="#B4832E" />
              </View>
              <AppText variant="title" weight="bold" className="text-primary-dark">
                {LOCAL_STRINGS.dailyShloka}
              </AppText>
            </HStack>

            {dailyShloka?.verse.sanskrit && (
              <AppText
                variant="verse"
                align="center"
                className="text-primary-dark mb-3"
                numberOfLines={4}
              >
                {dailyShloka.verse.sanskrit}
              </AppText>
            )}
            <AppText
              variant="bodySmall"
              align="center"
              color="muted"
              numberOfLines={2}
              className="mb-5"
            >
              {dailyShloka?.verse.translation}
            </AppText>

            <Pressable
              onPress={() => router.push(`/reading/${dailyShloka?.chapterId || CHAPTERS[0].id}`)}
              className="self-center bg-primary-default rounded-full px-10 py-3 shadow-floating"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <AppText variant="body" weight="bold" color="inverted">
                {LOCAL_STRINGS.readNow}
              </AppText>
            </Pressable>
          </LinearGradient>
        </View>

        {/* ಮುಂದುವರಿಸಿ ಓದಿ */}
        <Pressable
          onPress={() => router.push(`/reading/${continueChapter.id}`)}
          className="bg-white rounded-3xl p-5 border border-border-light shadow-soft"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing="sm" className="flex-1 mr-3">
              <View className="w-12 h-12 rounded-2xl bg-primary-subtle items-center justify-center">
                <Ionicons name="play" size={20} color="#8A3324" />
              </View>
              <VStack spacing="xs" className="flex-1 justify-center">
                <AppText variant="caption" weight="bold" color="secondary-dark">
                  {LOCAL_STRINGS.continueReading}
                </AppText>
                <AppText variant="body" weight="semibold" numberOfLines={1}>
                  {LOCAL_STRINGS.pariccheda} {toKannadaNumerals(continueChapter.number)} • {LOCAL_STRINGS.verse} {toKannadaNumerals(continueVerseNumber)}
                </AppText>
              </VStack>
            </HStack>
            <Ionicons name="chevron-forward" size={20} color="#A88C74" />
          </HStack>
          <View className="h-1.5 bg-background-subtle rounded-full overflow-hidden mt-4">
            <View
              className="h-full bg-primary-default rounded-full"
              style={{
                width: `${calculateProgress(continueVerseNumber, continueChapter.versesCount)}%`,
              }}
            />
          </View>
        </Pressable>

        <View className="h-6" />
      </View>
    </ScreenContainer>
  );
}
