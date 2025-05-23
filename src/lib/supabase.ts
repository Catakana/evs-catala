import { createClient } from '@supabase/supabase-js';

// Mettre à jour les clés Supabase avec les nouvelles valeurs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fcwvcjtnfxyzojolpisd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd3ZjanRuZnh5em9qb2xwaXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDE0ODQsImV4cCI6MjA1NzYxNzQ4NH0.5nhfFiobBMagzjpChJQGZ7TNqAWce6J3Mq6geMKtiCM';

// Exporter le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les utilisateurs
export type UserRole = 'member' | 'staff' | 'admin';

// Interface pour le profil utilisateur
export interface UserProfile {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar_url?: string;
  phone?: string | null;
  role: 'member' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

// Service d'authentification
export const authService = {
  // Obtenir l'utilisateur actuellement connecté
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
    return data.user;
  },

  // Obtenir le profil de l'utilisateur
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('evscatala_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }

    return data as UserProfile;
  },

  // Vérifier si l'utilisateur a un certain rôle
  async hasRole(role: 'member' | 'staff' | 'admin') {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const profile = await this.getUserProfile(user.id);
    if (!profile) return false;

    if (role === 'member') {
      // Tout utilisateur avec un profil est au moins membre
      return true;
    } else if (role === 'staff') {
      // Staff et admin ont le rôle staff
      return profile.role === 'staff' || profile.role === 'admin';
    } else if (role === 'admin') {
      // Seuls les admins ont le rôle admin
      return profile.role === 'admin';
    }

    return false;
  },

  // Connexion avec email/mot de passe
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  // Inscription avec email/mot de passe
  async signUp(email: string, password: string, userData: { firstname: string; lastname: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstname: userData.firstname,
          lastname: userData.lastname,
          role: 'member', // Rôle par défaut
          status: 'pending' // Statut par défaut (en attente de validation)
        },
        emailRedirectTo: `${window.location.origin}/verify-email` // URL de redirection après vérification de l'email
      }
    });

    if (!error && data.user) {
      // Créer un profil utilisateur dans la table evscatala_profiles
      await supabase.from('evscatala_profiles').insert({
        user_id: data.user.id,
        email: email,
        firstname: userData.firstname,
        lastname: userData.lastname,
        role: 'member',
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    return { data, error };
  },

  // Vérifier et activer un compte par email
  async verifyAndActivateAccount(email: string) {
    try {
      // Récupérer le profil utilisateur par email
      const { data: profile, error: profileError } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError) {
        throw new Error(`Profil non trouvé: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('Utilisateur non trouvé');
      }

      // Mettre à jour le statut dans la table des profils
      const { error: updateError } = await supabase
        .from('evscatala_profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (updateError) {
        throw new Error(`Erreur lors de l'activation du compte: ${updateError.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la vérification du compte:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  // Déconnexion
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Demande de réinitialisation de mot de passe
  async resetPasswordRequest(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  },

  // Mise à jour du mot de passe (après réinitialisation)
  async updatePassword(newPassword: string) {
    return await supabase.auth.updateUser({
      password: newPassword
    });
  },

  // Récupération du profil utilisateur par ID
  async getUserProfileById(userId: string) {
    const { data, error } = await supabase
      .from('evscatala_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  },

  // Mise à jour du profil utilisateur
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('evscatala_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { data, error };
  },

  // Vérification si l'utilisateur est authentifié
  isAuthenticated() {
    return !!supabase.auth.getSession();
  }
}; 