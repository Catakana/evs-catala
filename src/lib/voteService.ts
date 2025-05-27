// Service pour le module Votes v2
// Architecture simplifiée : pas de jointures, requêtes simples

import { supabase } from './supabase';
import type { 
  Vote, 
  VoteOption, 
  VoteResponse, 
  CreateVoteData, 
  VoteWithDetails, 
  VoteResult 
} from '../types/vote';

class VoteService {
  // ===== VOTES =====
  
  async getVotes(): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_votes_v2')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des votes:', error);
      throw error;
    }
  }
  
  async getVote(id: string): Promise<Vote | null> {
    try {
    const { data, error } = await supabase
        .from('evscatala_votes_v2')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du vote:', error);
      throw error;
    }
  }
  
  async createVote(voteData: CreateVoteData): Promise<Vote> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Utilisateur non connecté');
      
      const { options, ...vote } = voteData;
      
      const { data, error } = await supabase
        .from('evscatala_votes_v2')
        .insert({
          ...vote,
          created_by: user.data.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Créer les options si nécessaire
      if (options && options.length > 0) {
        await this.createVoteOptions(data.id, options);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du vote:', error);
      throw error;
    }
  }
  
  async updateVote(id: string, updates: Partial<Vote>): Promise<Vote> {
    try {
      const { data, error } = await supabase
        .from('evscatala_votes_v2')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du vote:', error);
      throw error;
    }
  }
  
  async deleteVote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('evscatala_votes_v2')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du vote:', error);
      throw error;
    }
  }
  
  // ===== OPTIONS =====
  
  async getVoteOptions(voteId: string): Promise<VoteOption[]> {
    try {
    const { data, error } = await supabase
        .from('evscatala_vote_options_v2')
      .select('*')
      .eq('vote_id', voteId)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des options:', error);
      throw error;
    }
  }
  
  async createVoteOptions(voteId: string, options: string[]): Promise<VoteOption[]> {
    try {
      const optionsData = options.map((text, index) => ({
        vote_id: voteId,
        option_text: text,
        display_order: index
      }));
      
      const { data, error } = await supabase
        .from('evscatala_vote_options_v2')
        .insert(optionsData)
        .select();
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la création des options:', error);
      throw error;
    }
  }
  
  // ===== RÉPONSES =====
  
  async getVoteResponses(voteId: string): Promise<VoteResponse[]> {
    try {
    const { data, error } = await supabase
        .from('evscatala_vote_responses_v2')
      .select('*')
      .eq('vote_id', voteId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses:', error);
      throw error;
    }
  }
  
  async getUserVoteResponse(voteId: string, userId: string): Promise<VoteResponse | null> {
    try {
      const { data, error } = await supabase
        .from('evscatala_vote_responses_v2')
        .select('*')
      .eq('vote_id', voteId)
        .eq('user_id', userId)
      .single();
      
    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la réponse utilisateur:', error);
      throw error;
    }
  }
  
  async submitVote(voteId: string, userId: string, selectedOptions: string[]): Promise<VoteResponse> {
    try {
    const { data, error } = await supabase
        .from('evscatala_vote_responses_v2')
        .upsert({
        vote_id: voteId,
          user_id: userId,
          selected_options: selectedOptions,
          updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la soumission du vote:', error);
      throw error;
    }
  }
  
  // ===== ASSEMBLAGE CÔTÉ CLIENT (pas de jointures) =====
  
  async getVoteWithDetails(voteId: string): Promise<VoteWithDetails> {
    try {
      // Récupération séparée des données (pas de JOIN)
      const [vote, options, responses] = await Promise.all([
        this.getVote(voteId),
        this.getVoteOptions(voteId),
        this.getVoteResponses(voteId)
      ]);
      
      if (!vote) throw new Error('Vote non trouvé');
      
      // Récupérer la réponse de l'utilisateur actuel si connecté
      const user = await supabase.auth.getUser();
      let userResponse;
      if (user.data.user) {
        userResponse = await this.getUserVoteResponse(voteId, user.data.user.id);
      }
      
      // Calculer les résultats côté client
      const results = this.calculateResults(options, responses);
      
      return { 
        vote, 
        options, 
        responses, 
        userResponse: userResponse || undefined,
        results 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du vote:', error);
      throw error;
    }
  }
  
  // ===== STATISTIQUES (côté client) =====
  
  calculateResults(options: VoteOption[], responses: VoteResponse[]): VoteResult[] {
    const totalResponses = responses.length;
    
    return options.map(option => {
      const count = responses.filter(response => 
        response.selected_options.includes(option.id)
      ).length;
      
      const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
      
      return {
        optionId: option.id,
        optionText: option.option_text,
        count,
        percentage: Math.round(percentage * 100) / 100
      };
    });
  }
  
  // ===== UTILITAIRES =====
  
  async getActiveVotes(): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_votes_v2')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des votes actifs:', error);
      throw error;
    }
  }
  
  async getUserVotes(userId: string): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_votes_v2')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des votes utilisateur:', error);
      throw error;
    }
  }
  
  // Validation côté client
  validateVote(vote: Partial<CreateVoteData>): string[] {
    const errors: string[] = [];
    
    if (!vote.title?.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    if (vote.title && vote.title.length > 200) {
      errors.push('Le titre ne peut pas dépasser 200 caractères');
    }
    
    if (vote.description && vote.description.length > 1000) {
      errors.push('La description ne peut pas dépasser 1000 caractères');
    }
    
    if (vote.start_date && vote.end_date && new Date(vote.start_date) >= new Date(vote.end_date)) {
      errors.push('La date de fin doit être après la date de début');
    }
    
    if (vote.type && ['single_choice', 'multiple_choice'].includes(vote.type)) {
      if (!vote.options || vote.options.length < 2) {
        errors.push('Au moins 2 options sont requises pour ce type de vote');
      }
      if (vote.options && vote.options.length > 10) {
        errors.push('Maximum 10 options autorisées');
      }
    }
    
    return errors;
  }
  
  // Vérifier les permissions
  async checkPermissions(userId: string): Promise<{
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }> {
    try {
      const { data: profile } = await supabase
        .from('evscatala_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      const role = profile?.role || 'member';
        
        return {
        canCreate: ['staff', 'admin'].includes(role),
        canEdit: ['staff', 'admin'].includes(role),
        canDelete: role === 'admin'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false
      };
    }
  }
}

export const voteService = new VoteService(); 