import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABuda1kjdL0GhDdOOaH1kh9q5PUi2Ap_E",
  authDomain: "siddanthashikhamani.firebaseapp.com",
  projectId: "siddanthashikhamani",
  storageBucket: "siddanthashikhamani.firebasestorage.app",
  messagingSenderId: "239148815890",
  appId: "1:239148815890:web:165072d3844c93c9852acb",
  measurementId: "G-9VQZHM31KV"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export default app;
