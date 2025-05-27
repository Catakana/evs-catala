import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell, Clock, User, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { Announcement } from '@/types/announcement';

interface WelcomeProps {
  className?: string;
}

// Émoticônes animées pour l'en-tête
const animatedEmojis = ['🎉', '✨', '🌟', '💫', '🎊', '🎈', '🌈', '💝'];

const Welcome: React.FC<WelcomeProps> = ({ className }) => {
  const navigate = useNavigate();
  const { announcements, loading } = useAnnouncements();
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  
  // Animation des émoticônes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmojiIndex((prev) => (prev + 1) % animatedEmojis.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Filtrer les annonces récentes et non archivées
  const recentAnnouncements = announcements
    .filter(announcement => {
      const isNotArchived = !announcement.isArchived;
      const isNotExpired = !announcement.expireDate || new Date(announcement.expireDate) > new Date();
      return isNotArchived && isNotExpired;
    })
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 5); // Limiter à 5 annonces

  // Styles pour les catégories d'annonces
  const categoryStyles = {
    urgent: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg",
    info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
    event: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg",
    project: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      urgent: "Urgent",
      info: "Information",
      event: "Événement",
      project: "Projet"
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <section className={cn("py-8", className)}>
      {/* En-tête de bienvenue amélioré */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Icône principale avec animation */}
        <motion.div 
          className="relative inline-block mb-8"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="p-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full backdrop-blur-sm border border-blue-200/20 shadow-xl"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 40px rgba(99, 102, 241, 0.4)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Calendar className="h-16 w-16 text-blue-600" />
          </motion.div>
          
          {/* Émoticônes flottantes animées */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEmojiIndex}
              className="absolute -top-2 -right-2 text-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {animatedEmojis[currentEmojiIndex]}
            </motion.div>
          </AnimatePresence>
          
          {/* Particules autour de l'icône */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                top: `${20 + i * 20}%`,
                left: `${20 + i * 20}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>
        
        {/* Titre principal avec gradient */}
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Bienvenue sur le Portail
          <motion.span 
            className="block text-4xl md:text-5xl mt-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            EVS CATALA ✨
          </motion.span>
        </motion.h1>
        
        {/* Description avec animation */}
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Une plateforme moderne et intuitive conçue pour faciliter la gestion et la communication 
          au sein de votre association. Découvrez un espace collaboratif où chaque membre peut 
          contribuer et s'épanouir. 🚀
        </motion.p>

        {/* Bouton de découverte */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button 
              size="lg"
              onClick={() => navigate('/presentation')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg rounded-full"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Découvrir toutes les fonctionnalités
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tableau des dernières annonces amélioré */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="h-6 w-6 text-blue-600" />
                </motion.div>
                <div>
                  <CardTitle className="text-xl">Dernières annonces 📢</CardTitle>
                  <CardDescription className="text-gray-600">
                    Restez informé des dernières actualités de l'association
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/announcements')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group"
              >
                Voir tout
                <motion.div
                  className="ml-1"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-gray-600">Chargement des annonces...</span>
                </motion.div>
              </div>
            ) : recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement, index) => (
                  <motion.div 
                    key={announcement.id}
                    className="group flex items-start gap-4 p-5 border border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer hover:shadow-md"
                    onClick={() => navigate('/announcements')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex-shrink-0">
                      <Badge 
                        className={cn(
                          "text-xs font-medium",
                          categoryStyles[announcement.category as keyof typeof categoryStyles]
                        )}
                      >
                        {getCategoryLabel(announcement.category)}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {announcement.title}
                        </h3>
                        {announcement.isPinned && (
                          <motion.div 
                            className="flex-shrink-0"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700 bg-yellow-50">
                              📌 Épinglé
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{announcement.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(announcement.publishDate), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-12 text-gray-500"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                </motion.div>
                <p className="text-lg font-medium mb-2">Aucune annonce récente 📭</p>
                <p className="text-sm">Les nouvelles annonces apparaîtront ici</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default Welcome;
