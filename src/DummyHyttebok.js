import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, doc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function DummyHyttebok({ t, onAdmin }) {
    const [innlegg, setInnlegg] = useState([]);
    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');
    const [hytteKey, setHytteKey] = useState('');
    const [tilgang, setTilgang] = useState(false);
    const [laster, setLaster] = useState(true);
    const [bakgrunnsbilde, setBakgrunnsbilde] = useState('');
    const [bakgrunnsfarge, setBakgrunnsfarge] = useState('#ffffff');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('hytteKey');
        setHytteKey(key);

        const unsubscribeConfig = onDocSnapshot(doc(db, 'config', 'hytte1'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBakgrunnsbilde(data.bakgrunnsbilde || '');
                setBakgrunnsfarge(data.bakgrunnsfarge || '#ffffff');
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
            backgroundColor: bakgrunnsfarge,
            backgroundImage: bakgrunnsbilde ? `url(${bakgrunnsbilde})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1rem',
            textAlign: 'center'
        }}>
            <header style={{ marginBottom: '2rem' }}>
                <button onClick={onAdmin} style={{ marginRight: '1rem' }}>Admin</button>
                {/* Språkvalg kunne legges her ved behov */}
            </header>

            <h1>{t('velkommen')}</h1>

            {!tilgang && (
                <div style={{ margin: '2rem auto', maxWidth: '500px', background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px' }}>
                    <p>{t('ikkeTilgang')}</p>
                </div>
            )}

            {tilgang && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2>{t('skrivInnlegg')}</h2>
                    <input type="text" placeholder={t('navn')} value={nyttNavn} onChange={(e) => setNyttNavn(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
                    <textarea placeholder={t('melding')} value={nyttTekst} onChange={(e) => setNyttTekst(e.target.value)} style={{ width: '100%', height: '100px', marginBottom: '0.5rem' }}></textarea>
                    <button onClick={leggTilInnlegg}>{t('leggTil')}</button>
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
