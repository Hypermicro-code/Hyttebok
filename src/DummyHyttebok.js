import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export default function DummyHyttebok() {
    const [innlegg, setInnlegg] = useState([]);
    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');

    useEffect(() => {
        const hentInnlegg = async () => {
            const q = query(collection(db, 'innlegg'), orderBy('opprettet', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInnlegg(data);
        };
        hentInnlegg();
    }, []);

    const leggTilInnlegg = async () => {
        if (!nyttTekst.trim()) {
            alert('Skriv inn en melding!');
            return;
        }
        await addDoc(collection(db, 'innlegg'), {
            navn: nyttNavn || 'Gjest',
            tekst: nyttTekst,
            opprettet: serverTimestamp(),
        });
        setNyttNavn('');
        setNyttTekst('');
        // Hent på nytt etter lagring
        const q = query(collection(db, 'innlegg'), orderBy('opprettet', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInnlegg(data);
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>Velkommen til Hytteboka</h1>
            <h3>Skriv et nytt innlegg:</h3>
            <input
                type="text"
                placeholder="Navn (valgfritt)"
                value={nyttNavn}
                onChange={(e) => setNyttNavn(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <textarea
                placeholder="Skriv noe hyggelig..."
                value={nyttTekst}
                onChange={(e) => setNyttTekst(e.target.value)}
                style={{ width: '100%', height: '100px' }}
            ></textarea>
            <button onClick={leggTilInnlegg} style={{ marginTop: '0.5rem' }}>Legg til innlegg</button>

            <h3>Tidligere innlegg:</h3>
            <ul>
                {innlegg.map((innlegg) => (
                    <li key={innlegg.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
                        <strong>{innlegg.navn}</strong> ({new Date(innlegg.opprettet?.seconds * 1000).toLocaleDateString()}):<br />
                        {innlegg.tekst}
                    </li>
                ))}
            </ul>
        </div>
    );
}
