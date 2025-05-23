import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

// Hook personnalisé pour l'authentification
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    // Récupérer la session à l'initialisation
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Si l'utilisateur est connecté, récupérer son profil pour les rôles
        if (session?.user) {
          const { data: profile } = await supabase
            .from('evscatala_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          setUserProfile(profile);
          
          // Définir les rôles basés sur le profil
          if (profile) {
            setIsAdmin(profile.role === 'admin');
            setIsStaff(profile.role === 'staff' || profile.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Si l'utilisateur est connecté, récupérer son profil pour les rôles
        if (session?.user) {
          const { data: profile } = await supabase
            .from('evscatala_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          setUserProfile(profile);
          
          // Définir les rôles basés sur le profil
          if (profile) {
            setIsAdmin(profile.role === 'admin');
            setIsStaff(profile.role === 'staff' || profile.role === 'admin');
          }
        } else {
          setUserProfile(null);
          setIsAdmin(false);
          setIsStaff(false);
        }
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Fonction d'inscription
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  };

  return {
    session,
    user,
    userProfile,
    loading,
    isAdmin,
    isStaff,
    signIn,
    signOut,
    signUp
  };
} 