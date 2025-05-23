import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook d'authentification qui expose les fonctionnalités du contexte d'authentification
 * @deprecated Utilisez directement `import { useAuth } from '@/contexts/AuthContext'` à la place
 */
export function useAuth() {
  // Pour des raisons de rétrocompatibilité, ce hook redirige simplement
  // vers le hook du contexte d'authentification
  return useAuthContext();
} 