import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

/**
 * Page de test pour la navigation
 * Contient plusieurs sections longues pour tester le comportement au défilement
 */
const NavTestPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">Test de Navigation</h1>
          <p className="text-muted-foreground">
            Cette page permet de tester le comportement de la barre de navigation inférieure lors du défilement.
            Faites défiler vers le bas pour voir la barre disparaître, et vers le haut pour la faire réapparaître.
          </p>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Navigation par catégories</h2>
          <p className="text-muted-foreground">
            La barre de navigation est maintenant organisée en catégories avec des sous-menus :
          </p>
          
          <Tabs defaultValue="layout">
            <TabsList>
              <TabsTrigger value="layout">Structure</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="behavior">Comportement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Structure de la navigation</CardTitle>
                  <CardDescription>Organisation de la barre de navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    <li>La barre est positionnée en bas de l'écran sur toutes les résolutions</li>
                    <li>Chaque catégorie a son propre sous-menu qui s'ouvre vers le haut</li>
                    <li>L'accueil est accessible directement sans sous-menu</li>
                    <li>Animations fluides lors de l'ouverture/fermeture des sous-menus</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Catégories disponibles</CardTitle>
                  <CardDescription>Les principales sections de l'application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-accent rounded-lg">
                      <h3 className="font-medium mb-2">Accueil</h3>
                      <p className="text-sm text-muted-foreground">Page d'accueil principale</p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <h3 className="font-medium mb-2">Organisation</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Agenda</li>
                        <li>Permanences</li>
                        <li>Votes (supprimé)</li>
                        <li>Annonces</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <h3 className="font-medium mb-2">Infos</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Messages</li>
                        <li>Trombinoscope</li>
                        <li>Infos générales</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <h3 className="font-medium mb-2">Profil</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Mon profil</li>
                        <li>Paramètres</li>
                        <li>Déconnexion</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="behavior" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comportement de la navigation</CardTitle>
                  <CardDescription>Interactions avec la barre de navigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    La barre de navigation disparaît lors du défilement vers le bas et réapparaît lors du défilement vers le haut.
                    Les sous-menus se ferment automatiquement lors du défilement.
                  </p>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Tester le défilement</h4>
                    <Button 
                      onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
                      className="mr-2"
                    >
                      Défiler vers le bas
                    </Button>
                    <Button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      variant="outline"
                    >
                      Remonter en haut
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Plusieurs sections pour créer une page longue */}
        {Array.from({ length: 8 }).map((_, index) => (
          <section key={index} className="space-y-4">
            <h2 className="text-2xl font-bold">Section {index + 1}</h2>
            <Card>
              <CardHeader>
                <CardTitle>Contenu de test {index + 1}</CardTitle>
                <CardDescription>Section pour tester le défilement de page</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, 
                  nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nunc. Nullam euismod, nisl eget ultricies aliquam,
                  nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nunc.
                </p>
                <p>
                  Nullam euismod, nisl eget ultricies aliquam, nunc nisl ultricies nunc, vitae ultricies nisl nisl eget nunc.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam.
                </p>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </AppLayout>
  );
};

export default NavTestPage; 