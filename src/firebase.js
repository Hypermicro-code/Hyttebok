import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "DIN_API_KEY",
  authDomain: "hyttebok-bca8a.firebaseapp.com",
  projectId: "hyttebok-bca8a",
  storageBucket: "hyttebok-bca8a.firebasestorage.app", // KORREKT bucket
  messagingSenderId: "DIN_MESSAGING_ID",
  appId: "DIN_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
