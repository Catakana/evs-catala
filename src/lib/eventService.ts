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
}

// Service pour les événements
export const eventService = {
  // Récupérer tous les événements
  async getEvents() {
    const { data, error } = await supabase
      .from('evs_events')
      .select('*')
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw error;
    }

    return data as Event[];
  },

  // Récupérer les événements pour une période donnée
  async getEventsByPeriod(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('evs_events')
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
      .from('evs_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
      throw error;
    }

    return data as Event;
  },

  // Créer un événement
  async createEvent(eventData: EventData, userId: string) {
    // Formatage des dates
    const startDateTime = `${eventData.start_date}T${eventData.start_time}:00`;
    const endDateTime = `${eventData.end_date}T${eventData.end_time}:00`;
    
    const { data, error } = await supabase
      .from('evs_events')
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
      .from('evs_events')
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
      .from('evs_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de l'événement ${id}:`, error);
      throw error;
    }

    return true;
  },

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
  }
}; 