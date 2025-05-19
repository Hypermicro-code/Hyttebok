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
  const [fullUrl, setFullUrl] = useState('');
  const [netlifyUrl] = useState('https://hyttebok.netlify.app');
  const [valgtFil, setValgtFil] = useState(null);
  const [opplastingStatus, setOpplastingStatus] = useState('');
  const [aktivSeksjon, setAktivSeksjon] = useState('meny');

  useEffect(() => {
    const hentConfig = async () => {
      const snap = await getDoc(doc(db, 'config', 'hytte1'));
      if (snap.exists()) {
        const data = snap.data();
        setConfig(prev => ({ ...prev, ...data }));
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
    } catch (err) {
      alert('Feil ved lagring: ' + err.message);
    }
  };

  const genererQR = (key) => {
    if (!key) return;
    const full = `${netlifyUrl}?hytteKey=${key}`;
    setFullUrl(full);
    const qr = new QRious({
      value: full,
      size: 300
    });
    setQrDataUrl(qr.toDataURL());
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValgtFil(file);
      setOpplastingStatus('Fil valgt – klar til opplasting');
    }
  };

  const handleImageUpload = async (type) => {
    if (!valgtFil) {
      alert('Velg en fil først');
      return;
    }
    const refPath = `${type === 'header' ? 'headerbilder' : 'bakgrunnsbilder'}/${valgtFil.name}`;
    const storageRef = ref(storage, refPath);
    try {
      setOpplastingStatus('Laster opp...');
      await uploadBytes(storageRef, valgtFil);
      const url = await getDownloadURL(storageRef);
      setConfig(prev => ({
        ...prev,
        [type === 'header' ? 'headerBilde' : 'bakgrunnsbilde']: url
      }));
      setOpplastingStatus('Opplasting ferdig');
    } catch (err) {
      setOpplastingStatus('Feil ved opplasting: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <button onClick={tilbake}>{t('tilbakeHyttebok')}</button>
      <h1>{t('adminTittel')}</h1>

      {aktivSeksjon === 'meny' && (
        <>
          <button onClick={() => setAktivSeksjon('språk')}>{t('språkOgDato')}</button>
          <button onClick={() => setAktivSeksjon('tema')}>{t('temaer')}</button>
          <button onClick={() => setAktivSeksjon('qr')}>{t('qrKodeSeksjon')}</button>
        </>
      )}

      {aktivSeksjon === 'språk' && (
        <>
          <h3>{t('språkOgDato')}</h3>
          <select
            value={config.språk}
            onChange={(e) => setConfig({ ...config, språk: e.target.value })}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <option value="no">Norsk (dd.mm.yyyy)</option>
            <option value="en">English (mm/dd/yyyy)</option>
          </select>
          <button onClick={lagreConfig}>{t('lagre')}</button>
          <button onClick={() => setAktivSeksjon('meny')} style={{ marginLeft: '1rem' }}>{t('tilbakeMeny')}</button>
        </>
      )}

      {aktivSeksjon === 'tema' && (
        <>
          <h3>{t('temaInnstillinger')}</h3>
          <p>{t('bakgrunnsfarge')}</p>
          <input
            type="color"
            value={config.bakgrunnsfarge}
            onChange={(e) => setConfig({ ...config, bakgrunnsfarge: e.target.value })}
            style={{ marginBottom: '1rem' }}
          />
          <p>{t('bakgrunnsbilde')}</p>
          <input
            type="text"
            value={config.bakgrunnsbilde}
            onChange={(e) => setConfig({ ...config, bakgrunnsbilde: e.target.value })}
            placeholder="https://..."
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <label htmlFor="filvalg">{t('velgFil')}</label><br />
<input id="filvalg" type="file" accept="image/*" onChange={handleImageSelect} />
<p style={{ fontStyle: 'italic', color: '#666' }}>{valgtFil?.name || t('ingenFilValgt')}</p>

          <button onClick={() => handleImageUpload('bakgrunn')}>{t('lastOppBilde')}</button>
          <p>{opplastingStatus}</p>
          <p>Headertekst:</p>
          <input
            type="text"
            value={config.headerTekst}
            onChange={(e) => setConfig({ ...config, headerTekst: e.target.value })}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
         <label htmlFor="filvalg">{t('velgFil')}</label><br />
<input id="filvalg" type="file" accept="image/*" onChange={handleImageSelect} />
<p style={{ fontStyle: 'italic', color: '#666' }}>{valgtFil?.name || t('ingenFilValgt')}</p>

          <button onClick={() => handleImageUpload('header')}>{t('lastOppBilde')}</button>
          <p>Opacity:</p>
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={config.headerOpacity}
            onChange={(e) => setConfig({ ...config, headerOpacity: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
          <p>Modus:</p>
          <select
            value={config.headerMode}
            onChange={(e) => setConfig({ ...config, headerMode: e.target.value })}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="repeat">Repeat</option>
          </select>
          <button onClick={lagreConfig}>{t('lagreTema')}</button>
          <button onClick={() => setAktivSeksjon('meny')} style={{ marginLeft: '1rem' }}>{t('tilbakeMeny')}</button>
        </>
      )}

      {aktivSeksjon === 'qr' && (
        <>
          <h3>{t('qrKode')}</h3>
          <input
            type="text"
            value={config.hytteKey}
            onChange={(e) => setConfig({ ...config, hytteKey: e.target.value })}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <button onClick={lagreConfig}>{t('lagreNokkel')}</button>
          {qrDataUrl && (
            <>
              <img src={qrDataUrl} alt="QR-kode" style={{ marginTop: '1rem', border: '1px solid #ccc' }} />
              <p>{t('fullUrl')}<br /><a href={fullUrl} target="_blank" rel="noopener noreferrer">{fullUrl}</a></p>
              <button onClick={() => navigator.clipboard.writeText(fullUrl).then(() => alert(t('kopierQrLink')))}>{t('kopierQrLink')}</button>
            </>
          )}
          <button onClick={() => setAktivSeksjon('meny')} style={{ marginTop: '1rem' }}>{t('tilbakeMeny')}</button>
        </>
      )}
    </div>
  );
}
