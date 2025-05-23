import { useState, useEffect } from 'react';
import { Member } from '@/types/member';
import { memberService } from '@/lib/memberService';

// Les données de mock ne sont plus utilisées, mais on les garde en commentaire pour référence
// const MOCK_MEMBERS: Member[] = [...]

// Utiliser une fonction nommée pour éviter l'incompatibilité avec Fast Refresh
function useMemberDataHook() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const data = await memberService.getAllMembers();
        setMembers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue lors de la récupération des membres'));
        console.error('Erreur lors du chargement des membres:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const getMembersByRole = async (role: string) => {
    try {
      setIsLoading(true);
      const data = await memberService.getMembersByRole(role);
      return data;
    } catch (err) {
      console.error(`Erreur lors de la récupération des membres avec le rôle ${role}:`, err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberById = async (id: string) => {
    try {
      return await memberService.getMemberById(id);
    } catch (err) {
      console.error(`Erreur lors de la récupération du membre ${id}:`, err);
      return null;
    }
  };

  return {
    members,
    isLoading,
    error,
    getMembersByRole,
    getMemberById
  };
}

// Exporter une constante pour être compatible avec le Fast Refresh de Vite
export const useMemberData = useMemberDataHook;
