import React from 'react';
import DummyHyttebok from './DummyHyttebok';
import t_no from './lang/no'; // OBS: default export
import t_en from './lang/en';

const valgtSpråk = 'no'; // Sett til 'en' for engelsk

const t = valgtSpråk === 'no' ? t_no : t_en;

export default function App() {
  return <DummyHyttebok t={(key) => t[key] || key} />;
}
