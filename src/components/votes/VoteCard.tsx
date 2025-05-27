// Composant VoteCard - Affichage d'un vote dans la liste
// Architecture simplifiée pour éviter les problèmes de performance

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Users, CheckCircle, Clock, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Vote } from '../../types/vote';

interface VoteCardProps {
  vote: Vote;
  showActions?: boolean;
  onEdit?: (vote: Vote) => void;
  onDelete?: (vote: Vote) => void;
}

export function VoteCard({ vote, showActions = false, onEdit, onDelete }: VoteCardProps) {
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

  const getTypeBadge = (type: Vote['type']) => {
    const typeLabels = {
      yes_no: 'Oui/Non',
      single_choice: 'Choix unique',
      multiple_choice: 'Choix multiple'
    };
    
    return (
      <Badge variant="outline">
        {typeLabels[type]}
      </Badge>
    );
  };

  const isActive = () => {
    const now = new Date();
    const startDate = new Date(vote.start_date);
    const endDate = new Date(vote.end_date);
    
    return vote.status === 'active' && now >= startDate && now <= endDate;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isActive() ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {vote.title}
          </CardTitle>
          <div className="flex flex-col gap-2 ml-4">
            {getStatusBadge(vote.status)}
            {getTypeBadge(vote.type)}
          </div>
        </div>
        
        {vote.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {vote.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Du {formatDate(vote.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>au {formatDate(vote.end_date)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Link to={`/votes/${vote.id}`}>
            <Button variant="outline" size="sm">
              {isActive() ? 'Voter' : 'Voir les détails'}
            </Button>
          </Link>
          
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(vote)}
                >
                  Modifier
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(vote)}
                  className="text-destructive hover:text-destructive"
                >
                  Supprimer
                </Button>
              )}
            </div>
          )}
        </div>
        
        {isActive() && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700 font-medium">
              🗳️ Vote en cours - Votre participation est attendue !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 