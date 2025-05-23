import React from 'react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, MapPin, Calendar, Clock, Users, Info, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Permanence, PermanenceStatus, ParticipantStatus } from '@/types/permanence';
import { Badge } from '@/components/ui/badge';

interface PermanenceModalProps {
  permanence: Permanence;
  onClose: () => void;
  onRegister?: () => Promise<void>;
  onUnregister?: () => Promise<void>;
  isUserRegistered?: boolean;
  canRegister?: boolean;
}

export const PermanenceModal: React.FC<PermanenceModalProps> = ({
  permanence,
  onClose,
  onRegister,
  onUnregister,
  isUserRegistered = false,
  canRegister = true
}) => {
  // Formatage des dates
  const fullDate = parse(`${permanence.date}`, 'yyyy-MM-dd', new Date());
  const dateStr = format(fullDate, 'EEEE d MMMM yyyy', { locale: fr });
  const startTimeStr = permanence.start_time.slice(0, 5); // Format HH:MM
  const endTimeStr = permanence.end_time.slice(0, 5); // Format HH:MM

  // Obtenir le statut de la permanence
  const getStatusBadge = (status: PermanenceStatus) => {
    switch (status) {
      case PermanenceStatus.COMPLETED:
        return <Badge className="bg-green-500">Terminée</Badge>;
      case PermanenceStatus.OPEN:
        return <Badge className="bg-blue-500">Ouverte</Badge>;
      case PermanenceStatus.FULL:
        return <Badge className="bg-yellow-500">Complète</Badge>;
      case PermanenceStatus.CANCELED:
        return <Badge className="bg-red-500">Annulée</Badge>;
      default:
        return null;
    }
  };

  // Obtenir le statut d'inscription
  const getRegistrationStatus = () => {
    if (isUserRegistered) {
      return <Badge className="bg-green-500 mb-4">Vous êtes inscrit(e)</Badge>;
    }
    
    if (permanence.participants && permanence.participants.length >= permanence.required_volunteers) {
      return <Badge className="bg-red-500 mb-4">Complet</Badge>;
    }
    
    if (permanence.status === PermanenceStatus.CANCELED) {
      return <Badge className="bg-red-500 mb-4">Annulée</Badge>;
    }
    
    return null;
  };

  // Gérer l'inscription ou la désinscription
  const handleRegistration = async () => {
    if (isUserRegistered && onUnregister) {
      await onUnregister();
    } else if (canRegister && onRegister) {
      await onRegister();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{permanence.title}</span>
            {getStatusBadge(permanence.status)}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {getRegistrationStatus()}
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{dateStr}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{startTimeStr} - {endTimeStr}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{permanence.location || 'Lieu non précisé'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                {permanence.participants ? permanence.participants.length : 0} / {permanence.required_volunteers} personnes
              </p>
              {permanence.participants && permanence.participants.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Personnes inscrites:</p>
                  <ul className="text-sm space-y-1">
                    {permanence.participants.map((participant) => (
                      <li key={participant.id || participant.user_id} className="flex items-center gap-1">
                        <span>
                          {participant.user ? `${participant.user.firstname} ${participant.user.lastname}` : 'Utilisateur'}
                          {participant.status === ParticipantStatus.PRESENT && (
                            <span className="ml-2 text-green-600 inline-flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Présent
                            </span>
                          )}
                          {participant.status === ParticipantStatus.ABSENT && (
                            <span className="ml-2 text-red-600 inline-flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Absent
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {permanence.description && (
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Description</p>
                <p className="text-sm">{permanence.description}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {(onRegister || onUnregister) && (
            <Button
              variant={isUserRegistered ? "destructive" : "default"}
              onClick={handleRegistration}
              disabled={(!canRegister && !isUserRegistered) || permanence.status === PermanenceStatus.CANCELED}
              className="w-full sm:w-auto"
            >
              {isUserRegistered ? "Se désinscrire" : "S'inscrire"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
