import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { clsx } from 'clsx';
import { ScreenContainer, VStack, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { BookmarkCard } from '@/components/cards/Cards';
import { Button } from '@/components/buttons/Button';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals } from '@/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

type FilterType = 'shlokas' | 'notes';

export default function BookmarksScreen() {
  const haptics = useHapticFeedback();
  const { bookmarks, removeBookmark, clearBookmarks } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('shlokas');

  const noteBookmarks = bookmarks.filter((b) => !!b.note);
  const filteredBookmarks = filter === 'notes' ? noteBookmarks : bookmarks;

  const handleRemoveBookmark = (id: string) => {
    Alert.alert(
      'ಬುಕ್ಮಾರ್ಕ್ ತೆಗೆದುಹಾಕಿ',
      'ಈ ಬುಕ್ಮಾರ್ಕ್ ಅನ್ನು ಖಚಿತವಾಗಿ ತೆಗೆದುಹಾಕಬೇಕೇ?',
      [
        { text: 'ರದ್ದು', style: 'cancel' },
        {
          text: 'ತೆಗೆದುಹಾಕಿ',
          style: 'destructive',
          onPress: () => {
            removeBookmark(id);
            haptics.warning();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (bookmarks.length === 0) return;
    Alert.alert(
      'ಎಲ್ಲಾ ಬುಕ್ಮಾರ್ಕ್‌ಗಳನ್ನು ತೆಗೆದುಹಾಕಿ',
      `ಈ ${toKannadaNumerals(bookmarks.length)} ಬುಕ್ಮಾರ್ಕ್‌ಗಳನ್ನು ಎಲ್ಲವನ್ನೂ ಖಚಿತವಾಗಿ ತೆಗೆದುಹಾಕಬೇಕೇ?`,
      [
        { text: 'ರದ್ದು', style: 'cancel' },
        {
          text: 'ತೆಗೆದುಹಾಕಿ',
          style: 'destructive',
          onPress: () => {
            clearBookmarks();
            haptics.warning();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top']}>
      <View className="px-6 pt-4">
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
          >
            {LOCAL_STRINGS.bookmarks}
          </AppText>
          {bookmarks.length > 0 ? (
            <Pressable
              onPress={handleClearAll}
              hitSlop={10}
              className="w-11 h-11 rounded-full bg-[#FBEAE7] items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#C0392B" />
            </Pressable>
          ) : (
            <View className="w-11 h-11" />
          )}
        </HStack>

        {/* ಟ್ಯಾಬ್‌ಗಳು — ಶ್ಲೋಕಗಳು / ನೋಟ್‌ಗಳು */}
        <View className="flex-row bg-background-soft rounded-full p-1 border border-border-light mb-5">
          {(
            [
              { key: 'shlokas', label: LOCAL_STRINGS.shlokas, count: bookmarks.length },
              { key: 'notes', label: LOCAL_STRINGS.notes, count: noteBookmarks.length },
            ] as { key: FilterType; label: string; count: number }[]
          ).map((tab) => {
            const isActive = filter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  haptics.selection();
                  setFilter(tab.key);
                }}
                className={clsx(
                  'flex-1 flex-row items-center justify-center py-2.5 rounded-full',
                  isActive ? 'bg-primary-default shadow-soft' : 'bg-transparent',
                )}
              >
                <AppText
                  variant="bodySmall"
                  weight={isActive ? 'semibold' : 'medium'}
                  className={isActive ? 'text-white' : 'text-text-muted'}
                >
                  {tab.label} ({toKannadaNumerals(tab.count)})
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 100,
        }}
      >
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onRemove={() => handleRemoveBookmark(bookmark.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <View className="w-28 h-28 rounded-full bg-secondary-subtle items-center justify-center mb-6 border border-secondary-light/40">
              <Ionicons name="bookmark-outline" size={52} color="#B4832E" />
            </View>
            <VStack spacing="sm" className="items-center mb-8 max-w-xs">
              <AppText variant="title" weight="bold" align="center">
                {LOCAL_STRINGS.noBookmarks}
              </AppText>
              <AppText variant="body" color="muted" align="center">
                {LOCAL_STRINGS.addFirstBookmark}
              </AppText>
            </VStack>
            <Button
              variant="gradient"
              icon="book-outline"
              onPress={() => router.push('/chapters')}
            >
              ಅಧ್ಯಾಯಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ
            </Button>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
