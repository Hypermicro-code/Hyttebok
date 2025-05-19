import React, { useState, useEffect } from 'react';
import {
    collection, query, onSnapshot, addDoc, updateDoc, doc,
    serverTimestamp, orderBy, onSnapshot as onDocSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import HytteHeader from './HytteHeader';

export default function DummyHyttebok({ t, onAdmin }) {
    const [innlegg, setInnlegg] = useState([]);
    const [utkast, setUtkast] = useState([]);
    const [hytteKey, setHytteKey] = useState('');
    const [tilgang, setTilgang] = useState(false);
    const [laster, setLaster] = useState(true);
    const [config, setConfig] = useState({});
    const [valgtVisning, setValgtVisning] = useState('meny');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('hytteKey');
        setHytteKey(key);

        const unsubscribeConfig = onDocSnapshot(doc(db, 'config', 'hytte1'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setConfig(data);
                if (key && key === data.hytteKey) {
                    setTilgang(true);
                }
            }
        });

        const unsubscribe = onSnapshot(query(collection(db, 'innlegg'), orderBy('fraDato', 'desc')), (snapshot) => {
            const innleggData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInnlegg(innleggData.filter(i => i.status === 'publisert'));
            setUtkast(innleggData.filter(i => i.status === 'utkast'));
            setLaster(false);
        });

        return () => {
            unsubscribe();
            unsubscribeConfig();
        };
    }, []);

    const formatDato = (datoStr) => {
        if (!datoStr) return 'Ukjent dato';
        const [y, m, d] = datoStr.split('-');
        return config.språk === 'no' ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: config.bakgrunnsfarge || '#ffffff',
            backgroundImage: config.bakgrunnsbilde ? `url(${config.bakgrunnsbilde})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1rem',
            textAlign: 'center'
        }}>
            <HytteHeader
                headerTekst={config.headerTekst}
                headerBilde={config.headerBilde}
                headerOpacity={config.headerOpacity}
                headerMode={config.headerMode}
            />

            <header style={{ marginBottom: '2rem' }}>
                <button onClick={onAdmin}>Admin</button>
            </header>

            <h2>{t('tidligereInnlegg')}</h2>
            {laster ? (
                <p>{t('laster')}</p>
            ) : innlegg.length === 0 ? (
                <p>{t('ingenInnlegg')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, maxWidth: '600px', margin: 'auto' }}>
                    {innlegg.map(item => (
                        <li key={item.id} style={{
                            marginBottom: '1rem',
                            background: 'rgba(255,255,255,0.8)',
                            padding: '1rem',
                            borderRadius: '8px'
                        }}>
                            <strong>{item.navn}</strong><br />
                            <small>Opphold: {formatDato(item.fraDato)} - {formatDato(item.tilDato)}</small><br />
                            <div style={{ marginTop: '0.5rem' }}>
                                {item.tekst}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
