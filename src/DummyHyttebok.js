import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import HytteHeader from './HytteHeader';

export default function DummyHyttebok({ t, onAdmin }) {
    const [innlegg, setInnlegg] = useState([]);
    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');
    const [hytteKey, setHytteKey] = useState('');
    const [tilgang, setTilgang] = useState(false);
    const [laster, setLaster] = useState(true);
    const [config, setConfig] = useState({});
    const [valgtVisning, setValgtVisning] = useState('meny'); // meny | vis | nytt

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
            setLaster(false);
        });

        return () => {
            unsubscribe();
            unsubscribeConfig();
        };
    }, []);

    const leggTilUtkast = async () => {
        if (!nyttTekst.trim()) {
            alert('Melding må fylles ut');
            return;
        }

        try {
            await addDoc(collection(db, 'innlegg'), {
                navn: nyttNavn.trim() || 'Anonym',
                tekst: nyttTekst.trim(),
                fraDato: null,
                tilDato: null,
                status: 'utkast',
                tidspunkt: serverTimestamp()
            });
            alert('Innlegg lagret som utkast. Publisering og datovalg kommer i neste steg.');
            setNyttNavn('');
            setNyttTekst('');
            setValgtVisning('vis');
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
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
                <button onClick={onAdmin} style={{ marginRight: '1rem' }}>Admin</button>
            </header>

            {tilgang ? (
                valgtVisning === 'meny' ? (
                    <div style={{ margin: '2rem auto', maxWidth: '500px' }}>
                        <h2>Hva ønsker du å gjøre?</h2>
                        <button onClick={() => setValgtVisning('vis')} style={{ margin: '0.5rem' }}>Se tidligere innlegg</button>
                        <button onClick={() => setValgtVisning('nytt')} style={{ margin: '0.5rem' }}>Skriv nytt innlegg</button>
                    </div>
                ) : valgtVisning === 'nytt' ? (
                    <div style={{ marginBottom: '2rem' }}>
                        <h2>Skriv nytt innlegg (utkast)</h2>
                        <input type="text" placeholder="Navn (valgfritt)" value={nyttNavn} onChange={(e) => setNyttNavn(e.target.value)}
                            style={{ width: '100%', maxWidth: '500px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }} />
                        <textarea placeholder="Skriv noe hyggelig..." value={nyttTekst} onChange={(e) => setNyttTekst(e.target.value)}
                            style={{ width: '100%', maxWidth: '500px', height: '100px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }}></textarea>
                        <button onClick={leggTilUtkast}
                            style={{ maxWidth: '500px', width: '100%', margin: '0 auto', display: 'block' }}>Lagre som utkast</button>
                    </div>
                ) : (
                    <>
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
                                        <small>Opphold: {item.fraDato || 'Ukjent'} - {item.tilDato || 'Ukjent'}</small>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )
            ) : (
                <div style={{ margin: '2rem auto', maxWidth: '500px', background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px' }}>
                    <p>{t('ikkeTilgang')}</p>
                </div>
            )}
        </div>
    );
}
