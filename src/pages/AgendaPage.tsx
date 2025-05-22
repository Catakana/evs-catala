import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AgendaCalendar from '@/components/agenda/AgendaCalendar';
import AgendaHeader from '@/components/agenda/AgendaHeader';
import { EventModal } from '@/components/agenda/EventModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { eventService, Event } from '@/lib/eventService';
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
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    async function loadEvents() {
      try {
        setIsLoading(true);
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les événements',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEvents();
  }, [toast]);

  // Ouvrir la modal pour ajouter un événement
  const handleAddEvent = () => {
    setSelectedEventId(undefined);
    setIsModalOpen(true);
  };

  // Gérer le clic sur un événement
  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  // Rafraîchir les événements
  const refreshEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des événements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir les événements pour l'affichage
  const displayEvents = events.map(event => eventService.convertToDisplayEvent(event));

  // Vérifier si l'utilisateur peut ajouter des événements (staff ou admin)
  const canAddEvents = userRole === 'staff' || userRole === 'admin';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agenda</h1>
          {canAddEvents && (
            <Button onClick={handleAddEvent}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un événement
            </Button>
          )}
        </div>
        
        <AgendaHeader 
          view={view}
          setView={setView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        
        <div className="mt-6">
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
      </main>
      
      <Footer />
      
      {/* Modal d'ajout/modification d'événement */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventSaved={refreshEvents}
        eventId={selectedEventId}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default AgendaPage;
