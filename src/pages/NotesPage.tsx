import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Tag,
  Calendar,
  User,
  Lock,
  Share
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { notesService, Note, NoteFilters } from '@/lib/notesService';
import { authService } from '@/lib/supabase';
import { QuickNoteModal } from '@/components/notes/QuickNoteModal';

export default function NotesPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Filtres
  const [filters, setFilters] = useState<NoteFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
  }, [notes, filters, searchTerm]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Charger l'utilisateur actuel
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }

      // Charger les notes
      await loadNotes();
      
      // Charger les tags disponibles
      const tags = await notesService.getAvailableTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const notesData = await notesService.getNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par contexte
    if (filters.context_type) {
      filtered = filtered.filter(note => note.context_type === filters.context_type);
    }

    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(note => note.status === filters.status);
    }

    // Filtre par tag
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(note => 
        filters.tags!.some(tag => note.tags.includes(tag))
      );
    }

    // Filtre par auteur (pour les admins)
    if (filters.author_id) {
      filtered = filtered.filter(note => note.author_id === filters.author_id);
    }

    setFilteredNotes(filtered);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      await notesService.deleteNote(noteId);
      toast({
        title: "Note supprimée",
        description: "La note a été supprimée avec succès",
      });
      await loadNotes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOptions = notesService.getStatusOptions();
    const option = statusOptions.find(opt => opt.value === status);
    return option || { label: status, color: 'bg-gray-500' };
  };

  const getContextIcon = (contextType: string) => {
    const contextOptions = notesService.getContextOptions();
    const option = contextOptions.find(opt => opt.value === contextType);
    return option?.icon || '📝';
  };

  const canEditNote = (note: Note) => {
    if (!currentUser) return false;
    return note.author_id === currentUser.id || currentUser.profile?.role === 'admin';
  };

  const canDeleteNote = (note: Note) => {
    if (!currentUser) return false;
    return note.author_id === currentUser.id || currentUser.profile?.role === 'admin';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des notes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">📝 Notes</h1>
          <p className="text-muted-foreground">
            Gérez vos notes, idées et compte-rendus
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle note
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-sm text-muted-foreground">Total notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {notes.filter(n => n.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {notes.filter(n => n.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">À valider</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {notes.filter(n => n.status === 'validated').length}
            </div>
            <p className="text-sm text-muted-foreground">Validées</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.context_type || ''}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  context_type: value as 'event' | 'project' | 'free' || undefined 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Contexte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les contextes</SelectItem>
                <SelectItem value="free">📝 Notes libres</SelectItem>
                <SelectItem value="event">📅 Événements</SelectItem>
                <SelectItem value="project">📌 Projets</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || ''}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  status: value as 'draft' | 'validated' | 'pending' || undefined 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="draft">📝 Brouillon</SelectItem>
                <SelectItem value="pending">⌛ À valider</SelectItem>
                <SelectItem value="validated">✅ Validée</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.tags?.[0] || ''}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  tags: value ? [value] : undefined 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    #{tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des notes */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                {notes.length === 0 ? (
                  <>
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium mb-2">Aucune note</h3>
                    <p>Créez votre première note pour commencer</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
                    <p>Aucune note ne correspond à vos critères de recherche</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    {/* En-tête de la note */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getContextIcon(note.context_type)}</span>
                        <div>
                          {note.title && (
                            <h3 className="font-semibold text-lg">{note.title}</h3>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={note.author?.avatar_url} />
                              <AvatarFallback>
                                {note.author?.firstname?.[0]}{note.author?.lastname?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {note.author?.firstname} {note.author?.lastname}
                            </span>
                            <span>•</span>
                            <span>
                              {format(parseISO(note.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </span>
                            {note.is_private && (
                              <>
                                <span>•</span>
                                <Lock className="h-3 w-3" />
                                <span>Privée</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(note.status).color}>
                          {getStatusBadge(note.status).label}
                        </Badge>
                        {canEditNote(note) && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteNote(note) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Contenu de la note */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 line-clamp-3">
                        {note.content}
                      </p>
                    </div>

                    {/* Tags et contexte */}
                    <div className="flex flex-wrap items-center gap-2">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {note.context_event && (
                        <Badge variant="secondary" className="text-xs">
                          📅 {note.context_event.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de création */}
      <QuickNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onNoteSaved={() => {
          setIsCreateModalOpen(false);
          loadNotes();
        }}
      />
    </div>
  );
} 