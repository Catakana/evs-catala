import { supabase } from './supabase';
import { EventData } from '@/components/agenda/EventForm';

// Type pour l'événement complet dans la base de données
export interface Event {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  category: 'reunion' | 'animation' | 'atelier' | 'permanence' | 'autre';
  location?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  max_participants?: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

// Type pour les participants aux événements
export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'present' | 'absent' | 'maybe';
  registered_at: string;
}

// Type pour les filtres d'événements
export interface EventFilters {
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  createdBy?: string;
}

// Service pour les événements
export const eventService = {
  // Récupérer tous les événements
  async getEvents() {
    const { data, error } = await supabase
      .from('evscatala_events')
      .select('*')
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw error;
    }

    return data as Event[];
  },

  // Récupérer les événements avec filtres
  async getEventsWithFilters(filters: EventFilters = {}) {
    let query = supabase
      .from('evscatala_events')
      .select('*');

    // Appliquer les filtres
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    if (filters.dateFrom) {
      query = query.gte('start_datetime', `${filters.dateFrom}T00:00:00`);
    }

    if (filters.dateTo) {
      query = query.lte('start_datetime', `${filters.dateTo}T23:59:59`);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    query = query.order('start_datetime', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des événements filtrés:', error);
      throw error;
    }

    return data as Event[];
  },

  // Récupérer les événements pour une période donnée
  async getEventsByPeriod(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('evscatala_events')
      .select('*')
      .gte('start_datetime', `${startDate}T00:00:00`)
      .lte('start_datetime', `${endDate}T23:59:59`)
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des événements par période:', error);
      throw error;
    }

    return data as Event[];
  },

  // Récupérer un événement par ID
  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('evscatala_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
      throw error;
    }

    return data as Event;
  },

  // Récupérer un événement avec ses participants
  async getEventWithParticipants(id: string) {
    const { data: event, error: eventError } = await supabase
      .from('evscatala_events')
      .select(`
        *,
        participants:evscatala_event_participants(
          id,
          user_id,
          status,
          registered_at,
          user:evscatala_profiles(firstname, lastname, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (eventError) {
      console.error(`Erreur lors de la récupération de l'événement avec participants ${id}:`, eventError);
      throw eventError;
    }

    return event;
  },

  // Créer un événement
  async createEvent(eventData: EventData, userId: string) {
    // Formatage des dates
    const startDateTime = `${eventData.start_date}T${eventData.start_time}:00`;
    const endDateTime = `${eventData.end_date}T${eventData.end_time}:00`;
    
    const { data, error } = await supabase
      .from('evscatala_events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        category: eventData.category,
        location: eventData.location,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      throw error;
    }

    return data as Event;
  },

  // Mettre à jour un événement
  async updateEvent(id: string, eventData: EventData) {
    // Formatage des dates
    const startDateTime = `${eventData.start_date}T${eventData.start_time}:00`;
    const endDateTime = `${eventData.end_date}T${eventData.end_time}:00`;
    
    const { data, error } = await supabase
      .from('evscatala_events')
      .update({
        title: eventData.title,
        description: eventData.description,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        category: eventData.category,
        location: eventData.location,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour de l'événement ${id}:`, error);
      throw error;
    }

    return data as Event;
  },

  // Supprimer un événement
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('evscatala_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de l'événement ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === GESTION DES PARTICIPANTS ===

  // S'inscrire à un événement
  async registerToEvent(eventId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('evscatala_event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered',
          registered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          throw new Error('La table des participants n\'existe pas encore. Veuillez exécuter le script de création de la base de données.');
        }
        console.error(`Erreur lors de l'inscription à l'événement ${eventId}:`, error);
        throw error;
      }

      return data as EventParticipant;
    } catch (error) {
      console.error(`Erreur lors de l'inscription à l'événement ${eventId}:`, error);
      throw error;
    }
  },

  // Se désinscrire d'un événement
  async unregisterFromEvent(eventId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('evscatala_event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          throw new Error('La table des participants n\'existe pas encore. Veuillez exécuter le script de création de la base de données.');
        }
        console.error(`Erreur lors de la désinscription de l'événement ${eventId}:`, error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors de la désinscription de l'événement ${eventId}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut de participation
  async updateParticipationStatus(eventId: string, userId: string, status: 'registered' | 'present' | 'absent' | 'maybe') {
    try {
      const { data, error } = await supabase
        .from('evscatala_event_participants')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          throw new Error('La table des participants n\'existe pas encore. Veuillez exécuter le script de création de la base de données.');
        }
        console.error(`Erreur lors de la mise à jour du statut de participation:`, error);
        throw error;
      }

      return data as EventParticipant;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de participation:`, error);
      throw error;
    }
  },

  // Vérifier si un utilisateur est inscrit à un événement
  async isUserRegistered(eventId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('evscatala_event_participants')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.warn('Table evscatala_event_participants non trouvée');
          return null;
        }
        console.error(`Erreur lors de la vérification d'inscription:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Erreur lors de la vérification d'inscription:`, error);
      return null;
    }
  },

  // Récupérer les participants d'un événement
  async getEventParticipants(eventId: string) {
    try {
      // Utiliser une requête RPC ou une approche différente pour éviter le problème de relation
      const { data, error } = await supabase
        .rpc('get_event_participants_with_profiles', { event_id_param: eventId });

      if (error) {
        // Si la fonction RPC n'existe pas, utiliser une approche alternative
        console.warn('Fonction RPC non trouvée, utilisation d\'une approche alternative');
        return await this.getEventParticipantsAlternative(eventId);
      }

      return data || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des participants:`, error);
      // En cas d'erreur, essayer l'approche alternative
      return await this.getEventParticipantsAlternative(eventId);
    }
  },

  // Méthode alternative pour récupérer les participants
  async getEventParticipantsAlternative(eventId: string) {
    try {
      // Récupérer d'abord les participants
      const { data: participants, error: participantsError } = await supabase
        .from('evscatala_event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: true });

      if (participantsError) {
        if (participantsError.code === 'PGRST106' || participantsError.message.includes('does not exist')) {
          console.warn('Table evscatala_event_participants non trouvée, retour d\'un tableau vide');
          return [];
        }
        throw participantsError;
      }

      if (!participants || participants.length === 0) {
        return [];
      }

      // Récupérer les profils pour chaque participant
      const userIds = participants.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('evscatala_profiles')
        .select('user_id, firstname, lastname, avatar_url, role')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Erreur lors de la récupération des profils:', profilesError);
        // Retourner les participants sans les profils
        return participants.map(p => ({ ...p, user: null }));
      }

      // Joindre les données
      const participantsWithProfiles = participants.map(participant => {
        const profile = profiles?.find(p => p.user_id === participant.user_id);
        return {
          ...participant,
          user: profile || null
        };
      });

      return participantsWithProfiles;
    } catch (error) {
      console.error(`Erreur lors de la récupération des participants (méthode alternative):`, error);
      return [];
    }
  },

  // === FONCTIONS UTILITAIRES ===

  // Convertir un événement du format DB au format du formulaire
  convertToFormData(event: Event): EventData {
    const startDateTime = new Date(event.start_datetime);
    const endDateTime = new Date(event.end_datetime);

    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      start_date: startDateTime.toISOString().split('T')[0],
      start_time: startDateTime.toISOString().split('T')[1].substring(0, 5),
      end_date: endDateTime.toISOString().split('T')[0],
      end_time: endDateTime.toISOString().split('T')[1].substring(0, 5),
      category: event.category,
      location: event.location
    };
  },

  // Convertir un événement du format d'API au format d'affichage
  convertToDisplayEvent(event: Event) {
    return {
      id: event.id,
      title: event.title,
      start: event.start_datetime,
      end: event.end_datetime,
      category: event.category,
      location: event.location
    };
  },

  // Récupérer les événements à venir (pour notifications)
  async getUpcomingEvents(hoursAhead: number = 24) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('evscatala_events')
      .select('*')
      .gte('start_datetime', now.toISOString())
      .lte('start_datetime', futureTime.toISOString())
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des événements à venir:', error);
      throw error;
    }

    return data as Event[];
  },

  // Récupérer les catégories disponibles
  getCategoryOptions() {
    return [
      { value: 'reunion', label: 'Réunion', color: 'bg-blue-500' },
      { value: 'animation', label: 'Animation', color: 'bg-amber-500' },
      { value: 'atelier', label: 'Atelier', color: 'bg-emerald-500' },
      { value: 'permanence', label: 'Permanence', color: 'bg-purple-500' },
      { value: 'autre', label: 'Autre', color: 'bg-slate-500' }
    ];
  }
}; 