import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminQRConfig({ t, tilbake }) {
    const [hytteKey, setHytteKey] = useState('');
    const [bakgrunnsbilde, setBakgrunnsbilde] = useState('');
    const [bakgrunnsfarge, setBakgrunnsfarge] = useState('#ffffff');
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
                genererQR(data.hytteKey);
            }
        };
        hentConfig();
    }, []);

    const lagreNokkelOgQR = async () => {
        try {
            await setDoc(doc(db, 'config', 'hytte1'), {
                hytteKey,
                bakgrunnsbilde,
                bakgrunnsfarge
            });
            alert(t('lagreNokkel'));
            genererQR(hytteKey);
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    const lagreTema = async () => {
        try {
            await setDoc(doc(db, 'config', 'hytte1'), {
                hytteKey,
                bakgrunnsbilde,
                bakgrunnsfarge
            });
            alert(t('lagreTema'));
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
            setOpplastingStatus(t('klarTilOpplasting'));
        }
    };

    const handleImageUpload = async () => {
        if (!valgtFil) {
            alert(t('velgFilFørOpplasting'));
            return;
        }

        const storageRef = ref(storage, `bakgrunnsbilder/${valgtFil.name}`);
        try {
            setOpplastingStatus(t('lasterOpp'));
            const snapshot = await uploadBytes(storageRef, valgtFil);
            const url = await getDownloadURL(snapshot.ref);
            setBakgrunnsbilde(url);
            setMelding(t('huskLagreTema'));
            setOpplastingStatus(t('opplastingFerdig'));
        } catch (error) {
            console.error('Feil ved opplasting:', error);
            alert('Feil ved opplasting: ' + error.message);
            setOpplastingStatus(t('feilOpplasting') + ': ' + error.message);
        }
    };

    const handleFargeEndring = (farge) => {
        setBakgrunnsfarge(farge);
        setMelding(t('huskLagreTema'));
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <button onClick={tilbake}>Tilbake til Hyttebok</button>
            <h1>Administrer din Hyttebok</h1>

            <h3>Tema-innstillinger</h3>
            <div style={{
                backgroundColor: bakgrunnsfarge,
                backgroundImage: bakgrunnsbilde ? `url(${bakgrunnsbilde})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '1rem'
            }}>
                <p><strong>Forhåndsvisning:</strong></p>
                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.5rem', borderRadius: '4px' }}>
                    Dette er hvordan hytteboka vil se ut med valgt tema.
                </div>
            </div>

            <p>Bakgrunnsbilde (URL):</p>
            <input type="text" value={bakgrunnsbilde} onChange={(e) => { setBakgrunnsbilde(e.target.value); setMelding('Husk å lagre tema'); }} style={{ width: '100%', marginBottom: '0.5rem' }} placeholder="https://..." />
            <input type="file" accept="image/*" onChange={handleImageSelect} style={{ marginBottom: '0.5rem' }} />

            {valgtFil && (
                <>
                    <p><strong>Valgt fil:</strong> {valgtFil.name}</p>
                    <img src={URL.createObjectURL(valgtFil)} alt="Preview" style={{ maxWidth: '100%', marginBottom: '0.5rem', border: '1px solid #ccc' }} />
                    <button onClick={handleImageUpload}>Last opp bilde</button>
                    <p>{opplastingStatus}</p>
                </>
            )}

            <p>Bakgrunnsfarge:</p>
            <input type="color" value={bakgrunnsfarge} onChange={(e) => handleFargeEndring(e.target.value)} style={{ marginBottom: '0.5rem' }} />

            {melding && <p style={{ color: 'red', fontWeight: 'bold' }}>{melding}</p>}

            <br />
            <button onClick={lagreTema}>Lagre tema</button>

            <hr />

            <h3>QR-innstillinger</h3>
            <p>Hytte-nøkkel (hemmelig kode):</p>
            <input type="text" value={hytteKey} onChange={(e) => setHytteKey(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />

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
