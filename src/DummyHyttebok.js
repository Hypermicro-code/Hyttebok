import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, doc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import HytteHeader from './HytteHeader';

export default function DummyHyttebok({ t, onAdmin }) {
    const [innlegg, setInnlegg] = useState([]);
    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');
    const [hytteKey, setHytteKey] = useState('');
    const [tilgang, setTilgang] = useState(false);
    const [laster, setLaster] = useState(true);
    const [config, setConfig] = useState({
        bakgrunnsbilde: '',
        bakgrunnsfarge: '#ffffff',
        headerTekst: '',
        headerBilde: '',
        headerOpacity: 1,
        headerMode: 'cover'
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('hytteKey');
        setHytteKey(key);

        const unsubscribeConfig = onDocSnapshot(doc(db, 'config', 'hytte1'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setConfig({
                    bakgrunnsbilde: data.bakgrunnsbilde || '',
                    bakgrunnsfarge: data.bakgrunnsfarge || '#ffffff',
                    headerTekst: data.headerTekst || '',
                    headerBilde: data.headerBilde || '',
                    headerOpacity: data.headerOpacity !== undefined ? data.headerOpacity : 1,
                    headerMode: data.headerMode || 'cover'
                });
                if (key && key === data.hytteKey) {
                    setTilgang(true);
                }
            }
        });

        const unsubscribe = onSnapshot(query(collection(db, 'innlegg'), orderBy('tidspunkt', 'desc')), (snapshot) => {
            const innleggData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInnlegg(innleggData);
            setLaster(false);
        }, (error) => {
            console.error('Feil ved henting av innlegg:', error);
            setLaster(false);
        });

        return () => {
            unsubscribe();
            unsubscribeConfig();
        };
    }, []);

    const leggTilInnlegg = async () => {
        if (!nyttTekst.trim()) {
            alert(t('melding'));
            return;
        }

        try {
            await addDoc(collection(db, 'innlegg'), {
                navn: nyttNavn.trim() || 'Anonym',
                tekst: nyttTekst.trim(),
                tidspunkt: serverTimestamp()
            });
            setNyttNavn('');
            setNyttTekst('');
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: config.bakgrunnsfarge,
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
                <button onClick={onAdmin} style={{ marginRight: '1rem' }}>Admin</button>
            </header>

            {!tilgang && (
                <div style={{ margin: '2rem auto', maxWidth: '500px', background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px' }}>
                    <p>{t('ikkeTilgang')}</p>
                </div>
            )}

            {tilgang && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2>{t('skrivInnlegg')}</h2>
                    <input type="text" placeholder={t('navn')} value={nyttNavn} onChange={(e) => setNyttNavn(e.target.value)}
                        style={{ width: '100%', maxWidth: '500px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }} />
                    <textarea placeholder={t('melding')} value={nyttTekst} onChange={(e) => setNyttTekst(e.target.value)}
                        style={{ width: '100%', maxWidth: '500px', height: '100px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }}></textarea>
                    <button onClick={leggTilInnlegg}
                        style={{ maxWidth: '500px', width: '100%', margin: '0 auto', display: 'block' }}>{t('leggTil')}</button>
                </div>
            )}

            <h2>{t('tidligereInnlegg')}</h2>
            {laster ? (
                <p>{t('laster')}</p>
            ) : innlegg.length === 0 ? (
                <p>{t('ingenInnlegg')}</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, maxWidth: '600px', margin: 'auto' }}>
                    {innlegg.map(item => (
                        <li key={item.id} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px' }}>
                            <strong>{item.navn}</strong><br />
                            {item.tekst}<br />
                            <small>{item.tidspunkt?.toDate().toLocaleString() || 'Ukjent dato'}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
