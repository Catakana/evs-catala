// Importer le polyfill en premier pour garantir que React est correctement configuré
import './lib/react-polyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { initializeTexts } from './lib/TextLoader';
import './index.css';

// Initialiser les textes avant de rendre l'application
initializeTexts().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
