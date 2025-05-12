import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import QRious from 'qrious';

export default function AdminQRGenerator() {
    const [netlifyUrl] = useState('https://din-hyttebok.netlify.app');
    const [hytteKey, setHytteKey] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');

    useEffect(() => {
        const hentNokkel = async () => {
            const docRef = doc(db, 'innstillinger', 'hytteinfo');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setHytteKey(docSnap.data().hytteKey);
            } else {
                setHytteKey('HEMMELIGKODE123'); // Standard nøkkel hvis tom
            }
        };
        hentNokkel();
    }, []);

    const lagreNokkel = async () => {
        if (!hytteKey.trim()) {
            alert('Nøkkel kan ikke være tom!');
            return;
        }
        await setDoc(doc(db, 'innstillinger', 'hytteinfo'), { hytteKey });
        alert('Nøkkel lagret.');
        generateQR();
    };

    const generateQR = () => {
        const fullUrl = `${netlifyUrl}?hytteKey=${hytteKey}`;
        const qr = new QRious({
            value: fullUrl,
            size: 300
        });
        setQrDataUrl(qr.toDataURL());
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>QR-kode & Nøkkel for din Hyttebok</h1>

            <p>Endre din hemmelige hytte-nøkkel:</p>
            <input
                type="text"
                value={hytteKey}
                onChange={(e) => setHytteKey(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <button onClick={lagreNokkel}>Lagre nøkkel & Generer QR-kode</button>

            {qrDataUrl && (
                <>
                    <h3>Skann eller lagre QR-koden:</h3>
                    <img src={qrDataUrl} alt="QR-kode" style={{ border: '1px solid #ccc', padding: '10px' }} />
                    <p>Full URL:<br />{`${netlifyUrl}?hytteKey=${hytteKey}`}</p>
                </>
            )}
        </div>
    );
}
