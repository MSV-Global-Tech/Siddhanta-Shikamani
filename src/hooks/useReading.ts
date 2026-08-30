import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CHAPTERS } from '@/data/chapters';
import { checkRemoteChapterHotfix, getLocalChapterOverrides } from '@/services/firestoreService';
import type { Chapter } from '@/types';
import { haptics } from '@/utils';

export function useReading(chapterId: string) {
  const baseChapter = CHAPTERS.find((c) => c.id === chapterId) || null;
  const [chapter, setChapter] = useState<Chapter | null>(baseChapter);

  useEffect(() => {
    // 1. Immediate sync with bundled code
    const bundled = CHAPTERS.find((c) => c.id === chapterId) || null;
    setChapter(bundled);

    let isMounted = true;

    // 2. Check cached local admin overrides
    getLocalChapterOverrides().then((overrides) => {
      if (isMounted && overrides[chapterId]) {
        setChapter(overrides[chapterId]);
      }
    });

    // 3. Background check Firestore for live hotfix
    checkRemoteChapterHotfix(chapterId).then((hotfix) => {
      if (isMounted && hotfix) {
        setChapter(hotfix);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [chapterId]);

  const progress = useAppStore((state) => state.getReadingProgress(chapterId));
  const updateProgress = useAppStore((state) => state.updateReadingProgress);
  const addRecent = useAppStore((state) => state.addRecentChapter);
  const incrementVerses = useAppStore((state) => state.incrementVersesRead);
  const autoSave = useAppStore((state) => state.settings.autoSaveProgress);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(
    chapter ? Math.max(0, (progress?.lastReadVerse || 1) - 1) : 0
  );

  const totalVerses = chapter?.content.length || 0;
  const currentVerse = chapter?.content[currentVerseIndex];

  if (!chapter) {
    return {
      chapter: null as Chapter | null,
      currentVerse: null,
      currentVerseIndex: 0,
      totalVerses: 0,
      progress: 0,
      next: () => {},
      previous: () => {},
      onVerseViewed: () => {},
    };
  }

  const handleProgressUpdate = useCallback(
    (verseIndex: number) => {
      const verseNumber = verseIndex + 1;
      if (autoSave) {
        updateProgress(chapterId, verseNumber, verseIndex >= totalVerses - 1);
      }
      if (verseIndex === (progress?.lastReadVerse || 0)) {
        incrementVerses();
      }
      addRecent(chapterId);
    },
    [chapterId, autoSave, updateProgress, addRecent, incrementVerses, progress?.lastReadVerse, totalVerses]
  );

  const onVerseViewed = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalVerses - 1));
      setCurrentVerseIndex(clamped);
      handleProgressUpdate(clamped);
    },
    [totalVerses, handleProgressUpdate]
  );

  const completedVerses = progress?.completed
    ? totalVerses
    : progress?.lastReadVerse || 0;

  const calculatedProgress = Math.min(100, Math.round((completedVerses / totalVerses) * 100));

  return {
    chapter,
    currentVerse,
    currentVerseIndex,
    totalVerses,
    progress: calculatedProgress,
    onVerseViewed,
  };
}
