import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "DIN_API_KEY",
    authDomain: "DITT_PROSJEKT.firebaseapp.com",
    projectId: "DITT_PROSJEKT",
    storageBucket: "DITT_PROSJEKT.appspot.com",
    messagingSenderId: "XXXXXX",
    appId: "XXXXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
