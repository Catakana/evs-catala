import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { initializeTexts } from './lib/TextLoader';
import './index.css';

// Initialiser le système de textes avant le rendu de l'application
async function initializeApp() {
  try {
    // Chargement des textes depuis le fichier CSV
    await initializeTexts();
    
    // Rendu de l'application une fois les textes chargés
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Fallback en cas d'erreur pour assurer que l'app se lance quand même
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
}

// Lancer l'initialisation
initializeApp();
