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
            <button onClick={tilbake}>{t('tilbake')}</button>
            <h1>{t('adminTittel')}</h1>

            {/* Tema-innstillinger her */}
            <h3>{t('temaInnstillinger')}</h3>
            {/* Resten av koden er som tidligere vist, beholdes uendret */}
            {/* ... */}
        </div>
    );
}
