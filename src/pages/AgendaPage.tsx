import React, { useState, useEffect } from 'react';
import AgendaCalendar from '@/components/agenda/AgendaCalendar';
import AgendaHeader from '@/components/agenda/AgendaHeader';
import AgendaFilters from '@/components/agenda/AgendaFilters';
import EventDetailModal from '@/components/agenda/EventDetailModal';
import { EventModal } from '@/components/agenda/EventModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { eventService, Event, EventFilters } from '@/lib/eventService';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/supabase';

const AgendaPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // États pour les filtres
  const [filters, setFilters] = useState<EventFilters>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // États pour le modal de détail
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  // Charger le rôle de l'utilisateur
  useEffect(() => {
    async function loadUserRole() {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const profile = await authService.getUserProfile(user.id);
          if (profile) {
            setUserRole(profile.role);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
      }
    }
    
    loadUserRole();
  }, []);

  // Charger les événements
  useEffect(() => {
    loadEvents();
  }, []);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      if (Object.keys(filters).length === 0) {
        // Aucun filtre, afficher tous les événements
        setFilteredEvents(events);
      } else {
        // Appliquer les filtres
        const filtered = await eventService.getEventsWithFilters(filters);
        setFilteredEvents(filtered);
      }
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
      setFilteredEvents(events);
    }
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  const handleEventClick = (eventId: string) => {
    setDetailEventId(eventId);
    setIsDetailModalOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedEventId(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });
      refreshEvents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    }
  };

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  // Convertir les événements pour l'affichage
  const displayEvents = filteredEvents.map(event => eventService.convertToDisplayEvent(event));

  // Vérifier si l'utilisateur peut créer des événements
  const canCreateEvent = userRole === 'admin' || userRole === 'staff';

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* En-tête avec navigation et filtres */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <div className="flex items-center space-x-2">
            {/* Filtres */}
            <AgendaFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            />
            
            {/* Bouton de création (si autorisé) */}
            {canCreateEvent && (
              <Button size="sm" onClick={handleCreateEvent}>
                <PlusCircle className="mr-1 h-4 w-4" />
                Nouvel événement
              </Button>
            )}
          </div>
        </div>

        {/* Navigation de l'agenda */}
        <AgendaHeader 
          view={view} 
          setView={setView}
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate}
          onAddEvent={canCreateEvent ? handleCreateEvent : undefined}
          onFilter={() => setIsFiltersOpen(!isFiltersOpen)}
        />

        {/* Indicateur de filtres actifs */}
        {Object.keys(filters).length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filtres actifs:</span>
            {filters.categories && filters.categories.length > 0 && (
              <span className="bg-muted px-2 py-1 rounded">
                {filters.categories.length} catégorie{filters.categories.length > 1 ? 's' : ''}
              </span>
            )}
            {filters.dateFrom && (
              <span className="bg-muted px-2 py-1 rounded">
                À partir du {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="bg-muted px-2 py-1 rounded">
                Jusqu'au {filters.dateTo}
              </span>
            )}
            {filters.location && (
              <span className="bg-muted px-2 py-1 rounded">
                Lieu: {filters.location}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              className="text-xs"
            >
              Effacer les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AgendaCalendar 
            view={view} 
            selectedDate={selectedDate} 
            isMobile={isMobile}
            events={displayEvents}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Statistiques rapides */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary">{filteredEvents.length}</p>
            <p className="text-sm text-muted-foreground">
              Événement{filteredEvents.length > 1 ? 's' : ''} affiché{filteredEvents.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {filteredEvents.filter(e => new Date(e.start_datetime) >= new Date()).length}
            </p>
            <p className="text-sm text-muted-foreground">À venir</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {new Set(filteredEvents.map(e => e.category)).size}
            </p>
            <p className="text-sm text-muted-foreground">
              Catégorie{new Set(filteredEvents.map(e => e.category)).size > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
      
      {/* Modal d'ajout/modification d'événement */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventSaved={refreshEvents}
        eventId={selectedEventId}
        initialDate={selectedDate}
      />

      {/* Modal de détail d'événement */}
      <EventDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        eventId={detailEventId}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onEventUpdated={refreshEvents}
      />
    </div>
  );
};

export default AgendaPage;
