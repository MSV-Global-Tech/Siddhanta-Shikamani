export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  versesCount: number;
  readingTime: number;
  category: string;
  content: ChapterVerse[];
}

export interface ChapterVerse {
  id: string;
  verseNumber: number;
  sanskrit: string;
  translation: string;
  commentary: string;
}

export interface Bookmark {
  id: string;
  chapterId: string;
  verseId: string;
  chapterTitle: string;
  verseNumber: number;
  note: string;
  createdAt: number;
}

export interface ReadingProgress {
  chapterId: string;
  lastReadVerse: number;
  completed: boolean;
  readAt: number;
}

export interface Settings {
  fontSize: number;
  fontFamily: 'serif' | 'sans';
  showSanskrit: boolean;
  showTranslation: boolean;
  showCommentary: boolean;
  vibrationEnabled: boolean;
  autoSaveProgress: boolean;
}

export interface Profile {
  name: string;
  joinedDate: number;
  chaptersRead: number;
  totalVersesRead: number;
  readingStreak: number;
  totalReadingMinutes: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface SearchResult {
  type: 'chapter' | 'verse';
  id: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle: string;
  verseNumber?: number;
  snippet: string;
  matchText: string;
}
