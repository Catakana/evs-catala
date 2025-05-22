
import React from 'react';
import { format, parseISO, isSameMonth, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  category: 'reunion' | 'animation' | 'atelier' | 'permanence' | 'autre';
  location?: string;
}

interface AgendaListViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const AgendaListView: React.FC<AgendaListViewProps> = ({ selectedDate, events, onEventClick }) => {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    return parseISO(a.start).getTime() - parseISO(b.start).getTime();
  });
  
  // Group events by date
  const groupedEvents: Record<string, Event[]> = {};
  
  sortedEvents.forEach(event => {
    const dateKey = format(parseISO(event.start), 'yyyy-MM-dd');
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'reunion': return "bg-blue-500";
      case 'animation': return "bg-amber-500";
      case 'atelier': return "bg-emerald-500";
      case 'permanence': return "bg-purple-500";
      default: return "bg-slate-500";
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'reunion': return "Réunion";
      case 'animation': return "Animation";
      case 'atelier': return "Atelier";
      case 'permanence': return "Permanence";
      default: return "Autre";
    }
  };

  // If no events in the current month, show a message
  if (Object.keys(groupedEvents).length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Aucun événement pour le moment</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
        <Card key={dateKey}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {format(parseISO(dateKey), 'EEEE d MMMM yyyy', { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dateEvents.map(event => (
                <div 
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge className={cn("ml-2", getCategoryColor(event.category))}>
                      {getCategoryLabel(event.category)}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>
                      {format(parseISO(event.start), 'HH:mm', { locale: fr })} - 
                      {format(parseISO(event.end), 'HH:mm', { locale: fr })}
                    </div>
                    {event.location && (
                      <div className="mt-1">
                        Lieu: {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AgendaListView;
