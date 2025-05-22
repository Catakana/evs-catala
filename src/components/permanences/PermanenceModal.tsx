
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Permanence } from '@/types/permanence';
import { Calendar, Clock, MapPin, Users, FileText, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermanenceModalProps {
  permanence: Permanence;
  onClose: () => void;
}

export const PermanenceModal: React.FC<PermanenceModalProps> = ({ permanence, onClose }) => {
  const statusLabels = {
    confirmed: 'Confirmée',
    pending: 'En attente',
    canceled: 'Annulée'
  };

  const statusColors = {
    confirmed: "bg-emerald-500",
    pending: "bg-amber-500",
    canceled: "bg-slate-500"
  };

  const handleParticipate = () => {
    // Logic to participate in the permanence
    console.log('Participate in permanence', permanence.id);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{permanence.title}</DialogTitle>
            <Badge variant="outline" className={`${statusColors[permanence.status]} text-white`}>
              {statusLabels[permanence.status]}
            </Badge>
          </div>
          <DialogDescription>
            Détails du créneau de permanence
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {format(permanence.startDate, 'EEEE dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Horaires</p>
              <p className="text-sm text-muted-foreground">
                {format(permanence.startDate, 'HH:mm', { locale: fr })} - 
                {format(permanence.endDate, 'HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Lieu</p>
              <p className="text-sm text-muted-foreground">{permanence.location}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Participants ({permanence.participants.length}/{permanence.maxMembers})</p>
              <ul className="text-sm text-muted-foreground">
                {permanence.participants.length > 0 ? (
                  permanence.participants.map(participant => (
                    <li key={participant.id} className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {participant.name}
                    </li>
                  ))
                ) : (
                  <li>Aucun participant pour le moment</li>
                )}
              </ul>
            </div>
          </div>
          
          {permanence.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{permanence.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {permanence.status !== 'canceled' && (
            <Button 
              variant="default" 
              onClick={handleParticipate}
              disabled={permanence.participants.length >= permanence.maxMembers}
            >
              Je participe
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
