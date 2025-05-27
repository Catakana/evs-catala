import { supabase } from './supabase';

// Types pour les notes
export interface Note {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  context_type: 'event' | 'project' | 'free';
  context_id?: string;
  status: 'draft' | 'validated' | 'pending';
  tags: string[];
  shared_with: string[];
  title?: string;
  is_private: boolean;
  // Relations
  author?: {
    firstname?: string;
    lastname?: string;
    avatar_url?: string;
  };
  context_event?: {
    title: string;
  };
}

export interface NoteData {
  content: string;
  title?: string;
  context_type: 'event' | 'project' | 'free';
  context_id?: string;
  status?: 'draft' | 'validated' | 'pending';
  tags?: string[];
  shared_with?: string[];
  is_private?: boolean;
}

export interface NoteFilters {
  context_type?: 'event' | 'project' | 'free';
  context_id?: string;
  status?: 'draft' | 'validated' | 'pending';
  tags?: string[];
  author_id?: string;
  search?: string;
}

// Service pour les notes
export const notesService = {
  // Récupérer toutes les notes accessibles
  async getNotes(filters: NoteFilters = {}) {
    try {
      // Utiliser une approche alternative pour éviter les problèmes de relation
      return await this.getNotesAlternative(filters);
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      return [];
    }
  },

  // Méthode alternative pour récupérer les notes
  async getNotesAlternative(filters: NoteFilters = {}) {
    try {
      let query = supabase
        .from('evscatala_notes')
        .select('*');

      // Appliquer les filtres
      if (filters.context_type) {
        query = query.eq('context_type', filters.context_type);
      }

      if (filters.context_id) {
        query = query.eq('context_id', filters.context_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.search) {
        query = query.or(`content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
      }

      query = query.order('updated_at', { ascending: false });

      const { data: notes, error } = await query;

      if (error) {
        // Si la table n'existe pas encore, retourner un tableau vide
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.warn('Table evscatala_notes non trouvée, retour d\'un tableau vide');
          return [];
        }
        throw error;
      }

      if (!notes || notes.length === 0) {
        return [];
      }

      // Récupérer les profils des auteurs
      const authorIds = [...new Set(notes.map(note => note.author_id))];
      const { data: profiles } = await supabase
        .from('evscatala_profiles')
        .select('user_id, firstname, lastname, avatar_url')
        .in('user_id', authorIds);

      // Récupérer les événements liés si nécessaire
      const eventIds = notes
        .filter(note => note.context_type === 'event' && note.context_id)
        .map(note => note.context_id)
        .filter(Boolean);
      
      let events = [];
      if (eventIds.length > 0) {
        const { data: eventsData } = await supabase
          .from('evscatala_events')
          .select('id, title')
          .in('id', eventIds);
        events = eventsData || [];
      }

      // Joindre les données
      const notesWithRelations = notes.map(note => {
        const author = profiles?.find(p => p.user_id === note.author_id);
        const contextEvent = note.context_type === 'event' && note.context_id 
          ? events.find(e => e.id === note.context_id)
          : null;

        return {
          ...note,
          author: author || null,
          context_event: contextEvent || null
        };
      });

      return notesWithRelations as Note[];
    } catch (error) {
      console.error('Erreur lors de la récupération des notes (méthode alternative):', error);
      return [];
    }
  },

  // Récupérer une note par ID
  async getNoteById(id: string) {
    try {
      const { data: note, error } = await supabase
        .from('evscatala_notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Erreur lors de la récupération de la note ${id}:`, error);
        throw error;
      }

      // Récupérer le profil de l'auteur
      const { data: author } = await supabase
        .from('evscatala_profiles')
        .select('user_id, firstname, lastname, avatar_url')
        .eq('user_id', note.author_id)
        .single();

      // Récupérer l'événement lié si nécessaire
      let contextEvent = null;
      if (note.context_type === 'event' && note.context_id) {
        const { data: event } = await supabase
          .from('evscatala_events')
          .select('id, title')
          .eq('id', note.context_id)
          .single();
        contextEvent = event;
      }

      return {
        ...note,
        author: author || null,
        context_event: contextEvent
      } as Note;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la note ${id}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle note
  async createNote(noteData: NoteData, userId: string) {
    try {
      const { data: note, error } = await supabase
        .from('evscatala_notes')
        .insert({
          content: noteData.content,
          title: noteData.title,
          author_id: userId,
          context_type: noteData.context_type,
          context_id: noteData.context_id,
          status: noteData.status || 'draft',
          tags: noteData.tags || [],
          shared_with: noteData.shared_with || [],
          is_private: noteData.is_private || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          throw new Error('La table des notes n\'existe pas encore. Veuillez exécuter le script de création de la base de données.');
        }
        console.error('Erreur lors de la création de la note:', error);
        throw error;
      }

      // Récupérer le profil de l'auteur
      const { data: author } = await supabase
        .from('evscatala_profiles')
        .select('user_id, firstname, lastname, avatar_url')
        .eq('user_id', note.author_id)
        .single();

      // Récupérer l'événement lié si nécessaire
      let contextEvent = null;
      if (note.context_type === 'event' && note.context_id) {
        const { data: event } = await supabase
          .from('evscatala_events')
          .select('id, title')
          .eq('id', note.context_id)
          .single();
        contextEvent = event;
      }

      return {
        ...note,
        author: author || null,
        context_event: contextEvent
      } as Note;
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      throw error;
    }
  },

  // Mettre à jour une note
  async updateNote(id: string, noteData: Partial<NoteData>) {
    try {
      const { data: note, error } = await supabase
        .from('evscatala_notes')
        .update({
          ...noteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error(`Erreur lors de la mise à jour de la note ${id}:`, error);
        throw error;
      }

      // Récupérer le profil de l'auteur
      const { data: author } = await supabase
        .from('evscatala_profiles')
        .select('user_id, firstname, lastname, avatar_url')
        .eq('user_id', note.author_id)
        .single();

      // Récupérer l'événement lié si nécessaire
      let contextEvent = null;
      if (note.context_type === 'event' && note.context_id) {
        const { data: event } = await supabase
          .from('evscatala_events')
          .select('id, title')
          .eq('id', note.context_id)
          .single();
        contextEvent = event;
      }

      return {
        ...note,
        author: author || null,
        context_event: contextEvent
      } as Note;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la note ${id}:`, error);
      throw error;
    }
  },

  // Supprimer une note
  async deleteNote(id: string) {
    try {
      const { error } = await supabase
        .from('evscatala_notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Erreur lors de la suppression de la note ${id}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la note ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les notes liées à un contexte spécifique
  async getNotesByContext(contextType: 'event' | 'project', contextId: string) {
    return this.getNotes({
      context_type: contextType,
      context_id: contextId
    });
  },

  // Récupérer les notes récentes (pour le dashboard)
  async getRecentNotes(limit: number = 5) {
    try {
      return await this.getNotesAlternative({ search: undefined });
    } catch (error) {
      console.error('Erreur lors de la récupération des notes récentes:', error);
      return [];
    }
  },

  // Partager une note avec d'autres utilisateurs
  async shareNote(noteId: string, userIds: string[]) {
    try {
      const { data, error } = await supabase
        .from('evscatala_notes')
        .update({
          shared_with: userIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        console.error(`Erreur lors du partage de la note ${noteId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Erreur lors du partage de la note ${noteId}:`, error);
      throw error;
    }
  },

  // Obtenir les tags disponibles
  async getAvailableTags() {
    try {
      const { data, error } = await supabase
        .from('evscatala_notes')
        .select('tags');

      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          return [];
        }
        console.error('Erreur lors de la récupération des tags:', error);
        return [];
      }

      // Extraire tous les tags uniques
      const allTags = data.flatMap(note => note.tags || []);
      const uniqueTags = [...new Set(allTags)].sort();

      return uniqueTags;
    } catch (error) {
      console.error('Erreur lors de la récupération des tags:', error);
      return [];
    }
  },

  // Obtenir les options de statut
  getStatusOptions() {
    return [
      { value: 'draft', label: 'Brouillon', color: 'bg-gray-500' },
      { value: 'pending', label: 'À valider', color: 'bg-yellow-500' },
      { value: 'validated', label: 'Validée', color: 'bg-green-500' }
    ];
  },

  // Obtenir les options de contexte
  getContextOptions() {
    return [
      { value: 'free', label: 'Note libre', icon: '📝' },
      { value: 'event', label: 'Événement', icon: '📅' },
      { value: 'project', label: 'Projet', icon: '��' }
    ];
  }
}; 