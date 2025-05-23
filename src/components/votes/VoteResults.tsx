import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vote, VoteOption, VoteStatus } from '@/types/vote';
import { Calendar, Clock, Users, UserCheck, Info, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getText } from '@/lib/textBank';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VoteResultsProps {
  vote: Vote;
}

const VoteResults = ({ vote }: VoteResultsProps) => {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);
  
  // Calcul du nombre total de votes
  const totalVotes = vote.options.reduce((sum, option) => sum + (option.count || 0), 0);
  
  // Calcul du pourcentage pour chaque option
  const getOptionPercentage = (count: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };
  
  // Déterminer si les résultats peuvent être affichés
  const canShowResults = (): boolean => {
    // On peut toujours voir les résultats des votes clôturés
    if (vote.status === 'closed') return true;
    
    // Sinon, cela dépend de la configuration de visibilité des résultats
    return vote.resultVisibility === 'immediate';
    // Note: la visibilité 'afterVote' nécessiterait de savoir si l'utilisateur a voté
  };
  
  // Déterminer la couleur du badge selon le statut
  const getStatusBadgeVariant = (status: VoteStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: VoteStatus) => {
    switch (status) {
      case 'active':
        return t('votes.status.active');
      case 'closed':
        return t('votes.status.closed');
      case 'draft':
        return t('votes.status.draft');
      default:
        return '';
    }
  };
  
  // Tri des options par nombre de votes (décroissant)
  const sortedOptions = [...vote.options].sort((a, b) => 
    (b.count || 0) - (a.count || 0)
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{vote.title}</CardTitle>
            <CardDescription className="mt-2">{vote.description}</CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(vote.status) as any}>
            {getStatusText(vote.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Métadonnées du vote */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(vote.startDate, 'PPP', { locale: fr })} - {format(vote.endDate, 'PPP', { locale: fr })}
            </span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <UserCheck className="h-4 w-4 mr-2" />
            <span>
              {totalVotes} {t('votes.participants')}
            </span>
          </div>
        </div>
        
        {/* Résultats */}
        {canShowResults() ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('votes.results.title')}</h3>
            
            {totalVotes === 0 ? (
              <div className="p-4 border rounded-lg flex items-center justify-center text-muted-foreground">
                <Info className="h-5 w-5 mr-2" />
                <span>{t('votes.results.no_votes_yet')}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOptions.map((option, index) => {
                  const percentage = getOptionPercentage(option.count || 0);
                  return (
                    <div key={option.id || index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.text}</span>
                        <span className="text-muted-foreground text-sm">
                          {option.count || 0} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Alert variant="default" className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('votes.results.hidden_title')}</AlertTitle>
            <AlertDescription>
              {vote.resultVisibility === 'afterVote' 
                ? t('votes.results.visible_after_vote') 
                : vote.resultVisibility === 'afterClose'
                  ? t('votes.results.visible_after_close')
                  : t('votes.results.not_available')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default VoteResults; 