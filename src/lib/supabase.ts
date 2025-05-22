import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase à partir des variables d'environnement
// Utiliser les valeurs en dur si les variables d'environnement ne sont pas disponibles
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fcwvcjtnfxyzojolpisd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd3ZjanRuZnh5em9qb2xwaXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDE0ODQsImV4cCI6MjA1NzYxNzQ4NH0.5nhfFiobBMagzjpChJQGZ7TNqAWce6J3Mq6geMKtiCM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les utilisateurs
export type UserRole = 'member' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

// Service d'authentification
export const authService = {
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
        }
      }
    });

    if (!error && data.user) {
      // Créer un profil utilisateur dans la table evs_profiles
      await supabase.from('evs_profiles').insert({
        id: data.user.id,
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

  // Récupération de l'utilisateur courant
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },

  // Récupération du profil utilisateur
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('evs_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  },

  // Mise à jour du profil utilisateur
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('evs_profiles')
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