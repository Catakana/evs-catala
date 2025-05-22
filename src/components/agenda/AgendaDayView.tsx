
import React from 'react';
import { format, parseISO, eachHourOfInterval, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  category: 'reunion' | 'animation' | 'atelier' | 'permanence' | 'autre';
  location?: string;
}

interface AgendaDayViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const AgendaDayView: React.FC<AgendaDayViewProps> = ({ selectedDate, events, onEventClick }) => {
  // Generate time slots for a day view (8h-20h)
  const hours = eachHourOfInterval({
    start: new Date(selectedDate.setHours(8, 0, 0, 0)),
    end: new Date(selectedDate.setHours(20, 0, 0, 0)),
  });
  
  // Filter events for the selected day
  const dayEvents = events.filter(event => 
    isSameDay(parseISO(event.start), selectedDate)
  );
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 divide-y">
        {hours.map((hour, idx) => (
          <div key={idx} className="relative min-h-[100px]">
            <div className="absolute top-0 left-0 w-16 p-2 text-xs text-muted-foreground border-r">
              {format(hour, 'HH:mm')}
            </div>
            
            <div className="ml-16 p-1">
              {/* Display events that start in this hour */}
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
                      "px-2 py-1 rounded text-sm mb-1 cursor-pointer text-white",
                      event.category === 'reunion' && "bg-blue-500",
                      event.category === 'animation' && "bg-amber-500",
                      event.category === 'atelier' && "bg-emerald-500",
                      event.category === 'permanence' && "bg-purple-500",
                      event.category === 'autre' && "bg-slate-500",
                    )}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs">
                      {format(parseISO(event.start), 'HH:mm', { locale: fr })} - 
                      {format(parseISO(event.end), 'HH:mm', { locale: fr })}
                      {event.location && ` • ${event.location}`}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaDayView;
