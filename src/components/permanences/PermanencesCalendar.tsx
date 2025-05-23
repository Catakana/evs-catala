import React, { useState } from 'react';
import PermanencesWeekView from './PermanencesWeekView';
import PermanencesMonthView from './PermanencesMonthView';
import { Permanence, PermanenceStatus } from '@/types/permanence';
import { PermanenceModal } from './PermanenceModal';

interface PermanencesCalendarProps {
  view: 'week' | 'month';
  selectedDate: Date;
  isMobile: boolean;
  permanences: Permanence[];
  onRegister: (permanenceId: string) => Promise<void>;
  onUnregister: (permanenceId: string) => Promise<void>;
  currentUserId?: string;
}

const PermanencesCalendar: React.FC<PermanencesCalendarProps> = ({
  view,
  selectedDate,
  isMobile,
  permanences,
  onRegister,
  onUnregister,
  currentUserId
}) => {
  const [selectedPermanence, setSelectedPermanence] = useState<Permanence | null>(null);

  const handlePermanenceClick = (permanence: Permanence) => {
    setSelectedPermanence(permanence);
  };

  const handleCloseModal = () => {
    setSelectedPermanence(null);
  };

  // Vérifier si l'utilisateur actuel est inscrit à une permanence
  const isUserRegistered = (permanence: Permanence): boolean => {
    if (!currentUserId) return false;
    return permanence.participants?.some(p => p.user_id === currentUserId) || false;
  };

  // Gérer l'inscription à une permanence
  const handleRegister = async (permanenceId: string) => {
    await onRegister(permanenceId);
    // Fermer la modal après l'inscription
    setSelectedPermanence(null);
  };

  // Gérer la désinscription d'une permanence
  const handleUnregister = async (permanenceId: string) => {
    await onUnregister(permanenceId);
    // Fermer la modal après la désinscription
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
          onRegister={onRegister}
          onUnregister={onUnregister}
          currentUserId={currentUserId}
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
          onRegister={() => handleRegister(selectedPermanence.id)}
          onUnregister={() => handleUnregister(selectedPermanence.id)}
          isUserRegistered={isUserRegistered(selectedPermanence)}
          canRegister={currentUserId !== undefined && 
            selectedPermanence.status === PermanenceStatus.OPEN &&
            (selectedPermanence.participants || []).length < (selectedPermanence.max_volunteers || selectedPermanence.required_volunteers)}
        />
      )}
    </div>
  );
};

export default PermanencesCalendar;
