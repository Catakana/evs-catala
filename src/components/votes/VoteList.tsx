import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getText } from '@/lib/textBank';
import { voteService } from '@/lib/voteService';
import { Vote, VoteStatus } from '@/types/vote';
import { formatDistanceToNow, isPast, isFuture, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  ExternalLink, 
  AlertCircle, 
  Users,
  ChevronRight,
  Edit,
  Trash2 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface VoteListProps {
  filter: VoteStatus | 'all';
  type?: 'binary' | 'multiple' | 'survey' | 'all';
  onCreateVote?: () => void;
  onEditVote?: (vote: Vote) => void;
  onDeleteVote?: (vote: Vote) => void;
}

const VoteList = ({ 
  filter, 
  type = 'all', 
  onCreateVote,
  onEditVote,
  onDeleteVote
}: VoteListProps) => {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer tous les votes
        const allVotes = await voteService.getAllVotes();
        
        // Appliquer les filtres
        let filteredVotes = allVotes;
        
        // Filtre par statut
        if (filter !== 'all') {
          filteredVotes = filteredVotes.filter(vote => vote.status === filter);
        }
        
        // Filtre par type
        if (type !== 'all') {
          filteredVotes = filteredVotes.filter(vote => vote.type === type);
        }
        
        setVotes(filteredVotes);
      } catch (err) {
        console.error('Erreur lors de la récupération des votes:', err);
        setError(t('votes.errors.fetch_error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchVotes();
  }, [filter, type, t]);
  
  // Fonction pour obtenir la couleur du badge selon le statut
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
  
  // Fonction pour afficher la période du vote
  const getVotePeriodText = (vote: Vote) => {
    const now = new Date();
    
    if (isPast(vote.endDate)) {
      return t('votes.period.ended', { 
        date: formatDistanceToNow(vote.endDate, { locale: fr, addSuffix: true }) 
      });
    }
    
    if (isFuture(vote.startDate)) {
      return t('votes.period.starts', { 
        date: formatDistanceToNow(vote.startDate, { locale: fr, addSuffix: true }) 
      });
    }
    
    return t('votes.period.ends', { 
      date: formatDistanceToNow(vote.endDate, { locale: fr, addSuffix: true }) 
    });
  };
  
  // Fonction pour vérifier si l'utilisateur peut modifier un vote
  const canEditVote = (vote: Vote) => {
    if (!user) return false;
    
    // L'utilisateur peut modifier son propre vote ou s'il est admin
    return user.id === vote.createdBy || user.role === 'admin';
  };
  
  // Naviguer vers la page de détail d'un vote
  const handleViewVote = (vote: Vote) => {
    navigate(`/votes/${vote.id}`);
  };
  
  // Gérer l'édition d'un vote
  const handleEditVote = (vote: Vote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditVote) onEditVote(vote);
  };
  
  // Gérer la suppression d'un vote
  const handleDeleteVote = (vote: Vote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteVote) onDeleteVote(vote);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (votes.length === 0) {
    return (
      <div className="p-12 border rounded-lg flex flex-col items-center justify-center text-muted-foreground">
        <p className="mb-4">{t('votes.no_votes_found')}</p>
        {onCreateVote && (
          <Button onClick={onCreateVote} variant="outline">
            {t('votes.create_new')}
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {votes.map((vote) => (
        <Card 
          key={vote.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleViewVote(vote)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{vote.title}</CardTitle>
              <Badge variant={getStatusBadgeVariant(vote.status) as any}>
                {getStatusText(vote.status)}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">{vote.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {format(vote.startDate, 'PPP', { locale: fr })} - {format(vote.endDate, 'PPP', { locale: fr })}
                </span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>{getVotePeriodText(vote)}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {vote.options.reduce((total, option) => total + (option.count || 0), 0)} {t('votes.participants')}
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2 border-t">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleViewVote(vote)}>
              {t('votes.view_results')}
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {canEditVote(vote) && (
              <div className="flex gap-1">
                {vote.status !== 'closed' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleEditVote(vote, e)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => handleDeleteVote(vote, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default VoteList; 