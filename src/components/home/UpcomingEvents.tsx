import React, { useState, useEffect } from 'react';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { eventService } from '@/lib/eventService';

interface Event {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  category: string;
  location?: string;
  created_by: string;
}

const UpcomingEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des événements...');
      const allEvents = await eventService.getEvents();
      console.log('📅 Événements récupérés:', allEvents);
      
      // Filtrer les événements futurs et prendre les 6 prochains
      const now = new Date();
      console.log('⏰ Date actuelle:', now.toISOString());
      
      const upcomingEvents = allEvents
        .filter(event => {
          const eventDate = new Date(event.start_datetime);
          const isFuture = eventDate >= now;
          console.log(`📊 Événement "${event.title}" (${event.start_datetime}): ${isFuture ? 'FUTUR' : 'PASSÉ'}`);
          return isFuture;
        })
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
        .slice(0, 6);
      
      console.log('✅ Événements futurs filtrés:', upcomingEvents);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, 'HH:mm')}`;
    } else if (isTomorrow(date)) {
      return `Demain à ${format(date, 'HH:mm')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE à HH:mm', { locale: fr });
    } else {
      return format(date, 'dd/MM à HH:mm', { locale: fr });
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      reunion: { label: 'Réunion', color: 'bg-blue-500' },
      animation: { label: 'Animation', color: 'bg-green-500' },
      atelier: { label: 'Atelier', color: 'bg-purple-500' },
      permanence: { label: 'Permanence', color: 'bg-orange-500' },
      autre: { label: 'Autre', color: 'bg-gray-500' }
    };
    
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.autre;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reunion': return '👥';
      case 'animation': return '🎉';
      case 'atelier': return '🛠️';
      case 'permanence': return '📋';
      default: return '📅';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochains événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochains événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-medium">Erreur lors du chargement</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={loadUpcomingEvents}
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochains événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun événement prévu pour le moment</p>
            <Button 
              variant="outline" 
              className="mt-4"
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
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Prochains événements
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/agenda')}
          className="gap-1"
        >
          Voir tout
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => {
            const categoryInfo = getCategoryBadge(event.category);
            return (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate('/agenda')}
              >
                <div className="text-2xl mt-1">
                  {getCategoryIcon(event.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">
                      {event.title}
                    </h3>
                    <Badge 
                      className={`${categoryInfo.color} text-white text-xs shrink-0`}
                    >
                      {categoryInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatEventDate(event.start_datetime)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {events.length === 6 && (
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/agenda')}
            >
              Voir tous les événements
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents; 