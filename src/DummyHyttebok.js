import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Sett din egen hemmelige kode her (samme som du legger i QR-lenken)
const TILLATT_NOKKEL = 'HEMMELIGKODE123';

export default function DummyHyttebok() {
    const [innlegg, setInnlegg] = useState([]);
    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');
    const [harTilgang, setHarTilgang] = useState(false);

    useEffect(() => {
        // Sjekk etter nøkkel i URL
        const params = new URLSearchParams(window.location.search);
        const hytteKey = params.get('hytteKey');
        if (hytteKey === TILLATT_NOKKEL) {
            setHarTilgang(true);
        } else {
            setHarTilgang(false);
        }

        // Alltid vis innlegg, men kun skriv om nøkkel er OK
        const q = query(collection(db, 'innlegg'), orderBy('opprettet', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInnlegg(data);
        });
        return () => unsubscribe();
    }, []);

    const leggTilInnlegg = async () => {
        if (!nyttTekst.trim()) {
            alert('Skriv inn en melding!');
            return;
        }
        try {
            await addDoc(collection(db, 'innlegg'), {
                navn: nyttNavn || 'Gjest',
                tekst: nyttTekst,
                opprettet: serverTimestamp(),
            });
            setNyttNavn('');
            setNyttTekst('');
        } catch (error) {
            alert('Kunne ikke lagre innlegg: ' + error.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
            <h1>Velkommen til Hytteboka</h1>

            {harTilgang ? (
                <>
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
                </>
            ) : (
                <p><strong>Du har ikke tilgang til å legge inn innlegg.<br />Skann gyldig QR-kode på hytta.</strong></p>
            )}

            <h3>Tidligere innlegg:</h3>
            {innlegg.length === 0 ? (
                <p>Ingen innlegg enda. Vær den første!</p>
            ) : (
                <ul>
                    {innlegg.map((innlegg) => (
                        <li key={innlegg.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
                            <strong>{innlegg.navn}</strong> ({innlegg.opprettet?.seconds ? new Date(innlegg.opprettet.seconds * 1000).toLocaleDateString() : 'Ukjent dato'}):<br />
                            {innlegg.tekst}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
