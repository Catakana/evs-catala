
import React from 'react';
import { format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface PermanencesHeaderProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const PermanencesHeader: React.FC<PermanencesHeaderProps> = ({
  view,
  setView,
  selectedDate,
  setSelectedDate
}) => {
  const handlePrevious = () => {
    if (view === 'week') {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <span>
            {view === 'week' 
              ? `Semaine du ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`
              : format(selectedDate, 'MMMM yyyy', { locale: fr })}
          </span>
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-md overflow-hidden border">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-none ${view === 'week' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setView('week')}
          >
            Semaine
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-none ${view === 'month' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setView('month')}
          >
            Mois
          </Button>
        </div>

        <div className="flex rounded-md overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            className="rounded-r-none"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={handleToday}
          >
            Aujourd'hui
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="default" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};

export default PermanencesHeader;
