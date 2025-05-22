
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementsHeader from '@/components/announcements/AnnouncementsHeader';
import AnnouncementsContent from '@/components/announcements/AnnouncementsContent';

const AnnouncementsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-6">
        <AnnouncementsHeader />
        <AnnouncementsContent />
      </main>
      <Footer />
    </div>
  );
};

export default AnnouncementsPage;
