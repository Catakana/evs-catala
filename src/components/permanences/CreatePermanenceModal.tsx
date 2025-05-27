import React, { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Permanence, PermanenceStatus } from '@/types/permanence';
import { permanenceService } from '@/lib/permanenceService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface CreatePermanenceModalProps {
  onClose: () => void;
  onCreated: () => void;
  permanence?: Permanence; // Si fourni, on est en mode édition
  initialData?: any; // Données initiales pour le formulaire en mode création rapide
}

export const CreatePermanenceModal: React.FC<CreatePermanenceModalProps> = ({
  onClose,
  onCreated,
  permanence,
  initialData
}) => {
  const isEditMode = !!permanence;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Déterminer les valeurs initiales pour le formulaire
  const getInitialFormData = () => {
    if (permanence) {
      // En mode édition, essayer d'extraire date et heures depuis start_date/end_date
      let extractedDate = format(new Date(), 'yyyy-MM-dd');
      let extractedStartTime = '14:00';
      let extractedEndTime = '18:00';
      
      try {
        const startDate = new Date(permanence.start_date);
        const endDate = new Date(permanence.end_date);
        
        extractedDate = format(startDate, 'yyyy-MM-dd');
        extractedStartTime = format(startDate, 'HH:mm');
        extractedEndTime = format(endDate, 'HH:mm');
      } catch (e) {
        console.error('Erreur lors de l\'extraction des dates:', e);
      }
      
      return {
        title: permanence.title || 'Permanence',
        description: permanence.description || '',
        date: extractedDate,
        start_time: extractedStartTime,
        end_time: extractedEndTime,
        location: permanence.location || 'Local associatif',
        required_volunteers: permanence.required_volunteers || 2,
        max_volunteers: permanence.max_volunteers || 4,
        min_volunteers: permanence.min_volunteers || 1,
        notes: permanence.notes || ''
      };
    }
    
    // Utiliser les données initiales si fournies
    if (initialData) {
      return initialData;
    }
    
    // En mode création, utiliser des valeurs par défaut
    return {
      title: 'Permanence',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '14:00',
      end_time: '18:00',
      location: 'Local associatif',
      required_volunteers: 2,
      max_volunteers: 4,
      min_volunteers: 1,
      notes: ''
    };
  };
  
  // État du formulaire
  const [formData, setFormData] = useState(getInitialFormData());

  // Récupérer l'utilisateur courant
  const [currentUser, setCurrentUser] = useState<any>(null);
  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('volunteers') ? parseInt(value) : value
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une permanence.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation basique
    if (!formData.title || !formData.date || !formData.start_time || !formData.end_time || !formData.location) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation des nombres
    if (formData.required_volunteers < 1 || formData.max_volunteers < formData.required_volunteers) {
      toast({
        title: "Valeurs incorrectes",
        description: "Le nombre de volontaires requis doit être supérieur à 0 et inférieur ou égal au maximum.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation du format de la date et des heures
    if (!formData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      toast({
        title: "Format de date incorrect",
        description: "La date doit être au format AAAA-MM-JJ.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation du format des heures
    const startTimeParts = formData.start_time.split(':');
    const endTimeParts = formData.end_time.split(':');
    
    if (startTimeParts.length < 2 || endTimeParts.length < 2) {
      toast({
        title: "Format d'heure incorrect",
        description: "Les heures doivent être au format HH:MM.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Normaliser les heures avant de les envoyer (assure un format HH:MM)
      const normalizedStartTime = `${startTimeParts[0].padStart(2, '0')}:${startTimeParts[1].padStart(2, '0')}`;
      const normalizedEndTime = `${endTimeParts[0].padStart(2, '0')}:${endTimeParts[1].padStart(2, '0')}`;
      
      // Construction directe des chaînes ISO pour les dates
      const startDateISO = `${formData.date}T${normalizedStartTime}:00.000Z`;
      const endDateISO = `${formData.date}T${normalizedEndTime}:00.000Z`;
      
      console.log("Données préparées pour l'insertion:", {
        date: formData.date,
        start_time: normalizedStartTime,
        end_time: normalizedEndTime,
        start_date_iso: startDateISO,
        end_date_iso: endDateISO
      });
      
      // Préparation des données simplifiées pour éviter les erreurs
      const permanenceData = {
        title: formData.title,
        description: formData.description || '',
        location: formData.location,
        required_volunteers: formData.required_volunteers,
        max_volunteers: formData.max_volunteers,
        min_volunteers: formData.min_volunteers,
        notes: formData.notes || '',
        start_date: startDateISO,
        end_date: endDateISO,
        status: PermanenceStatus.OPEN,
        created_by: currentUser.id
      };
      
      let result;
      
      if (isEditMode && permanence) {
        // Mode édition
        console.log("Mise à jour de la permanence:", permanenceData);
        result = await permanenceService.updatePermanence(permanence.id, permanenceData);
        
        if (result) {
          toast({
            title: "Permanence mise à jour",
            description: "La permanence a été mise à jour avec succès.",
          });
        }
      } else {
        // Mode création
        console.log("Création de la permanence:", permanenceData);
        result = await permanenceService.createPermanence(permanenceData);
        
        if (result) {
          toast({
            title: "Permanence créée",
            description: "La permanence a été créée avec succès.",
          });
        }
      }
      
      if (result) {
        onCreated();
        onClose();
      } else {
        // Si result est null, une erreur s'est produite mais nous n'avons pas les détails
        console.error("Erreur: Le service a retourné null");
        throw new Error("Erreur lors de l'opération - aucune donnée retournée");
      }
    } catch (error) {
      console.error('Erreur lors de la création/édition de la permanence:', error);
      
      // Essayer d'extraire plus d'informations de l'erreur
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          // Si la conversion en JSON échoue, on garde le message par défaut
        }
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier la permanence' : 'Créer une nouvelle permanence'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifiez les informations de la permanence existante' 
              : 'Renseignez les informations pour créer une nouvelle permanence'}
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Début</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="end_time">Fin</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="required_volunteers">Requis</Label>
                <Input
                  id="required_volunteers"
                  name="required_volunteers"
                  type="number"
                  min="1"
                  value={formData.required_volunteers}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max_volunteers">Maximum</Label>
                <Input
                  id="max_volunteers"
                  name="max_volunteers"
                  type="number"
                  min={formData.required_volunteers}
                  value={formData.max_volunteers}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="min_volunteers">Minimum</Label>
                <Input
                  id="min_volunteers"
                  name="min_volunteers"
                  type="number"
                  min="1"
                  max={formData.required_volunteers}
                  value={formData.min_volunteers}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Informations complémentaires pour les volontaires"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Traitement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 