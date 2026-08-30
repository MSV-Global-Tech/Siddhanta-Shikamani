import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';
import { ScreenContainer, HStack, VStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { Header, VerseContent } from '@/components/common/Common';
import { Button } from '@/components/buttons/Button';
import { useReading } from '@/hooks/useReading';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, haptics } from '@/utils';

export default function ReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const flatListRef = useRef<FlatList>(null);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  const settings = useAppStore((state) => state.settings);

  const {
    chapter,
    currentVerseIndex,
    totalVerses,
    onVerseViewed,
  } = useReading(id || '');

  const [showToc, setShowToc] = useState(false);
  
  // Track manual scroll to prevent viewableItems update from overriding jumps temporarily
  const isJumping = useRef(false);

  const goToVerse = useCallback((index: number) => {
    haptics.selection();
    onVerseViewed(index);
    isJumping.current = true;
    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
    
    setTimeout(() => {
      isJumping.current = false;
    }, 1000);
  }, [onVerseViewed]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40,
    minimumViewTime: 200,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (isJumping.current || viewableItems.length === 0) return;
    const firstVisible = viewableItems[0];
    if (firstVisible && firstVisible.index !== null) {
      onVerseViewed(firstVisible.index);
      
      // Auto-scroll the horizontal bottom scrubber
      scrollRef.current?.scrollTo({ 
        x: firstVisible.index * 44 - 100, // Approximate width of scrubber items
        animated: true 
      });
    }
  });

  if (!chapter) {
    return (
      <ScreenContainer>
        <Header
          title="ದೊರೆತಿಲ್ಲ"
          showBack
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-3xl bg-error/10 items-center justify-center mb-6">
            <Ionicons name="alert-circle-outline" size={40} color="#C0392B" />
          </View>
          <AppText variant="title" weight="semibold" align="center" className="mb-2">
            {LOCAL_STRINGS.chapterNotFound}
          </AppText>
          <Button
            variant="primary"
            icon="arrow-back"
            onPress={() => router.back()}
          >
            ಹಿಂದಕ್ಕೆ ಹೋಗಿ
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const parichhedaInfo = chapter.parichheda;
  let parichhedaOrdinal = '';
  let parichhedaName = '';

  if (parichhedaInfo) {
    if (parichhedaInfo.title.includes(' - ')) {
      const parts = parichhedaInfo.title.split(' - ');
      parichhedaOrdinal = `${parts[0].trim()} (${toKannadaNumerals(parichhedaInfo.number)})`;
      parichhedaName = parts.slice(1).join(' - ').trim();
    } else {
      parichhedaOrdinal = `${LOCAL_STRINGS.pariccheda} (${toKannadaNumerals(parichhedaInfo.number)})`;
      parichhedaName = parichhedaInfo.title;
    }
  }

  return (
    <ScreenContainer edges={['top']}>
      <Header
        showBack
        onBack={() => router.back()}
        centerContent={
          <View className="items-center justify-center">
            {parichhedaOrdinal ? (
              <AppText
                variant="bodySmall"
                weight="bold"
                className="text-secondary-dark tracking-wide"
                align="center"
                numberOfLines={1}
                style={{ fontSize: 13, lineHeight: 18, marginBottom: 2 }}
              >
                {parichhedaOrdinal}
              </AppText>
            ) : null}
            {parichhedaName ? (
              <AppText
                variant="bodySmall"
                color="muted"
                weight="semibold"
                align="center"
                numberOfLines={2}
                style={{ fontSize: 13, lineHeight: 18, marginBottom: 2 }}
              >
                {parichhedaName}
              </AppText>
            ) : null}
            <AppText
              variant="heading3"
              weight="bold"
              align="center"
              numberOfLines={2}
              className="text-primary-dark font-kannada-bold mt-0.5"
              style={{ fontSize: 18, lineHeight: 26, paddingHorizontal: 2 }}
            >
              {chapter.title}
            </AppText>
          </View>
        }
        rightContent={
          <Pressable
            onPress={() => {
              haptics.selection();
              useAppStore.getState().updateSettings({
                showTranslation: !settings.showTranslation,
              });
            }}
            hitSlop={8}
            className="items-center justify-center"
            accessibilityRole="switch"
            accessibilityState={{ checked: settings.showTranslation }}
            accessibilityLabel="ಭಾವಾರ್ಥ ಆನ್/ಆಫ್"
          >
            <AppText
              weight="bold"
              style={{
                fontSize: 10,
                lineHeight: 12,
                marginBottom: 2,
                color: settings.showTranslation ? '#8A3324' : '#9E948A',
              }}
            >
              ಭಾ
            </AppText>
            <View
              style={{
                width: 28,
                height: 16,
                borderRadius: 9999,
                padding: 1.5,
                backgroundColor: settings.showTranslation ? '#8A3324' : '#D1C7BD',
                justifyContent: 'center',
                alignItems: settings.showTranslation ? 'flex-end' : 'flex-start',
              }}
            >
              <View
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 9999,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.5,
                  elevation: 1.5,
                }}
              />
            </View>
          </Pressable>
        }
      />

      <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
        <FlatList
          ref={flatListRef}
          data={chapter.content}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: bottomInset + 30,
          }}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          renderItem={({ item, index }) => (
            <View className="mb-4 pb-4 border-b border-border-light">
              <VerseContent
                verseNumber={item.verseNumber}
                sanskrit={item.sanskrit}
                translation={item.translation}
                showSanskrit={settings.showSanskrit}
                showTranslation={settings.showTranslation}
                showCommentary={settings.showCommentary}
                fontSize={settings.fontSize}
              />
            </View>
          )}
          ListFooterComponent={
            chapter.colophon ? (
              <View className="mt-6 mx-2 mb-4 items-center px-4">
                <View className="w-24 h-px bg-secondary-default mb-5" />
                <AppText
                  variant="body"
                  weight="semibold"
                  align="center"
                  className="text-secondary-dark mb-1"
                >
                  {chapter.colophon}
                </AppText>
                <View className="w-24 h-px bg-secondary-default mt-5" />
              </View>
            ) : null
          }
        />
      </View>
    </ScreenContainer>
  );
}
