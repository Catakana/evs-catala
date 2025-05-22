import React from 'react';
import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CalendarEvent } from './AgendaCalendar';

interface AgendaWeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const AgendaWeekView: React.FC<AgendaWeekViewProps> = ({ selectedDate, events, onEventClick }) => {
  // Get all days of the selected week
  const weekStart = startOfWeek(selectedDate, { locale: fr });
  const weekEnd = endOfWeek(selectedDate, { locale: fr });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Time slots for the week view (8h-20h)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);
  
  // Function to get events for a specific day and time slot
  const getEventsForSlot = (day: Date, hour: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = parseISO(event.start);
      const eventEnd = parseISO(event.end);
      
      return (
        isSameDay(eventStart, day) && 
        eventStart.getHours() <= hour && 
        eventEnd.getHours() > hour
      );
    });
  };
  
  return (
    <div className="overflow-x-auto">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Heure</TableHead>
            {days.map((day, idx) => (
              <TableHead key={idx} className="text-center min-w-[120px]">
                <div className="font-medium">{format(day, 'EEE', { locale: fr })}</div>
                <div className={cn(
                  "text-sm font-normal",
                  isSameDay(day, new Date()) && "text-primary font-medium"
                )}>
                  {format(day, 'd MMM', { locale: fr })}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map(hour => (
            <TableRow key={hour}>
              <TableCell className="text-muted-foreground text-sm">
                {hour}:00
              </TableCell>
              
              {days.map((day, dayIdx) => {
                const slotEvents = getEventsForSlot(day, hour);
                
                return (
                  <TableCell 
                    key={dayIdx} 
                    className={cn(
                      "h-16 align-top p-1 border",
                      hour % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    )}
                  >
                    {slotEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          "px-2 py-1 text-xs rounded cursor-pointer text-white mb-1 truncate",
                          event.category === 'reunion' && "bg-blue-500",
                          event.category === 'animation' && "bg-amber-500",
                          event.category === 'atelier' && "bg-emerald-500",
                          event.category === 'permanence' && "bg-purple-500",
                          event.category === 'autre' && "bg-slate-500"
                        )}
                      >
                        {/* If event starts at this hour, show the time */}
                        {parseISO(event.start).getHours() === hour && (
                          <span className="font-medium">
                            {format(parseISO(event.start), 'HH:mm')} - {' '}
                          </span>
                        )}
                        {event.title}
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
