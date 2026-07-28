import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Bookmark, ReadingProgress, Settings, Profile, Achievement } from '@/types';
import { storage, CANTO_KEYS } from '@/services/storage';
import { generateId } from '@/utils';

const defaultSettings: Settings = {
  fontSize: 17,
  fontFamily: 'serif',
  showSanskrit: true,
  showTranslation: true,
  showCommentary: true,
  vibrationEnabled: true,
  autoSaveProgress: true,
};

const defaultAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'ಪ್ರಥಮ ಸ್ಪರ್ಶ',
    description: 'ಮೊದಲ ಅಧ್ಯಾಯವನ್ನು ಪ್ರಾರಂಭಿಸಿ',
    icon: 'book-outline',
    unlocked: false,
  },
  {
    id: 'ach-2',
    title: 'ಜ್ಞಾನ ಪ್ರಯಾಣಿಕ',
    description: '5 ಅಧ್ಯಾಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
    icon: 'trophy-outline',
    unlocked: false,
  },
  {
    id: 'ach-3',
    title: 'ಶ್ಲೋಕ ಸಾರಥಿ',
    description: '100 ಶ್ಲೋಕಗಳನ್ನು ಓದಿ',
    icon: 'star',
    unlocked: false,
  },
  {
    id: 'ach-4',
    title: 'ನಿರಂತರ ವಾಚಕ',
    description: '7 ದಿನಗಳ ಸಾಲು ಕಾಪಾಡಿ',
    icon: 'flame',
    unlocked: false,
  },
  {
    id: 'ach-5',
    title: 'ಬುಕ್ಮಾರ್ಕ್ ಪ್ರೇಮಿ',
    description: '10 ಬುಕ್ಮಾರ್ಕ್‌ಗಳನ್ನು ಸೇರಿಸಿ',
    icon: 'bookmark',
    unlocked: false,
  },
  {
    id: 'ach-6',
    title: 'ಪರಮ ಜ್ಞಾನಿ',
    description: 'ಎಲ್ಲಾ ಅಧ್ಯಾಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
    icon: 'ribbon-outline',
    unlocked: false,
  },
];

export const defaultProfile: Profile = {
  name: 'ಪ್ರಿಯ ವಾಚಕ',
  joinedDate: Date.now(),
  chaptersRead: 0,
  totalVersesRead: 0,
  readingStreak: 0,
  totalReadingMinutes: 0,
  achievements: [...defaultAchievements],
};

interface AppState {
  settings: Settings;
  bookmarks: Bookmark[];
  readingProgress: ReadingProgress[];
  profile: Profile;
  recentChapters: string[];

  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;

  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (chapterId: string, verseId: string) => boolean;
  clearBookmarks: () => void;

  updateReadingProgress: (chapterId: string, lastReadVerse: number, completed: boolean) => void;
  getReadingProgress: (chapterId: string) => ReadingProgress | undefined;

  addRecentChapter: (chapterId: string) => void;
  clearRecentChapters: () => void;

  updateProfile: (updates: Partial<Profile>) => void;
  incrementVersesRead: (count?: number) => void;
  incrementReadingTime: (minutes: number) => void;
  checkAchievements: () => void;
  unlockAchievement: (id: string) => void;

  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: { ...defaultSettings },
      bookmarks: [],
      readingProgress: [],
      profile: { ...defaultProfile },
      recentChapters: [],

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () =>
        set(() => ({
          settings: { ...defaultSettings },
        })),

