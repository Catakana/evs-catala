import React from 'react';
import { format, parseISO, eachHourOfInterval, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarEvent } from './AgendaCalendar';

interface AgendaDayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const AgendaDayView: React.FC<AgendaDayViewProps> = ({ selectedDate, events, onEventClick }) => {
  // Generate hours for the day (7AM to 9PM)
  const hours = eachHourOfInterval({
    start: new Date(selectedDate.setHours(7, 0, 0, 0)),
    end: new Date(selectedDate.setHours(21, 0, 0, 0))
  });

  // Filter events for the selected day
  const dayEvents = events.filter(event => {
    const eventDate = parseISO(event.start);
    return isSameDay(eventDate, selectedDate);
  });

  // Sort events by start time
  dayEvents.sort((a, b) => {
    return parseISO(a.start).getTime() - parseISO(b.start).getTime();
  });
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">
        {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
      </h2>
      
      {/* Timeline view */}
      <div className="bg-white rounded-lg border">
        {hours.map((hour, idx) => (
          <div 
            key={idx} 
            className={cn(
              "border-b last:border-b-0 py-2 px-3 grid grid-cols-[80px_1fr] gap-4",
              hour.getHours() % 2 === 0 ? "bg-white" : "bg-slate-50"
            )}
          >
            <div className="text-sm text-muted-foreground">
              {format(hour, 'HH:mm')}
            </div>
            <div className="relative">
              {dayEvents
                .filter(event => {
                  const eventHour = parseISO(event.start).getHours();
                  return eventHour === hour.getHours();
                })
                .map(event => (
                  <div 
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "mb-1 px-2 py-1 text-sm rounded cursor-pointer text-white",
                      event.category === 'reunion' && "bg-blue-500",
                      event.category === 'animation' && "bg-amber-500",
                      event.category === 'atelier' && "bg-emerald-500",
                      event.category === 'permanence' && "bg-purple-500",
                      event.category === 'autre' && "bg-slate-500",
                    )}
                  >
                    <div className="font-medium">
                      {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                    </div>
                    <div>{event.title}</div>
                    {event.location && (
                      <div className="text-xs opacity-90">{event.location}</div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Event list for quick reference */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Événements du jour</h3>
          
          {dayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun événement prévu pour cette journée.</p>
          ) : (
            <ul className="space-y-2">
              {dayEvents.map(event => (
                <li 
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="text-sm p-2 rounded hover:bg-muted cursor-pointer"
                >
                  <span className="font-medium">{format(parseISO(event.start), 'HH:mm')}</span> - {event.title}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaDayView;
