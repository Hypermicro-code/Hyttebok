import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function AdminQRConfig({ t }) {
    const [hytteKey, setHytteKey] = useState('');
    const [bakgrunnsbilde, setBakgrunnsbilde] = useState('');
    const [bakgrunnsfarge, setBakgrunnsfarge] = useState('#ffffff');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [netlifyUrl] = useState('https://din-hyttebok.netlify.app');
    const [fullUrl, setFullUrl] = useState('');

    useEffect(() => {
        const hentConfig = async () => {
            const docRef = doc(db, 'config', 'hytte1');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setHytteKey(data.hytteKey || '');
                setBakgrunnsbilde(data.bakgrunnsbilde || '');
                setBakgrunnsfarge(data.bakgrunnsfarge || '#ffffff');
            }
        };
        hentConfig();
    }, []);

    useEffect(() => {
        if (hytteKey) {
            genererQR(hytteKey);
        }
    }, [hytteKey]);

    const lagreConfig = async () => {
        if (!hytteKey.trim()) {
            alert(t('hytteNokkel') + ' ' + t('melding'));
            return;
        }
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
            alert(t('kopierQrLink'));
        }, () => {
            alert('Kunne ikke kopiere. Prøv manuelt.');
        });
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>{t('adminTittel')}</h1>

            <p>{t('hytteNokkel')}</p>
            <input type="text" value={hytteKey} onChange={(e) => setHytteKey(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />

            <p>{t('bakgrunnsbilde')}</p>
            <input type="text" value={bakgrunnsbilde} onChange={(e) => setBakgrunnsbilde(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} placeholder="https://..." />

            <p>{t('bakgrunnsfarge')}</p>
            <input type="color" value={bakgrunnsfarge} onChange={(e) => setBakgrunnsfarge(e.target.value)} style={{ marginBottom: '0.5rem' }} />

            <br />
            <button onClick={lagreConfig}>{t('lagreNokkel')}</button>

            {qrDataUrl && (
                <>
                    <h3>{t('qrKode')}</h3>
                    <img src={qrDataUrl} alt="QR-kode" style={{ border: '1px solid #ccc', padding: '10px' }} />
                    <p>{t('fullUrl')}<br /><a href={fullUrl} target="_blank" rel="noopener noreferrer">{fullUrl}</a></p>
                    <button onClick={kopierTilUtklippstavle}>{t('kopierQrLink')}</button>
                </>
            )}
        </div>
    );
}
