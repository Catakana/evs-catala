import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Vérifier si window est disponible (pour éviter les erreurs côté serveur)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Définir l'état initial
      setMatches(media.matches);
      
      // Fonction de callback pour les changements
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      // Ajouter l'écouteur d'événement
      media.addEventListener('change', listener);
      
      // Nettoyer l'écouteur d'événement
      return () => {
        media.removeEventListener('change', listener);
      };
    }
    
    // Valeur par défaut pour le rendu côté serveur
    return () => {};
  }, [query]);

  return matches;
} 