// Composant VoteDetail - Interface de vote et affichage des détails
// Architecture simplifiée pour éviter les boucles infinies

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Calendar, Users, CheckCircle, Clock, Archive, AlertCircle, Vote as VoteIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useVote } from '../../hooks/useVote';
import { VoteResults } from './VoteResults';
import type { Vote, VoteOption } from '../../types/vote';

interface VoteDetailProps {
  voteId: string;
}

export function VoteDetail({ voteId }: VoteDetailProps) {
  const { 
    vote, 
    options, 
    userResponse, 
    results, 
    loading, 
    error, 
    success, 
    submitVote 
  } = useVote(voteId);
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser les options sélectionnées avec la réponse existante
  React.useEffect(() => {
    if (userResponse) {
      setSelectedOptions(userResponse.selected_options);
    }
  }, [userResponse]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du vote...</p>
        </div>
      </div>
    );
  }

  if (error || !vote) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Vote non trouvé'}
        </AlertDescription>
      </Alert>
    );
  }

  const isActive = () => {
    const now = new Date();
    const startDate = new Date(vote.start_date);
    const endDate = new Date(vote.end_date);
    
    return vote.status === 'active' && now >= startDate && now <= endDate;
  };

  const canVote = isActive() && !userResponse;
  const canModifyVote = isActive() && userResponse;
  const canViewResults = () => {
    if (vote.show_results_mode === 'immediate') return true;
    if (vote.show_results_mode === 'after_vote' && userResponse) return true;
    if (vote.show_results_mode === 'after_close' && !isActive()) return true;
    return false;
  };

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (vote.type === 'single_choice' || vote.type === 'yes_no') {
      setSelectedOptions(checked ? [optionId] : []);
    } else {
      setSelectedOptions(prev => 
        checked 
          ? [...prev, optionId]
          : prev.filter(id => id !== optionId)
      );
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await submitVote(selectedOptions);
    } catch (err) {
      // L'erreur est gérée par le hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Vote['status']) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const, icon: Clock },
      active: { label: 'Actif', variant: 'default' as const, icon: CheckCircle },
      closed: { label: 'Fermé', variant: 'destructive' as const, icon: Archive },
      archived: { label: 'Archivé', variant: 'outline' as const, icon: Archive }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du vote */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{vote.title}</CardTitle>
              {vote.description && (
                <p className="text-muted-foreground">{vote.description}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {getStatusBadge(vote.status)}
              <Badge variant="outline">
                {vote.type === 'yes_no' && 'Oui/Non'}
                {vote.type === 'single_choice' && 'Choix unique'}
                {vote.type === 'multiple_choice' && 'Choix multiple'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Du {formatDate(vote.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>au {formatDate(vote.end_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages d'état */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Interface de vote */}
      {(canVote || canModifyVote) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VoteIcon className="h-5 w-5" />
              {canVote ? 'Votre vote' : 'Modifier votre vote'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {vote.type === 'yes_no' || vote.type === 'single_choice' ? (
                <RadioGroup
                  value={selectedOptions[0] || ''}
                  onValueChange={(value) => setSelectedOptions([value])}
                >
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={(checked) => 
                          handleOptionChange(option.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedOptions.length === 0 || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Enregistrement...' : 
                   canVote ? 'Voter' : 'Modifier mon vote'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut du vote utilisateur */}
      {userResponse && !canModifyVote && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez déjà voté pour ce sondage. 
            {!isActive() && ' Le vote est maintenant fermé.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Vote fermé */}
      {!isActive() && vote.status === 'closed' && (
        <Alert variant="destructive">
          <Archive className="h-4 w-4" />
          <AlertDescription>
            Ce vote est fermé. Les votes ne sont plus acceptés.
          </AlertDescription>
        </Alert>
      )}

      {/* Résultats */}
      {canViewResults() && results && (
        <VoteResults 
          vote={vote}
          options={options}
          results={results}
          totalResponses={results.reduce((sum, r) => sum + r.count, 0)}
        />
      )}

      {/* Message si les résultats ne sont pas encore visibles */}
      {!canViewResults() && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>
                {vote.show_results_mode === 'after_vote' && !userResponse && 
                  'Les résultats seront visibles après votre vote'}
                {vote.show_results_mode === 'after_close' && 
                  'Les résultats seront visibles après la clôture du vote'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 