import { supabase } from './supabase';
import { Member } from '@/types/member';

// Interface pour le profil Supabase
interface SupabaseProfile {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
  status?: string;
  updated_at?: string;
  created_at: string;
}

/**
 * Service pour la gestion des membres et des profils utilisateurs
 */
export const memberService = {
  /**
   * Récupérer tous les membres depuis les profils Supabase
   * @returns Liste des membres
   */
  async getAllMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select(`
          id,
          user_id,
          firstname,
          lastname,
          email,
          phone,
          avatar_url,
          role,
          status,
          updated_at,
          created_at
        `)
        .order('lastname', { ascending: true });

      if (error) throw error;

      // Transformer les données pour correspondre au format Member
      const members: Member[] = data.map((profile: SupabaseProfile) => ({
        id: profile.user_id || profile.id,
        firstName: profile.firstname || '',
        lastName: profile.lastname || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
        role: profile.role || 'member',
        status: profile.status || 'active',
        groups: [],  // À remplir ultérieurement si nécessaire
        projects: [] // À remplir ultérieurement si nécessaire
      }));

      return members;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      return [];
    }
  },

  /**
   * Récupérer un membre par son ID
   * @param id ID du membre
   * @returns Le membre ou null s'il n'existe pas
   */
  async getMemberById(id: string): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select(`
          id,
          user_id,
          firstname,
          lastname,
          email,
          phone,
          avatar_url,
          role,
          status,
          updated_at,
          created_at
        `)
        .eq('user_id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const profile = data as SupabaseProfile;
      return {
        id: profile.user_id || profile.id,
        firstName: profile.firstname || '',
        lastName: profile.lastname || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
        role: profile.role || 'member',
        status: profile.status || 'active',
        groups: [],  // À remplir ultérieurement si nécessaire
        projects: [] // À remplir ultérieurement si nécessaire
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${id}:`, error);
      return null;
    }
  },

  /**
   * Récupérer les membres par rôle
   * @param role Rôle recherché (admin, staff, member, volunteer)
   * @returns Liste des membres ayant ce rôle
   */
  async getMembersByRole(role: string): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select(`
          id,
          user_id,
          firstname,
          lastname,
          email,
          phone,
          avatar_url,
          role,
          status,
          updated_at,
          created_at
        `)
        .eq('role', role)
        .order('lastname', { ascending: true });

      if (error) throw error;

      // Transformer les données
      const members: Member[] = data.map((profile: SupabaseProfile) => ({
        id: profile.user_id || profile.id,
        firstName: profile.firstname || '',
        lastName: profile.lastname || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
        role: profile.role || 'member',
        status: profile.status || 'active',
        groups: [],  // À remplir ultérieurement si nécessaire
        projects: [] // À remplir ultérieurement si nécessaire
      }));

      return members;
    } catch (error) {
      console.error(`Erreur lors de la récupération des membres avec le rôle ${role}:`, error);
      return [];
    }
  },

  /**
   * Mettre à jour un profil membre
   * @param id ID du membre
   * @param updates Données à mettre à jour
   * @returns Le membre mis à jour ou null en cas d'erreur
   */
  async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    try {
      // Convertir le format Member vers le format de la base de données
      const profileUpdates = {
        firstname: updates.firstName,
        lastname: updates.lastName,
        email: updates.email,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
        role: updates.role,
        status: updates.status
      };

      const { data, error } = await supabase
        .from('evscatala_profiles')
        .update(profileUpdates)
        .eq('user_id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const profile = data as SupabaseProfile;
      return {
        id: profile.user_id || profile.id,
        firstName: profile.firstname || '',
        lastName: profile.lastname || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
        role: profile.role || 'member',
        status: profile.status || 'active',
        groups: updates.groups || [],
        projects: updates.projects || []
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du membre ${id}:`, error);
      return null;
    }
  }
}; 