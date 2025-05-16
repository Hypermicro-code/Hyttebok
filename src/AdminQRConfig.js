import React, { useState, useEffect } from 'react';
import QRious from 'qrious';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminQRConfig({ t, tilbake }) {
    const [hytteKey, setHytteKey] = useState('');
    const [språk, setSpråk] = useState('no');
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
                setSpråk(data.språk || 'no');
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

    const lagreConfig = async () => {
        try {
            await setDoc(doc(db, 'config', 'hytte1'), {
                hytteKey,
                språk,
                bakgrunnsbilde,
                bakgrunnsfarge,
                headerTekst,
                headerBilde,
                headerOpacity,
                headerMode
            });
            alert('Innstillinger lagret.');
            setMelding('');
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
            setMelding('Husk å lagre innstillinger');
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

            <h3>Språk og datoformat</h3>
            <select value={språk} onChange={(e) => { setSpråk(e.target.value); setMelding('Husk å lagre innstillinger'); }} style={{ width: '100%', marginBottom: '1rem' }}>
                <option value="no">Norsk (dd.mm.yyyy)</option>
                <option value="en">English (mm/dd/yyyy)</option>
            </select>

            <hr />

            <h3>Tema og header-innstillinger</h3>
            {/* Resten beholdes som tidligere... (du har denne allerede oppdatert) */}

            {/* QR-innstillinger */}
            <h3>QR-innstillinger</h3>
            <input type="text" value={hytteKey} onChange={(e) => setHytteKey(e.target.value)}
                style={{ width: '100%', maxWidth: '500px', margin: '0 auto', marginBottom: '0.5rem', display: 'block' }} />
            <button onClick={lagreConfig}>Lagre nøkkel og innstillinger</button>

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
