import React, { useState, useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clsx } from 'clsx';
import { ScreenContainer, VStack, HStack } from '@/components/layouts/Containers';
import { AppText } from '@/components/typography/AppText';
import { SearchBar } from '@/components/inputs/Inputs';
import { CHAPTERS } from '@/data/chapters';
import { LOCAL_STRINGS } from '@/localization';
import { toKannadaNumerals } from '@/utils';
import type { SearchResult } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const categoryColors: Record<string, { bg: string; text: string }> = {
  ಸಂಖ್ಯಾ: { bg: 'bg-secondary-subtle', text: 'text-secondary-dark' },
  ಕರ್ಮ: { bg: 'bg-primary-subtle', text: 'text-primary-dark' },
  ಜ್ಞಾನ: { bg: 'bg-primary-subtle', text: 'text-primary-dark' },
  ಯೋಗ: { bg: 'bg-[#F7ECD6]', text: 'text-[#8C6220]' },
  ಭಕ್ತಿ: { bg: 'bg-[#F2E0D4]', text: 'text-[#8A3324]' },
  ವೈರಾಗ್ಯ: { bg: 'bg-[#EAD7C7]', text: 'text-[#5E2116]' },
};

type SearchFilter = 'all' | 'shloka' | 'words' | 'topics';

const popularSearches = [
  'ಕರ್ಮ ಯೋಗ',
  'ಬುದ್ಧಿ ಯೋಗ',
  'ಸಂನ್ಯಾಸ',
  'ಧ್ಯಾನ',
  'ಮುಕ್ತಿ',
  'ಫಲ ತ್ಯಾಗ',
];

