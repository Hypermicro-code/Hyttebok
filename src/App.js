import React, { useState } from 'react';
import DummyHyttebok from './DummyHyttebok';
import AdminQRConfig from './AdminQRConfig';
import no from './lang/no.json';
import en from './lang/en.json';

function App() {
  const [visAdmin, setVisAdmin] = useState(false);
  const [language, setLanguage] = useState('no');

  const translations = {
    no,
    en
  };

  const t = (key) => translations[language][key] || key;

  return (
    <div>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setVisAdmin(false)} style={{ marginRight: '1rem' }}>Hyttebok</button>
        <button onClick={() => setVisAdmin(true)}>Admin</button>
        <select onChange={(e) => setLanguage(e.target.value)} value={language} style={{ marginLeft: '2rem' }}>
          <option value="no">Norsk</option>
          <option value="en">English</option>
        </select>
      </header>

      {visAdmin ? <AdminQRConfig t={t} /> : <DummyHyttebok t={t} />}
    </div>
  );
}

export default App;
