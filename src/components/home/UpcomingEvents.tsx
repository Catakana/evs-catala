import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { eventService } from '@/lib/eventService';
import { parseAsLocalDateTime } from '@/lib/dateUtils';

interface Event {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  category: string;
  location?: string;
  created_by: string;
}

const UpcomingEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des événements...');
      const allEvents = await eventService.getEvents();
      console.log('📅 Événements récupérés:', allEvents);
      
      // Filtrer les événements futurs et prendre les 6 prochains
      const now = new Date();
      console.log('⏰ Date actuelle:', now.toISOString());
      
      const upcomingEvents = allEvents
        .filter(event => {
          const eventDate = new Date(event.start_datetime);
          const isFuture = eventDate >= now;
          console.log(`📊 Événement "${event.title}" (${event.start_datetime}): ${isFuture ? 'FUTUR' : 'PASSÉ'}`);
          return isFuture;
        })
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
        .slice(0, 6);
      
      console.log('✅ Événements futurs filtrés:', upcomingEvents);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = parseAsLocalDateTime(dateString);
    
    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, 'HH:mm')}`;
    } else if (isTomorrow(date)) {
      return `Demain à ${format(date, 'HH:mm')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE à HH:mm', { locale: fr });
    } else {
      return format(date, 'dd/MM à HH:mm', { locale: fr });
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      reunion: { label: 'Réunion', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
      animation: { label: 'Animation', color: 'bg-gradient-to-r from-green-500 to-green-600' },
      atelier: { label: 'Atelier', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
      permanence: { label: 'Permanence', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
      autre: { label: 'Autre', color: 'bg-gradient-to-r from-gray-500 to-gray-600' }
    };
    
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.autre;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reunion': return '👥';
      case 'animation': return '🎉';
      case 'atelier': return '🛠️';
      case 'permanence': return '📋';
      default: return '📅';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Calendar className="h-6 w-6 text-green-600" />
            </motion.div>
            <span>Prochains événements 🗓️</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-gray-600">Chargement des événements...</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <span>Prochains événements 🗓️</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-center py-12 text-red-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            </motion.div>
            <p className="font-medium text-lg mb-2">Erreur lors du chargement 😞</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 hover:bg-green-50 border-green-300"
              onClick={loadUpcomingEvents}
            >
              🔄 Réessayer
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <span>Prochains événements 🗓️</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-center py-12 text-gray-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            </motion.div>
            <p className="text-lg font-medium mb-2">Aucun événement prévu 📭</p>
            <p className="text-sm mb-4">Les prochains événements apparaîtront ici</p>
            <Button 
              variant="outline" 
              className="mt-4 hover:bg-green-50 border-green-300"
              onClick={() => navigate('/agenda')}
            >
              📅 Voir l'agenda complet
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Calendar className="h-6 w-6 text-green-600" />
            </motion.div>
            <div>
              <CardTitle className="text-xl">Prochains événements 🗓️</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Ne manquez aucun rendez-vous important</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/agenda')}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 group"
          >
            Voir tout
            <motion.div
              className="ml-1"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {events.map((event, index) => {
            const categoryInfo = getCategoryBadge(event.category);
            const isUrgent = isToday(parseAsLocalDateTime(event.start_datetime)) || isTomorrow(parseAsLocalDateTime(event.start_datetime));
            
            return (
              <motion.div
                key={event.id}
                className="group flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300 cursor-pointer hover:shadow-md"
                onClick={() => navigate('/agenda')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Icône de catégorie animée */}
                <motion.div 
                  className="text-3xl mt-1"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {getCategoryIcon(event.category)}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  {/* En-tête avec badge et urgence */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-xs font-medium text-white shadow-sm ${categoryInfo.color}`}
                      >
                        {categoryInfo.label}
                      </Badge>
                      {isUrgent && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700 bg-red-50">
                            ⚡ Bientôt
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Titre de l'événement */}
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    {event.title}
                  </h3>
                  
                  {/* Description si disponible */}
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  
                  {/* Informations de l'événement */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {formatEventDate(event.start_datetime)}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Indicateur de flèche */}
                <motion.div
                  className="text-gray-400 group-hover:text-green-600 transition-colors"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Pied de section avec encouragement */}
        <motion.div 
          className="mt-6 pt-4 border-t border-gray-100 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-gray-500 mb-2">
            ✨ Participez à la vie de l'association !
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/agenda')}
            className="hover:bg-green-50 border-green-300 text-green-700"
          >
            📅 Découvrir tous les événements
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents; 