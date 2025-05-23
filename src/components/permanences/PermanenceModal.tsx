import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, MapPin, Calendar, Clock, Users, Info, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Permanence, PermanenceStatus } from '@/types/permanence';
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
  const dateStr = format(permanence.startDate, 'EEEE d MMMM yyyy', { locale: fr });
  const startTimeStr = format(permanence.startDate, 'HH:mm', { locale: fr });
  const endTimeStr = format(permanence.endDate, 'HH:mm', { locale: fr });

  // Obtenir le statut de la permanence
  const getStatusBadge = (status: PermanenceStatus) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'canceled':
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
    
    if (permanence.participants.length >= permanence.maxMembers) {
      return <Badge className="bg-red-500 mb-4">Complet</Badge>;
    }
    
    if (permanence.status === 'canceled') {
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
                {permanence.participants.length} / {permanence.maxMembers} personnes
              </p>
              <p className="text-sm text-muted-foreground">
                Minimum requis: {permanence.minMembers} personnes
              </p>
              {permanence.participants.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Personnes inscrites:</p>
                  <ul className="text-sm space-y-1">
                    {permanence.participants.map((participant) => (
                      <li key={participant.id} className="flex items-center gap-1">
                        <span>
                          {participant.name}
                          {participant.status === 'confirmed' && (
                            <span className="ml-2 text-green-600 inline-flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Présent
                            </span>
                          )}
                          {participant.status === 'absent' && (
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
          
          {permanence.notes && (
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Notes</p>
                <p className="text-sm">{permanence.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {(onRegister || onUnregister) && (
            <Button
              variant={isUserRegistered ? "destructive" : "default"}
              onClick={handleRegistration}
              disabled={!canRegister && !isUserRegistered}
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
