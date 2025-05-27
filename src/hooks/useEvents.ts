/**
 * Hook simplifié et robuste pour la gestion des événements
 */

import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../lib/eventService';

export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await eventService.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('❌ Erreur dans useEvents:', err);
      setError('Erreur lors du chargement des événements');
      setEvents([]); // Tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const reload = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    reload
  };
} 