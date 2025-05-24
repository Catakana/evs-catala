import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Permanence } from '@/types/permanence';
import PermanenceItem from './PermanenceItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PermanencesWeekViewProps {
  selectedDate: Date;
  permanences: Permanence[];
  onPermanenceClick: (permanence: Permanence) => void;
  isMobile: boolean;
  onRegister?: (permanenceId: string) => Promise<void>;
  onUnregister?: (permanenceId: string) => Promise<void>;
  currentUserId?: string;
  onCreateClick?: (date: Date, timeSlot: { start: number, end: number }) => void;
}

const PermanencesWeekView: React.FC<PermanencesWeekViewProps> = ({
  selectedDate,
  permanences,
  onPermanenceClick,
  isMobile,
  onRegister,
  onUnregister,
  currentUserId,
  onCreateClick
}) => {
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });

  // Fixed time slots for the week view
  const timeSlots = [
    { start: 9, end: 12, label: '9h - 12h' },
    { start: 14, end: 17, label: '14h - 17h' },
    { start: 17, end: 20, label: '17h - 20h' },
  ];

  // Vérifier si l'utilisateur actuel est inscrit à une permanence
  const isUserRegistered = (permanence: Permanence): boolean => {
    if (!currentUserId) return false;
    return permanence.participants?.some(p => p.user_id === currentUserId) || false;
  };

  console.log("PermanencesWeekView rendered with", {
    permanences: permanences.length,
    currentUserId
  });

  // Fonction pour ouvrir le formulaire de création de permanence
  const handleCreateClick = (day: Date, timeSlot: { start: number, end: number }) => {
    if (onCreateClick) {
      // Créer une date avec la bonne heure pour le début du créneau
      const startDateTime = new Date(day);
      startDateTime.setHours(timeSlot.start, 0, 0);
      onCreateClick(startDateTime, timeSlot);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 bg-muted/20">
        <div className="p-2 border-r text-center font-medium">Heures</div>
        {daysOfWeek.map((day, index) => (
          <div 
            key={index} 
            className={`p-2 text-center border-r last:border-r-0 font-medium ${
              isSameDay(day, new Date()) ? 'bg-primary/10' : ''
            }`}
          >
            <div>{format(day, 'EEE', { locale: fr })}</div>
            <div className="text-sm">{format(day, 'dd/MM')}</div>
          </div>
        ))}
      </div>

      {timeSlots.map((slot, slotIndex) => (
        <div key={slotIndex} className="grid grid-cols-8 border-t">
          <div className="p-2 border-r flex items-center justify-center text-sm text-muted-foreground">
            {slot.label}
          </div>
          
          {daysOfWeek.map((day, dayIndex) => {
            const dayPermanences = permanences.filter(perm => {
              const permStartHour = new Date(perm.start_date).getHours();
              return isSameDay(new Date(perm.start_date), day) && 
                     permStartHour >= slot.start && 
                     permStartHour < slot.end;
            });
            
            return (
              <div key={dayIndex} className="p-1 border-r last:border-r-0 min-h-24 relative">
                {dayPermanences.length > 0 ? (
                  // Afficher les permanences existantes
                  dayPermanences.map((permanence) => (
                    <PermanenceItem 
                      key={permanence.id}
                      permanence={permanence}
                      onClick={() => onPermanenceClick(permanence)}
                      isUserRegistered={isUserRegistered(permanence)}
                      onRegister={onRegister}
                      onUnregister={onUnregister}
                      currentUserId={currentUserId}
                    />
                  ))
                ) : (
                  // Cellule vide avec bouton pour créer une permanence
                  onCreateClick && (
                    <div className="h-full w-full flex items-center justify-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 rounded-full p-0 opacity-50 hover:opacity-100 transition-opacity"
                        onClick={() => handleCreateClick(day, slot)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PermanencesWeekView;
