import React, { useEffect, useState } from 'react';
import DummyHyttebok from './DummyHyttebok';
import AdminQRConfig from './AdminQRConfig';
import no from './lang/no';
import en from './lang/en';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [visAdmin, setVisAdmin] = useState(false);
  const [språk, setSpråk] = useState('no');
  const [t, setT] = useState(() => (key) => key); // fallback t()

  useEffect(() => {
    const hentSpråk = async () => {
      const snap = await getDoc(doc(db, 'config', 'hytte1'));
      if (snap.exists()) {
        const data = snap.data();
        const valgtSpråk = data?.språk || 'no';
        setSpråk(valgtSpråk);
        const valgtT = valgtSpråk === 'en' ? en : no;
        setT(() => (key) => valgtT[key] || key);
      }
    };
    hentSpråk();
  }, []);

  return visAdmin
    ? <AdminQRConfig t={t} tilbake={() => setVisAdmin(false)} />
    : <DummyHyttebok t={t} onAdmin={() => setVisAdmin(true)} />;
}
