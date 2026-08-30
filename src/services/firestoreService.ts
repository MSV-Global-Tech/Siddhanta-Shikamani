import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Chapter, ChapterVerse } from '@/types';
import { CHAPTERS as LOCAL_CHAPTERS } from '@/data/chapters';
import { storage } from './storage';

const CHAPTERS_COLLECTION = 'chapters';
const OVERRIDES_KEY = '@siddhanta_admin_overrides_v2';

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
 * Fetch all chapters with bundled local data as primary source of truth,
 * merged with any custom in-app admin overrides.
 */
export async function getChapters(): Promise<Chapter[]> {
  try {
    const overrides = await getLocalChapterOverrides();
    return LOCAL_CHAPTERS.map((ch) => overrides[ch.id] || ch);
  } catch (error) {
    return LOCAL_CHAPTERS;
  }
}

/**
 * Fetch a single chapter by ID with bundled local data as primary,
 * falling back to local admin overrides if available.
 */
export async function getChapterById(chapterId: string): Promise<Chapter | null> {
  try {
    // 1. Check if user made custom edits via in-app Admin
    const overrides = await getLocalChapterOverrides();
    if (overrides[chapterId]) {
      return overrides[chapterId];
    }

    // 2. Return latest bundled local code (source of truth for code edits)
    const local = LOCAL_CHAPTERS.find((c) => c.id === chapterId);
    return local || null;
  } catch (error) {
    const local = LOCAL_CHAPTERS.find((c) => c.id === chapterId);
    return local || null;
  }
}

/**
 * Save / Update a single chapter to Firestore as an active remote hotfix.
 */
export async function saveChapterToFirestore(chapter: Chapter): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = JSON.parse(JSON.stringify({
      ...chapter,
      versesCount: chapter.content.length,
      isRemoteEdit: true,
      updatedAt: new Date().toISOString(),
    }));

    // 1. Save to local overrides for instant offline availability
    const overrides = await getLocalChapterOverrides();
    overrides[chapter.id] = payload;
    await storage.setJSON(OVERRIDES_KEY, overrides);

    // 2. Upload cleanly to Firestore
    const docRef = doc(db, CHAPTERS_COLLECTION, chapter.id);
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
 * Upload all 21 local code chapters to Firestore in batches.
 * Synchronizes the entire local codebase with Firebase.
 */
export async function syncAllChaptersToFirestore(
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let successCount = 0;
    const total = LOCAL_CHAPTERS.length;

    for (let i = 0; i < total; i++) {
      const chapter = LOCAL_CHAPTERS[i];
      const docRef = doc(db, CHAPTERS_COLLECTION, chapter.id);
      const payload = JSON.parse(JSON.stringify({
        ...chapter,
        versesCount: chapter.content.length,
        isRemoteEdit: false,
        updatedAt: new Date().toISOString(),
      }));

      await setDoc(docRef, payload, { merge: true });
      successCount++;
      if (onProgress) {
        onProgress(successCount, total);
      }
    }

    return { success: true, count: successCount };
  } catch (error: any) {
    console.error('Failed to sync all chapters to Firestore:', error);
    return {
      success: false,
      count: 0,
      error: error?.message || 'Failed to sync to Firestore',
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

/**
 * Background check if a specific chapter has a remote hotfix on Firestore.
 */
export async function checkRemoteChapterHotfix(chapterId: string): Promise<Chapter | null> {
  try {
    const docRef = doc(db, CHAPTERS_COLLECTION, chapterId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Chapter & { isRemoteEdit?: boolean };
      if (data.isRemoteEdit) {
        // Cache this hotfix locally for offline reading
        try {
          const overrides = await getLocalChapterOverrides();
          overrides[chapterId] = data;
          await storage.setJSON(OVERRIDES_KEY, overrides);
        } catch {}
        return data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

