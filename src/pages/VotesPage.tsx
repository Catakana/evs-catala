// Page VotesPage - Liste des votes avec filtres et actions
// Architecture simplifiée pour éviter les problèmes de performance

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Search, Filter, AlertCircle, Vote as VoteIcon } from 'lucide-react';
import { VoteCard } from '../components/votes/VoteCard';
import { CreateVoteForm } from '../components/votes/CreateVoteForm';
import { EditVoteForm } from '../components/votes/EditVoteForm';
import { useVotes, useActiveVotes, useVotePermissions } from '../hooks/useVote';
import { voteService } from '../lib/voteService';
import type { Vote } from '../types/vote';

export function VotesPage() {
  const { votes, loading, error, reload } = useVotes();
  const { activeVotes, loading: loadingActive } = useActiveVotes();
  const { permissions, loading: loadingPermissions } = useVotePermissions();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVote, setEditingVote] = useState<Vote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filtrage des votes
  const filteredVotes = votes.filter(vote => {
    const matchesSearch = vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vote.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || vote.status === statusFilter;
    const matchesType = typeFilter === 'all' || vote.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Séparation des votes par statut
  const draftVotes = filteredVotes.filter(vote => vote.status === 'draft');
  const closedVotes = filteredVotes.filter(vote => vote.status === 'closed' || vote.status === 'archived');

  const handleVoteCreated = (vote: Vote) => {
    setShowCreateForm(false);
    reload(); // Recharger la liste
  };

  const handleVoteUpdated = (vote: Vote) => {
    setEditingVote(null);
    reload(); // Recharger la liste
  };

  const handleEditVote = (vote: Vote) => {
    setEditingVote(vote);
  };

  const handleDeleteVote = async (vote: Vote) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le vote "${vote.title}" ?`)) {
      try {
        await voteService.deleteVote(vote.id);
        reload(); // Recharger la liste
      } catch (error) {
        console.error('Erreur lors de la suppression du vote:', error);
        alert('Erreur lors de la suppression du vote');
      }
    }
  };

  if (showCreateForm) {
    return (
      <div className="container mx-auto px-4 py-6">
        <CreateVoteForm
          onSuccess={handleVoteCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (editingVote) {
    return (
      <div className="container mx-auto px-4 py-6">
        <EditVoteForm
          vote={editingVote}
          onSuccess={handleVoteUpdated}
          onCancel={() => setEditingVote(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <VoteIcon className="h-8 w-8" />
            Votes et Sondages
          </h1>
          <p className="text-muted-foreground mt-1">
            Participez aux décisions collectives de l'association
          </p>
        </div>
        
        {permissions.canCreate && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau vote
          </Button>
        )}
      </div>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un vote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="closed">Fermés</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="yes_no">Oui/Non</SelectItem>
            <SelectItem value="single_choice">Choix unique</SelectItem>
            <SelectItem value="multiple_choice">Choix multiple</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des votes...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">
              Actifs ({activeVotes.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Tous ({filteredVotes.length})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Brouillons ({draftVotes.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Fermés ({closedVotes.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Votes actifs */}
          <TabsContent value="active" className="space-y-4">
            {loadingActive ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : activeVotes.length === 0 ? (
              <div className="text-center py-12">
                <VoteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun vote actif</h3>
                <p className="text-muted-foreground mb-4">
                  Il n'y a actuellement aucun vote en cours.
                </p>
                {permissions.canCreate && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un vote
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeVotes.map((vote) => (
                  <VoteCard key={vote.id} vote={vote} />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Tous les votes */}
          <TabsContent value="all" className="space-y-4">
            {filteredVotes.length === 0 ? (
              <div className="text-center py-12">
                <VoteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun vote trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Aucun vote ne correspond à vos critères de recherche.'
                    : 'Aucun vote n\'a encore été créé.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVotes.map((vote) => (
                  <VoteCard 
                    key={vote.id} 
                    vote={vote}
                    showActions={permissions.canEdit}
                    onEdit={handleEditVote}
                    onDelete={permissions.canDelete ? handleDeleteVote : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Brouillons */}
          <TabsContent value="drafts" className="space-y-4">
            {draftVotes.length === 0 ? (
              <div className="text-center py-12">
                <VoteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun brouillon</h3>
                <p className="text-muted-foreground">
                  Vous n'avez aucun vote en brouillon.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftVotes.map((vote) => (
                  <VoteCard 
                    key={vote.id} 
                    vote={vote}
                    showActions={permissions.canEdit}
                    onEdit={handleEditVote}
                    onDelete={permissions.canDelete ? handleDeleteVote : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Votes fermés */}
          <TabsContent value="closed" className="space-y-4">
            {closedVotes.length === 0 ? (
              <div className="text-center py-12">
                <VoteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun vote fermé</h3>
                <p className="text-muted-foreground">
                  Aucun vote n'a encore été fermé.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {closedVotes.map((vote) => (
                  <VoteCard 
                    key={vote.id} 
                    vote={vote}
                    showActions={permissions.canDelete}
                    onEdit={permissions.canEdit ? handleEditVote : undefined}
                    onDelete={permissions.canDelete ? handleDeleteVote : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 