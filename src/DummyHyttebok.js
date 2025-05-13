import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, doc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function DummyHyttebok({ t }) {
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
            }
        });

        if (!key) {
            setTilgang(false);
            setLaster(false);
            return () => unsubscribeConfig();
        }

        const unsubscribe = onSnapshot(query(collection(db, 'innlegg'), orderBy('tidspunkt', 'desc')), (snapshot) => {
            const innleggData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInnlegg(innleggData);
            setTilgang(true);
            setLaster(false);
        }, (error) => {
            console.error('Feil ved henting av innlegg:', error);
            setTilgang(false);
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

    if (laster) return <p>{t('laster')}</p>;
    if (!tilgang) return <p>{t('ikkeTilgang')}</p>;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: bakgrunnsfarge,
            backgroundImage: bakgrunnsbilde ? `url(${bakgrunnsbilde})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '1rem'
        }}>
            <h1>{t('velkommen')}</h1>
            <h2>{t('skrivInnlegg')}</h2>
            <input type="text" placeholder={t('navn')} value={nyttNavn} onChange={(e) => setNyttNavn(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
            <textarea placeholder={t('melding')} value={nyttTekst} onChange={(e) => setNyttTekst(e.target.value)} style={{ width: '100%', height: '100px', marginBottom: '0.5rem' }}></textarea>
            <button onClick={leggTilInnlegg}>{t('leggTil')}</button>

            <h2>{t('tidligereInnlegg')}</h2>
            {innlegg.length === 0 ? (
                <p>{t('ingenInnlegg')}</p>
            ) : (
                <ul>
                    {innlegg.map(item => (
                        <li key={item.id}>
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
