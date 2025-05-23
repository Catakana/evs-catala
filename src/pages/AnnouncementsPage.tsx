import React from 'react';
import AnnouncementsHeader from '@/components/announcements/AnnouncementsHeader';
import AnnouncementsContent from '@/components/announcements/AnnouncementsContent';

const AnnouncementsPage: React.FC = () => {
  return (
    <div className="container py-6">
      <AnnouncementsHeader />
      <AnnouncementsContent />
    </div>
  );
};

export default AnnouncementsPage;
