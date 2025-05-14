import React, { useState } from 'react';
import DummyHyttebok from './DummyHyttebok';
import AdminQRConfig from './AdminQRConfig';
import no from './lang/no';
import en from './lang/en';

const valgtSpråk = 'no'; // Sett til 'en' for engelsk
const t = valgtSpråk === 'no' ? no : en;

export default function App() {
    const [visAdmin, setVisAdmin] = useState(false);

    return visAdmin ? (
        <AdminQRConfig t={(key) => t[key] || key} tilbake={() => setVisAdmin(false)} />
    ) : (
        <DummyHyttebok t={(key) => t[key] || key} onAdmin={() => setVisAdmin(true)} />
    );
}
