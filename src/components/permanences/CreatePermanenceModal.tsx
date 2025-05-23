import React, { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
}

export const CreatePermanenceModal: React.FC<CreatePermanenceModalProps> = ({
  onClose,
  onCreated,
  permanence
}) => {
  const isEditMode = !!permanence;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: permanence?.title || 'Permanence',
    description: permanence?.description || '',
    date: permanence?.date || format(new Date(), 'yyyy-MM-dd'),
    start_time: permanence?.start_time?.slice(0, 5) || '14:00',
    end_time: permanence?.end_time?.slice(0, 5) || '18:00',
    location: permanence?.location || 'Local associatif',
    required_volunteers: permanence?.required_volunteers || 2,
    max_volunteers: permanence?.max_volunteers || 4,
    min_volunteers: permanence?.min_volunteers || 1,
    notes: permanence?.notes || ''
  });

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
    
    try {
      setLoading(true);
      
      const permanenceData = {
        ...formData,
        status: PermanenceStatus.OPEN,
        created_by: currentUser.id
      };
      
      let result;
      
      if (isEditMode && permanence) {
        // Mode édition
        result = await permanenceService.updatePermanence(permanence.id, permanenceData);
        
        if (result) {
          toast({
            title: "Permanence mise à jour",
            description: "La permanence a été mise à jour avec succès.",
          });
        }
      } else {
        // Mode création
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
        throw new Error("Erreur lors de l'opération");
      }
    } catch (error) {
      console.error('Erreur lors de la création/édition de la permanence:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
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