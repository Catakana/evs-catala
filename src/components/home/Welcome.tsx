import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell, Clock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { Announcement } from '@/types/announcement';

interface WelcomeProps {
  className?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ className }) => {
  const navigate = useNavigate();
  const { announcements, loading } = useAnnouncements();
  
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
    urgent: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    event: "bg-green-500 text-white",
    project: "bg-purple-500 text-white"
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
      {/* En-tête de bienvenue */}
      <div className="text-center mb-8">
        <div className="animate-float inline-block mb-6 p-3 bg-evs-blue/10 rounded-full text-evs-blue">
          <Calendar className="h-12 w-12" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          Bienvenue sur le Portail EVS CATALA
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Une plateforme conçue pour faciliter la gestion et la communication au sein de votre association.
          Découvrez les différents modules disponibles ci-dessous.
        </p>
      </div>

      {/* Tableau des dernières annonces */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-evs-blue" />
              <CardTitle>Dernières annonces</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/announcements')}
              className="text-evs-blue hover:text-evs-blue-dark"
            >
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CardDescription>
            Restez informé des dernières actualités de l'association
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evs-blue"></div>
            </div>
          ) : recentAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/announcements')}
                >
                  <div className="flex-shrink-0">
                    <Badge 
                      className={cn(
                        "text-xs",
                        categoryStyles[announcement.category as keyof typeof categoryStyles]
                      )}
                    >
                      {getCategoryLabel(announcement.category)}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {announcement.title}
                      </h3>
                      {announcement.isPinned && (
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            Épinglé
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Aucune annonce récente</p>
              <p className="text-sm">Les nouvelles annonces apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default Welcome;
