
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Permanence } from '@/types/permanence';
import PermanenceItem from './PermanenceItem';

interface PermanencesMonthViewProps {
  selectedDate: Date;
  permanences: Permanence[];
  onPermanenceClick: (permanence: Permanence) => void;
}

const PermanencesMonthView: React.FC<PermanencesMonthViewProps> = ({
  selectedDate,
  permanences,
  onPermanenceClick
}) => {
  // Get all days in the selected month and include days from previous/next month to fill complete weeks
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Group days into weeks
  const weeks: Date[][] = [];
  let week: Date[] = [];
  
  allDays.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-muted/20">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayName) => (
          <div key={dayName} className="p-2 text-center font-medium">
            {dayName}
          </div>
        ))}
      </div>

      <div className="divide-y">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x">
            {week.map((day, dayIndex) => {
              const dayPermanences = permanences.filter(perm => 
                isSameDay(perm.startDate, day)
              );

              return (
                <div 
                  key={dayIndex}
                  className={`min-h-28 p-1 ${
                    !isSameMonth(day, selectedDate) ? 'bg-muted/10 text-muted-foreground' : ''
                  } ${
                    isSameDay(day, new Date()) ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="text-xs font-medium p-1">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayPermanences.map((permanence) => (
                      <PermanenceItem 
                        key={permanence.id}
                        permanence={permanence}
                        onClick={() => onPermanenceClick(permanence)}
                        isCompact={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermanencesMonthView;
