import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer, HStack, VStack, Card } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { Header, VerseContent } from '@/components/common/Common';
import { IconButton, Button } from '@/components/buttons/Button';
import { useReading } from '@/hooks/useReading';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals, calculateProgress, haptics } from '@/utils';
import type { View as RNView } from 'react-native';

export default function ReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // ಸಿಸ್ಟಂ ನ್ಯಾವಿಗೇಶನ್‌ಗೆ ತಕ್ಕಂತೆ ಕೆಳ ಅಂತರ
  const bottomInset = Math.max(insets.bottom, 8);

  const settings = useAppStore((state) => state.settings);
  const addBookmark = useAppStore((state) => state.addBookmark);
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const isBookmarkedFn = useAppStore((state) => state.isBookmarked);

  const {
    chapter,
    currentVerse,
    currentVerseIndex,
    totalVerses,
    progress,
    next,
    previous,
    goTo,
  } = useReading(id || '');

  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(settings.fontSize);

  const bookmarked = currentVerse
    ? isBookmarkedFn(chapter?.id || '', currentVerse.id)
    : false;

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentVerseIndex]);

  const handleBookmark = useCallback(() => {
    if (!currentVerse || !chapter) return;
    if (bookmarked) {
      const existingBm = useAppStore
        .getState()
        .bookmarks.find(
          (b) => b.chapterId === chapter.id && b.verseId === currentVerse.id
        );
      if (existingBm) {
        removeBookmark(existingBm.id);
        haptics.warning();
      }
    } else {
      addBookmark({
        chapterId: chapter.id,
        verseId: currentVerse.id,
        chapterTitle: chapter.title,
        verseNumber: currentVerse.verseNumber,
        note: '',
      });
      haptics.success();
    }
  }, [bookmarked, currentVerse, chapter, addBookmark, removeBookmark]);

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
              icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
              variant="ghost"
              size="sm"
              onPress={handleBookmark}
            />
            <IconButton
              icon="settings-outline"
              variant="ghost"
              size="sm"
              onPress={() => setShowSettings(true)}
            />
          </HStack>
        }
      />

      {/* ಶ್ಲೋಕ ಸಂಚರಣೆ — ವೃತ್ತಾಕಾರದ ಹಿಂದಿನ/ಮುಂದಿನ ಗುಂಡಿಗಳು */}
      <View className="px-6 py-3 bg-background-default border-b border-border-light">
        <HStack justify="space-between" align="center">
          <Pressable
            onPress={previous}
            disabled={currentVerseIndex === 0}
            hitSlop={8}
            className={clsx(
              'w-11 h-11 rounded-full items-center justify-center border',
              currentVerseIndex === 0
                ? 'bg-background-soft border-border-light opacity-50'
                : 'bg-white border-border-strong shadow-soft',
            )}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentVerseIndex === 0 ? '#A88C74' : '#8A3324'}
            />
          </Pressable>

          <Pressable onPress={() => setShowToc(true)} hitSlop={8} className="items-center">
            <AppText variant="title" weight="bold" className="text-primary-dark">
              {LOCAL_STRINGS.verse} {toKannadaNumerals(currentVerseIndex + 1)}
            </AppText>
            <AppText variant="caption" color="muted">
              {toKannadaNumerals(currentVerseIndex + 1)} / {toKannadaNumerals(totalVerses)}
            </AppText>
          </Pressable>

          <Pressable
            onPress={next}
            disabled={currentVerseIndex >= totalVerses - 1}
            hitSlop={8}
            className={clsx(
              'w-11 h-11 rounded-full items-center justify-center border',
              currentVerseIndex >= totalVerses - 1
                ? 'bg-background-soft border-border-light opacity-50'
                : 'bg-white border-border-strong shadow-soft',
            )}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentVerseIndex >= totalVerses - 1 ? '#A88C74' : '#8A3324'}
            />
          </Pressable>
        </HStack>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 180,
        }}
        className="flex-1 bg-background-default"
      >
        {currentVerse && (
          <VerseContent
            verseNumber={currentVerse.verseNumber}
            sanskrit={currentVerse.sanskrit}
            translation={currentVerse.translation}
            commentary={currentVerse.commentary}
            showSanskrit={settings.showSanskrit}
            showTranslation={settings.showTranslation}
            showCommentary={settings.showCommentary}
            isBookmarked={bookmarked}
            onBookmark={handleBookmark}
            fontSize={fontSize}
          />
        )}

        <View className="flex-row justify-between mt-4 mb-4">
          <Pressable
            onPress={previous}
            disabled={currentVerseIndex === 0}
            className={clsx(
              'flex-row items-center px-5 py-3.5 rounded-full border',
              currentVerseIndex === 0
                ? 'bg-background-subtle border-border-light opacity-50'
                : 'bg-white border-border-strong shadow-soft',
            )}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={currentVerseIndex === 0 ? '#A88C74' : '#8A3324'}
            />
            <AppText
              variant="bodySmall"
              weight="semibold"
              className={currentVerseIndex === 0 ? 'text-text-subtle ml-2' : 'text-primary-default ml-2'}
            >
              {LOCAL_STRINGS.previousShloka}
            </AppText>
          </Pressable>

          <Pressable
            onPress={next}
            disabled={currentVerseIndex >= totalVerses - 1}
            className={clsx(
              'flex-row items-center px-5 py-3.5 rounded-full',
              currentVerseIndex >= totalVerses - 1
                ? 'bg-background-subtle opacity-50'
                : 'bg-primary-default shadow-floating',
            )}
          >
            <AppText
              variant="bodySmall"
              weight="semibold"
              color={currentVerseIndex >= totalVerses - 1 ? 'subtle' : 'inverted'}
              className="mr-2"
            >
              {LOCAL_STRINGS.nextShloka}
            </AppText>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={currentVerseIndex >= totalVerses - 1 ? '#A88C74' : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white/95 backdrop-blur-xl border-t border-border-light"
        style={{ paddingBottom: bottomInset }}
      >
        <View className="mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center py-1">
              {chapter.content.map((verse, idx) => {
                const p = useAppStore.getState().getReadingProgress(chapter.id);
                const isRead = idx < (p?.lastReadVerse || 0);
                const isCurrent = idx === currentVerseIndex;

                return (
                  <Pressable
                    key={verse.id}
                    onPress={() => {
                      haptics.selection();
                      goTo(idx);
                    }}
                    className={clsx(
                      'w-9 h-9 rounded-full items-center justify-center mr-2',
                      isCurrent
                        ? 'bg-primary-default shadow-soft'
                        : isRead
                        ? 'bg-primary-subtle'
                        : 'bg-background-soft border border-border-light',
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

      <Modal
        visible={showToc}
        animationType="slide"
        transparent
        onRequestClose={() => setShowToc(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onPress={() => setShowToc(false)}
          />
          <View className="bg-white rounded-t-[32px] max-h-[80%] relative z-10">
            <View className="w-12 h-1.5 rounded-full bg-border-strong self-center mt-4 mb-2" />
            <View className="px-6 py-4 border-b border-border-light">
              <HStack justify="space-between">
                <AppText variant="heading3" weight="bold">
                  ಪಟ್ಟಿ ಸೂಚಿ
                </AppText>
                <Pressable
                  onPress={() => setShowToc(false)}
                  className="w-10 h-10 rounded-full items-center justify-center bg-background-soft"
                >
                  <Ionicons name="close" size={18} color="#7A5C48" />
                </Pressable>
              </HStack>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 24 }}
            >
              {chapter.content.map((verse, idx) => {
                const isCurrent = idx === currentVerseIndex;
                return (
                  <Pressable
                    key={verse.id}
                    onPress={() => {
                      haptics.selection();
                      goTo(idx);
                      setShowToc(false);
                    }}
                    className={clsx(
                      'flex-row items-center p-4 rounded-2xl mb-2',
                      isCurrent
                        ? 'bg-primary-subtle border-2 border-primary-default'
                        : 'bg-background-soft',
                    )}
                  >
                    <View
                      className={clsx(
                        'w-10 h-10 rounded-xl items-center justify-center mr-4',
                        isCurrent ? 'bg-primary-default' : 'bg-white',
                      )}
                    >
                      <AppText
                        variant="bodySmall"
                        weight="bold"
                        color={isCurrent ? 'inverted' : 'muted'}
                      >
                        {toKannadaNumerals(idx + 1)}
                      </AppText>
                    </View>
                    <AppText
                      variant="body"
                      weight={isCurrent ? 'semibold' : 'medium'}
                      numberOfLines={2}
                      color={isCurrent ? 'primary' : 'default'}
                      className="flex-1"
                    >
                      {verse.translation.substring(0, 80)}...
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
