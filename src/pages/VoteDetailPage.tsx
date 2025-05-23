import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { voteService } from '@/lib/voteService';
import { Vote, VoteOption } from '@/types/vote';
import { getText } from '@/lib/textBank';
import { useAuth } from '@/hooks/useAuth';
import VoteResults from '@/components/votes/VoteResults';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VoteForm from '@/components/votes/VoteForm';
import { AlertCircle, ArrowLeft, Edit, Lock, Trash2 } from 'lucide-react';

const VoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);
  
  // États
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  
  // Charger les données du vote
  useEffect(() => {
    const fetchVote = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les détails du vote
        const voteData = await voteService.getVoteById(id);
        
        if (!voteData) {
          setError(t('votes.errors.not_found'));
          return;
        }
        
        setVote(voteData);
        
        // Vérifier si l'utilisateur a déjà voté
        if (user) {
          const userHasVoted = await voteService.hasUserVoted(id, user.id);
          setHasVoted(userHasVoted);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du vote:', err);
        setError(t('votes.errors.fetch_error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchVote();
  }, [id, user, t]);
  
  // Soumettre un vote
  const handleSubmitVote = async () => {
    if (!vote || !selectedOption || !user || hasVoted) return;
    
    setIsSubmitting(true);
    
    try {
      // Enregistrer la réponse au vote
      await voteService.submitVoteResponse(vote.id, selectedOption, user.id);
      
      toast({
        title: t('votes.toast.vote_success'),
        description: t('votes.toast.vote_success_description'),
      });
      
      setHasVoted(true);
      
      // Recharger le vote pour obtenir les résultats mis à jour
      const updatedVote = await voteService.getVoteById(vote.id);
      if (updatedVote) {
        setVote(updatedVote);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du vote:', error);
      toast({
        variant: 'destructive',
        title: t('votes.toast.error_title'),
        description: t('votes.toast.vote_error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Mettre à jour un vote
  const handleUpdateVote = (updatedVote: Vote) => {
    setVote(updatedVote);
    setEditDialogOpen(false);
    
    toast({
      title: t('votes.toast.updated_title'),
      description: t('votes.toast.updated_description'),
    });
  };
  
  // Supprimer un vote
  const handleConfirmDelete = async () => {
    if (!vote) return;
    
    try {
      await voteService.deleteVote(vote.id);
      
      toast({
        title: t('votes.toast.deleted_title'),
        description: t('votes.toast.deleted_description'),
      });
      
      navigate('/votes');
    } catch (error) {
      console.error('Erreur lors de la suppression du vote:', error);
      toast({
        variant: 'destructive',
        title: t('votes.toast.error_title'),
        description: t('votes.toast.delete_error_description'),
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  // Mettre à jour le statut d'un vote
  const handleUpdateStatus = async (status: 'active' | 'closed') => {
    if (!vote) return;
    
    try {
      await voteService.updateVoteStatus(vote.id, status);
      
      // Recharger le vote pour obtenir le statut mis à jour
      const updatedVote = await voteService.getVoteById(vote.id);
      if (updatedVote) {
        setVote(updatedVote);
        
        toast({
          title: status === 'active' 
            ? t('votes.toast.activated_title') 
            : t('votes.toast.closed_title'),
          description: status === 'active' 
            ? t('votes.toast.activated_description') 
            : t('votes.toast.closed_description'),
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        variant: 'destructive',
        title: t('votes.toast.error_title'),
        description: t('votes.toast.status_error'),
      });
    } finally {
      setStatusUpdateDialogOpen(false);
    }
  };
  
  // Vérifier si l'utilisateur peut modifier le vote
  const canEditVote = (): boolean => {
    if (!vote || !user) return false;
    return user.id === vote.createdBy || user.role === 'admin';
  };
  
  // Vérifier si l'utilisateur peut voter
  const canVote = (): boolean => {
    if (!vote || !user || hasVoted) return false;
    if (vote.status !== 'active') return false;
    
    // Vérifier que le vote est dans sa période active
    const now = new Date();
    return now >= vote.startDate && now <= vote.endDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container flex-1 py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !vote) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container flex-1 py-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/votes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('common.errors.generic')}</AlertTitle>
            <AlertDescription>
              {error || t('votes.errors.not_found')}
            </AlertDescription>
            <div className="mt-4">
              <Button onClick={() => navigate('/votes')}>
                {t('votes.actions.back_to_votes')}
              </Button>
            </div>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/votes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
          
          {canEditVote() && (
            <div className="flex gap-2">
              {vote.status === 'draft' && (
                <Button 
                  variant="outline"
                  onClick={() => setStatusUpdateDialogOpen(true)}
                >
                  {t('votes.actions.activate')}
                </Button>
              )}
              
              {vote.status === 'active' && (
                <Button 
                  variant="outline"
                  onClick={() => setStatusUpdateDialogOpen(true)}
                >
                  {t('votes.actions.close')}
                </Button>
              )}
              
              {vote.status !== 'closed' && (
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
              )}
              
              <Button 
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de vote */}
          <div className="space-y-6">
            {canVote() ? (
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-bold">{t('votes.vote_form.title')}</h2>
                <p className="text-muted-foreground">{t('votes.vote_form.description')}</p>
                
                <RadioGroup 
                  value={selectedOption} 
                  onValueChange={setSelectedOption}
                  className="mt-4 space-y-3"
                >
                  {vote.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="font-normal">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleSubmitVote}
                  disabled={!selectedOption || isSubmitting}
                >
                  {isSubmitting ? t('common.processing') : t('votes.actions.submit_vote')}
                </Button>
              </div>
            ) : (
              <div className="bg-card border rounded-lg p-6 space-y-4">
                {hasVoted ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="bg-primary/10 text-primary rounded-full p-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t('votes.already_voted.title')}</h3>
                    <p className="text-muted-foreground">{t('votes.already_voted.description')}</p>
                  </div>
                ) : vote.status === 'draft' ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="bg-muted text-muted-foreground rounded-full p-3 mb-3">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t('votes.not_active.title')}</h3>
                    <p className="text-muted-foreground">{t('votes.not_active.description')}</p>
                  </div>
                ) : vote.status === 'closed' ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="bg-muted text-muted-foreground rounded-full p-3 mb-3">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t('votes.closed.title')}</h3>
                    <p className="text-muted-foreground">{t('votes.closed.description')}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="bg-muted text-muted-foreground rounded-full p-3 mb-3">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t('votes.cannot_vote.title')}</h3>
                    <p className="text-muted-foreground">{t('votes.cannot_vote.description')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Résultats du vote */}
          <div>
            <VoteResults vote={vote} />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Dialogue d'édition de vote */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <VoteForm 
            vote={vote}
            onSubmit={handleUpdateVote} 
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('votes.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('votes.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              {t('votes.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialogue de mise à jour du statut */}
      <AlertDialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {vote.status === 'draft' 
                ? t('votes.activate.title') 
                : t('votes.close.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {vote.status === 'draft' 
                ? t('votes.activate.description') 
                : t('votes.close.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUpdateStatus(vote.status === 'draft' ? 'active' : 'closed')}
            >
              {vote.status === 'draft' 
                ? t('votes.activate.confirm') 
                : t('votes.close.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoteDetailPage; 