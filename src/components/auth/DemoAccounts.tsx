import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, ShieldCheck, ShieldAlert, Clipboard } from 'lucide-react';
import { t } from '@/lib/textBank';
import { authService } from '@/lib/supabase';
import { toast } from 'sonner';

interface DemoAccount {
  email: string;
  password: string;
  role: 'member' | 'staff' | 'admin';
  description: string;
}

/**
 * Composant affichant les comptes de démonstration pour les tests
 * Ces comptes sont préconfigurés et peuvent être utilisés pour tester l'application
 */
const DemoAccounts: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Comptes de démonstration préconfigurés
  const demoAccounts: Record<string, DemoAccount> = {
    member: {
      email: 'demo-member@evscatala.fr',
      password: 'demo-member-2024',
      role: 'member',
      description: 'Compte membre standard avec accès limité'
    },
    staff: {
      email: 'demo-staff@evscatala.fr',
      password: 'demo-staff-2024',
      role: 'staff',
      description: 'Compte staff avec accès étendu pour gérer les événements et annonces'
    },
    admin: {
      email: 'demo-admin@evscatala.fr',
      password: 'demo-admin-2024',
      role: 'admin',
      description: 'Compte administrateur avec accès complet à toutes les fonctionnalités'
    }
  };

  // Se connecter avec un compte de démonstration
  const loginWithDemo = async (accountType: string) => {
    const account = demoAccounts[accountType];
    if (!account) return;

    setIsLoading(accountType);
    try {
      const { error } = await authService.signIn(account.email, account.password);
      if (error) throw error;
      
      toast.success(`Connecté en tant que ${accountType}`);
      // Redirection gérée par le composant auth provider
    } catch (err) {
      console.error('Erreur de connexion:', err);
      toast.error("Échec de la connexion avec le compte de démonstration");
    } finally {
      setIsLoading(null);
    }
  };

  // Copier les identifiants dans le presse-papier
  const copyCredentials = (account: DemoAccount) => {
    const text = `Email: ${account.email}\nMot de passe: ${account.password}`;
    navigator.clipboard.writeText(text);
    toast.success('Identifiants copiés dans le presse-papier');
  };

  // Rendu des onglets pour chaque type de compte
  const renderAccountTabs = () => {
    return (
      <Tabs defaultValue="member" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="member" className="flex items-center gap-1">
            <UserIcon size={14} /> Membre
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-1">
            <ShieldCheck size={14} /> Staff
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-1">
            <ShieldAlert size={14} /> Admin
          </TabsTrigger>
        </TabsList>

        {Object.entries(demoAccounts).map(([key, account]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="text-sm font-mono">{account.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyCredentials(account)}
                >
                  <Clipboard size={16} />
                </Button>
              </div>
              
              <div>
                <p className="font-medium">Mot de passe:</p>
                <p className="text-sm font-mono">{account.password}</p>
              </div>
              
              <div>
                <p className="font-medium">Description:</p>
                <p className="text-sm text-muted-foreground">{account.description}</p>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => loginWithDemo(key)} 
              disabled={!!isLoading}
            >
              {isLoading === key ? 'Connexion...' : `Se connecter en tant que ${key}`}
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Comptes de démonstration</CardTitle>
        <CardDescription>
          Utilisez ces comptes pour tester l'application sans créer de compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderAccountTabs()}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Note: Ces comptes sont partagés pour les démonstrations et tests. Ne stockez pas de données sensibles.
        </p>
      </CardFooter>
    </Card>
  );
};

export default DemoAccounts; 