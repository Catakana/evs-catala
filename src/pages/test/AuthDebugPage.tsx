import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';

const AuthDebugPage = () => {
  const { user, userProfile, loading, refreshSession } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [supSession, setSupSession] = useState<any>(null);

  // Ajouter un log avec timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  // Récupérer la session directement de Supabase
  const checkDirectSession = async () => {
    try {
      addLog('Vérification directe de la session Supabase...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`Erreur lors de la récupération de la session: ${error.message}`);
        return;
      }
      
      setSupSession(data.session);
      
      if (data.session) {
        addLog(`Session trouvée, utilisateur: ${data.session.user.email}`);
      } else {
        addLog('Aucune session trouvée');
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Tester la connexion
  const testLogin = async () => {
    try {
      addLog('Test de connexion avec nguyenvanjean@gmail.com...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nguyenvanjean@gmail.com',
        password: '!!Jano070287!!'
      });
      
      if (error) {
        addLog(`Erreur de connexion: ${error.message}`);
      } else {
        addLog('Connexion réussie!');
        await refreshSession();
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Vérifier le profil
  const checkProfile = async () => {
    if (!user) {
      addLog('Aucun utilisateur connecté pour vérifier le profil');
      return;
    }
    
    try {
      addLog(`Vérification du profil pour l'utilisateur ${user.id}...`);
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        addLog(`Erreur lors de la récupération du profil: ${error.message}`);
      } else if (data) {
        addLog(`Profil trouvé: ${data.firstname} ${data.lastname} (${data.role})`);
      } else {
        addLog('Aucun profil trouvé');
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Tester la déconnexion
  const testLogout = async () => {
    try {
      addLog('Déconnexion...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addLog(`Erreur de déconnexion: ${error.message}`);
      } else {
        addLog('Déconnexion réussie!');
        await refreshSession();
      }
    } catch (err) {
      addLog(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Vérifier la session au chargement
  useEffect(() => {
    addLog('Page chargée, vérification de l\'état d\'authentification...');
    addLog(`État de chargement: ${loading ? 'En cours' : 'Terminé'}`);
    addLog(`Utilisateur connecté: ${user ? 'Oui' : 'Non'}`);
    
    if (user) {
      addLog(`Email de l'utilisateur: ${user.email}`);
      addLog(`ID de l'utilisateur: ${user.id}`);
    }
    
    addLog(`Profil utilisateur: ${userProfile ? 'Disponible' : 'Non disponible'}`);
    
    if (userProfile) {
      addLog(`Nom complet: ${userProfile.firstname} ${userProfile.lastname}`);
      addLog(`Rôle: ${userProfile.role}`);
      addLog(`Statut: ${userProfile.status}`);
    }
    
    checkDirectSession();
  }, [user, userProfile, loading]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Débogage d'authentification</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>État d'authentification</CardTitle>
            <CardDescription>Informations sur l'utilisateur connecté</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Chargement:</h3>
                <p>{loading ? 'En cours...' : 'Terminé'}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium">Utilisateur (contexte):</h3>
                {user ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">ID:</span> {user.id}</p>
                    <p><span className="font-medium">Créé le:</span> {new Date(user.created_at || '').toLocaleString()}</p>
                  </div>
                ) : (
                  <p>Non connecté</p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium">Session Supabase directe:</h3>
                {supSession ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">ID Session:</span> {supSession.user.id}</p>
                    <p><span className="font-medium">Email:</span> {supSession.user.email}</p>
                    <p><span className="font-medium">Expire:</span> {new Date(supSession.expires_at * 1000).toLocaleString()}</p>
                  </div>
                ) : (
                  <p>Aucune session</p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium">Profil utilisateur:</h3>
                {userProfile ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">Nom:</span> {userProfile.firstname} {userProfile.lastname}</p>
                    <p><span className="font-medium">Rôle:</span> {userProfile.role}</p>
                    <p><span className="font-medium">Statut:</span> {userProfile.status}</p>
                  </div>
                ) : (
                  <p>Non disponible</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={checkDirectSession}>Actualiser la session</Button>
            <Button onClick={refreshSession}>Rafraîchir le contexte</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Tester les fonctionnalités d'authentification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testLogin} className="w-full">
                Se connecter (Test)
              </Button>
              
              <Button onClick={checkProfile} className="w-full">
                Vérifier le profil
              </Button>
              
              <Button onClick={testLogout} variant="destructive" className="w-full">
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Journal des opérations d'authentification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugPage; 