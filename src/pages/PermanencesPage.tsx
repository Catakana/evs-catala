import React, { useState, useEffect } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Permanence } from '@/types/permanence';
import { permanenceService } from '@/lib/permanenceService';
import PermanencesHeader from '@/components/permanences/PermanencesHeader';
import PermanencesCalendar from '@/components/permanences/PermanencesCalendar';
import { CreatePermanenceModal } from '@/components/permanences/CreatePermanenceModal';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export default function PermanencesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [permanences, setPermanences] = useState<Permanence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        console.log("Fetching current user...");
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error getting user:", error);
          return;
        }
        
        console.log("User data from supabase:", data.user);
        setUser(data.user);
        
        if (data.user) {
          // Récupérer le rôle de l'utilisateur à partir du JWT
          const jwt = await supabase.auth.getSession();
          console.log("Session data:", jwt);
          const userRole = jwt?.data?.session?.user?.app_metadata?.user_role || null;
          setUserRole(userRole);
          console.log("User role set to:", userRole);
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
      }
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
        firstDay.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);  // Commencer le lundi
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
      
      console.log("Fetching permanences from", startDate, "to", endDate);
      const data = await permanenceService.getPermanencesByPeriod(startDate, endDate);
      console.log("Fetched permanences:", data);
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
    console.log("Attempting to register for permanence:", permanenceId);
    console.log("Current user:", user);
    
    if (!user) {
      console.log("User not logged in");
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour vous inscrire à une permanence.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Registering user", user.id, "for permanence", permanenceId);
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
    console.log("Attempting to unregister from permanence:", permanenceId);
    if (!user) {
      console.log("User not logged in");
      return;
    }

    try {
      console.log("Unregistering user", user.id, "from permanence", permanenceId);
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

  // Gestionnaire pour ouvrir la modal de création avec des données pré-remplies
  const handleQuickCreateClick = (date: Date, timeSlot: { start: number, end: number }) => {
    console.log("Quick create clicked for", date, timeSlot);
    
    // Calculer l'heure de fin (3 heures après le début par défaut)
    const endDate = new Date(date);
    endDate.setHours(timeSlot.end, 0, 0);
    
    // Préparer les données initiales pour le formulaire
    setInitialFormData({
      title: 'Permanence',
      description: '',
      date: date.toISOString().split('T')[0],
      start_time: `${timeSlot.start.toString().padStart(2, '0')}:00`,
      end_time: `${timeSlot.end.toString().padStart(2, '0')}:00`,
      location: 'Local associatif',
      required_volunteers: 2,
      max_volunteers: 4,
      min_volunteers: 1
    });
    
    // Ouvrir la modal
    setShowCreateModal(true);
  };

  // Détermine si l'utilisateur peut créer des permanences (admin ou staff)
  const canCreatePermanence = userRole === 'admin' || userRole === 'staff';

  console.log("Rendering PermanencesPage with:", {
    userId: user?.id,
    userRole,
    permanencesCount: permanences.length,
    view
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des permanences</h1>
        
        {canCreatePermanence && (
          <Button 
            onClick={() => {
              setInitialFormData(null); // Réinitialiser les données du formulaire
              setShowCreateModal(true);
            }} 
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Créer
          </Button>
        )}
      </div>
      
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
            onCreateClick={canCreatePermanence ? handleQuickCreateClick : undefined}
          />
        )}
      </div>
      
      {showCreateModal && (
        <CreatePermanenceModal 
          onClose={() => {
            setShowCreateModal(false);
            setInitialFormData(null);
          }}
          onCreated={() => {
            fetchPermanences();
            setInitialFormData(null);
          }}
          initialData={initialFormData}
        />
      )}
    </div>
  );
}
