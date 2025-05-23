import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { getText } from '@/lib/textBank';
import { Vote, VoteStatus, VoteType } from '@/types/vote';
import { voteService } from '@/lib/voteService';
import VoteList from '@/components/votes/VoteList';
import VoteForm from '@/components/votes/VoteForm';

const VotesPage: React.FC = () => {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);
  const { toast } = useToast();
  
  // États pour les filtres et onglets
  const [filter, setFilter] = useState<VoteStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'votes' | 'surveys'>('votes');
  
  // États pour les dialogues
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [formType, setFormType] = useState<VoteType>('binary');
  
  // Ouvrir le dialogue de création avec le type approprié
  const handleOpenCreateDialog = (type: VoteType) => {
    setFormType(type);
    setCreateDialogOpen(true);
  };
  
  // Ouvrir le dialogue d'édition pour un vote
  const handleEditVote = (vote: Vote) => {
    setSelectedVote(vote);
    setEditDialogOpen(true);
  };
  
  // Ouvrir le dialogue de suppression pour un vote
  const handleDeleteVote = (vote: Vote) => {
    setSelectedVote(vote);
    setDeleteDialogOpen(true);
  };
  
  // Gérer la création d'un vote
  const handleCreateVote = (vote: Vote) => {
    setCreateDialogOpen(false);
    toast({
      title: t('votes.toast.created_title'),
      description: t('votes.toast.created_description'),
    });
  };
  
  // Gérer la mise à jour d'un vote
  const handleUpdateVote = (vote: Vote) => {
    setEditDialogOpen(false);
    toast({
      title: t('votes.toast.updated_title'),
      description: t('votes.toast.updated_description'),
    });
  };
  
  // Gérer la suppression d'un vote
  const handleConfirmDelete = async () => {
    if (!selectedVote) return;
    
    try {
      await voteService.deleteVote(selectedVote.id);
      
      toast({
        title: t('votes.toast.deleted_title'),
        description: t('votes.toast.deleted_description'),
      });
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('votes.page_title')}</h1>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Select 
              value={filter} 
              onValueChange={(value) => setFilter(value as VoteStatus | 'all')}
            >
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder={t('votes.filter.label')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('votes.filter.all')}</SelectItem>
                <SelectItem value="active">{t('votes.filter.active')}</SelectItem>
                <SelectItem value="closed">{t('votes.filter.closed')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="gap-1"
              onClick={() => handleOpenCreateDialog(activeTab === 'votes' ? 'binary' : 'survey')}
            >
              <Plus className="h-4 w-4" />
              {t('votes.actions.create')}
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="votes" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'votes' | 'surveys')}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="votes">{t('votes.tabs.official')}</TabsTrigger>
            <TabsTrigger value="surveys">{t('votes.tabs.surveys')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="votes" className="mt-6">
            <VoteList 
              filter={filter}
              type="binary"
              onCreateVote={() => handleOpenCreateDialog('binary')}
              onEditVote={handleEditVote}
              onDeleteVote={handleDeleteVote}
            />
          </TabsContent>
          
          <TabsContent value="surveys" className="mt-6">
            <VoteList 
              filter={filter}
              type="survey"
              onCreateVote={() => handleOpenCreateDialog('survey')}
              onEditVote={handleEditVote}
              onDeleteVote={handleDeleteVote}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      {/* Dialogue de création de vote */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <VoteForm 
            onSubmit={handleCreateVote} 
            onCancel={() => setCreateDialogOpen(false)}
            initialType={formType}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'édition de vote */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedVote && (
            <VoteForm 
              vote={selectedVote}
              onSubmit={handleUpdateVote} 
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
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
    </div>
  );
};

export default VotesPage; 