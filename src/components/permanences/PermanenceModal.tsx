import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, MapPin, Calendar, Clock, Users, Info, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Permanence, PermanenceStatus, ParticipantStatus } from '@/types/permanence';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PermanenceModalProps {
  permanence: Permanence;
  onClose: () => void;
  onRegister?: () => Promise<void>;
  onUnregister?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  isUserRegistered?: boolean;
  canRegister?: boolean;
  currentUserId?: string;
  userRole?: string | null;
}

export const PermanenceModal: React.FC<PermanenceModalProps> = ({
  permanence,
  onClose,
  onRegister,
  onUnregister,
  onDelete,
  isUserRegistered = false,
  canRegister = true,
  currentUserId,
  userRole
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Vérifier si l'utilisateur est admin ou staff
  const canManagePermanences = userRole === 'admin' || userRole === 'staff';
  
  // Formatage des dates
  const startDate = parseISO(permanence.start_date);
  const endDate = parseISO(permanence.end_date);
  
  const dateStr = format(startDate, 'EEEE d MMMM yyyy', { locale: fr });
  const startTimeStr = format(startDate, 'HH:mm', { locale: fr });
  const endTimeStr = format(endDate, 'HH:mm', { locale: fr });

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

  // Gérer la suppression après confirmation
  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{permanence.title}</span>
              {getStatusBadge(permanence.status)}
            </DialogTitle>
            <DialogDescription>
              Détails de la permanence du {dateStr}
            </DialogDescription>
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
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {canManagePermanences && onDelete && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            )}
            
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

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette permanence ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La permanence du {dateStr} ({startTimeStr} - {endTimeStr}) sera définitivement supprimée.
              {permanence.participants && permanence.participants.length > 0 && (
                <p className="mt-2 text-amber-600 font-medium">
                  Attention : {permanence.participants.length} personne(s) sont inscrites à cette permanence.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
