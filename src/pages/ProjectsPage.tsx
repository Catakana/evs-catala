import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ProjectsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Projets</h1>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un projet..." className="pl-8 w-[200px]" />
            </div>
            
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="planning">En préparation</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Contenu des projets actifs à créer */}
              <div className="p-12 border rounded-lg flex items-center justify-center text-muted-foreground">
                Aucun projet en cours
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="planning" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Contenu des projets en préparation à créer */}
              <div className="p-12 border rounded-lg flex items-center justify-center text-muted-foreground">
                Aucun projet en préparation
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Contenu des projets terminés à créer */}
              <div className="p-12 border rounded-lg flex items-center justify-center text-muted-foreground">
                Aucun projet terminé
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectsPage; 