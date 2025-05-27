import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Plus, Search, Filter, Grid, List, Calendar, Paperclip, Edit, Archive, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { AnnouncementForm } from '../components/announcements/AnnouncementForm';
import { useAnnouncements, useAnnouncementActions, useAnnouncementFilters, useAnnouncementPermissions } from '../hooks/useAnnouncements';
import type { Announcement, AnnouncementCategory } from '../types/announcement';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

type ViewMode = 'list' | 'grid';

const AnnouncementsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    filters
  } = useAnnouncementFilters();

  const { announcements, loading, error, reload } = useAnnouncements(filters);
  const { deleteAnnouncement, archiveAnnouncement } = useAnnouncementActions();
  const { canCreate, canEditAnnouncement, canDeleteAnnouncement } = useAnnouncementPermissions();

  console.log('🎯 AnnouncementsPage render:', { 
    loading, 
    error, 
    announcementsCount: announcements.length,
    canCreate,
    showCreateForm 
  });

  // Filtrer les annonces côté client pour les catégories sélectionnées
  const filteredAnnouncements = announcements.filter(announcement => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(announcement.category as AnnouncementCategory);
  });

  const categoryStyles = {
    urgent: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    event: "bg-green-500 text-white",
    project: "bg-purple-500 text-white"
  };

  const handleCreateSuccess = (announcement: Announcement) => {
    console.log('✅ Annonce créée avec succès:', announcement);
    setShowCreateForm(false);
    reload();
  };

  const handleEditSuccess = (announcement: Announcement) => {
    console.log('✅ Annonce modifiée avec succès:', announcement);
    setEditingAnnouncement(null);
    reload();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
  };

  const handleDelete = async (announcement: Announcement) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${announcement.title}" ?`)) {
      const success = await deleteAnnouncement(announcement.id);
      if (success) {
        reload();
      }
    }
  };

  const handleArchive = async (announcement: Announcement) => {
    if (window.confirm(`Êtes-vous sûr de vouloir archiver l'annonce "${announcement.title}" ?`)) {
      const success = await archiveAnnouncement(announcement.id);
      if (success) {
        reload();
      }
    }
  };

  // Si on affiche le formulaire de création ou d'édition
  if (showCreateForm || editingAnnouncement) {
    return (
      <AnnouncementForm
        announcement={editingAnnouncement || undefined}
        onSuccess={editingAnnouncement ? handleEditSuccess : handleCreateSuccess}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingAnnouncement(null);
        }}
      />
    );
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Annonces</h1>
          {/* Bouton toujours visible pour les tests */}
          <Button onClick={() => setShowCreateForm(true)}>
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
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <strong>Debug:</strong> Loading: {loading ? 'Oui' : 'Non'}, 
        Error: {error || 'Aucune'}, 
        Annonces: {announcements.length}, 
        Filtrées: {filteredAnnouncements.length}
      </div>

      {/* Contenu */}
      <div className="mt-8">
        {loading && (
          <div className="text-center py-8">
            <p>Chargement des annonces...</p>
            <Button 
              variant="outline" 
              onClick={reload} 
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                onClick={reload} 
                className="ml-4"
                size="sm"
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && filteredAnnouncements.length === 0 && (
          <Alert>
            <AlertDescription>
              Aucune annonce trouvée. Créez la première annonce !
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && filteredAnnouncements.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
          }>
            {filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {announcement.isPinned && (
                        <Badge variant="secondary">Épinglé</Badge>
                      )}
                      <Badge className={cn(categoryStyles[announcement.category as keyof typeof categoryStyles])}>
                        {announcement.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(announcement.publishDate), { addSuffix: true, locale: fr })}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="line-clamp-3 text-sm mb-4">
                    {announcement.content}
                  </div>
                  
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Paperclip className="h-3 w-3" />
                      {announcement.attachments.length} pièce(s) jointe(s)
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Par {announcement.authorName}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(announcement)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
