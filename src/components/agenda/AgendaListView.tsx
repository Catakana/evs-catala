import React from 'react';
import { format, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from './AgendaCalendar';
import { parseAsLocalDateTime } from '@/lib/dateUtils';

interface AgendaListViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const AgendaListView: React.FC<AgendaListViewProps> = ({ selectedDate, events, onEventClick }) => {
  // Group events by month
  const eventsByMonth: Record<string, CalendarEvent[]> = {};
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    parseAsLocalDateTime(a.start).getTime() - parseAsLocalDateTime(b.start).getTime()
  );
  
  // Group events by month
  sortedEvents.forEach(event => {
    const eventDate = parseAsLocalDateTime(event.start);
    const monthKey = format(eventDate, 'yyyy-MM');
    
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    
    eventsByMonth[monthKey].push(event);
  });
  
  // Get formatted category badges
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'reunion':
        return <Badge className="bg-blue-500">Réunion</Badge>;
      case 'animation':
        return <Badge className="bg-amber-500">Animation</Badge>;
      case 'atelier':
        return <Badge className="bg-emerald-500">Atelier</Badge>;
      case 'permanence':
        return <Badge className="bg-purple-500">Permanence</Badge>;
      default:
        return <Badge className="bg-slate-500">Autre</Badge>;
    }
  };
  
  // Format dates for display
  const formatEventDate = (event: CalendarEvent) => {
    const startDate = parseAsLocalDateTime(event.start);
    const endDate = parseAsLocalDateTime(event.end);
    
    const startStr = format(startDate, 'EEEE d MMMM yyyy', { locale: fr });
    const timeStr = `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
    
    return { date: startStr, time: timeStr };
  };

  // If no events, show message
  if (Object.keys(eventsByMonth).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Aucun événement à afficher.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-8">
      {Object.keys(eventsByMonth).sort().map(monthKey => {
        const monthEvents = eventsByMonth[monthKey];
        const monthDate = parseAsLocalDateTime(`${monthKey}-01`);
        const isCurrentMonth = isSameMonth(monthDate, selectedDate);
        
        return (
          <Card key={monthKey} className={cn(
            isCurrentMonth && "border-primary"
          )}>
            <CardHeader className={cn(
              "pb-2",
              isCurrentMonth && "bg-primary/5"
            )}>
              <CardTitle className="text-lg">
                {format(monthDate, 'MMMM yyyy', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {monthEvents.map(event => {
                const { date, time } = formatEventDate(event);
                
                return (
                  <div 
                    key={event.id}
                    className="py-4 cursor-pointer hover:bg-muted/50 -mx-6 px-6 transition-colors"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{date}</p>
                        <p className="text-sm">
                          <span className="font-medium">{time}</span>
                          {event.location && ` • ${event.location}`}
                        </p>
                      </div>
                      <div>
                        {getCategoryBadge(event.category)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AgendaListView;
