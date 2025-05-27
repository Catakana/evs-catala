import React from 'react';
import { Permanence } from '@/types/permanence';
import PermanencesWeekView from './PermanencesWeekView';
import PermanencesMonthView from './PermanencesMonthView';
import { PermanenceModal } from './PermanenceModal';

interface PermanencesCalendarProps {
  view: 'week' | 'month';
  selectedDate: Date;
  isMobile: boolean;
  permanences: Permanence[];
  onRegister?: (permanenceId: string) => Promise<void>;
  onUnregister?: (permanenceId: string) => Promise<void>;
  onDelete?: (permanenceId: string) => Promise<void>;
  currentUserId?: string;
  userRole?: string | null;
  onCreateClick?: (date: Date, timeSlot: { start: number, end: number }) => void;
}

const PermanencesCalendar: React.FC<PermanencesCalendarProps> = ({ 
  view, 
  selectedDate, 
  permanences,
  isMobile,
  onRegister,
  onUnregister,
  onDelete,
  currentUserId,
  userRole,
  onCreateClick
}) => {
  const [selectedPermanence, setSelectedPermanence] = React.useState<Permanence | null>(null);

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
    await onRegister?.(permanenceId);
    // Fermer la modal après l'inscription
    setSelectedPermanence(null);
  };

  // Gérer la désinscription d'une permanence
  const handleUnregister = async (permanenceId: string) => {
    await onUnregister?.(permanenceId);
    // Fermer la modal après la désinscription
    setSelectedPermanence(null);
  };

  // Gérer la suppression d'une permanence
  const handleDelete = async (permanenceId: string) => {
    await onDelete?.(permanenceId);
    // Fermer la modal après la suppression
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
          onCreateClick={onCreateClick}
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
          isUserRegistered={
            !!currentUserId && 
            selectedPermanence.participants?.some(p => p.user_id === currentUserId)
          }
          onRegister={
            onRegister ? 
            () => onRegister(selectedPermanence.id) : 
            undefined
          }
          onUnregister={
            onUnregister ? 
            () => onUnregister(selectedPermanence.id) : 
            undefined
          }
          onDelete={
            onDelete ? 
            () => onDelete(selectedPermanence.id) : 
            undefined
          }
          currentUserId={currentUserId}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default PermanencesCalendar;
