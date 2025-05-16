import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminQRConfig({ t, tilbake }) {
    const [config, setConfig] = useState({
        hytteKey: '',
        språk: 'no',
        bakgrunnsbilde: '',
        bakgrunnsfarge: '#ffffff',
        headerTekst: 'Velkommen til Hytteboka',
        headerBilde: '',
        headerOpacity: 1,
        headerMode: 'cover'
    });
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [netlifyUrl] = useState('https://hyttebok.netlify.app');
    const [fullUrl, setFullUrl] = useState('');
    const [valgtFil, setValgtFil] = useState(null);
    const [opplastingStatus, setOpplastingStatus] = useState('');
    const [melding, setMelding] = useState('');
    const [aktivSeksjon, setAktivSeksjon] = useState('meny');

    useEffect(() => {
        const hentConfig = async () => {
            const docRef = doc(db, 'config', 'hytte1');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setConfig({
                    ...config,
                    ...data
                });
                genererQR(data.hytteKey);
            }
        };
        hentConfig();
    }, []);

    const lagreConfig = async () => {
        try {
            await setDoc(doc(db, 'config', 'hytte1'), config);
            alert('Innstillinger lagret.');
            genererQR(config.hytteKey);
            setMelding('');
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    const genererQR = (key) => {
        if (!key) return;
        const fullUrl = `${netlifyUrl}?hytteKey=${key}`;
        setFullUrl(fullUrl);
        const qr = new QRious({
            value: fullUrl,
            size: 300
        });
        setQrDataUrl(qr.toDataURL());
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setValgtFil(file);
            setOpplastingStatus('Fil valgt - klar til opplasting');
        }
    };

    const handleImageUpload = async (type) => {
        if (!valgtFil) {
            alert('Velg en fil først.');
            return;
        }

        const storageRef = ref(storage, `${type === 'header' ? 'headerbilder' : 'bakgrunnsbilder'}/${valgtFil.name}`);
        try {
            setOpplastingStatus('Laster opp...');
            const snapshot = await uploadBytes(storageRef, valgtFil);
            const url = await getDownloadURL(snapshot.ref);
            if (type === 'header') {
                setConfig({ ...config, headerBilde: url });
            } else {
                setConfig({ ...config, bakgrunnsbilde: url });
            }
            setMelding('Husk å lagre innstillinger');
            setOpplastingStatus('Opplasting ferdig');
        } catch (error) {
            alert('Feil ved opplasting: ' + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <button onClick={tilbake}>Tilbake til Hyttebok</button>
            <h1>Administrer din Hyttebok</h1>

            {aktivSeksjon === 'meny' && (
                <>
                    <button onClick={() => setAktivSeksjon('språk')}>Språk og datoformat</button>
                    <button onClick={() => setAktivSeksjon('tema')}>Temaer</button>
                    <button onClick={() => setAktivSeksjon('qr')}>QR-kode og nøkkel</button>
                </>
            )}

            {aktivSeksjon === 'språk' && (
                <>
                    <h3>Språk og datoformat</h3>
                    <select value={config.språk} onChange={(e) => setConfig({ ...config, språk: e.target.value })} style={{ width: '100%', marginBottom: '1rem' }}>
                        <option value="no">Norsk (dd.mm.yyyy)</option>
                        <option value="en">English (mm/dd/yyyy)</option>
                    </select>
                    <button onClick={lagreConfig}>Lagre</button>
                    <button onClick={() => setAktivSeksjon('meny')} style={{ marginLeft: '1rem' }}>Tilbake til meny</button>
                </>
            )}

            {aktivSeksjon === 'tema' && (
                <>
                    <h3>Tema- og headerinnstillinger</h3>
                    <input type="text" value={config.headerTekst} onChange={(e) => setConfig({ ...config, headerTekst: e.target.value })}
                        placeholder="Headertekst" style={{ width: '100%', marginBottom: '0.5rem' }} />
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ marginBottom: '0.5rem' }} />
                    <button onClick={() => handleImageUpload('header')}>Last opp headerbilde</button>
                    {config.headerBilde && <img src={config.headerBilde} alt="Header Preview" style={{ width: '100%', marginBottom: '1rem' }} />}
                    <label>Opacity:</label>
                    <input type="range" min="0" max="1" step="0.01" value={config.headerOpacity} onChange={(e) => setConfig({ ...config, headerOpacity: parseFloat(e.target.value) })}
                        style={{ width: '100%' }} />
                    <p>Bakgrunnsmodus:</p>
                    <select value={config.headerMode} onChange={(e) => setConfig({ ...config, headerMode: e.target.value })} style={{ width: '100%', marginBottom: '0.5rem' }}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="repeat">Repeat</option>
                    </select>
                    <p>Bakgrunnsbilde (URL):</p>
                    <input type="text" value={config.bakgrunnsbilde} onChange={(e) => setConfig({ ...config, bakgrunnsbilde: e.target.value })}
                        style={{ width: '100%', marginBottom: '0.5rem' }} />
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ marginBottom: '0.5rem' }} />
                    <button onClick={() => handleImageUpload('bakgrunn')}>Last opp bakgrunnsbilde</button>
                    <p>Bakgrunnsfarge:</p>
                    <input type="color" value={config.bakgrunnsfarge} onChange={(e) => setConfig({ ...config, bakgrunnsfarge: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                    <br />
                    <button onClick={lagreConfig}>Lagre</button>
                    <button onClick={() => setAktivSeksjon('meny')} style={{ marginLeft: '1rem' }}>Tilbake til meny</button>
                </>
            )}

            {aktivSeksjon === 'qr' && (
                <>
                    <h3>QR-innstillinger</h3>
                    <input type="text" value={config.hytteKey} onChange={(e) => setConfig({ ...config, hytteKey: e.target.value })}
                        placeholder="Hytte-nøkkel" style={{ width: '100%', marginBottom: '0.5rem' }} />
                    <button onClick={lagreConfig}>Lagre nøkkel og generer QR</button>
                    {qrDataUrl && (
                        <>
                            <h3>QR-kode</h3>
                            <img src={qrDataUrl} alt="QR-kode" style={{ border: '1px solid #ccc', padding: '10px' }} />
                            <p>Full URL:<br /><a href={fullUrl} target="_blank" rel="noopener noreferrer">{fullUrl}</a></p>
                            <button onClick={() => navigator.clipboard.writeText(fullUrl).then(() => alert('QR-link kopiert!'))}>Kopier QR-link</button>
                        </>
                    )}
                    <button onClick={() => setAktivSeksjon('meny')} style={{ marginTop: '1rem' }}>Tilbake til meny</button>
                </>
            )}
        </div>
    );
}
