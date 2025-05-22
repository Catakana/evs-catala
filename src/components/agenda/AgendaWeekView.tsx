
import React from 'react';
import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  category: 'reunion' | 'animation' | 'atelier' | 'permanence' | 'autre';
  location?: string;
}

interface AgendaWeekViewProps {
  selectedDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

const AgendaWeekView: React.FC<AgendaWeekViewProps> = ({ selectedDate, events, onEventClick }) => {
  // Get the week interval
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  
  // Get all days in the week
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Hours for the week view (simplified to 8h-20h)
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i);
  
  // Get events for a specific day and hour
  const getEventsForHourAndDay = (day: Date, hour: number): Event[] => {
    return events.filter(event => {
      const eventStart = parseISO(event.start);
      const eventEnd = parseISO(event.end);
      
      return isSameDay(eventStart, day) && 
             eventStart.getHours() <= hour && 
             eventEnd.getHours() > hour;
    });
  };
  
  return (
    <div className="overflow-x-auto">
      <Table className="border">
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="w-16">Heure</TableHead>
            {days.map((day, idx) => (
              <TableHead key={idx} className="min-w-[120px] text-center">
                <div className="font-medium">{format(day, 'EEEE', { locale: fr })}</div>
                <div className={cn(
                  "text-sm",
                  isSameDay(day, new Date()) && "text-primary font-bold"
                )}>
                  {format(day, 'd MMM', { locale: fr })}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hours.map((hour) => (
            <TableRow key={hour}>
              <TableCell className="font-medium text-muted-foreground text-xs">
                {hour}:00
              </TableCell>
              
              {days.map((day, dayIdx) => {
                const hourEvents = getEventsForHourAndDay(day, hour);
                
                return (
                  <TableCell key={dayIdx} className="p-1 h-12 align-top">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          "px-1 py-0.5 text-xs mb-1 rounded cursor-pointer text-white truncate",
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
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgendaWeekView;
