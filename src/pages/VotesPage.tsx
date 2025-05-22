import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VotesPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Votes et sondages</h1>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'active' | 'closed')}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrer" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="closed">Terminés</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Nouveau vote
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="votes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="votes">Votes officiels</TabsTrigger>
            <TabsTrigger value="surveys">Sondages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="votes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contenu des votes à créer */}
              <div className="p-12 border rounded-lg flex items-center justify-center text-muted-foreground">
                Aucun vote en cours
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="surveys" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contenu des sondages à créer */}
              <div className="p-12 border rounded-lg flex items-center justify-center text-muted-foreground">
                Aucun sondage en cours
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default VotesPage; 