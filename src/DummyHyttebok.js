import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function DummyHyttebok({ t }) {
    const [innlegg, setInnlegg] = useState([]);
    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');
    const [tillatNokkel, setTillatNokkel] = useState('');
    const [harTilgang, setHarTilgang] = useState(false);
    const [nokkellastet, setNokkellastet] = useState(false);

    useEffect(() => {
        const hentNokkel = async () => {
            try {
                const docRef = doc(db, 'config', 'hytte1');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const lagretNokkel = docSnap.data().hytteKey;
                    setTillatNokkel(lagretNokkel);
                } else {
                    console.warn('Ingen nøkkel lagret i Firestore');
                }
            } catch (error) {
                console.error('Feil ved henting av nøkkel:', error);
            } finally {
                setNokkellastet(true);
            }
        };
        hentNokkel();

        const q = query(collection(db, 'innlegg'), orderBy('opprettet', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInnlegg(data);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (tillatNokkel) {
            const params = new URLSearchParams(window.location.search);
            const hytteKey = params.get('hytteKey');
            if (hytteKey === tillatNokkel) {
                setHarTilgang(true);
            } else {
                setHarTilgang(false);
            }
        }
    }, [tillatNokkel]);

    const leggTilInnlegg = async () => {
        if (!nyttTekst.trim()) {
            alert(t('melding'));
            return;
        }
        try {
            await addDoc(collection(db, 'innlegg'), {
                navn: nyttNavn || 'Gjest',
                tekst: nyttTekst,
                opprettet: serverTimestamp(),
                hytteKey: tillatNokkel
            });
            setNyttNavn('');
            setNyttTekst('');
        } catch (error) {
            alert('Kunne ikke lagre innlegg: ' + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>{t('velkommen')}</h1>

            {!nokkellastet ? (
                <p>{t('laster')}</p>
            ) : harTilgang ? (
                <>
                    <h3>{t('skrivInnlegg')}</h3>
                    <input
                        type="text"
                        placeholder={t('navn')}
                        value={nyttNavn}
                        onChange={(e) => setNyttNavn(e.target.value)}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                    <textarea
                        placeholder={t('melding')}
                        value={nyttTekst}
                        onChange={(e) => setNyttTekst(e.target.value)}
                        style={{ width: '100%', height: '100px' }}
                    ></textarea>
                    <button onClick={leggTilInnlegg} style={{ marginTop: '0.5rem' }}>{t('leggTil')}</button>
                </>
            ) : (
                <p><strong>{t('ikkeTilgang')}</strong></p>
            )}

            <h3>{t('tidligereInnlegg')}</h3>
            {innlegg.length === 0 ? (
                <p>{t('ingenInnlegg')}</p>
            ) : (
                <ul>
                    {innlegg.map((innlegg) => (
                        <li key={innlegg.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
                            <strong>{innlegg.navn}</strong> ({innlegg.opprettet?.seconds ? new Date(innlegg.opprettet.seconds * 1000).toLocaleDateString() : 'Ukjent dato'}):<br />
                            {innlegg.tekst}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
