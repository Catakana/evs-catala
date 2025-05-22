
import React from 'react';
import { useAnnouncementStore } from '@/hooks/useAnnouncementStore';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementListItem from './AnnouncementListItem';
import AnnouncementDetailModal from './AnnouncementDetailModal';
import AnnouncementCreateModal from './AnnouncementCreateModal';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const AnnouncementsContent: React.FC = () => {
  const { 
    filteredAnnouncements,
    viewMode,
    selectedAnnouncement,
    showDetailModal,
    showCreateModal,
    closeDetailModal,
    closeCreateModal,
  } = useAnnouncementStore();

  if (filteredAnnouncements.length === 0) {
    return (
      <Alert className="mt-8">
        <AlertTitle>Aucune annonce trouvée</AlertTitle>
        <AlertDescription>
          Aucune annonce ne correspond à vos critères de recherche ou il n'y a pas encore d'annonces publiées.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-8">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map(announcement => (
            <AnnouncementListItem key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}

      {selectedAnnouncement && showDetailModal && (
        <AnnouncementDetailModal 
          announcement={selectedAnnouncement}
          onClose={closeDetailModal}
        />
      )}

      {showCreateModal && (
        <AnnouncementCreateModal onClose={closeCreateModal} />
      )}
    </div>
  );
};

export default AnnouncementsContent;
