import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQNEjM_6rQvKaeMbcIyd6hGmIynqcW7wQ",
  authDomain: "hyttebok-bca8a.firebaseapp.com",
  projectId: "hyttebok-bca8a",
  storageBucket: "hyttebok-bca8a.firebasestorage.app",
  messagingSenderId: "170937664052",
  appId: "1:170937664052:web:1837c49267453c25d6c061"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