export default function SearchScreen() {
  const router = useRouter();
  const haptics = useHapticFeedback();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');

  const filterChips: { key: SearchFilter; label: string }[] = [
    { key: 'all', label: LOCAL_STRINGS.all },
    { key: 'shloka', label: LOCAL_STRINGS.verse },
    { key: 'words', label: LOCAL_STRINGS.words },
    { key: 'topics', label: LOCAL_STRINGS.topics },
  ];

  const searchResults = useMemo<SearchResult[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const results: SearchResult[] = [];

    CHAPTERS.forEach((chapter) => {
      if (
        chapter.title.toLowerCase().includes(normalizedQuery) ||
        chapter.subtitle.toLowerCase().includes(normalizedQuery) ||
        chapter.description.toLowerCase().includes(normalizedQuery) ||
        chapter.category.toLowerCase().includes(normalizedQuery) ||
        chapter.number.toString().includes(normalizedQuery)
      ) {
        results.push({
          type: 'chapter',
          id: chapter.id,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          snippet: chapter.description.substring(0, 100),
          matchText: query,
        });
      }

      chapter.content.forEach((verse) => {
        if (
          verse.sanskrit.toLowerCase().includes(normalizedQuery) ||
          verse.translation.toLowerCase().includes(normalizedQuery) ||
          verse.commentary.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: 'verse',
            id: verse.id,
            chapterId: chapter.id,
            chapterNumber: chapter.number,
            chapterTitle: chapter.title,
            verseNumber: verse.verseNumber,
            snippet: verse.translation.substring(0, 100),
            matchText: query,
          });
        }
      });
    });

    return results;
  }, [query]);

  const filteredResults = useMemo<SearchResult[]>(() => {
    if (activeFilter === 'all') return searchResults;
    if (activeFilter === 'topics') return searchResults.filter((r) => r.type === 'chapter');
    return searchResults.filter((r) => r.type === 'verse');
  }, [searchResults, activeFilter]);

  const handleSearch = (searchTerm: string) => {
    haptics.light();
    setQuery(searchTerm);
    if (searchTerm.trim()) {
      setSearchHistory((prev) => {
        const filtered = prev.filter((t) => t !== searchTerm);
        return [searchTerm, ...filtered].slice(0, 10);
      });
    }
  };

  const handleResultPress = (result: SearchResult) => {
    haptics.medium();
    router.push(`/reading/${result.chapterId}`);
  };

  const isEmpty = query.trim() === '';

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
            {LOCAL_STRINGS.search}
          </AppText>
          <View className="w-11 h-11" />
        </HStack>

        <SearchBar
          value={query}
          onChangeText={handleSearch}
          onClear={() => setQuery('')}
          onSubmit={() => {}}
          placeholder={LOCAL_STRINGS.searchHint}
          autoFocus={false}
          showCancel={false}
          className="mb-4"
        />

        {/* ಫಿಲ್ಟರ್ ಚಿಪ್ಸ್ */}
        <View className="flex-row mb-5">
          {filterChips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={() => {
                haptics.selection();
                setActiveFilter(chip.key);
              }}
              className={clsx(
                'px-4 py-2 rounded-full mr-2 border',
                activeFilter === chip.key
                  ? 'bg-primary-default border-primary-default shadow-soft'
                  : 'bg-white border-border-strong',
              )}
            >
              <AppText
                variant="bodySmall"
                weight={activeFilter === chip.key ? 'semibold' : 'medium'}
                className={activeFilter === chip.key ? 'text-white' : 'text-text-muted'}
              >
                {chip.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {isEmpty && (
          <>
            <View className="mb-6">
              <HStack justify="space-between" className="mb-3">
                <AppText variant="title" weight="semibold">
                  ಜನಪ್ರಿಯ ಹುಡುಕಾಟಗಳು
                </AppText>
              </HStack>
              <View className="flex-row flex-wrap">
                {popularSearches.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => handleSearch(term)}
                    className="mr-2 mb-2 bg-background-soft rounded-xl px-4 py-2"
                  >
                    <AppText variant="bodySmall" color="muted" weight="medium">
                      {term}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            {searchHistory.length > 0 && (
              <View>
                <HStack justify="space-between" className="mb-3">
                  <AppText variant="title" weight="semibold">
                    ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳು
                  </AppText>
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      setSearchHistory([]);
                    }}
                  >
                    <AppText variant="bodySmall" color="primary" weight="semibold">
                      ತೆರವುಗೊಳಿಸಿ
                    </AppText>
                  </Pressable>
                </HStack>
                <View className="flex-col">
                  {searchHistory.slice(0, 5).map((term) => (
                    <Pressable
                      key={term}
                      onPress={() => handleSearch(term)}
                      className="flex-row items-center justify-between py-3 border-b border-border-light"
                    >
                      <HStack spacing="sm">
                        <Ionicons name="time-outline" size={16} color="#A88C74" />
                        <AppText variant="body">{term}</AppText>
                      </HStack>
                      <Ionicons name="arrow-redo-outline" size={16} color="#A88C74" />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View className="mt-8">
              <AppText variant="title" weight="semibold" className="mb-3">
                ವರ್ಗಗಳು
              </AppText>
              <VStack spacing="sm">
                {Object.entries(categoryColors).map(([category, config]) => {
                  const count = CHAPTERS.filter((c) => c.category === category).length;
                  return (
                    <Pressable
                      key={category}
                      onPress={() => handleSearch(category)}
                      className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-border-light shadow-soft"
                    >
                      <HStack spacing="sm">
                        <View className={clsx('w-11 h-11 rounded-xl items-center justify-center', config.bg)}>
                          <Ionicons name="book" size={20} color="#8A3324" />
                        </View>
                        <VStack spacing="xs">
                          <AppText variant="body" weight="semibold">
                            {category}
                          </AppText>
                          <AppText variant="caption" color="muted">
                            {toKannadaNumerals(count)} ಅಧ್ಯಾಯಗಳು
                          </AppText>
                        </VStack>
                      </HStack>
                      <Ionicons name="chevron-forward" size={18} color="#A88C74" />
                    </Pressable>
                  );
                })}
              </VStack>
            </View>
          </>
        )}
      </View>

      {!isEmpty && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 }}
        >
          {filteredResults.length > 0 ? (
            <>
              <HStack justify="space-between" className="mb-4">
                <AppText variant="title" weight="semibold">
                  {LOCAL_STRINGS.searchResults}
                </AppText>
                <View className="bg-primary-subtle rounded-xl px-3 py-1.5">
                  <AppText variant="caption" weight="bold" color="primary">
                    {toKannadaNumerals(filteredResults.length)}
                  </AppText>
                </View>
              </HStack>

              {filteredResults.map((result, idx) => (
                <Pressable
                  key={`${result.id}-${idx}`}
                  onPress={() => handleResultPress(result)}
                  className="mb-3"
                >
                  <View className="bg-white rounded-2xl p-4 border border-border-light shadow-soft">
                    <HStack spacing="sm" className="mb-3">
                      <View
                        className={clsx(
                          'w-10 h-10 rounded-xl items-center justify-center',
                          result.type === 'chapter'
                            ? 'bg-secondary-subtle'
                            : 'bg-primary-subtle',
                        )}
                      >
                        <Ionicons
                          name={result.type === 'chapter' ? 'book-outline' : 'document-text-outline'}
                          size={18}
                          color={result.type === 'chapter' ? '#B4832E' : '#8A3324'}
                        />
                      </View>
                      <VStack spacing="xs" className="flex-1">
                        <View className="flex-row items-center">
                          <AppText variant="caption" color="muted" weight="semibold" className="uppercase tracking-wide mr-2">
                            {result.type === 'chapter' ? 'ಅಧ್ಯಾಯ' : 'ಶ್ಲೋಕ'}
                          </AppText>
                          <View
                            className={clsx(
                              'rounded-md px-2 py-0.5',
                              categoryColors[
                                CHAPTERS.find((c) => c.id === result.chapterId)?.category || 'ಜ್ಞಾನ'
                              ]?.bg,
                            )}
                          >
                            <AppText
                              variant="caption"
                              weight="semibold"
                              className={
                                categoryColors[
                                  CHAPTERS.find((c) => c.id === result.chapterId)?.category || 'ಜ್ಞಾನ'
                                ]?.text
                              }
                            >
                              {CHAPTERS.find((c) => c.id === result.chapterId)?.category}
                            </AppText>
                          </View>
                        </View>
                        <AppText variant="body" weight="semibold" numberOfLines={1}>
                          {LOCAL_STRINGS.chapter} {toKannadaNumerals(result.chapterNumber || 0)} •{' '}
                          {result.chapterTitle}
                          {result.verseNumber &&
                            ` • ${LOCAL_STRINGS.verse} ${toKannadaNumerals(result.verseNumber)}`}
                        </AppText>
                      </VStack>
                    </HStack>

                    <AppText variant="bodySmall" color="muted" numberOfLines={3}>
                      {result.snippet}...
                    </AppText>
                  </View>
                </Pressable>
              ))}

              {/* ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ */}
              <Pressable
                onPress={() => {
                  haptics.light();
                  setActiveFilter('all');
                }}
                className="flex-row items-center justify-center py-4 mt-2"
              >
                <AppText variant="bodySmall" weight="bold" color="secondary-dark" className="mr-1.5">
                  {LOCAL_STRINGS.seeAllResults}
                </AppText>
                <Ionicons name="chevron-down" size={16} color="#8C6220" />
              </Pressable>
            </>
          ) : (
            <View className="items-center justify-center py-24">
              <View className="w-24 h-24 rounded-3xl bg-background-soft items-center justify-center mb-5">
                <Ionicons name="search-outline" size={40} color="#A88C74" />
              </View>
              <AppText variant="title" weight="semibold" align="center" className="mb-2">
                {LOCAL_STRINGS.noResults}
              </AppText>
              <AppText variant="body" color="muted" align="center" className="max-w-xs mb-6">
                \"{query}\" ಗಾಗಿ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ
              </AppText>
              <Pressable
                onPress={() => setQuery('')}
                className="bg-primary-default rounded-2xl px-6 py-3 shadow-soft"
              >
                <AppText variant="bodySmall" weight="semibold" color="inverted">
                  ಪುನರಾರಂಭಿಸಿ
                </AppText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {isEmpty && <View className="h-8" />}
    </ScreenContainer>
  );
}
