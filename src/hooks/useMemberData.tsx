
import { useState, useEffect } from 'react';
import { Member } from '@/types/member';

// Mock data for now - would be replaced by API calls in a real app
const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    firstName: 'Sophie',
    lastName: 'Dupont',
    email: 'sophie.dupont@example.com',
    phone: '06 12 34 56 78',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    role: 'admin',
    status: 'active',
    groups: ['Bureau', 'Commission Communication'],
    projects: ['Fête annuelle', 'Refonte site web']
  },
  {
    id: '2',
    firstName: 'Thomas',
    lastName: 'Martin',
    email: 'thomas.martin@example.com',
    phone: '06 23 45 67 89',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    role: 'staff',
    status: 'active',
    groups: ['Accueil', 'Informatique'],
    projects: ['Ateliers numériques']
  },
  {
    id: '3',
    firstName: 'Marie',
    lastName: 'Bernard',
    email: 'marie.bernard@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    role: 'member',
    status: 'active',
    groups: ['Bénévoles', 'Jardin partagé'],
    projects: []
  },
  {
    id: '4',
    firstName: 'Pierre',
    lastName: 'Lefevre',
    email: 'pierre.lefevre@example.com',
    phone: '06 34 56 78 90',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    role: 'staff',
    status: 'active',
    groups: ['Animation', 'Évènements'],
    projects: ['Fête de quartier']
  },
  {
    id: '5',
    firstName: 'Julie',
    lastName: 'Garcia',
    email: 'julie.garcia@example.com',
    avatarUrl: '',  // Empty to test fallback
    role: 'volunteer',
    status: 'active',
    groups: ['Bénévoles'],
    projects: []
  },
  {
    id: '6',
    firstName: 'Jean',
    lastName: 'Moreau',
    email: 'jean.moreau@example.com',
    phone: '06 45 67 89 01',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    role: 'member',
    status: 'inactive',
    groups: ['Anciens membres'],
    projects: []
  },
  {
    id: '7',
    firstName: 'Isabelle',
    lastName: 'Rousseau',
    email: 'isabelle.rousseau@example.com',
    phone: '06 56 78 90 12',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    role: 'admin',
    status: 'active',
    groups: ['Bureau', 'Trésorerie'],
    projects: ['Budget participatif']
  },
  {
    id: '8',
    firstName: 'Luc',
    lastName: 'Girard',
    email: 'luc.girard@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    role: 'volunteer',
    status: 'pending',
    groups: ['Nouveaux bénévoles'],
    projects: []
  }
];

export const useMemberData = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API fetch with a small delay
    const timer = setTimeout(() => {
      try {
        setMembers(MOCK_MEMBERS);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return {
    members,
    isLoading,
    error
  };
};