      addBookmark: (bookmarkData) => {
        const exists = get().bookmarks.some(
          (b) => b.chapterId === bookmarkData.chapterId && b.verseId === bookmarkData.verseId
        );
        if (exists) return;

        const newBookmark: Bookmark = {
          ...bookmarkData,
          id: generateId(),
          createdAt: Date.now(),
        };

        set((state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
        }));
        get().checkAchievements();
      },

      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),

      isBookmarked: (chapterId, verseId) =>
        get().bookmarks.some((b) => b.chapterId === chapterId && b.verseId === verseId),

      clearBookmarks: () => set(() => ({ bookmarks: [] })),

      updateReadingProgress: (chapterId, lastReadVerse, completed) => {
        const existing = get().readingProgress.find((p) => p.chapterId === chapterId);

        if (existing) {
          set((state) => ({
            readingProgress: state.readingProgress.map((p) =>
              p.chapterId === chapterId
                ? {
                    ...p,
                    lastReadVerse: Math.max(p.lastReadVerse, lastReadVerse),
                    completed: p.completed || completed,
                    readAt: Date.now(),
                  }
                : p
            ),
          }));
        } else {
          const newProgress: ReadingProgress = {
            chapterId,
            lastReadVerse,
            completed,
            readAt: Date.now(),
          };
          set((state) => ({
            readingProgress: [...state.readingProgress, newProgress],
          }));

          const currentProfile = get().profile;
          if (currentProfile.chaptersRead === 0) {
            set((state) => ({
              profile: {
                ...state.profile,
                chaptersRead: 1,
              },
            }));
          }
        }

        if (completed) {
          set((state) => ({
            profile: {
              ...state.profile,
              chaptersRead: state.profile.chaptersRead + (existing?.completed ? 0 : 1),
            },
          }));
        }

        get().checkAchievements();
      },

      getReadingProgress: (chapterId) =>
        get().readingProgress.find((p) => p.chapterId === chapterId),

      addRecentChapter: (chapterId) =>
        set((state) => {
          const filtered = state.recentChapters.filter((id) => id !== chapterId);
          return {
            recentChapters: [chapterId, ...filtered].slice(0, 5),
          };
        }),

      clearRecentChapters: () => set(() => ({ recentChapters: [] })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      incrementVersesRead: (count = 1) => {
        set((state) => ({
          profile: {
            ...state.profile,
            totalVersesRead: state.profile.totalVersesRead + count,
          },
        }));
        get().checkAchievements();
      },

      incrementReadingTime: (minutes) =>
        set((state) => ({
          profile: {
            ...state.profile,
            totalReadingMinutes: state.profile.totalReadingMinutes + minutes,
          },
        })),

      unlockAchievement: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            achievements: state.profile.achievements.map((a) =>
              a.id === id && !a.unlocked
                ? { ...a, unlocked: true, unlockedAt: Date.now() }
                : a
            ),
          },
        })),

      checkAchievements: () => {
        const state = get();
        const { profile, bookmarks } = state;
        const unlocked: string[] = [];

        if (profile.chaptersRead >= 1) unlocked.push('ach-1');
        if (profile.chaptersRead >= 5) unlocked.push('ach-2');
        if (profile.totalVersesRead >= 100) unlocked.push('ach-3');
        if (profile.readingStreak >= 7) unlocked.push('ach-4');
        if (bookmarks.length >= 10) unlocked.push('ach-5');

        const uniqueChapters = new Set(
          state.readingProgress.filter((p) => p.completed).map((p) => p.chapterId)
        );
        if (uniqueChapters.size >= 8) unlocked.push('ach-6');

        if (unlocked.length > 0) {
          set((st) => ({
            profile: {
              ...st.profile,
              achievements: st.profile.achievements.map((a) =>
                unlocked.includes(a.id) && !a.unlocked
                  ? { ...a, unlocked: true, unlockedAt: Date.now() }
                  : a
              ),
            },
          }));
        }
      },

      resetAllData: () =>
        set(() => ({
          settings: { ...defaultSettings },
          bookmarks: [],
          readingProgress: [],
          profile: { ...defaultProfile },
          recentChapters: [],
        })),
    }),
    {
      name: 'siddhanta-shikamani-store-v1',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        settings: state.settings,
        bookmarks: state.bookmarks,
        readingProgress: state.readingProgress,
        profile: state.profile,
        recentChapters: state.recentChapters,
      }),
    }
  )
);
