import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

// Types pour le contexte d'authentification
type AuthContextType = {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: { firstname: string; lastname: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
};

// Valeur par défaut du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Props du provider
type AuthProviderProps = {
  children: ReactNode;
};

// Provider du contexte
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  // Fonction pour rafraîchir la session
  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsStaff(false);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
    }
  };

  // Fonction pour récupérer le profil de l'utilisateur
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return;
      }

      const profile = data as UserProfile;
      setUserProfile(profile);
      setIsAdmin(profile.role === 'admin');
      setIsStaff(profile.role === 'staff' || profile.role === 'admin');
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  // Initialisation et écoute des changements d'authentification
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Récupération de la session actuelle
        await refreshSession();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Abonnement aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Événement d\'authentification:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
          setIsStaff(false);
        }
      }
    );

    // Nettoyage de l'abonnement
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { error: error instanceof Error ? error : new Error('Erreur de connexion') };
    }
  };

  // Inscription
  const signUp = async (
    email: string, 
    password: string, 
    userData: { firstname: string; lastname: string }
  ) => {
    try {
      // Obtenir l'URL de redirection basée sur l'origine actuelle
      const redirectUrl = window.location.origin;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstname: userData.firstname,
            lastname: userData.lastname,
            role: 'member', // Rôle par défaut
            status: 'pending' // Statut par défaut
          },
          emailRedirectTo: `${redirectUrl}/verify-email`
        }
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      // Création du profil utilisateur
      // Note: cette étape sera normalement gérée par un trigger côté serveur
      // Mais nous l'ajoutons ici pour garantir la création du profil
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: profileError } = await supabase
          .from('evscatala_profiles')
          .insert({
            user_id: user.id,
            email: email,
            firstname: userData.firstname,
            lastname: userData.lastname,
            role: 'member',
            status: 'pending'
          });

        if (profileError) {
          console.error('Erreur lors de la création du profil:', profileError);
          // Ne pas renvoyer d'erreur ici car l'inscription a réussi
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { error: error instanceof Error ? error : new Error('Erreur d\'inscription') };
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', error);
      return { error: error instanceof Error ? error : new Error('Erreur de réinitialisation du mot de passe') };
    }
  };

  // Mise à jour du mot de passe
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return { error: error instanceof Error ? error : new Error('Erreur de mise à jour du mot de passe') };
    }
  };

  // Mise à jour du profil
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      return { error: new Error('Utilisateur non connecté') };
    }

    try {
      const { error } = await supabase
        .from('evscatala_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Rafraîchir le profil après mise à jour
      await fetchUserProfile(user.id);
      
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { error: error instanceof Error ? error : new Error('Erreur de mise à jour du profil') };
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    isStaff,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 