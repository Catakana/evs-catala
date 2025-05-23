import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DemoAccounts from '@/components/auth/DemoAccounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/supabase';
import { t } from '@/lib/textBank';

/**
 * Page de test pour les fonctionnalités d'authentification
 * Cette page permet de tester les comptes de démonstration et l'authentification
 */
const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Page de test</h1>
            <p className="text-muted-foreground mb-4">
              Cette page est destinée à tester les fonctionnalités d'authentification et de gestion des utilisateurs.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 mb-2">
                Environnement de test
              </Badge>
              <p className="text-amber-800">
                Les comptes de démonstration ci-dessous sont disponibles pour tester les différentes fonctionnalités 
                de l'application sans avoir à créer un compte. Ils sont préchargés avec des rôles et permissions spécifiques.
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="w-full mb-8">
              <TabsTrigger value="demo" className="flex-1">Comptes de démonstration</TabsTrigger>
              <TabsTrigger value="status" className="flex-1">Statut d'authentification</TabsTrigger>
              <TabsTrigger value="guest" className="flex-1">Mode invité</TabsTrigger>
            </TabsList>
            
            <TabsContent value="demo" className="space-y-6">
              <DemoAccounts />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">À propos des comptes de démonstration</CardTitle>
                  <CardDescription>
                    Informations sur les types de comptes et leurs permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Compte Membre</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Accès de base, peut consulter mais ne peut pas modifier la plupart des contenus.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>✅ Voir le calendrier</div>
                        <div>✅ Voir le trombinoscope</div>
                        <div>✅ S'inscrire aux permanences</div>
                        <div>✅ Lire les annonces</div>
                        <div>❌ Créer des événements</div>
                        <div>❌ Publier des annonces</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Compte Staff</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Accès étendu, peut créer et gérer la plupart des contenus.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>✅ Créer des événements</div>
                        <div>✅ Gérer les permanences</div>
                        <div>✅ Publier des annonces</div>
                        <div>✅ Organiser des votes</div>
                        <div>❌ Gérer les utilisateurs</div>
                        <div>❌ Accéder aux paramètres système</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Compte Admin</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Accès complet, peut tout gérer, y compris les utilisateurs et les paramètres.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>✅ Gérer les utilisateurs</div>
                        <div>✅ Attribuer des rôles</div>
                        <div>✅ Accéder aux paramètres</div>
                        <div>✅ Supprimer du contenu</div>
                        <div>✅ Exporter des données</div>
                        <div>✅ Toutes les actions du staff</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Statut d'authentification</CardTitle>
                  <CardDescription>
                    Information sur le statut de connexion actuel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AuthenticationStatus />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="guest">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Mode Invité</CardTitle>
                  <CardDescription>
                    Accès limité sans authentification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Le mode invité permet de consulter certaines informations publiques sans avoir à se connecter.
                    Ce mode est actuellement en développement.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Fonctionnalités accessibles en mode invité :</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Consultation des événements publics dans le calendrier</li>
                      <li>Consultation des annonces publiques</li>
                      <li>Vue limitée du trombinoscope (sans coordonnées)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

/**
 * Composant qui affiche le statut d'authentification de l'utilisateur
 */
const AuthenticationStatus: React.FC = () => {
  const [status, setStatus] = React.useState<{
    isAuthenticated: boolean;
    user: any | null;
    profile: any | null;
    role: string | null;
  }>({
    isAuthenticated: false,
    user: null,
    profile: null,
    role: null
  });

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      // Vérifier si l'utilisateur est authentifié
      const user = await authService.getCurrentUser();
      const isAuthenticated = !!user;
      
      // Récupérer le profil si authentifié
      let profile = null;
      let role = null;
      
      if (user) {
        profile = await authService.getUserProfile(user.id);
        role = profile?.role || null;
      }
      
      setStatus({
        isAuthenticated,
        user,
        profile,
        role
      });
    };
    
    checkAuthStatus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="font-medium">Statut:</div>
        {status.isAuthenticated ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Connecté
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-100">
            Non connecté
          </Badge>
        )}
      </div>
      
      {status.isAuthenticated && status.user && (
        <>
          <div>
            <p className="font-medium mb-1">Information utilisateur:</p>
            <div className="bg-slate-50 p-3 rounded-md text-sm font-mono overflow-auto max-h-36">
              <div>Email: {status.user.email}</div>
              <div>ID: {status.user.id}</div>
              <div>Création: {new Date(status.user.created_at).toLocaleString()}</div>
            </div>
          </div>
          
          {status.profile && (
            <div>
              <p className="font-medium mb-1">Profil:</p>
              <div className="bg-slate-50 p-3 rounded-md text-sm overflow-hidden">
                <div><span className="font-medium">Nom:</span> {status.profile.firstname} {status.profile.lastname}</div>
                <div><span className="font-medium">Rôle:</span> {status.profile.role}</div>
                <div><span className="font-medium">Statut:</span> {status.profile.status}</div>
              </div>
            </div>
          )}
          
          {status.role && (
            <div>
              <p className="font-medium mb-1">Permissions:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Badge variant="outline" className={status.role === 'member' || status.role === 'staff' || status.role === 'admin' ? 'bg-green-100' : undefined}>
                    Accès membre
                  </Badge>
                </div>
                <div>
                  <Badge variant="outline" className={status.role === 'staff' || status.role === 'admin' ? 'bg-green-100' : undefined}>
                    Accès staff
                  </Badge>
                </div>
                <div>
                  <Badge variant="outline" className={status.role === 'admin' ? 'bg-green-100' : undefined}>
                    Accès admin
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestPage; 