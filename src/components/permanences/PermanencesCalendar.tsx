
import React, { useState } from 'react';
import PermanencesWeekView from './PermanencesWeekView';
import PermanencesMonthView from './PermanencesMonthView';
import { Permanence, PermanenceStatus } from '@/types/permanence';
import { PermanenceModal } from './PermanenceModal';

interface PermanencesCalendarProps {
  view: 'week' | 'month';
  selectedDate: Date;
  isMobile: boolean;
}

const PermanencesCalendar: React.FC<PermanencesCalendarProps> = ({
  view,
  selectedDate,
  isMobile
}) => {
  // Mock data for permanences
  const [permanences, setPermanences] = useState<Permanence[]>([
    {
      id: '1',
      title: 'Permanence du matin',
      startDate: new Date(new Date().setHours(9, 0, 0, 0)),
      endDate: new Date(new Date().setHours(12, 0, 0, 0)),
      location: 'EVS Catala - Salle principale',
      status: 'confirmed',
      type: 'public',
      minMembers: 2,
      maxMembers: 4,
      participants: [
        { id: '1', name: 'Jean Dupont', status: 'confirmed' },
        { id: '2', name: 'Marie Martin', status: 'confirmed' }
      ],
      notes: 'Accueil du public et aide administrative',
    },
    {
      id: '2',
      title: 'Permanence de l\'après-midi',
      startDate: new Date(new Date().setHours(14, 0, 0, 0)),
      endDate: new Date(new Date().setHours(17, 0, 0, 0)),
      location: 'EVS Catala - Salle principale',
      status: 'pending',
      type: 'public',
      minMembers: 2,
      maxMembers: 4,
      participants: [
        { id: '1', name: 'Jean Dupont', status: 'confirmed' }
      ],
      notes: 'Besoin d\'une personne supplémentaire',
    },
    {
      id: '3',
      title: 'Maintenance informatique',
      startDate: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 0, 0, 0)),
      endDate: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(12, 0, 0, 0)),
      location: 'EVS Catala - Bureau',
      status: 'canceled',
      type: 'internal',
      minMembers: 1,
      maxMembers: 2,
      participants: [],
      notes: 'Maintenance annulée, reportée à la semaine prochaine',
    }
  ]);

  const [selectedPermanence, setSelectedPermanence] = useState<Permanence | null>(null);

  const handlePermanenceClick = (permanence: Permanence) => {
    setSelectedPermanence(permanence);
  };

  const handleCloseModal = () => {
    setSelectedPermanence(null);
  };

  return (
    <div>
      {view === 'week' ? (
        <PermanencesWeekView
          selectedDate={selectedDate}
          permanences={permanences}
          onPermanenceClick={handlePermanenceClick}
          isMobile={isMobile}
        />
      ) : (
        <PermanencesMonthView 
          selectedDate={selectedDate}
          permanences={permanences}
          onPermanenceClick={handlePermanenceClick}
        />
      )}

      {selectedPermanence && (
        <PermanenceModal
          permanence={selectedPermanence}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PermanencesCalendar;
