import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { EventForm, EventData } from './EventForm';
import { eventService } from '@/lib/eventService';
import { authService } from '@/lib/supabase';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventSaved: () => void;
  eventId?: string;
  initialDate?: Date;
}

export function EventModal({ isOpen, onClose, onEventSaved, eventId, initialDate }: EventModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [initialData, setInitialData] = React.useState<Partial<EventData> | undefined>(
    initialDate ? {
      start_date: initialDate.toISOString().split('T')[0],
      end_date: initialDate.toISOString().split('T')[0]
    } : undefined
  );
  const isEditMode = Boolean(eventId);

  // Charger les données de l'événement si on est en mode édition
  React.useEffect(() => {
    async function loadEvent() {
      if (eventId) {
        try {
          setIsLoading(true);
          const event = await eventService.getEventById(eventId);
          setInitialData(eventService.convertToFormData(event));
        } catch (error) {
          console.error('Erreur lors du chargement de l\'événement:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les données de l\'événement',
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isOpen && eventId) {
      loadEvent();
    }
  }, [eventId, isOpen, toast]);

  const handleSubmit = async (data: EventData) => {
    try {
      setIsLoading(true);
      
      // Récupérer l'utilisateur courant
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Vous devez être connecté pour effectuer cette action');
      }

      if (isEditMode && eventId) {
        // Mise à jour d'un événement existant
        await eventService.updateEvent(eventId, data);
        toast({
          title: 'Succès',
          description: 'Événement mis à jour avec succès',
        });
      } else {
        // Création d'un nouvel événement
        await eventService.createEvent(data, currentUser.id);
        toast({
          title: 'Succès',
          description: 'Événement créé avec succès',
        });
      }
      
      // Fermer la modal et rafraîchir les événements
      onClose();
      onEventSaved();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de l\'événement:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'enregistrement',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifier un événement' : 'Créer un nouvel événement'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifiez les détails de cet événement dans le formulaire ci-dessous.' 
              : 'Remplissez le formulaire ci-dessous pour créer un nouvel événement.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <EventForm 
              initialData={initialData} 
              onSubmit={handleSubmit} 
              onCancel={onClose}
              isEditMode={isEditMode}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 