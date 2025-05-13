import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminQRConfig({ t }) {
    const [hytteKey, setHytteKey] = useState('');
    const [bakgrunnsbilde, setBakgrunnsbilde] = useState('');
    const [bakgrunnsfarge, setBakgrunnsfarge] = useState('#ffffff');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [netlifyUrl] = useState('https://hyttebok.netlify.app');
    const [fullUrl, setFullUrl] = useState('');
    const [visQRinnstillinger, setVisQRinnstillinger] = useState(false);
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

    const kopierTilUtklippstavle = () => {
        navigator.clipboard.writeText(fullUrl).then(() => {
            alert(t('kopierQrLink'));
        }, () => {
            alert('Kunne ikke kopiere. Prøv manuelt.');
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `bakgrunnsbilder/${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setBakgrunnsbilde(url);
            setMelding(t('huskLagreTema'));
        } catch (error) {
            alert('Feil ved opplasting av bilde: ' + error.message);
        }
    };

    const handleFargeEndring = (farge) => {
        setBakgrunnsfarge(farge);
        setMelding(t('huskLagreTema'));
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>{t('adminTittel')}</h1>

            <h3>{t('temaInnstillinger')}</h3>
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
                <p><strong>{t('forhandsvisning')}</strong></p>
                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.5rem', borderRadius: '4px' }}>
                    {t('forhandsvisningTekst')}
                </div>
            </div>

            <p>{t('bakgrunnsbilde')}</p>
            <input type="text" value={bakgrunnsbilde} onChange={(e) => { setBakgrunnsbilde(e.target.value); setMelding(t('huskLagreTema')); }} style={{ width: '100%', marginBottom: '0.5rem' }} placeholder="https://..." />
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '0.5rem' }} />

            <p>{t('bakgrunnsfarge')}</p>
            <input type="color" value={bakgrunnsfarge} onChange={(e) => handleFargeEndring(e.target.value)} style={{ marginBottom: '0.5rem' }} />

            {melding && <p style={{ color: 'red', fontWeight: 'bold' }}>{melding}</p>}

            <br />
            <button onClick={lagreTema}>{t('lagreTema')}</button>

            <hr />

            <button onClick={() => setVisQRinnstillinger(!visQRinnstillinger)} style={{ marginTop: '1rem' }}>
                {visQRinnstillinger ? t('skjulQrInnstillinger') : t('visQrInnstillinger')}
            </button>

            {visQRinnstillinger && (
                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
                    <p>{t('hytteNokkel')}</p>
                    <input type="text" value={hytteKey} onChange={(e) => setHytteKey(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />

                    <button onClick={lagreNokkelOgQR}>{t('lagreNokkel')}</button>

                    {qrDataUrl && (
                        <>
                            <h3>{t('qrKode')}</h3>
                            <img src={qrDataUrl} alt="QR-kode" style={{ border: '1px solid #ccc', padding: '10px' }} />
                            <p>{t('fullUrl')}<br /><a href={fullUrl} target="_blank" rel="noopener noreferrer">{fullUrl}</a></p>
                            <button onClick={kopierTilUtklippstavle}>{t('kopierQrLink')}</button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
