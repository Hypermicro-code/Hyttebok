import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Hvis du bruker språkstøtte, kan du legge inn global config her senere
// For nå, kun App

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
