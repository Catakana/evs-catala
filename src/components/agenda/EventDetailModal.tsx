import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus, 
  UserMinus, 
  Edit,
  Trash2,
  X
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { eventService, Event, EventParticipant } from '@/lib/eventService';
import { authService } from '@/lib/supabase';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onEventUpdated?: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onEdit,
  onDelete,
  onEventUpdated
}) => {
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userParticipation, setUserParticipation] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Charger les données de l'événement
  useEffect(() => {
    if (isOpen && eventId) {
      loadEventData();
      loadCurrentUser();
    }
  }, [isOpen, eventId]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const profile = await authService.getUserProfile(user.id);
        setCurrentUser({ ...user, profile });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  };

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      
      // Charger l'événement
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);

      // Charger les participants
      const participantsData = await eventService.getEventParticipants(eventId);
      setParticipants(participantsData || []);

      // Vérifier si l'utilisateur actuel est inscrit
      if (currentUser) {
        const participation = await eventService.isUserRegistered(eventId, currentUser.id);
        setUserParticipation(participation);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'événement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'inscription/désinscription
  const handleRegistrationToggle = async () => {
    if (!eventId || !currentUser) return;

    try {
      setIsRegistering(true);

      if (userParticipation) {
        // Désinscription
        await eventService.unregisterFromEvent(eventId, currentUser.id);
        setUserParticipation(null);
        toast({
          title: "Désinscription réussie",
          description: "Vous êtes maintenant désinscrit de cet événement",
        });
      } else {
        // Inscription
        await eventService.registerToEvent(eventId, currentUser.id);
        const newParticipation = await eventService.isUserRegistered(eventId, currentUser.id);
        setUserParticipation(newParticipation);
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à cet événement",
        });
      }

      // Recharger les participants
      const participantsData = await eventService.getEventParticipants(eventId);
      setParticipants(participantsData || []);
      
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription/désinscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier votre inscription",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Gérer la suppression
  const handleDelete = () => {
    if (eventId && onDelete) {
      onDelete(eventId);
      onClose();
    }
  };

  // Gérer l'édition
  const handleEdit = () => {
    if (eventId && onEdit) {
      onEdit(eventId);
      onClose();
    }
  };

  // Obtenir la couleur de la catégorie
  const getCategoryColor = (category: string) => {
    const categoryOptions = eventService.getCategoryOptions();
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.color || 'bg-slate-500';
  };

  // Obtenir le label de la catégorie
  const getCategoryLabel = (category: string) => {
    const categoryOptions = eventService.getCategoryOptions();
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.label || category;
  };

  // Vérifier si l'utilisateur peut modifier/supprimer l'événement
  const canModifyEvent = () => {
    if (!currentUser || !event) return false;
    return (
      currentUser.profile?.role === 'admin' ||
      currentUser.profile?.role === 'staff' ||
      event.created_by === currentUser.id
    );
  };

  if (!event) {
    return null;
  }

  const startDate = parseISO(event.start_datetime);
  const endDate = parseISO(event.end_datetime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold mb-2">
                {event.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-white", getCategoryColor(event.category))}>
                  {getCategoryLabel(event.category)}
                </Badge>
              </div>
            </div>
            
            {canModifyEvent() && (
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(startDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, 'HH:mm', { locale: fr })} - {format(endDate, 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <p>{event.location}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p>{participants.length} participant{participants.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Participants */}
          <div>
            <h3 className="font-medium mb-3">Participants ({participants.length})</h3>
            {participants.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback>
                        {participant.user?.firstname?.[0]}{participant.user?.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {participant.user?.firstname} {participant.user?.lastname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {format(parseISO(participant.registered_at), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {participant.status === 'registered' && 'Inscrit'}
                      {participant.status === 'present' && 'Présent'}
                      {participant.status === 'absent' && 'Absent'}
                      {participant.status === 'maybe' && 'Peut-être'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun participant pour le moment</p>
            )}
          </div>

          <Separator />

          {/* Actions d'inscription */}
          {currentUser && (
            <div className="flex justify-between items-center">
              <div>
                {userParticipation ? (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Vous êtes inscrit à cet événement
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Vous n'êtes pas encore inscrit
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleRegistrationToggle}
                disabled={isRegistering}
                variant={userParticipation ? "outline" : "default"}
              >
                {isRegistering ? (
                  "Traitement..."
                ) : userParticipation ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Se désinscrire
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    S'inscrire
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal; 