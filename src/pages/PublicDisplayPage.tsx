import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, Bell, Briefcase, Target, User, Vote, SkipForward, SkipBack } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { eventService } from '../lib/eventService';
import { projectService } from '../lib/projectService';
import { voteService } from '../lib/voteService';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';

// Types pour les différents tableaux
type DisplayMode = 'announcements' | 'events' | 'projects' | 'votes';

interface DisplayConfig {
  mode: DisplayMode;
  duration: number; // Durée d'affichage en secondes
  title: string;
  icon: React.ReactNode;
}

const PublicDisplayPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<DisplayMode>('announcements');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingVotes, setLoadingVotes] = useState(true);

  // Hook pour récupérer les annonces
  const { announcements, loading: loadingAnnouncements } = useAnnouncements();

  console.log('📢 État des annonces:', { 
    announcements: announcements?.length || 0, 
    loading: loadingAnnouncements 
  });

  // Charger les événements
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        console.log('🔄 Début du chargement des événements...');
        const data = await eventService.getEvents();
        console.log('✅ Événements chargés:', data);
        console.log('📊 Nombre d\'événements:', data?.length || 0);
        setEvents(data || []);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des événements:', error);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
        console.log('🏁 Fin du chargement des événements');
      }
    };

    loadEvents();
  }, []);

  // Charger les projets
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        console.log('🔄 Début du chargement des projets...');
        const data = await projectService.getProjects();
        console.log('✅ Projets chargés:', data);
        console.log('📊 Nombre de projets:', data?.length || 0);
        setProjects(data || []);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des projets:', error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
        console.log('🏁 Fin du chargement des projets');
      }
    };

    loadProjects();
  }, []);

  // Charger les votes
  useEffect(() => {
    const loadVotes = async () => {
      try {
        setLoadingVotes(true);
        console.log('🔄 Début du chargement des votes...');
        const data = await voteService.getActiveVotes();
        console.log('✅ Votes chargés:', data);
        console.log('📊 Nombre de votes:', data?.length || 0);
        setVotes(data || []);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des votes:', error);
        setVotes([]);
      } finally {
        setLoadingVotes(false);
        console.log('🏁 Fin du chargement des votes');
      }
    };

    loadVotes();
  }, []);

  console.log('📅 État des événements:', { 
    events: events?.length || 0, 
    loading: loadingEvents 
  });
  console.log('📋 État des projets:', { 
    projects: projects?.length || 0, 
    loading: loadingProjects 
  });
  console.log('🗳️ État des votes:', { 
    votes: votes?.length || 0, 
    loading: loadingVotes 
  });

  // Configuration des tableaux
  const displayConfigs: DisplayConfig[] = [
    {
      mode: 'announcements',
      duration: 30, // 30 secondes par tableau
      title: 'Dernières Annonces',
      icon: <Bell className="w-8 h-8" />
    },
    {
      mode: 'events',
      duration: 25,
      title: 'Prochains Événements',
      icon: <Calendar className="w-8 h-8" />
    },
    {
      mode: 'projects',
      duration: 20,
      title: 'Projets en Cours',
      icon: <Briefcase className="w-8 h-8" />
    },
    {
      mode: 'votes',
      duration: 15,
      title: 'Votes en Cours',
      icon: <Vote className="w-8 h-8" />
    }
  ];

  const currentConfig = displayConfigs.find(config => config.mode === currentMode)!;

  // Filtrer et préparer les données
  const filteredAnnouncements = announcements
    .filter(a => {
      const isNotArchived = !a.isArchived;
      const isNotExpired = !a.expireDate || new Date(a.expireDate) > new Date();
      console.log(`📢 Annonce "${a.title}": archivée=${a.isArchived}, expirée=${a.expireDate ? new Date(a.expireDate) <= new Date() : false}`);
      return isNotArchived && isNotExpired;
    })
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 10); // Limiter à 10 annonces

  console.log('📢 Annonces filtrées:', filteredAnnouncements.length);

  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.start_datetime);
      const now = new Date();
      const isFuture = eventDate > now;
      console.log(`📅 Événement "${e.title}": Date=${eventDate.toISOString()}, Maintenant=${now.toISOString()}, Futur=${isFuture}`);
      return isFuture;
    })
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 8); // Limiter à 8 événements

  console.log('📅 Événements futurs filtrés:', upcomingEvents.length);

  const activeProjects = projects
    .filter(p => {
      const isActive = p.status === 'active' || p.status === 'planning';
      console.log(`📋 Projet "${p.title}": statut=${p.status}, actif=${isActive}`);
      return isActive;
    })
    .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
    .slice(0, 6); // Limiter à 6 projets

  console.log('📋 Projets actifs filtrés:', activeProjects.length);

  const activeVotes = votes
    .filter(v => {
      const isActive = v.status === 'active';
      const isNotExpired = new Date(v.end_date) > new Date();
      console.log(`🗳️ Vote "${v.title}": statut=${v.status}, actif=${isActive}, expiré=${!isNotExpired}`);
      return isActive && isNotExpired;
    })
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    .slice(0, 6); // Limiter à 6 votes

  console.log('🗳️ Votes actifs filtrés:', activeVotes.length);

  // Obtenir les données actuelles selon le mode
  const getCurrentData = () => {
    switch (currentMode) {
      case 'announcements':
        return filteredAnnouncements;
      case 'events':
        return upcomingEvents;
      case 'projects':
        return activeProjects;
      case 'votes':
        return activeVotes;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  // État de chargement global
  const isLoading = loadingAnnouncements || loadingEvents || loadingProjects || loadingVotes;
  
  console.log('🔄 État de chargement global:', {
    isLoading,
    loadingAnnouncements,
    loadingEvents,
    loadingProjects,
    loadingVotes
  });

  console.log('📊 Données actuelles pour le mode', currentMode, ':', {
    mode: currentMode,
    dataLength: currentData.length,
    data: currentData
  });

  // Fonction pour passer au tableau suivant manuellement
  const skipToNext = () => {
    const currentIndex = displayConfigs.findIndex(config => config.mode === currentMode);
    const nextIndex = (currentIndex + 1) % displayConfigs.length;
    setCurrentMode(displayConfigs[nextIndex].mode);
    setCurrentItemIndex(0);
    setTimeRemaining(displayConfigs[nextIndex].duration);
  };

  // Fonction pour revenir au tableau précédent
  const skipToPrevious = () => {
    const currentIndex = displayConfigs.findIndex(config => config.mode === currentMode);
    const previousIndex = (currentIndex - 1 + displayConfigs.length) % displayConfigs.length;
    setCurrentMode(displayConfigs[previousIndex].mode);
    setCurrentItemIndex(0);
    setTimeRemaining(displayConfigs[previousIndex].duration);
  };

  // Gestion du cycle automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Passer au tableau suivant
          const currentIndex = displayConfigs.findIndex(config => config.mode === currentMode);
          const nextIndex = (currentIndex + 1) % displayConfigs.length;
          setCurrentMode(displayConfigs[nextIndex].mode);
          setCurrentItemIndex(0);
          return displayConfigs[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentMode, displayConfigs]);

  // Initialiser le timer
  useEffect(() => {
    setTimeRemaining(currentConfig.duration);
  }, [currentMode, currentConfig.duration]);

  // Gestion du défilement des items pour les annonces (plein écran)
  useEffect(() => {
    if (currentMode === 'announcements' && filteredAnnouncements.length > 0) {
      const itemInterval = setInterval(() => {
        setCurrentItemIndex(prev => (prev + 1) % filteredAnnouncements.length);
      }, 8000); // 8 secondes par annonce

      return () => clearInterval(itemInterval);
    }
  }, [currentMode, filteredAnnouncements.length]);

  // Gestion du défilement des cartes pour les événements, projets et votes
  useEffect(() => {
    if ((currentMode === 'events' || currentMode === 'projects' || currentMode === 'votes') && currentData.length > 0) {
      const cardInterval = setInterval(() => {
        setCurrentItemIndex(prev => (prev + 1) % Math.max(1, currentData.length - 2));
      }, 4000); // 4 secondes par défilement

      return () => clearInterval(cardInterval);
    }
  }, [currentMode, currentData.length]);

  // Gestionnaire d'événements clavier pour le bouton Skip
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); // Empêcher le défilement de la page
        skipToNext();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        skipToPrevious();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        skipToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Styles pour les catégories d'annonces
  const categoryStyles = {
    urgent: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    event: "bg-green-500 text-white",
    project: "bg-purple-500 text-white"
  };

  // Rendu des annonces en plein écran
  const renderAnnouncements = () => {
    if (filteredAnnouncements.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-4xl text-muted-foreground mb-4">Aucune annonce récente</p>
          <div className="text-lg text-muted-foreground">
            <p>Total annonces: {announcements?.length || 0}</p>
            <p>Annonces filtrées: {filteredAnnouncements.length}</p>
            <p>Chargement: {loadingAnnouncements ? 'En cours' : 'Terminé'}</p>
          </div>
        </div>
      );
    }

    const currentAnnouncement = filteredAnnouncements[currentItemIndex];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItemIndex}
          className="flex flex-col justify-center items-center h-full p-16 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Badge 
              className={cn(
                "text-2xl px-6 py-2 mb-8",
                categoryStyles[currentAnnouncement.category as keyof typeof categoryStyles]
              )}
            >
              {currentAnnouncement.category.toUpperCase()}
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl font-bold mb-8 leading-tight"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {currentAnnouncement.title}
          </motion.h1>

          <motion.div
            className="text-2xl text-muted-foreground max-w-4xl leading-relaxed"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {currentAnnouncement.content}
          </motion.div>

          <motion.div
            className="mt-12 flex items-center gap-4 text-xl text-muted-foreground"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <User className="w-6 h-6" />
            <span>Par {currentAnnouncement.authorName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(currentAnnouncement.publishDate), { addSuffix: true, locale: fr })}</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Rendu des événements avec défilement de cartes
  const renderEvents = () => {
    if (upcomingEvents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-4xl text-muted-foreground mb-4">Aucun événement à venir</p>
          <div className="text-lg text-muted-foreground">
            <p>Total événements: {events?.length || 0}</p>
            <p>Événements futurs: {upcomingEvents.length}</p>
            <p>Chargement: {loadingEvents ? 'En cours' : 'Terminé'}</p>
          </div>
        </div>
      );
    }

    const visibleEvents = upcomingEvents.slice(currentItemIndex, currentItemIndex + 3);

    return (
      <div className="flex flex-col h-full p-8">
        <AnimatePresence mode="wait">
          {visibleEvents.map((event, index) => (
            <motion.div
              key={`${event.id}-${currentItemIndex}`}
              className="mb-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut"
              }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-4">{event.title}</h3>
                      <p className="text-xl text-muted-foreground mb-6">{event.description}</p>
                      
                      <div className="flex items-center gap-8 text-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span>{format(new Date(event.start_datetime), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span>{format(new Date(event.start_datetime), 'HH:mm')}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {event.category}
                      </Badge>
                      {event.max_participants && (
                        <div className="flex items-center gap-2 mt-4 text-lg">
                          <Users className="w-5 h-5" />
                          <span>{event.participant_count || 0}/{event.max_participants}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // Rendu des projets avec défilement de cartes
  const renderProjects = () => {
    if (activeProjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-4xl text-muted-foreground mb-4">Aucun projet en cours</p>
          <div className="text-lg text-muted-foreground">
            <p>Total projets: {projects?.length || 0}</p>
            <p>Projets actifs: {activeProjects.length}</p>
            <p>Chargement: {loadingProjects ? 'En cours' : 'Terminé'}</p>
          </div>
        </div>
      );
    }

    const visibleProjects = activeProjects.slice(currentItemIndex, currentItemIndex + 2);

    return (
      <div className="flex flex-col h-full p-8">
        <AnimatePresence mode="wait">
          {visibleProjects.map((project, index) => (
            <motion.div
              key={`${project.id}-${currentItemIndex}`}
              className="mb-8"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.3,
                ease: "easeOut"
              }}
            >
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
                <CardContent className="p-10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-4xl font-bold">{project.title}</h3>
                        <Badge 
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          className="text-lg px-4 py-2"
                        >
                          {project.status === 'active' ? 'En cours' : 'Planification'}
                        </Badge>
                      </div>
                      
                      <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-8">
                        {project.budget && (
                          <div>
                            <h4 className="text-lg font-semibold mb-2">Budget</h4>
                            <p className="text-2xl font-bold text-green-600">{project.budget}€</p>
                          </div>
                        )}
                        
                        {(project.endDate || project.end_date) && (
                          <div>
                            <h4 className="text-lg font-semibold mb-2">Échéance</h4>
                            <p className="text-xl">{format(new Date(project.endDate || project.end_date), 'd MMMM yyyy', { locale: fr })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-lg">
                        <Target className="w-6 h-6 text-purple-600" />
                        <span className="font-semibold">Objectif</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // Rendu des votes avec défilement de cartes
  const renderVotes = () => {
    if (activeVotes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-4xl text-muted-foreground mb-4">Aucun vote en cours</p>
          <div className="text-lg text-muted-foreground">
            <p>Total votes: {votes?.length || 0}</p>
            <p>Votes actifs: {activeVotes.length}</p>
            <p>Chargement: {loadingVotes ? 'En cours' : 'Terminé'}</p>
          </div>
        </div>
      );
    }

    const visibleVotes = activeVotes.slice(currentItemIndex, currentItemIndex + 2);

    return (
      <div className="flex flex-col h-full p-8">
        <AnimatePresence mode="wait">
          {visibleVotes.map((vote, index) => (
            <motion.div
              key={`${vote.id}-${currentItemIndex}`}
              className="mb-8"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.3,
                ease: "easeOut"
              }}
            >
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-l-orange-500">
                <CardContent className="p-10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-4xl font-bold">{vote.title}</h3>
                        <Badge 
                          variant="default"
                          className="text-lg px-4 py-2 bg-orange-500"
                        >
                          {vote.type === 'yes_no' ? 'Oui/Non' : 
                           vote.type === 'single_choice' ? 'Choix unique' : 
                           'Choix multiple'}
                        </Badge>
                      </div>
                      
                      <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        {vote.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Fin du vote</h4>
                          <p className="text-xl">{format(new Date(vote.end_date), 'd MMMM yyyy à HH:mm', { locale: fr })}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Temps restant</h4>
                          <p className="text-xl font-bold text-orange-600">
                            {formatDistanceToNow(new Date(vote.end_date), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-lg">
                        <Vote className="w-6 h-6 text-orange-600" />
                        <span className="font-semibold">Vote</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // Rendu du contenu selon le mode actuel
  const renderContent = () => {
    // Afficher l'état de chargement
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-2xl text-muted-foreground">Chargement des données...</p>
          <div className="mt-4 text-lg text-muted-foreground">
            <p>Annonces: {loadingAnnouncements ? '⏳' : '✅'}</p>
            <p>Événements: {loadingEvents ? '⏳' : '✅'}</p>
            <p>Projets: {loadingProjects ? '⏳' : '✅'}</p>
            <p>Votes: {loadingVotes ? '⏳' : '✅'}</p>
          </div>
        </div>
      );
    }

    // Afficher les données ou un message d'état
    switch (currentMode) {
      case 'announcements':
        return renderAnnouncements();
      case 'events':
        return renderEvents();
      case 'projects':
        return renderProjects();
      case 'votes':
        return renderVotes();
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-4xl text-muted-foreground">Mode inconnu: {currentMode}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Header avec titre et indicateur de progression */}
      <motion.header 
        className="bg-white/90 backdrop-blur-sm border-b shadow-sm p-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {currentConfig.icon}
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-800">{currentConfig.title}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg text-muted-foreground">EVS CATALA</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE d MMMM yyyy • HH:mm', { locale: fr })}
              </p>
            </div>
            
            {/* Bouton Skip précédent */}
            <motion.button
              onClick={skipToPrevious}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Revenir au tableau précédent (Flèche gauche)"
            >
              <SkipBack className="w-5 h-5" />
              <span className="font-medium">Précédent</span>
              <span className="text-xs opacity-75 ml-1">[←]</span>
            </motion.button>
            
            {/* Bouton Skip */}
            <motion.button
              onClick={skipToNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Passer au tableau suivant (Barre d'espace ou Flèche droite)"
            >
              <SkipForward className="w-5 h-5" />
              <span className="font-medium">Suivant</span>
              <span className="text-xs opacity-75 ml-1">[Space/→]</span>
            </motion.button>
            
            {/* Indicateur de progression */}
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "100%" }}
                animate={{ width: `${(timeRemaining / currentConfig.duration) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Contenu principal */}
      <main className="h-[calc(100vh-120px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            className="h-full"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Indicateurs de navigation en bas */}
      <motion.footer 
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex justify-center gap-4">
          {displayConfigs.map((config) => (
            <div
              key={config.mode}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300",
                currentMode === config.mode 
                  ? "bg-blue-500 scale-125" 
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </motion.footer>
    </div>
  );
};

export default PublicDisplayPage; 