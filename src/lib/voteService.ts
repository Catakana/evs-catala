import { supabase } from './supabase';
import { Vote, VoteOption, VoteResponse, VoteType, VoteStatus, VoteVisibility, VoteResultVisibility } from '@/types/vote';

// Constantes pour les noms de tables
const VOTES_TABLE = 'evscatala_votes';
const VOTE_OPTIONS_TABLE = 'evscatala_vote_options';
const VOTE_RESPONSES_TABLE = 'evscatala_vote_responses';

/**
 * Service de gestion des votes et sondages
 */
export const voteService = {
  /**
   * Récupérer tous les votes (avec filtrage optionnel)
   * @param status Statut des votes à récupérer
   * @returns Liste des votes
   */
  async getAllVotes(status?: VoteStatus): Promise<Vote[]> {
    let query = supabase
      .from(VOTES_TABLE)
      .select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des votes:', error);
      throw error;
    }
    
    // Récupérer les options pour chaque vote
    const votes = await Promise.all(
      (data || []).map(async (vote) => {
        const options = await this.getVoteOptions(vote.id);
        
        return {
          id: vote.id,
          title: vote.title,
          description: vote.description,
          type: vote.type as VoteType,
          status: vote.status as VoteStatus,
          visibility: vote.visibility as VoteVisibility,
          resultVisibility: vote.result_visibility as VoteResultVisibility,
          options: options,
          startDate: new Date(vote.start_date),
          endDate: new Date(vote.end_date),
          createdBy: vote.created_by,
          createdAt: new Date(vote.created_at),
          updatedAt: new Date(vote.updated_at)
        };
      })
    );
    
    return votes;
  },
  
  /**
   * Récupérer un vote par son ID
   * @param id ID du vote
   * @returns Vote demandé ou null si non trouvé
   */
  async getVoteById(id: string): Promise<Vote | null> {
    const { data, error } = await supabase
      .from(VOTES_TABLE)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erreur lors de la récupération du vote ${id}:`, error);
      return null;
    }
    
    if (!data) return null;
    
    // Récupérer les options du vote
    const options = await this.getVoteOptions(id);
    
    // Récupérer les réponses si pertinent
    const responses = await this.getVoteResponses(id);
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type as VoteType,
      status: data.status as VoteStatus,
      visibility: data.visibility as VoteVisibility,
      resultVisibility: data.result_visibility as VoteResultVisibility,
      options: options,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      responses: responses
    };
  },
  
  /**
   * Récupérer les options d'un vote
   * @param voteId ID du vote
   * @returns Liste des options
   */
  async getVoteOptions(voteId: string): Promise<VoteOption[]> {
    const { data, error } = await supabase
      .from(VOTE_OPTIONS_TABLE)
      .select('*')
      .eq('vote_id', voteId)
      .order('created_at');
      
    if (error) {
      console.error(`Erreur lors de la récupération des options pour le vote ${voteId}:`, error);
      return [];
    }
    
    // Récupérer le nombre de votes pour chaque option
    const options = await Promise.all(
      (data || []).map(async (option) => {
        const { count } = await supabase
          .from(VOTE_RESPONSES_TABLE)
          .select('id', { count: 'exact' })
          .eq('option_id', option.id);
          
        return {
          id: option.id,
          text: option.text,
          count: count || 0
        };
      })
    );
    
    return options;
  },
  
  /**
   * Récupérer les réponses d'un vote
   * @param voteId ID du vote
   * @returns Liste des réponses
   */
  async getVoteResponses(voteId: string): Promise<VoteResponse[]> {
    const { data, error } = await supabase
      .from(VOTE_RESPONSES_TABLE)
      .select('*')
      .eq('vote_id', voteId);
      
    if (error) {
      console.error(`Erreur lors de la récupération des réponses pour le vote ${voteId}:`, error);
      return [];
    }
    
    return (data || []).map(response => ({
      id: response.id,
      userId: response.user_id,
      voteId: response.vote_id,
      optionId: response.option_id,
      createdAt: new Date(response.created_at)
    }));
  },
  
  /**
   * Vérifier si un utilisateur a déjà voté
   * @param voteId ID du vote
   * @param userId ID de l'utilisateur
   * @returns true si l'utilisateur a déjà voté
   */
  async hasUserVoted(voteId: string, userId: string): Promise<boolean> {
    const { count } = await supabase
      .from(VOTE_RESPONSES_TABLE)
      .select('id', { count: 'exact' })
      .eq('vote_id', voteId)
      .eq('user_id', userId);
      
    return count !== null && count > 0;
  },
  
  /**
   * Créer un nouveau vote
   * @param vote Données du vote à créer
   * @returns Le nouveau vote créé
   */
  async createVote(vote: Omit<Vote, 'id' | 'createdAt' | 'updatedAt' | 'responses'>): Promise<Vote> {
    const { data, error } = await supabase
      .from(VOTES_TABLE)
      .insert({
        title: vote.title,
        description: vote.description,
        type: vote.type,
        status: vote.status,
        visibility: vote.visibility,
        result_visibility: vote.resultVisibility,
        start_date: vote.startDate.toISOString(),
        end_date: vote.endDate.toISOString(),
        created_by: vote.createdBy
      })
      .select()
      .single();
      
    if (error) {
      console.error('Erreur lors de la création du vote:', error);
      throw error;
    }
    
    // Créer les options du vote
    const options = await Promise.all(
      vote.options.map(option => 
        this.createVoteOption(data.id, option.text)
      )
    );
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type as VoteType,
      status: data.status as VoteStatus,
      visibility: data.visibility as VoteVisibility,
      resultVisibility: data.result_visibility as VoteResultVisibility,
      options: options,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },
  
  /**
   * Créer une option pour un vote
   * @param voteId ID du vote
   * @param text Texte de l'option
   * @returns L'option créée
   */
  async createVoteOption(voteId: string, text: string): Promise<VoteOption> {
    const { data, error } = await supabase
      .from(VOTE_OPTIONS_TABLE)
      .insert({
        vote_id: voteId,
        text: text
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Erreur lors de la création de l'option pour le vote ${voteId}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      text: data.text,
      count: 0
    };
  },
  
  /**
   * Mettre à jour un vote existant
   * @param id ID du vote à mettre à jour
   * @param vote Nouvelles données du vote
   * @returns Le vote mis à jour
   */
  async updateVote(id: string, vote: Partial<Vote>): Promise<Vote | null> {
    const { data, error } = await supabase
      .from(VOTES_TABLE)
      .update({
        title: vote.title,
        description: vote.description,
        type: vote.type,
        status: vote.status,
        visibility: vote.visibility,
        result_visibility: vote.resultVisibility,
        start_date: vote.startDate?.toISOString(),
        end_date: vote.endDate?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Erreur lors de la mise à jour du vote ${id}:`, error);
      return null;
    }
    
    // Mettre à jour les options si nécessaire
    if (vote.options) {
      // Supprimer les options existantes
      await supabase
        .from(VOTE_OPTIONS_TABLE)
        .delete()
        .eq('vote_id', id);
        
      // Créer les nouvelles options
      const options = await Promise.all(
        vote.options.map(option => 
          this.createVoteOption(id, option.text)
        )
      );
      
      return this.getVoteById(id);
    }
    
    return this.getVoteById(id);
  },
  
  /**
   * Supprimer un vote
   * @param id ID du vote à supprimer
   * @returns true si suppression réussie
   */
  async deleteVote(id: string): Promise<boolean> {
    // Supprimer d'abord les réponses au vote
    await supabase
      .from(VOTE_RESPONSES_TABLE)
      .delete()
      .eq('vote_id', id);
      
    // Supprimer les options du vote
    await supabase
      .from(VOTE_OPTIONS_TABLE)
      .delete()
      .eq('vote_id', id);
      
    // Supprimer le vote
    const { error } = await supabase
      .from(VOTES_TABLE)
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Erreur lors de la suppression du vote ${id}:`, error);
      return false;
    }
    
    return true;
  },
  
  /**
   * Soumettre une réponse à un vote
   * @param voteId ID du vote
   * @param optionId ID de l'option choisie
   * @param userId ID de l'utilisateur
   * @returns La réponse créée ou null en cas d'erreur
   */
  async submitVoteResponse(voteId: string, optionId: string, userId: string): Promise<VoteResponse | null> {
    // Vérifier si l'utilisateur a déjà voté
    const hasVoted = await this.hasUserVoted(voteId, userId);
    
    if (hasVoted) {
      throw new Error('L\'utilisateur a déjà voté');
    }
    
    // Vérifier si le vote est actif
    const vote = await this.getVoteById(voteId);
    
    if (!vote) {
      throw new Error('Vote non trouvé');
    }
    
    if (vote.status !== 'active') {
      throw new Error('Le vote n\'est pas actif');
    }
    
    const now = new Date();
    if (now < vote.startDate || now > vote.endDate) {
      throw new Error('Le vote n\'est pas dans sa période active');
    }
    
    // Soumettre la réponse
    const { data, error } = await supabase
      .from(VOTE_RESPONSES_TABLE)
      .insert({
        vote_id: voteId,
        option_id: optionId,
        user_id: userId
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Erreur lors de la soumission de la réponse au vote ${voteId}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      voteId: data.vote_id,
      optionId: data.option_id,
      createdAt: new Date(data.created_at)
    };
  },
  
  /**
   * Mettre à jour le statut d'un vote
   * @param id ID du vote
   * @param status Nouveau statut
   * @returns true si mise à jour réussie
   */
  async updateVoteStatus(id: string, status: VoteStatus): Promise<boolean> {
    const { error } = await supabase
      .from(VOTES_TABLE)
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      console.error(`Erreur lors de la mise à jour du statut du vote ${id}:`, error);
      return false;
    }
    
    return true;
  },
  
  /**
   * Récupérer les votes créés par un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Liste des votes
   */
  async getVotesByUser(userId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from(VOTES_TABLE)
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Erreur lors de la récupération des votes de l'utilisateur ${userId}:`, error);
      return [];
    }
    
    // Récupérer les options pour chaque vote
    const votes = await Promise.all(
      (data || []).map(async (vote) => {
        const options = await this.getVoteOptions(vote.id);
        
        return {
          id: vote.id,
          title: vote.title,
          description: vote.description,
          type: vote.type as VoteType,
          status: vote.status as VoteStatus,
          visibility: vote.visibility as VoteVisibility,
          resultVisibility: vote.result_visibility as VoteResultVisibility,
          options: options,
          startDate: new Date(vote.start_date),
          endDate: new Date(vote.end_date),
          createdBy: vote.created_by,
          createdAt: new Date(vote.created_at),
          updatedAt: new Date(vote.updated_at)
        };
      })
    );
    
    return votes;
  },
  
  /**
   * Récupérer les votes actifs
   * @returns Liste des votes actifs
   */
  async getActiveVotes(): Promise<Vote[]> {
    return this.getAllVotes('active');
  }
};

