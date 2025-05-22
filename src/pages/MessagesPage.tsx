import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Plus, Search, MessageSquare, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const MessagesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messagerie</h1>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button className="gap-1" variant="outline">
              <Users className="h-4 w-4" />
              Nouveau groupe
            </Button>
            
            <Button className="gap-1">
              <MessageSquare className="h-4 w-4" />
              Nouveau message
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel de gauche pour les conversations */}
          <div className="border rounded-lg h-[600px] flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-8" />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                {/* Liste des conversations à créer */}
                <div className="p-6 text-center text-muted-foreground">
                  Aucune conversation
                </div>
              </div>
            </ScrollArea>
          </div>
          
          {/* Panel de droite pour les messages */}
          <div className="border rounded-lg h-[600px] flex flex-col col-span-2">
            <div className="flex justify-center items-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Sélectionnez une conversation pour afficher les messages</p>
                <Button variant="outline" className="mt-4 gap-1">
                  <Plus className="h-4 w-4" />
                  Nouvelle conversation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MessagesPage; 