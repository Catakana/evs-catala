/**
 * Polyfill pour React.createContext
 * 
 * Ce module garantit que React.createContext est toujours disponible,
 * même en cas de problème de bundling.
 */

import React from 'react';

// Fonction qui vérifie et corrige createContext
const ensureCreateContext = () => {
  // Vérifier si createContext est disponible
  if (!(React as any).createContext) {
    // Définir une fonction de secours simple
    (window as any).React = (window as any).React || React;
    
    if (!(window as any).React.createContext) {
      console.warn('React.createContext n\'est pas disponible, utilisation d\'un polyfill');
      
      // Fonction de secours simple pour createContext
      (window as any).React.createContext = function createContextPolyfill(defaultValue?: any) {
        const context = {
          Provider: ({ value, children }: { value: any, children: React.ReactNode }) => children,
          Consumer: ({ children }: { children: (value: any) => React.ReactNode }) => children(defaultValue),
          _currentValue: defaultValue,
          displayName: 'PolyfillContext'
        };
        return context;
      };
    }
  }
};

// Exécuter la fonction immédiatement
ensureCreateContext();

// Pas d'export - ce fichier est uniquement utilisé pour ses effets secondaires 