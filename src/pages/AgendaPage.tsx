
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AgendaCalendar from '@/components/agenda/AgendaCalendar';
import AgendaHeader from '@/components/agenda/AgendaHeader';
import { useIsMobile } from '@/hooks/use-mobile';

const AgendaPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <AgendaHeader 
          view={view}
          setView={setView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        
        <div className="mt-6">
          <AgendaCalendar 
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

export default AgendaPage;
