import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  avatar_url?: string;
}

export const userService = {
  // Récupérer un utilisateur par son ID
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      console.log('👤 Récupération de l\'utilisateur:', userId);

      // D'abord essayer de récupérer depuis evscatala_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData && !profileError) {
        console.log('✅ Profil trouvé dans evscatala_profiles:', profileData);
        return {
          id: profileData.id,
          email: profileData.email || '',
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          role: profileData.role,
          avatar_url: profileData.avatar_url
        };
      }

      // Si pas trouvé dans les profils, essayer auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userData && !userError) {
        console.log('✅ Utilisateur trouvé dans auth.users:', userData.user?.email);
        return {
          id: userId,
          email: userData.user?.email || '',
          firstname: userData.user?.user_metadata?.firstname,
          lastname: userData.user?.user_metadata?.lastname,
          role: userData.user?.user_metadata?.role
        };
      }

      console.warn('⚠️ Utilisateur non trouvé:', userId);
      return null;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Récupérer plusieurs utilisateurs par leurs IDs
  async getUsersByIds(userIds: string[]): Promise<UserProfile[]> {
    try {
      console.log('👥 Récupération de plusieurs utilisateurs:', userIds);

      if (userIds.length === 0) return [];

      // Récupérer depuis evscatala_profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erreur lors de la récupération des profils:', profilesError);
        return [];
      }

      const profiles = (profilesData || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        firstname: profile.firstname,
        lastname: profile.lastname,
        role: profile.role,
        avatar_url: profile.avatar_url
      }));

      console.log(`✅ ${profiles.length} profils récupérés`);
      return profiles;

    } catch (error) {
      console.error('❌ Erreur dans getUsersByIds:', error);
      return [];
    }
  },

  // Rechercher des utilisateurs par nom/email
  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      console.log('🔍 Recherche d\'utilisateurs:', query);

      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .or(`firstname.ilike.%${query}%,lastname.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('❌ Erreur lors de la recherche:', error);
        return [];
      }

      const users = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        firstname: profile.firstname,
        lastname: profile.lastname,
        role: profile.role,
        avatar_url: profile.avatar_url
      }));

      console.log(`✅ ${users.length} utilisateurs trouvés`);
      return users;

    } catch (error) {
      console.error('❌ Erreur dans searchUsers:', error);
      return [];
    }
  },

  // Récupérer tous les utilisateurs (pour les sélecteurs)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('👥 Récupération de tous les utilisateurs');

      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .order('lastname', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération de tous les utilisateurs:', error);
        return [];
      }

      const users = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        firstname: profile.firstname,
        lastname: profile.lastname,
        role: profile.role,
        avatar_url: profile.avatar_url
      }));

      console.log(`✅ ${users.length} utilisateurs récupérés`);
      return users;

    } catch (error) {
      console.error('❌ Erreur dans getAllUsers:', error);
      return [];
    }
  },

  // Formater le nom complet d'un utilisateur
  formatUserName(user: UserProfile): string {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    } else if (user.firstname) {
      return user.firstname;
    } else if (user.lastname) {
      return user.lastname;
    } else {
      return user.email || 'Utilisateur inconnu';
    }
  },

  // Formater le nom avec initiales
  formatUserNameWithInitials(user: UserProfile): string {
    const fullName = this.formatUserName(user);
    if (user.firstname && user.lastname) {
      return `${fullName} (${user.firstname[0]}${user.lastname[0]})`;
    }
    return fullName;
  },

  // Obtenir les initiales d'un utilisateur
  getUserInitials(user: UserProfile): string {
    if (user.firstname && user.lastname) {
      return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
    } else if (user.firstname) {
      return user.firstname[0].toUpperCase();
    } else if (user.lastname) {
      return user.lastname[0].toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  }
}; 