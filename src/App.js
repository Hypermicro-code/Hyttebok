import React, { useState } from 'react';
import DummyHyttebok from './DummyHyttebok';
import AdminQRConfig from './AdminQRConfig';

function App() {
  const [visAdmin, setVisAdmin] = useState(false);

  return (
    <div>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setVisAdmin(false)} style={{ marginRight: '1rem' }}>Hyttebok</button>
        <button onClick={() => setVisAdmin(true)}>Admin (QR-konfig)</button>
      </header>

      {visAdmin ? <AdminQRConfig /> : <DummyHyttebok />}
    </div>
  );
}

export default App;
