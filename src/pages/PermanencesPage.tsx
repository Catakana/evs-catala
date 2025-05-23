import React, { useState, useEffect } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Permanence } from '@/types/permanence';
import { permanenceService } from '@/lib/permanenceService';
import PermanencesHeader from '@/components/permanences/PermanencesHeader';
import PermanencesCalendar from '@/components/permanences/PermanencesCalendar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export default function PermanencesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [permanences, setPermanences] = useState<Permanence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchPermanences();
  }, [selectedDate, view]);

  const fetchPermanences = async () => {
    try {
      setLoading(true);
      let startDate: string;
      let endDate: string;
      
      if (view === 'week') {
        const firstDay = new Date(selectedDate);
        firstDay.setDate(selectedDate.getDate() - selectedDate.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      } else {
        const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      }
      
      const data = await permanenceService.getPermanencesByPeriod(startDate, endDate);
      setPermanences(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des permanences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les permanences. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPeriod = () => {
    setSelectedDate(view === 'month' ? subMonths(selectedDate, 1) : new Date(selectedDate.setDate(selectedDate.getDate() - 7)));
  };

  const handleNextPeriod = () => {
    setSelectedDate(view === 'month' ? addMonths(selectedDate, 1) : new Date(selectedDate.setDate(selectedDate.getDate() + 7)));
  };

  const handleViewChange = (newView: 'week' | 'month') => {
    setView(newView);
  };

  const handleRegisterForPermanence = async (permanenceId: string) => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour vous inscrire à une permanence.",
        variant: "destructive"
      });
      return;
    }

    try {
      await permanenceService.registerForPermanence(permanenceId, user.id);
      toast({
        title: "Succès",
        description: "Vous êtes inscrit à la permanence.",
        variant: "default"
      });
      fetchPermanences();
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la permanence:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vous inscrire. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleUnregisterFromPermanence = async (permanenceId: string) => {
    if (!user) return;

    try {
      await permanenceService.unregisterFromPermanence(permanenceId, user.id);
      toast({
        title: "Succès",
        description: "Vous êtes désinscrit de la permanence.",
        variant: "default"
      });
      fetchPermanences();
    } catch (error) {
      console.error('Erreur lors de la désinscription de la permanence:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vous désinscrire. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des permanences</h1>
      
      <PermanencesHeader 
        selectedDate={selectedDate}
        view={view}
        onPrevious={handlePreviousPeriod}
        onNext={handleNextPeriod}
        onViewChange={handleViewChange}
      />
      
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <PermanencesCalendar 
            view={view}
            selectedDate={selectedDate}
            isMobile={isMobile}
            permanences={permanences}
            onRegister={handleRegisterForPermanence}
            onUnregister={handleUnregisterFromPermanence}
            currentUserId={user?.id}
          />
        )}
      </div>
    </div>
  );
}
