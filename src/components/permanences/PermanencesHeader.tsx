import React from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PermanencesHeaderProps {
  selectedDate: Date;
  view: 'week' | 'month';
  onPrevious: () => void;
  onNext: () => void;
  onViewChange: (view: 'week' | 'month') => void;
}

const PermanencesHeader: React.FC<PermanencesHeaderProps> = ({
  selectedDate,
  view,
  onPrevious,
  onNext,
  onViewChange
}) => {
  // Formatage de la date selon la vue
  const getFormattedDate = () => {
    if (view === 'week') {
      // Obtenir le premier jour de la semaine (dimanche)
      const firstDay = new Date(selectedDate);
      firstDay.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      // Obtenir le dernier jour de la semaine (samedi)
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      
      // Format: "Semaine du 1 au 7 janvier 2023"
      return `Semaine du ${format(firstDay, 'd', { locale: fr })} au ${format(lastDay, 'd MMMM yyyy', { locale: fr })}`;
    } else {
      // Format: "Janvier 2023"
      return format(selectedDate, 'MMMM yyyy', { locale: fr });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{getFormattedDate()}</h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue={view}
        onValueChange={(value) => onViewChange(value as 'week' | 'month')}
        className="w-full"
      >
        <TabsList className="grid w-40 grid-cols-2">
          <TabsTrigger value="week">
            <List className="h-4 w-4 mr-2" />
            Semaine
          </TabsTrigger>
          <TabsTrigger value="month">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Mois
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PermanencesHeader;
