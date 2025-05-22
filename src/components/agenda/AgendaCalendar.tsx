
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek, getDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AgendaDayView from './AgendaDayView';
import AgendaWeekView from './AgendaWeekView';
import AgendaListView from './AgendaListView';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  category: 'reunion' | 'animation' | 'atelier' | 'permanence' | 'autre';
  location?: string;
}

interface AgendaCalendarProps {
  view: 'month' | 'week' | 'day' | 'list';
  selectedDate: Date;
  isMobile: boolean;
}

// Exemple d'événements pour la démo
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Réunion du bureau',
    start: '2025-05-22T10:00:00',
    end: '2025-05-22T12:00:00',
    category: 'reunion',
    location: 'Salle principale'
  },
  {
    id: '2',
    title: 'Atelier couture',
    start: '2025-05-24T14:00:00',
    end: '2025-05-24T16:30:00',
    category: 'atelier',
    location: 'Salle d\'activités'
  },
  {
    id: '3',
    title: 'Animation enfants',
    start: '2025-05-25T15:00:00',
    end: '2025-05-25T17:00:00',
    category: 'animation'
  },
  {
    id: '4',
    title: 'Permanence administrative',
    start: '2025-05-26T09:00:00',
    end: '2025-05-26T12:00:00',
    category: 'permanence',
    location: 'Bureau d\'accueil'
  }
];

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ view, selectedDate, isMobile }) => {
  const { toast } = useToast();

  // Function to handle event click
  const handleEventClick = (event: Event) => {
    toast({
      title: event.title,
      description: `${format(parseISO(event.start), 'PPp', { locale: fr })} - ${event.location || 'Aucun lieu spécifié'}`,
      duration: 3000,
    });
  };

  // Function to get events for a specific day
  const getEventsForDay = (day: Date): Event[] => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return MOCK_EVENTS.filter(event => {
      const eventDate = format(parseISO(event.start), 'yyyy-MM-dd');
      return eventDate === dayStr;
    });
  };

  // Generate the month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, { locale: fr });
    const endDate = endOfWeek(monthEnd, { locale: fr });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center py-2 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const dayEvents = getEventsForDay(day);
            
            return (
              <div 
                key={idx}
                className={cn(
                  "min-h-24 p-1 border border-muted relative",
                  !isCurrentMonth && "opacity-50 bg-muted/30",
                  isToday && "bg-accent/20"
                )}
                onClick={() => {
                  // Future enhancement: Show day details or create event
                }}
              >
                <div className="flex justify-between items-start">
                  <span 
                    className={cn(
                      "inline-block h-6 w-6 text-center rounded-full text-sm",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1 max-h-20 overflow-y-auto text-xs">
                  {dayEvents.map((event) => (
                    <div 
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className={cn(
                        "px-1 py-0.5 rounded-sm cursor-pointer text-white truncate",
                        event.category === 'reunion' && "bg-blue-500",
                        event.category === 'animation' && "bg-amber-500",
                        event.category === 'atelier' && "bg-emerald-500",
                        event.category === 'permanence' && "bg-purple-500",
                        event.category === 'autre' && "bg-slate-500",
                      )}
                    >
                      {format(parseISO(event.start), 'HH:mm')} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render the appropriate view
  if (view === 'day') {
    return <AgendaDayView selectedDate={selectedDate} events={MOCK_EVENTS} onEventClick={handleEventClick} />;
  }
  
  if (view === 'week') {
    return <AgendaWeekView selectedDate={selectedDate} events={MOCK_EVENTS} onEventClick={handleEventClick} />;
  }
  
  if (view === 'list') {
    return <AgendaListView selectedDate={selectedDate} events={MOCK_EVENTS} onEventClick={handleEventClick} />;
  }
  
  // Default to month view
  return renderMonthView();
};

export default AgendaCalendar;
