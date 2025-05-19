import React, { useEffect, useState } from 'react';
import DummyHyttebok from './DummyHyttebok';
import AdminQRConfig from './AdminQRConfig';
import no from './lang/no';
import en from './lang/en';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [visAdmin, setVisAdmin] = useState(false);
  const [t, setT] = useState(() => (key) => key); // fallback inntil lastet

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'hytte1'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const valgtSpråk = data?.språk || 'no';
        const valgtT = valgtSpråk === 'en' ? en : no;
        setT(() => (key) => valgtT[key] || key);
      }
    });

    return () => unsubscribe();
  }, []);

  return visAdmin
    ? <AdminQRConfig t={t} tilbake={() => setVisAdmin(false)} />
    : <DummyHyttebok t={t} onAdmin={() => setVisAdmin(true)} />;
}
