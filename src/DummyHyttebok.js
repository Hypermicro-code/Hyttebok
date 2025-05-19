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

    const leggTilUtkast = async (navn, tekst, fraDato, tilDato) => {
        if (!tekst.trim()) {
            alert(t('melding'));
            return;
        }

        try {
            await addDoc(collection(db, 'innlegg'), {
                navn: navn.trim() || 'Anonym',
                tekst: tekst.trim(),
                fraDato: fraDato || '',
                tilDato: tilDato || '',
                status: 'utkast',
                tidspunkt: serverTimestamp()
            });
            alert('Innlegg lagret som utkast.');
            setValgtVisning('utkast');
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    const lagreEndringerUtkast = async (item) => {
        try {
            const ref = doc(db, 'innlegg', item.id);
            await updateDoc(ref, {
                navn: item.navn,
                tekst: item.tekst,
                fraDato: item.fraDato,
                tilDato: item.tilDato
            });
            alert('Endringer lagret.');
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    const publiserInnlegg = async (item) => {
        try {
            const ref = doc(db, 'innlegg', item.id);
            await updateDoc(ref, {
                status: 'publisert'
            });
            alert('Innlegg publisert.');
            setValgtVisning('vis');
        } catch (error) {
            alert('Feil ved publisering: ' + error.message);
        }
    };

    const redigerFelt = (id, felt, verdi) => {
        setUtkast(utkast.map(u => u.id === id ? { ...u, [felt]: verdi } : u));
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

            {tilgang ? (
                valgtVisning === 'meny' ? (
                    <div style={{ margin: '2rem auto', maxWidth: '500px' }}>
                        <h2>{t('velkommen')}</h2>
                        <button onClick={() => setValgtVisning('vis')} style={{ margin: '0.5rem' }}>{t('tidligereInnlegg')}</button>
                        <button onClick={() => setValgtVisning('nytt')} style={{ margin: '0.5rem' }}>{t('leggTil')}</button>
                        {utkast.length > 0 && <button onClick={() => setValgtVisning('utkast')} style={{ margin: '0.5rem' }}>Rediger utkast</button>}
                    </div>
                ) : valgtVisning === 'nytt' ? (
                    <NyttInnleggForm t={t} onLagre={leggTilUtkast} />
                ) : valgtVisning === 'utkast' ? (
                    <div>
                        <h2>Utkast</h2>
                        {utkast.length === 0 ? <p>Ingen utkast lagret.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0, maxWidth: '600px', margin: 'auto' }}>
                                {utkast.map(item => (
                                    <li key={item.id} style={{
                                        marginBottom: '1rem',
                                        background: 'rgba(255,255,255,0.8)',
                                        padding: '1rem',
                                        borderRadius: '8px'
                                    }}>
                                        <input type="text" value={item.navn} onChange={(e) => redigerFelt(item.id, 'navn', e.target.value)}
                                            style={{ width: '100%', marginBottom: '0.5rem' }} />
                                        <textarea value={item.tekst} onChange={(e) => redigerFelt(item.id, 'tekst', e.target.value)}
                                            style={{ width: '100%', height: '100px', marginBottom: '0.5rem' }} />
                                        <label>Fra dato:</label>
                                        <input type="date" value={item.fraDato} onChange={(e) => redigerFelt(item.id, 'fraDato', e.target.value)}
                                            style={{ width: '100%', maxWidth: '300px', marginBottom: '0.5rem' }} />
                                        <label>Til dato:</label>
                                        <input type="date" value={item.tilDato} onChange={(e) => redigerFelt(item.id, 'tilDato', e.target.value)}
                                            style={{ width: '100%', maxWidth: '300px', marginBottom: '0.5rem' }} />
                                        <br />
                                        <button onClick={() => lagreEndringerUtkast(item)}>Lagre endringer</button>
                                        <button onClick={() => publiserInnlegg(item)} style={{ marginLeft: '0.5rem' }}>Publiser innlegg</button>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                                    <li key={item.id} style={{
                                        marginBottom: '1rem',
                                        background: 'rgba(255,255,255,0.8)',
                                        padding: '1rem',
                                        borderRadius: '8px'
                                    }}>
                                        <strong>{item.navn}</strong><br />
                                        <small>Opphold: {formatDato(item.fraDato)} – {formatDato(item.tilDato)}</small><br />
                                        <div style={{ marginTop: '0.5rem' }}>{item.tekst}</div>
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

function NyttInnleggForm({ t, onLagre }) {
    const [navn, setNavn] = useState('');
    const [tekst, setTekst] = useState('');
    const [fraDato, setFraDato] = useState('');
    const [tilDato, setTilDato] = useState('');

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h2>{t('leggTil')}</h2>
            <input type="text" placeholder={t('navn')} value={navn} onChange={(e) => setNavn(e.target.value)}
                style={{ width: '100%', maxWidth: '500px', marginBottom: '0.5rem' }} />
            <textarea placeholder={t('melding')} value={tekst} onChange={(e) => setTekst(e.target.value)}
                style={{ width: '100%', maxWidth: '500px', height: '100px', marginBottom: '0.5rem' }} />
            <label>Fra dato:</label>
            <input type="date" value={fraDato} onChange={(e) => setFraDato(e.target.value)}
                style={{ width: '100%', maxWidth: '300px', marginBottom: '0.5rem' }} />
            <label>Til dato:</label>
            <input type="date" value={tilDato} onChange={(e) => setTilDato(e.target.value)}
                style={{ width: '100%', maxWidth: '300px', marginBottom: '0.5rem' }} />
            <button onClick={() => onLagre(navn, tekst, fraDato, tilDato)}
                style={{ marginTop: '1rem' }}>{t('leggTil')}</button>
        </div>
    );
}
