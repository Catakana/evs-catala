
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAnnouncementStore } from '@/hooks/useAnnouncementStore';
import { AnnouncementViewMode } from '@/types/announcement';
import { useToast } from '@/hooks/use-toast';

const AnnouncementsHeader: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    viewMode, 
    setViewMode,
    selectedCategories,
    toggleCategory,
    showCreateModal,
    setShowCreateModal
  } = useAnnouncementStore();
  
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(true); // Mock admin status - in real app, this would come from auth

  const handleCreateAnnouncement = () => {
    if (!isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations requises pour créer des annonces.",
        variant: "destructive",
      });
      return;
    }
    
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Annonces</h1>
        <Button onClick={handleCreateAnnouncement}>
          <Plus className="mr-2 h-4 w-4" />
          Créer une annonce
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les annonces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('info')}
                onCheckedChange={() => toggleCategory('info')}
              >
                Information
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('urgent')}
                onCheckedChange={() => toggleCategory('urgent')}
              >
                Urgent
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('event')}
                onCheckedChange={() => toggleCategory('event')}
              >
                Événement
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes('project')}
                onCheckedChange={() => toggleCategory('project')}
              >
                Projet
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="border rounded-md flex">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid' as AnnouncementViewMode)}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list' as AnnouncementViewMode)}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsHeader;
