import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminQRConfig({ t, tilbake }) {
    const [hytteKey, setHytteKey] = useState('');
    const [bakgrunnsbilde, setBakgrunnsbilde] = useState('');
    const [bakgrunnsfarge, setBakgrunnsfarge] = useState('#ffffff');
    const [headerTekst, setHeaderTekst] = useState('Velkommen til Hytteboka');
    const [headerBilde, setHeaderBilde] = useState('');
    const [headerOpacity, setHeaderOpacity] = useState(1);
    const [headerMode, setHeaderMode] = useState('cover');

    const [qrDataUrl, setQrDataUrl] = useState('');
    const [netlifyUrl] = useState('https://hyttebok.netlify.app');
    const [fullUrl, setFullUrl] = useState('');
    const [valgtFil, setValgtFil] = useState(null);
    const [opplastingStatus, setOpplastingStatus] = useState('');
    const [melding, setMelding] = useState('');

    useEffect(() => {
        const hentConfig = async () => {
            const docRef = doc(db, 'config', 'hytte1');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setHytteKey(data.hytteKey || '');
                setBakgrunnsbilde(data.bakgrunnsbilde || '');
                setBakgrunnsfarge(data.bakgrunnsfarge || '#ffffff');
                setHeaderTekst(data.headerTekst || 'Velkommen til Hytteboka');
                setHeaderBilde(data.headerBilde || '');
                setHeaderOpacity(data.headerOpacity !== undefined ? data.headerOpacity : 1);
                setHeaderMode(data.headerMode || 'cover');
                genererQR(data.hytteKey);
            }
        };
        hentConfig();
    }, []);

    const lagreTemaOgHeader = async () => {
        try {
            await setDoc(doc(db, 'config', 'hytte1'), {
                hytteKey,
                bakgrunnsbilde,
                bakgrunnsfarge,
                headerTekst,
                headerBilde,
                headerOpacity,
                headerMode
            });
            alert('Tema og header lagret.');
            setMelding('');
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    const lagreNokkelOgQR = async () => {
        try {
            await setDoc(doc(db, 'config', 'hytte1'), {
                hytteKey,
                bakgrunnsbilde,
                bakgrunnsfarge,
                headerTekst,
                headerBilde,
                headerOpacity,
                headerMode
            });
            alert('Nøkkel og QR lagret.');
            genererQR(hytteKey);
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
                setHeaderBilde(url);
            } else {
                setBakgrunnsbilde(url);
            }
            setMelding('Husk å lagre tema');
            setOpplastingStatus('Opplasting ferdig');
        } catch (error) {
            console.error('Feil ved opplasting:', error);
            alert('Feil ved opplasting: ' + error.message);
            setOpplastingStatus('Feil ved opplasting: ' + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <button onClick={tilbake}>Tilbake til Hyttebok</button>
            <h1>Administrer din Hyttebok</h1>

            <h3>Tema og header-innstillinger</h3>
            <p>Headertekst:</p>
            <input type="text" value={headerTekst} onChange={(e) => { setHeaderTekst(e.target.value); setMelding('Husk å lagre tema'); }}
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }} />

            <p>Last opp headerbilde:</p>
            <input type="file" accept="image/*" onChange={handleImageSelect} style={{ marginBottom: '0.5rem' }} />
            <button onClick={() => handleImageUpload('header')} style={{ marginBottom: '0.5rem' }}>Last opp headerbilde</button>

            {headerBilde && <img src={headerBilde} alt="Header Preview" style={{ width: '100%', marginBottom: '1rem', border: '1px solid #ccc' }} />}

            <p>Gjennomsiktighet (0=helt gjennomsiktig, 1=helt synlig): {headerOpacity}</p>
            <input type="range" min="0" max="1" step="0.01" value={headerOpacity} onChange={(e) => { setHeaderOpacity(parseFloat(e.target.value)); setMelding('Husk å lagre tema'); }} style={{ width: '100%', marginBottom: '0.5rem' }} />

            <p>Bakgrunnsmodus:</p>
            <select value={headerMode} onChange={(e) => { setHeaderMode(e.target.value); setMelding('Husk å lagre tema'); }} style={{ width: '100%', marginBottom: '0.5rem' }}>
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="repeat">Repeat</option>
            </select>

            <hr />

            <p>Bakgrunnsbilde for appen (URL eller opplasting):</p>
            <input type="text" value={bakgrunnsbilde} onChange={(e) => { setBakgrunnsbilde(e.target.value); setMelding('Husk å lagre tema'); }}
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }} />
            <input type="file" accept="image/*" onChange={handleImageSelect} style={{ marginBottom: '0.5rem' }} />
            <button onClick={() => handleImageUpload('bakgrunn')}>Last opp bakgrunnsbilde</button>

            <p>Bakgrunnsfarge:</p>
            <input type="color" value={bakgrunnsfarge} onChange={(e) => { setBakgrunnsfarge(e.target.value); setMelding('Husk å lagre tema'); }} style={{ marginBottom: '0.5rem' }} />

            {melding && <p style={{ color: 'red', fontWeight: 'bold' }}>{melding}</p>}

            <br />
            <button onClick={lagreTemaOgHeader}>Lagre tema og header</button>

            <hr />

            <h3>QR-innstillinger</h3>
            <p>Hytte-nøkkel (hemmelig kode):</p>
            <input type="text" value={hytteKey} onChange={(e) => setHytteKey(e.target.value)}
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }} />
            <button onClick={lagreNokkelOgQR}>Lagre nøkkel og generer QR</button>

            {qrDataUrl && (
                <>
                    <h3>QR-kode</h3>
                    <img src={qrDataUrl} alt="QR-kode" style={{ border: '1px solid #ccc', padding: '10px' }} />
                    <p>Full URL:<br /><a href={fullUrl} target="_blank" rel="noopener noreferrer">{fullUrl}</a></p>
                    <button onClick={() => navigator.clipboard.writeText(fullUrl).then(() => alert('QR-link kopiert!'))}>Kopier QR-link</button>
                </>
            )}
        </div>
    );
}
