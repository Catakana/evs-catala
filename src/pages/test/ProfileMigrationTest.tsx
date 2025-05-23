import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProfileMigrationTest: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de Migration des Profils</CardTitle>
          <CardDescription>
            Outil pour tester la migration des profils utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Cette page est une page de test. Elle sera utilisée ultérieurement pour tester la migration des profils.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button disabled>
              Exécuter la migration (non disponible)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileMigrationTest; 