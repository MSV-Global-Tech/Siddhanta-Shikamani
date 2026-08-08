import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';
import { ScreenContainer, HStack, VStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { Header, VerseContent } from '@/components/common/Common';
import { IconButton, Button } from '@/components/buttons/Button';
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
  const addBookmark = useAppStore((state) => state.addBookmark);
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const isBookmarkedFn = useAppStore((state) => state.isBookmarked);

  const {
    chapter,
    currentVerseIndex,
    totalVerses,
    onVerseViewed,
  } = useReading(id || '');

  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  
  // Track manual scroll to prevent viewableItems update from overriding jumps temporarily
  const isJumping = useRef(false);

  const handleBookmark = useCallback((verseId: string, verseNumber: number) => {
    if (!chapter) return;
    const isBookmarked = isBookmarkedFn(chapter.id, verseId);
    
    if (isBookmarked) {
      const existingBm = useAppStore
        .getState()
        .bookmarks.find(
          (b) => b.chapterId === chapter.id && b.verseId === verseId
        );
      if (existingBm) {
        removeBookmark(existingBm.id);
        haptics.warning();
      }
    } else {
      addBookmark({
        chapterId: chapter.id,
        verseId,
        chapterTitle: chapter.title,
        verseNumber,
        note: '',
      });
      haptics.success();
    }
  }, [chapter, isBookmarkedFn, addBookmark, removeBookmark]);

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

  return (
    <ScreenContainer edges={['top']}>
      <Header
        title={`${LOCAL_STRINGS.pariccheda} ${toKannadaNumerals(chapter.number)}`}
        subtitle={chapter.title}
        showBack
        onBack={() => router.back()}
        rightContent={
          <HStack spacing="xs">
            <IconButton
              icon="settings-outline"
              variant="ghost"
              size="sm"
              onPress={() => setShowSettings(true)}
            />
          </HStack>
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
            paddingBottom: 180,
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
                isBookmarked={isBookmarkedFn(chapter.id, item.id)}
                onBookmark={() => handleBookmark(item.id, item.verseNumber)}
                fontSize={fontSize}
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

        <View
          className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white/95 backdrop-blur-xl border-t border-border-light"
          style={{ paddingBottom: bottomInset }}
        >
          <View className="mb-2">
            <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row items-center py-1">
                {chapter.content.map((verse, idx) => {
                  const p = useAppStore.getState().getReadingProgress(chapter.id);
                  const isRead = idx < (p?.lastReadVerse || 0);
                  const isCurrent = idx === currentVerseIndex;

                  return (
                    <Pressable
                      key={verse.id}
                      onPress={() => goToVerse(idx)}
                      className={clsx(
                        'w-9 h-9 rounded-full items-center justify-center mr-2',
                        isCurrent
                          ? 'bg-primary-default shadow-soft'
                          : isRead
                          ? 'bg-primary-subtle shadow-none'
                          : 'bg-background-soft border border-border-light shadow-none',
                      )}
                    >
                      <AppText
                        variant="caption"
                        weight={isCurrent ? 'bold' : 'medium'}
                        color={
                          isCurrent
                            ? 'inverted'
                            : isRead
                            ? 'primary'
                            : 'muted'
                        }
                      >
                        {toKannadaNumerals(idx + 1)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <Modal
        visible={showSettings}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSettings(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onPress={() => setShowSettings(false)}
          />
          <View
            className="bg-white rounded-t-[32px] p-6 relative z-10"
            style={{ paddingBottom: bottomInset + 24 }}
          >
            <View className="w-12 h-1.5 rounded-full bg-border-strong self-center mb-6" />

            <HStack justify="space-between" className="mb-6">
              <AppText variant="heading3" weight="bold">
                ಓದುವಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು
              </AppText>
              <Pressable
                onPress={() => setShowSettings(false)}
                className="w-10 h-10 rounded-full items-center justify-center bg-background-soft"
              >
                <Ionicons name="close" size={18} color="#7A5C48" />
              </Pressable>
            </HStack>

            <VStack spacing="lg">
              <View>
                <HStack justify="space-between" className="mb-3">
                  <AppText variant="title" weight="semibold">
                    {LOCAL_STRINGS.fontSize}
                  </AppText>
                  <View className="bg-primary-subtle rounded-xl px-3 py-1">
                    <AppText variant="bodySmall" weight="semibold" color="primary">
                      {toKannadaNumerals(fontSize)}px
                    </AppText>
                  </View>
                </HStack>
                <View className="flex-row items-center justify-between gap-4">
                  <Pressable
                    onPress={() => setFontSize(Math.max(14, fontSize - 1))}
                    className="w-12 h-12 rounded-2xl bg-background-soft items-center justify-center"
                  >
                    <Ionicons name="remove" size={22} color="#7A5C48" />
                  </Pressable>
                  <View className="flex-1 h-2 bg-background-subtle rounded-full">
                    <View
                      className="h-full bg-primary-default rounded-full"
                      style={{
                        width: `${((fontSize - 14) / 10) * 100}%`,
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={() => setFontSize(Math.min(24, fontSize + 1))}
                    className="w-12 h-12 rounded-2xl bg-background-soft items-center justify-center"
                  >
                    <Ionicons name="add" size={22} color="#7A5C48" />
                  </Pressable>
                </View>
              </View>

              <View className="h-px bg-border-light" />

              {[
                {
                  key: 'showSanskrit',
                  label: LOCAL_STRINGS.showSanskrit,
                  value: settings.showSanskrit,
                },
                {
                  key: 'showTranslation',
                  label: LOCAL_STRINGS.showTranslation,
                  value: settings.showTranslation,
                },
                {
                  key: 'showCommentary',
                  label: LOCAL_STRINGS.showCommentary,
                  value: settings.showCommentary,
                },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    haptics.light();
                    useAppStore.getState().updateSettings({
                      [item.key]: !item.value,
                    } as any);
                  }}
                  className="flex-row items-center justify-between"
                >
                  <AppText variant="body" weight="medium">
                    {item.label}
                  </AppText>
                  <View
                    className={clsx(
                      'w-13 h-8 rounded-full p-1 transition-all',
                      item.value ? 'bg-primary-default' : 'bg-border-strong',
                    )}
                  >
                    <View
                      className={clsx(
                        'w-6 h-6 rounded-full bg-white shadow-soft transition-transform',
                        item.value ? 'translate-x-5' : 'translate-x-0',
                      )}
                    />
                  </View>
                </Pressable>
              ))}
            </VStack>

            <Button
              variant="gradient"
              fullWidth
              icon="checkmark"
              className="mt-8"
              onPress={() => {
                useAppStore.getState().updateSettings({ fontSize });
                setShowSettings(false);
              }}
            >
              ವಾಸ್ತವಗೊಳಿಸಿ
            </Button>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
