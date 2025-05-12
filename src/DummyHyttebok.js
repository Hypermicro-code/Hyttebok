import React, { useState } from 'react';

export default function DummyHyttebok() {
    const [innlegg, setInnlegg] = useState([
        { id: 1, navn: 'Per', dato: '2025-05-12', tekst: 'Fin helg på hytta, flott vær og mye fisk!' },
        { id: 2, navn: 'Kari', dato: '2025-05-05', tekst: 'Familietur med bål og pølser. Veldig koselig!' },
    ]);

    const [nyttNavn, setNyttNavn] = useState('');
    const [nyttTekst, setNyttTekst] = useState('');

    const leggTilInnlegg = () => {
        if (!nyttTekst.trim()) {
            alert('Skriv inn en melding!');
            return;
        }
        const nyttInnlegg = {
            id: innlegg.length + 1,
            navn: nyttNavn || 'Gjest',
            dato: new Date().toISOString().split('T')[0],
            tekst: nyttTekst,
        };
        setInnlegg([nyttInnlegg, ...innlegg]);
        setNyttNavn('');
        setNyttTekst('');
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
                        <strong>{innlegg.navn}</strong> ({innlegg.dato}):<br />
                        {innlegg.tekst}
                    </li>
                ))}
            </ul>
        </div>
    );
}

