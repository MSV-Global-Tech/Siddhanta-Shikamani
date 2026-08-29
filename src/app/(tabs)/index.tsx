import React, { useState, useCallback } from 'react';
import { View, Pressable, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer, VStack, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { CHAPTERS } from '@/data/chapters';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, calculateProgress } from '@/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export default function HomeScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const { width: screenWidth } = useWindowDimensions();

  const [readingProgress, setReadingProgress] = useState(() => useAppStore.getState().readingProgress);
  const [recentChapters, setRecentChapters] = useState(() => useAppStore.getState().recentChapters);
  const [profile, setProfile] = useState(() => useAppStore.getState().profile);

  useFocusEffect(
    useCallback(() => {
      const state = useAppStore.getState();
      setReadingProgress(state.readingProgress);
      setRecentChapters(state.recentChapters);
      setProfile(state.profile);
    }, [])
  );

  // ಗುರುವಾಣಿ ಚಿತ್ರದ ನಿಖರ ಗಾತ್ರ — 1277×603 ಅನುಪಾತದಲ್ಲಿ ಪರದೆಯ ಅಗಲಕ್ಕೆ ಹೊಂದಿಸಿ
  const quoteImageWidth = screenWidth - 40; // px-5 ಅಂಚು (20 + 20)
  const quoteImageHeight = quoteImageWidth * (603 / 1277);

  const continueChapterId =
    recentChapters[0] || readingProgress.find((p) => !p.completed)?.chapterId || CHAPTERS[0].id;
  const continueChapter = CHAPTERS.find((c) => c.id === continueChapterId) || CHAPTERS[0];
  const continueProgress = useAppStore.getState().getReadingProgress(continueChapterId);
  const continueVerseNumber = continueProgress?.lastReadVerse || 1;

  const navigateToSettings = () => {
    haptics.light();
    router.push('/settings');
  };

  return (
    <ScreenContainer scroll>
      <View className="px-5 pt-4 pb-8">
        {/* ಶೀರ್ಷಿಕೆ ಪಟ್ಟಿ — ಮೆನು, ಹೆಸರು, ಬಲ ಭಾಗ ಸ್ಪೇಸರ್ */}
        <HStack justify="space-between" align="center" className="mb-6">
          <Pressable
            onPress={navigateToSettings}
            hitSlop={12}
            className="w-11 h-11 rounded-full items-center justify-center bg-amber-50/80 border border-amber-200/60 shadow-sm"
          >
            <Ionicons name="menu" size={24} color="#8A3324" />
          </Pressable>
          <AppText
            variant="heading3"
            weight="bold"
            align="center"
            className="text-primary-dark font-kannada-bold flex-1 mx-2"
            numberOfLines={1}
          >
            {LOCAL_STRINGS.appName}
          </AppText>
          <View className="w-11 h-11" />
        </HStack>

        {/* ಗುರುವಾಣಿ ಕಾರ್ಡ್ — ಬಸವಣ್ಣನವರ ವಾಣಿ ಚಿತ್ರ */}
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
        </HStack>

        <View className="flex-row -mx-1 mb-7">
          <View className="flex-1 px-1">
            <Pressable
              onPress={() => router.push('/chapters')}
              className="bg-white rounded-2xl border border-border-light shadow-soft items-center px-2 py-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View className="w-12 h-12 rounded-xl bg-secondary-subtle border border-secondary-light/40 items-center justify-center mb-2">
                <Ionicons name="book-outline" size={24} color="#8A3324" />
              </View>
              <AppText
                variant="bodySmall"
                weight="bold"
                align="center"
                numberOfLines={1}
                className="text-primary-dark mb-0.5"
              >
                {LOCAL_STRINGS.chapters}
              </AppText>
              <AppText
                align="center"
                numberOfLines={1}
                color="muted"
                weight="semibold"
                style={{ fontSize: 10, lineHeight: 14 }}
              >
                (21 ಪರಿಚ್ಛೇದಗಳು)
              </AppText>
            </Pressable>
          </View>
          <View className="flex-1 px-1">
            <Pressable
              onPress={navigateToSettings}
              className="bg-white rounded-2xl border border-border-light shadow-soft items-center px-2 py-3"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View className="w-12 h-12 rounded-xl bg-secondary-subtle border border-secondary-light/40 items-center justify-center mb-2">
                <Ionicons name="settings-outline" size={24} color="#8A3324" />
              </View>
              <AppText
                variant="bodySmall"
                weight="bold"
                align="center"
                numberOfLines={1}
                className="text-primary-dark mb-0.5"
              >
                {LOCAL_STRINGS.settingsTitle}
              </AppText>
              <AppText
                align="center"
                numberOfLines={1}
                color="muted"
                weight="semibold"
                style={{ fontSize: 10, lineHeight: 14 }}
              >
                (ಆಯ್ಕೆಗಳು)
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* ಮುಂದುವರಿಸಿ ಓದಿ */}
        <HStack justify="space-between" align="center" className="mb-4">
          <AppText variant="heading3" weight="bold">
            Continue Reading
          </AppText>
        </HStack>
        <Pressable
          onPress={() => router.push(`/reading/${continueChapter.id}`)}
          className="bg-white rounded-3xl p-5 border border-border-light shadow-soft mb-7"
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
          <View className="h-[3px] bg-[#F0E6D8] rounded-full overflow-hidden mt-4">
            <View
              className="h-full bg-[#8A3324]/80 rounded-full"
              style={{
                width: `${calculateProgress(continueVerseNumber, continueChapter.versesCount)}%`,
              }}
            />
          </View>
        </Pressable>

        {/* ಗ್ರಂಥ ಪರಿಚಯ (Book Overview) */}
        <View className="bg-white rounded-3xl border border-secondary-light/40 shadow-soft overflow-hidden mb-7">
          <LinearGradient
            colors={['#FFFDF9', '#F7ECD6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="p-5"
          >
            <HStack spacing="sm" align="center" className="mb-3">
              <View className="w-10 h-10 rounded-full bg-secondary-subtle border border-secondary-light/50 items-center justify-center">
                <Ionicons name="leaf" size={20} color="#B4832E" />
              </View>
              <AppText variant="title" weight="bold" className="text-primary-dark">
                ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ
              </AppText>
            </HStack>
            <AppText
              variant="bodySmall"
              color="muted"
              style={{ lineHeight: 22 }}
              className="mb-4"
            >
              ಶಿವಯೋಗಿ ಶಿವಾಚಾರ್ಯರು ರಚಿಸಿರುವ ವೀರಶೈವ ಧರ್ಮದ ಶ್ರೇಷ್ಠ ದಾರ್ಶನಿಕ ಗ್ರಂಥ. ಇದು ರೇಣುಕಾಚಾರ್ಯರು ಅಗಸ್ತ್ಯ ಮುನಿಗೆ ಬೋಧಿಸಿದ ತತ್ವಗಳ ಸಂಗ್ರಹವಾಗಿದೆ.
            </AppText>
          </LinearGradient>
        </View>

      </View>
    </ScreenContainer>
  );
}
