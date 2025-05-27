import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Link, Lock, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { notesService, NoteData } from '@/lib/notesService';
import { eventService } from '@/lib/eventService';
import { authService } from '@/lib/supabase';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteSaved?: () => void;
  initialContext?: {
    type: 'event' | 'project' | 'free';
    id?: string;
    title?: string;
  };
}

export function QuickNoteModal({ 
  isOpen, 
  onClose, 
  onNoteSaved,
  initialContext 
}: QuickNoteModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  
  // État du formulaire
  const [formData, setFormData] = useState<NoteData>({
    content: '',
    title: '',
    context_type: initialContext?.type || 'free',
    context_id: initialContext?.id,
    status: 'draft',
    tags: [],
    is_private: false
  });
  
  const [newTag, setNewTag] = useState('');

  // Charger les données initiales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      console.log('🔄 [MODAL] Chargement des données initiales...');
      
      // Charger l'utilisateur actuel
      console.log('👤 [MODAL] Récupération de l\'utilisateur...');
      const user = await authService.getCurrentUser();
      if (user) {
        console.log('✅ [MODAL] Utilisateur trouvé:', user);
        setCurrentUser(user);
      } else {
        console.log('❌ [MODAL] Aucun utilisateur trouvé');
      }

      // Charger les événements disponibles pour le contexte
      console.log('📅 [MODAL] Récupération des événements...');
      try {
        const events = await eventService.getEvents();
        console.log('✅ [MODAL] Événements récupérés:', events.length);
        setAvailableEvents(events);
      } catch (eventError) {
        console.error('❌ [MODAL] Erreur lors du chargement des événements:', eventError);
        // Continuer même si les événements ne se chargent pas
        setAvailableEvents([]);
      }
      
      console.log('✅ [MODAL] Données initiales chargées');
    } catch (error) {
      console.error('❌ [MODAL] Erreur lors du chargement des données:', error);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [MODAL] Début de la soumission du formulaire');
    console.log('📋 [MODAL] Données du formulaire:', formData);
    console.log('👤 [MODAL] Utilisateur actuel:', currentUser);
    
    if (!formData.content.trim()) {
      console.log('❌ [MODAL] Contenu vide');
      toast({
        title: "Erreur",
        description: "Le contenu de la note ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      console.log('❌ [MODAL] Pas d\'utilisateur connecté');
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une note",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('⏳ [MODAL] Début de l\'enregistrement...');
      
      console.log('🔄 [MODAL] Appel notesService.createNote avec:', { 
        formData, 
        userId: currentUser.id 
      });
      
      const createdNote = await notesService.createNote(formData, currentUser.id);
      
      console.log('✅ [MODAL] Note créée avec succès:', createdNote);
      
      toast({
        title: "Note créée",
        description: "Votre note a été enregistrée avec succès",
      });

      // Réinitialiser le formulaire
      console.log('🔄 [MODAL] Réinitialisation du formulaire...');
      setFormData({
        content: '',
        title: '',
        context_type: 'free',
        context_id: undefined,
        status: 'draft',
        tags: [],
        is_private: false
      });

      if (onNoteSaved) {
        console.log('📞 [MODAL] Appel du callback onNoteSaved...');
        onNoteSaved();
      }
      
      // Fermer la modal après succès
      console.log('🚪 [MODAL] Fermeture de la modal...');
      onClose();
    } catch (error) {
      console.error('❌ [MODAL] Erreur lors de la création de la note:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue lors de la création de la note";
      
      console.log('📢 [MODAL] Affichage du toast d\'erreur:', errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🏁 [MODAL] Fin de l\'enregistrement, isLoading = false');
      setIsLoading(false);
    }
  };

  // Ajouter un tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Gérer la touche Entrée pour les tags
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 Nouvelle note rapide
          </DialogTitle>
          <DialogDescription>
            Créez une note rapidement pour capturer vos idées, observations ou compte-rendus
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={(e) => {
            console.log('📝 [MODAL] Événement onSubmit du formulaire déclenché');
            handleSubmit(e);
          }} 
          className="space-y-6"
          noValidate
        >
          {/* Titre (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre (optionnel)</Label>
            <Input
              id="title"
              placeholder="Titre de votre note..."
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Contenu principal */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              placeholder="Écrivez votre note ici... (Markdown supporté)"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Contexte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contexte</Label>
              <Select
                value={formData.context_type}
                onValueChange={(value: 'event' | 'project' | 'free') => 
                  setFormData(prev => ({ 
                    ...prev, 
                    context_type: value,
                    context_id: value === 'free' ? undefined : prev.context_id
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">📝 Note libre</SelectItem>
                  <SelectItem value="event">📅 Événement</SelectItem>
                  <SelectItem value="project">📌 Projet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sélection d'événement si contexte = event */}
            {formData.context_type === 'event' && (
              <div className="space-y-2">
                <Label>Événement lié</Label>
                <Select
                  value={formData.context_id || ''}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, context_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Ajouter un tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm" variant="outline">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'validated' | 'pending') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">📝 Brouillon</SelectItem>
                  <SelectItem value="pending">⌛ À valider</SelectItem>
                  <SelectItem value="validated">✅ Validée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={formData.is_private}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_private: checked }))
                }
              />
              <Label htmlFor="private" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Note privée
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.content.trim()}
              onClick={(e) => {
                console.log('🖱️ [MODAL] Clic sur le bouton Enregistrer');
                console.log('📋 [MODAL] FormData au moment du clic:', formData);
                console.log('👤 [MODAL] CurrentUser au moment du clic:', currentUser);
                // Le onClick ne doit pas empêcher la soumission du formulaire
              }}
            >
              {isLoading ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 