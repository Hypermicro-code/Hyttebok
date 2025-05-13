import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

// Din faktiske firebaseConfig fra Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDQNEjM_6rQvKaeMbcIyd6hGmIynqcW7wQ",
  authDomain: "hyttebok-bca8a.firebaseapp.com",
  projectId: "hyttebok-bca8a",
  storageBucket: "hyttebok-bca8a.firebasestorage.app",
  messagingSenderId: "XXXXXX",
  appId: "XXXXXX"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default function StorageTest() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [url, setUrl] = useState('');

    const handleSelect = (e) => {
        setFile(e.target.files[0]);
        setStatus('Fil valgt - klar til opplasting');
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Velg en fil først');
            return;
        }

        const storageRef = ref(storage, `testopplasting/${file.name}`);
        try {
            setStatus('Laster opp...');
            console.log('Starter opplasting:', file.name);
            const snapshot = await uploadBytes(storageRef, file);
            console.log('Opplasting ferdig, snapshot:', snapshot);
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Download URL:', downloadURL);
            setUrl(downloadURL);
            setStatus('Opplasting fullført!');
        } catch (error) {
            console.error('Feil under opplasting:', error);
            setStatus('Feil: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Test: Last opp bilde til Storage</h1>
            <input type="file" accept="image/*" onChange={handleSelect} />
            <br />
            <button onClick={handleUpload}>Last opp bilde</button>
            <p>Status: {status}</p>
            {url && (
                <div>
                    <p>Bilde lastet opp. Her er URL:</p>
                    <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                    <br />
                    <img src={url} alt="Opplastet" style={{ maxWidth: '300px', border: '1px solid #ccc' }} />
                </div>
            )}
        </div>
    );
}
