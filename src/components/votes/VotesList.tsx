import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, Clock, X, Filter, PlusCircle, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getText } from '@/lib/textBank';
import { voteService } from '@/lib/voteService';
import { Vote, VoteStatus } from '@/types/vote';
import { useAuth } from '@/hooks/useAuth';

interface VotesListProps {
  onVoteSelect: (voteId: string) => void;
  onCreateVote: () => void;
}

export default function VotesList({ onVoteSelect, onCreateVote }: VotesListProps) {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);
  const { user, isAdmin, isStaff } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredVotes, setFilteredVotes] = useState<Vote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadVotes = async () => {
      try {
        setLoading(true);
        const data = await voteService.getAllVotes();
        setVotes(data);
        setFilteredVotes(data);
      } catch (error) {
        console.error('Erreur lors du chargement des votes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVotes();
  }, []);

  // Filtrage des votes selon les critères
  useEffect(() => {
    let result = [...votes];
    
    // Filtrage par statut
    if (statusFilter !== 'all') {
      result = result.filter(vote => vote.status === statusFilter);
    }
    
    // Filtrage par terme de recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        vote => 
          vote.title.toLowerCase().includes(search) || 
          vote.description.toLowerCase().includes(search)
      );
    }
    
    setFilteredVotes(result);
  }, [votes, statusFilter, searchTerm]);

  // Convertir le statut en badge
  const getStatusBadge = (status: VoteStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-slate-100">{t('votes.status.draft')}</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">{t('votes.status.active')}</Badge>;
      case 'closed':
        return <Badge variant="secondary">{t('votes.status.closed')}</Badge>;
      default:
        return null;
    }
  };

  // Obtenir l'icône pour le type de vote
  const getVoteTypeIcon = (type: string) => {
    switch (type) {
      case 'binary':
        return <Check size={16} />;
      case 'multiple':
        return <Filter size={16} />;
      case 'survey':
        return <Calendar size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t('votes.title')}</h2>
        
        {(isAdmin || isStaff) && (
          <Button onClick={onCreateVote} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('votes.create')}
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('votes.search')}
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('votes.filter.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('votes.filter.all')}</SelectItem>
            <SelectItem value="draft">{t('votes.status.draft')}</SelectItem>
            <SelectItem value="active">{t('votes.status.active')}</SelectItem>
            <SelectItem value="closed">{t('votes.status.closed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredVotes.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <div className="mb-2">
            {statusFilter !== 'all' ? 
              t('votes.empty.filtered') : 
              t('votes.empty.all')}
          </div>
          {(isAdmin || isStaff) && (
            <Button onClick={onCreateVote} variant="outline">
              {t('votes.create_first')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVotes.map(vote => (
            <Card 
              key={vote.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onVoteSelect(vote.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="mr-2">{vote.title}</CardTitle>
                  {getStatusBadge(vote.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {vote.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {vote.status === 'draft' ? t('votes.created') : 
                     vote.status === 'active' ? t('votes.ends_in') : 
                     t('votes.ended')}
                    {' '}
                    {formatDistanceToNow(
                      vote.status === 'draft' || vote.status === 'closed' ? 
                        vote.createdAt : vote.endDate, 
                      { addSuffix: true, locale: fr }
                    )}
                  </span>
                </div>
                
                <div className="mt-4">
                  {vote.options.slice(0, 2).map((option, index) => (
                    <div key={option.id} className="text-sm truncate">
                      • {option.text}
                    </div>
                  ))}
                  {vote.options.length > 2 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      + {vote.options.length - 2} {t('votes.more_options')}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 border-t text-sm text-muted-foreground">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    {getVoteTypeIcon(vote.type)}
                    <span>
                      {vote.type === 'binary' ? t('votes.type.binary') :
                       vote.type === 'multiple' ? t('votes.type.multiple') :
                       t('votes.type.survey')}
                    </span>
                  </div>
                  
                  <div>
                    {vote.options.reduce((sum, opt) => sum + (opt.count || 0), 0)}
                    {' '}
                    {t('votes.responses')}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 