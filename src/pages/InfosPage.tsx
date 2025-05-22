import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building, FileDown, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InfosPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <h1 className="text-3xl font-bold mb-6">Informations générales</h1>
        
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="links">Liens utiles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>L'Espace de Vie Sociale CATALA</span>
                </CardTitle>
                <CardDescription>
                  Présentation de notre association
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Qui sommes-nous ?</h3>
                <p>
                  L'Espace de Vie Sociale (EVS) CATALA est un lieu ouvert à tous qui favorise le lien social,
                  les rencontres intergénérationnelles et les initiatives citoyennes. Nous proposons des activités
                  culturelles, éducatives et de loisirs pour tous les habitants du territoire.
                </p>
                
                <h3>Notre mission</h3>
                <p>
                  Notre objectif est de créer un espace de convivialité, d'échanges et de partage, 
                  qui contribue à la cohésion sociale et au mieux-vivre ensemble. Nous encourageons
                  la participation des habitants et soutenons les projets collectifs.
                </p>
                
                <h3>Nos valeurs</h3>
                <ul>
                  <li>Solidarité et entraide</li>
                  <li>Respect et inclusion</li>
                  <li>Participation et citoyenneté</li>
                  <li>Innovation sociale</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Documents officiels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Statuts de l'association</span>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileDown className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Règlement intérieur</span>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileDown className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Charte des bénévoles</span>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileDown className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>Adhésion</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Formulaire d'adhésion</span>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileDown className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Tarifs et cotisations</span>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileDown className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="links" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  <span>Liens utiles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                      <Link className="h-4 w-4" />
                      <span>Site web officiel</span>
                    </a>
                    <p className="text-sm text-muted-foreground ml-6">Le site web de l'EVS CATALA</p>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                      <Link className="h-4 w-4" />
                      <span>Page Facebook</span>
                    </a>
                    <p className="text-sm text-muted-foreground ml-6">Suivez notre actualité sur Facebook</p>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                      <Link className="h-4 w-4" />
                      <span>Chaîne YouTube</span>
                    </a>
                    <p className="text-sm text-muted-foreground ml-6">Retrouvez nos vidéos et tutoriels</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default InfosPage; 