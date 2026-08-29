import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, writeBatch } from 'firebase/firestore';

// Import all parichheda data
import { parichheda1Chapters } from '../src/data/parichheda1';
import { parichheda2Chapters } from '../src/data/parichheda2';
import { parichheda3Chapters } from '../src/data/parichheda3';
import { parichheda4Chapters } from '../src/data/parichheda4';
import { parichheda5Chapters } from '../src/data/parichheda5';
import { parichheda6Chapters } from '../src/data/parichheda6';
import { parichheda7Chapters } from '../src/data/parichheda7';
import { parichheda8Chapters } from '../src/data/parichheda8';
import { parichheda9Chapters } from '../src/data/parichheda9';
import { parichheda10Chapters } from '../src/data/parichheda10';
import { parichheda11Chapters } from '../src/data/parichheda11';
import { parichheda12Chapters } from '../src/data/parichheda12';
import { parichheda13Chapters } from '../src/data/parichheda13';
import { parichheda14Chapters } from '../src/data/parichheda14';
import { parichheda15Chapters } from '../src/data/parichheda15';
import { parichheda16Chapters } from '../src/data/parichheda16';
import { parichheda17Chapters } from '../src/data/parichheda17';
import { parichheda18Chapters } from '../src/data/parichheda18';
import { parichheda19Chapters } from '../src/data/parichheda19';
import { parichheda20Chapters } from '../src/data/parichheda20';
import { parichheda21Chapters } from '../src/data/parichheda21';

const firebaseConfig = {
  apiKey: "AIzaSyABuda1kjdL0GhDdOOaH1kh9q5PUi2Ap_E",
  authDomain: "siddanthashikhamani.firebaseapp.com",
  projectId: "siddanthashikhamani",
  storageBucket: "siddanthashikhamani.firebasestorage.app",
  messagingSenderId: "239148815890",
  appId: "1:239148815890:web:165072d3844c93c9852acb",
  measurementId: "G-9VQZHM31KV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const allChapters = [
  ...parichheda1Chapters,
  ...parichheda2Chapters,
  ...parichheda3Chapters,
  ...parichheda4Chapters,
  ...parichheda5Chapters,
  ...parichheda6Chapters,
  ...parichheda7Chapters,
  ...parichheda8Chapters,
  ...parichheda9Chapters,
  ...parichheda10Chapters,
  ...parichheda11Chapters,
  ...parichheda12Chapters,
  ...parichheda13Chapters,
  ...parichheda14Chapters,
  ...parichheda15Chapters,
  ...parichheda16Chapters,
  ...parichheda17Chapters,
  ...parichheda18Chapters,
  ...parichheda19Chapters,
  ...parichheda20Chapters,
  ...parichheda21Chapters,
];

async function uploadData() {
  console.log('========================================================');
  console.log(`Starting migration of ${allChapters.length} chapters to Firestore...`);
  console.log(`Target Project: ${firebaseConfig.projectId}`);
  console.log('========================================================\n');

  let successCount = 0;
  let totalVerses = 0;

  for (let i = 0; i < allChapters.length; i++) {
    const ch = allChapters[i];
    const docRef = doc(db, 'chapters', ch.id);
    
    // Clean undefined fields if any
    const payload = JSON.parse(JSON.stringify({
      ...ch,
      uploadedAt: new Date().toISOString(),
    }));

    try {
      await setDoc(docRef, payload);
      successCount++;
      totalVerses += (ch.content?.length || ch.versesCount || 0);
      console.log(`[${i + 1}/${allChapters.length}] Uploaded: ${ch.id} - ${ch.title} (${ch.versesCount} verses)`);
    } catch (err) {
      console.error(`FAILED to upload ${ch.id}:`, err);
    }
  }

  // Upload metadata summary document
  try {
    const metaRef = doc(db, 'metadata', 'overview');
    await setDoc(metaRef, {
      totalChapters: allChapters.length,
      totalParichhedas: 21,
      totalVerses: totalVerses,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    });
    console.log('\nUploaded metadata overview document to metadata/overview');
  } catch (err: any) {
    console.warn('Metadata upload notice:', err?.message || err);
  }

  console.log('\n========================================================');
  console.log(`Migration Complete!`);
  console.log(`Successfully uploaded: ${successCount} / ${allChapters.length} chapters`);
  console.log(`Total verses processed: ${totalVerses}`);
  console.log('========================================================\n');
}

uploadData()
  .then(() => {
    console.log('All operations finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error during migration:', err);
    process.exit(1);
  });
