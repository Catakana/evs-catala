
import React from 'react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, CalendarPlus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgendaHeaderProps {
  view: 'month' | 'week' | 'day' | 'list';
  setView: (view: 'month' | 'week' | 'day' | 'list') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({ 
  view, 
  setView, 
  selectedDate, 
  setSelectedDate 
}) => {
  const { toast } = useToast();

  const handleAddEvent = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La création d'événements sera bientôt disponible.",
      duration: 3000,
    });
  };

  const handleFilter = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "Le filtrage des événements sera bientôt disponible.",
      duration: 3000,
    });
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
    } else if (view === 'week') {
      setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
    } else if (view === 'day') {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    }
  };

  const getHeaderTitle = () => {
    if (view === 'month') {
      return format(selectedDate, 'MMMM yyyy', { locale: fr });
    } else if (view === 'week') {
      const start = format(selectedDate, 'd', { locale: fr });
      const end = format(addDays(selectedDate, 6), 'd MMMM yyyy', { locale: fr });
      return `${start} - ${end}`;
    } else if (view === 'day') {
      return format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr });
    } else {
      return 'Liste des événements';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleFilter}>
            <Filter className="mr-1 h-4 w-4" />
            Filtrer
          </Button>
          <Button size="sm" onClick={handleAddEvent}>
            <CalendarPlus className="mr-1 h-4 w-4" />
            Nouvel événement
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-lg font-medium capitalize">
            {getHeaderTitle()}
          </span>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedDate(new Date())}
            className="ml-2"
          >
            Aujourd'hui
          </Button>
        </div>
        
        <Tabs 
          defaultValue="month" 
          value={view}
          onValueChange={(val) => setView(val as 'month' | 'week' | 'day' | 'list')}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="month">Mois</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="day">Jour</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default AgendaHeader;
