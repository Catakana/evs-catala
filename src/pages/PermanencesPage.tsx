
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PermanencesHeader from '@/components/permanences/PermanencesHeader';
import PermanencesCalendar from '@/components/permanences/PermanencesCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

const PermanencesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <h1 className="text-2xl font-bold mb-6">Permanences / Ouvertures du local</h1>
        
        <PermanencesHeader 
          view={view}
          setView={setView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        
        <div className="mt-6">
          <PermanencesCalendar 
            view={view} 
            selectedDate={selectedDate} 
            isMobile={isMobile} 
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PermanencesPage;
