import React, { useState, useEffect } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, UserPlus, ArrowRight, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { eventService, Event } from '@/lib/eventService';
import { authService } from '@/lib/supabase';
import { parseAsLocalDateTime } from '@/lib/dateUtils';

interface UpcomingEventsProps {
  maxEvents?: number;
  showRegistration?: boolean;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ 
  maxEvents = 3, 
  showRegistration = true 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRegistrations, setUserRegistrations] = useState<Record<string, any>>({});

  useEffect(() => {
    loadUpcomingEvents();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Charger les inscriptions de l'utilisateur pour les événements à venir
        if (events.length > 0) {
          await loadUserRegistrations(user.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      setIsLoading(true);
      // Récupérer les événements des 7 prochains jours
      const upcomingEvents = await eventService.getUpcomingEvents(24 * 7); // 7 jours
      setEvents(upcomingEvents.slice(0, maxEvents));
    } catch (error) {
      console.error('Erreur lors du chargement des événements à venir:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRegistrations = async (userId: string) => {
    try {
      const registrations: Record<string, any> = {};
      for (const event of events) {
        const registration = await eventService.isUserRegistered(event.id, userId);
        if (registration) {
          registrations[event.id] = registration;
        }
      }
      setUserRegistrations(registrations);
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
    }
  };

  const handleQuickRegister = async (eventId: string) => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour vous inscrire à un événement",
        variant: "destructive",
      });
      return;
    }

    try {
      if (userRegistrations[eventId]) {
        // Désinscription
        await eventService.unregisterFromEvent(eventId, currentUser.id);
        const newRegistrations = { ...userRegistrations };
        delete newRegistrations[eventId];
        setUserRegistrations(newRegistrations);
        
        toast({
          title: "Désinscription réussie",
          description: "Vous êtes maintenant désinscrit de cet événement",
        });
      } else {
        // Inscription
        await eventService.registerToEvent(eventId, currentUser.id);
        const registration = await eventService.isUserRegistered(eventId, currentUser.id);
        setUserRegistrations({
          ...userRegistrations,
          [eventId]: registration
        });
        
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à cet événement",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier votre inscription",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryOptions = eventService.getCategoryOptions();
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.color || 'bg-slate-500';
  };

  const getCategoryLabel = (category: string) => {
    const categoryOptions = eventService.getCategoryOptions();
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.label || category;
  };

  const formatEventDate = (dateString: string) => {
    const date = parseAsLocalDateTime(dateString);
    
    if (isToday(date)) {
      return "Aujourd'hui";
    } else if (isTomorrow(date)) {
      return "Demain";
    } else {
      return format(date, 'EEEE d MMMM', { locale: fr });
    }
  };

  const formatEventTime = (startString: string, endString: string) => {
    const start = parseAsLocalDateTime(startString);
    const end = parseAsLocalDateTime(endString);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochains événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochains événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucun événement prévu dans les prochains jours
          </p>
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/agenda')}
            >
              Voir l'agenda complet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochains événements
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/agenda')}
            className="text-muted-foreground hover:text-foreground"
          >
            Voir tout
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => {
          const isRegistered = !!userRegistrations[event.id];
          
          return (
            <div 
              key={event.id} 
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate('/agenda')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  {/* Titre et catégorie */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <Badge className={cn("text-white text-xs", getCategoryColor(event.category))}>
                      {getCategoryLabel(event.category)}
                    </Badge>
                  </div>

                  {/* Date et heure */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatEventDate(event.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatEventTime(event.start_datetime, event.end_datetime)}</span>
                    </div>
                  </div>

                  {/* Lieu */}
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {/* Description courte */}
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Bouton d'inscription rapide */}
                {showRegistration && currentUser && (
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <Button
                      size="sm"
                      variant={isRegistered ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickRegister(event.id);
                      }}
                      className="text-xs"
                    >
                      {isRegistered ? (
                        <>
                          <Users className="mr-1 h-3 w-3" />
                          Inscrit
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-1 h-3 w-3" />
                          S'inscrire
                        </>
                      )}
                    </Button>
                    
                    {isRegistered && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Inscrit
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Lien vers l'agenda complet */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => navigate('/agenda')}
          >
            Voir l'agenda complet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents; 