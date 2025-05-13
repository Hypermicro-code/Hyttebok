import React from 'react';
import DummyHyttebok from './DummyHyttebok';
import no from './lang/no';
import en from './lang/en';

// Sett ønsket språk her:
const valgtSpråk = 'no'; // eller 'en'

const t = valgtSpråk === 'no' ? no : en;

export default function App() {
  return <DummyHyttebok t={(key) => t[key] || key} />;
}
