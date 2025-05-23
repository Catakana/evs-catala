import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

const Dashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const profile = await authService.getUserProfile(user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue, {userProfile ? `${userProfile.firstname} ${userProfile.lastname}` : 'Utilisateur'}</CardTitle>
              <CardDescription>Votre espace personnel</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Accédez à vos informations et gérez votre compte.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Centre de communication</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Vous avez de nouveaux messages non lus.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Votes en cours</CardTitle>
              <CardDescription>Participez aux décisions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Plusieurs votes sont ouverts et attendent votre participation.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard; 