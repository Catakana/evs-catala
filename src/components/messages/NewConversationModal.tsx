import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Users, Search, Plus, UserPlus, X } from 'lucide-react';
import { ConversationType } from '@/types/message';
import { cn } from '@/lib/utils';

export interface ProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (type: ConversationType, title: string | null, participantIds: string[]) => void;
  availableProfiles: ProfileSummary[];
  currentUserId: string;
  isLoading?: boolean;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
  availableProfiles,
  currentUserId,
  isLoading = false
}) => {
  const [type, setType] = useState<ConversationType>('private');
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileSummary[]>([]);

  // Réinitialiser le formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setType('private');
      setTitle('');
      setSearchQuery('');
      setSelectedProfiles([]);
    }
  }, [isOpen]);

  // Filtrer les profiles en fonction de la recherche
  const filteredProfiles = availableProfiles.filter(profile => 
    profile.id !== currentUserId && // Exclure l'utilisateur courant
    !selectedProfiles.some(p => p.id === profile.id) && // Exclure les profils déjà sélectionnés
    (profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     profile.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectProfile = (profile: ProfileSummary) => {
    // Pour les conversations privées, on ne peut sélectionner qu'un seul participant
    if (type === 'private' && selectedProfiles.length === 1) {
      setSelectedProfiles([profile]);
    } else {
      setSelectedProfiles(prev => [...prev, profile]);
    }
    setSearchQuery('');
  };

  const handleRemoveProfile = (profileId: string) => {
    setSelectedProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const handleCreateConversation = () => {
    if (selectedProfiles.length === 0) {
      alert('Veuillez sélectionner au moins un participant.');
      return;
    }

    const participantIds = selectedProfiles.map(p => p.id);
    
    // Pour les conversations de groupe, il faut un titre
    if (type === 'group' && title.trim() === '') {
      alert('Veuillez donner un titre à votre conversation de groupe.');
      return;
    }

    onCreateConversation(
      type, 
      type === 'group' ? title.trim() : null, 
      participantIds
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Créez une nouvelle conversation privée ou de groupe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Choix du type de conversation */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'private' ? 'default' : 'outline'}
              className="flex-1 gap-1"
              onClick={() => setType('private')}
            >
              <MessageSquare className="h-4 w-4" />
              Privée
            </Button>
            <Button
              type="button"
              variant={type === 'group' ? 'default' : 'outline'}
              className="flex-1 gap-1"
              onClick={() => setType('group')}
            >
              <Users className="h-4 w-4" />
              Groupe
            </Button>
          </div>

          {/* Titre de la conversation (pour les groupes uniquement) */}
          {type === 'group' && (
            <div className="space-y-2">
              <Label htmlFor="title">Nom du groupe</Label>
              <Input
                id="title"
                placeholder="Entrez un nom pour le groupe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}

          {/* Sélection des participants */}
          <div className="space-y-2">
            <Label>Participants ({selectedProfiles.length})</Label>
            
            {/* Affichage des participants sélectionnés */}
            {selectedProfiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedProfiles.map(profile => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-1 bg-muted py-1 px-2 rounded-full text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      {profile.avatar ? (
                        <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {profile.firstName[0]}{profile.lastName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="truncate max-w-[150px]">
                      {profile.firstName} {profile.lastName}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full ml-1 hover:bg-muted-foreground/20"
                      onClick={() => handleRemoveProfile(profile.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Recherche et ajout de participants */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des membres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8"
              />
              <UserPlus className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Liste des résultats de recherche */}
            {searchQuery && (
              <div className="border rounded-md max-h-[160px] overflow-y-auto">
                {filteredProfiles.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Aucun résultat
                  </div>
                ) : (
                  <div>
                    {filteredProfiles.map(profile => (
                      <div 
                        key={profile.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectProfile(profile)}
                      >
                        <Avatar className="h-6 w-6">
                          {profile.avatar ? (
                            <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {profile.firstName[0]}{profile.lastName[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="flex-1">
                          {profile.firstName} {profile.lastName}
                        </span>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            disabled={selectedProfiles.length === 0 || (type === 'group' && title.trim() === '') || isLoading}
            onClick={handleCreateConversation}
          >
            {isLoading ? 'Création...' : 'Créer la conversation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal; 