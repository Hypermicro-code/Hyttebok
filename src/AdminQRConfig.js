import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function AdminQRConfig() {
    const [hytteKey, setHytteKey] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [netlifyUrl] = useState('https://din-hyttebok.netlify.app'); // Sett din Netlify-URL her
    const [fullUrl, setFullUrl] = useState('');

    useEffect(() => {
        const hentNokkel = async () => {
            const docRef = doc(db, 'config', 'hytte1');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setHytteKey(docSnap.data().hytteKey);
            }
        };
        hentNokkel();
    }, []);

    useEffect(() => {
        if (hytteKey) {
            genererQR(hytteKey);
        }
    }, [hytteKey]);

    const lagreNokkel = async () => {
        if (!hytteKey.trim()) {
            alert('Nøkkel kan ikke være tom!');
            return;
        }
        try {
            await setDoc(doc(db, 'config', 'hytte1'), { hytteKey });
            alert('Nøkkel lagret!');
            genererQR(hytteKey);
        } catch (error) {
            alert('Feil ved lagring: ' + error.message);
        }
    };

    const genererQR = (key) => {
        const fullUrl = `${netlifyUrl}?hytteKey=${key}`;
        setFullUrl(fullUrl);
        const qr = new QRious({
            value: fullUrl,
            size: 300
        });
        setQrDataUrl(qr.toDataURL());
    };

    const kopierTilUtklippstavle = () => {
        navigator.clipboard.writeText(fullUrl).then(() => {
            alert('QR-link kopiert til utklippstavle!');
        }, () => {
            alert('Kunne ikke kopiere. Prøv manuelt.');
        });
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>QR-kode Generator for din Hyttebok</h1>

            <p>Hytte-nøkkel (hemmelig kode):</p>
            <input
                type="text"
                value={hytteKey}
                onChange={(e) => setHytteKey(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
            />

            <button onClick={lagreNokkel}>Lagre nøkkel og generer QR</button>

            {qrDataUrl && (
                <>
                    <h3>QR-kode (scannes av gjester):</h3>
                    <img src={qrDataUrl} alt="QR-kode" style={{ border: '1px solid #ccc', padding: '10px' }} />
                    <p>Full URL:<br /><a href={fullUrl} target="_blank" rel="noopener noreferrer">{fullUrl}</a></p>
                    <button onClick={kopierTilUtklippstavle}>Kopier QR-link</button>
                </>
            )}
        </div>
    );
}
