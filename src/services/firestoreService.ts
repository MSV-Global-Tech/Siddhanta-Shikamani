import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Chapter, ChapterVerse } from '@/types';
import { CHAPTERS as LOCAL_CHAPTERS } from '@/data/chapters';
import { storage } from './storage';

const CHAPTERS_COLLECTION = 'chapters';
const OVERRIDES_KEY = '@siddhanta_custom_chapters';

/**
 * Fetch all custom locally overridden chapters.
 */
export async function getLocalChapterOverrides(): Promise<Record<string, Chapter>> {
  try {
    const data = await storage.getJSON<Record<string, Chapter>>(OVERRIDES_KEY);
    return data || {};
  } catch {
    return {};
  }
}

/**
 * Fetch all chapters from Firestore with automatic fallback to local bundled data.
 */
export async function getChapters(): Promise<Chapter[]> {
  try {
    const chaptersQuery = query(collection(db, CHAPTERS_COLLECTION), orderBy('number', 'asc'));
    const snapshot = await getDocs(chaptersQuery);

    if (snapshot.empty) {
      console.warn('No chapters found in Firestore, using bundled local data.');
      return LOCAL_CHAPTERS;
    }

    const remoteChapters: Chapter[] = [];
    snapshot.forEach((docSnap) => {
      remoteChapters.push(docSnap.data() as Chapter);
    });

    return remoteChapters.sort((a, b) => a.number - b.number);
  } catch (error) {
    console.error('Failed to fetch chapters from Firestore, falling back to local data:', error);
    return LOCAL_CHAPTERS;
  }
}

/**
 * Fetch a single chapter by ID from Firestore with fallback to local bundled data.
 */
export async function getChapterById(chapterId: string): Promise<Chapter | null> {
  try {
    // 1. Fetch from Firestore for latest admin updates
    const docRef = doc(db, CHAPTERS_COLLECTION, chapterId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Chapter;
      // Cache locally on user's device for fast subsequent offline reading
      try {
        const overrides = await getLocalChapterOverrides();
        overrides[chapterId] = data;
        await storage.setJSON(OVERRIDES_KEY, overrides);
      } catch {}
      return data;
    }

    // 2. If not found in remote doc, check local overrides/cache
    const overrides = await getLocalChapterOverrides();
    if (overrides[chapterId]) {
      return overrides[chapterId];
    }

    // 3. Fallback to bundled local data
    const local = LOCAL_CHAPTERS.find((c) => c.id === chapterId);
    return local || null;
  } catch (error) {
    // Network offline or error: load from local cache first, then bundled
    try {
      const overrides = await getLocalChapterOverrides();
      if (overrides[chapterId]) {
        return overrides[chapterId];
      }
    } catch {}
    const local = LOCAL_CHAPTERS.find((c) => c.id === chapterId);
    return local || null;
  }
}

/**
 * Save / Update a chapter to Firestore and local storage.
 */
export async function saveChapterToFirestore(chapter: Chapter): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save to local overrides for instant offline availability
    const overrides = await getLocalChapterOverrides();
    overrides[chapter.id] = chapter;
    await storage.setJSON(OVERRIDES_KEY, overrides);

    // 2. Upload cleanly to Firestore
    const docRef = doc(db, CHAPTERS_COLLECTION, chapter.id);
    const payload = JSON.parse(JSON.stringify({
      ...chapter,
      versesCount: chapter.content.length,
      updatedAt: new Date().toISOString(),
    }));

    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error(`Error saving chapter ${chapter.id} to Firestore:`, error);
    return {
      success: false,
      error: error?.message || 'Failed to save to Firestore. Saved locally only.',
    };
  }
}

/**
 * Save chapter locally only.
 */
export async function saveChapterLocally(chapter: Chapter): Promise<boolean> {
  try {
    const overrides = await getLocalChapterOverrides();
    overrides[chapter.id] = {
      ...chapter,
      versesCount: chapter.content.length,
    };
    await storage.setJSON(OVERRIDES_KEY, overrides);
    return true;
  } catch (error) {
    console.error('Error saving chapter locally:', error);
    return false;
  }
}

