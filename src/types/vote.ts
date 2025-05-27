// Types pour le module Votes v2
// Architecture simplifiée pour éviter les problèmes de l'ancienne version

export interface Vote {
  id: string;
  title: string;
  description?: string;
  type: 'yes_no' | 'single_choice' | 'multiple_choice';
  status: 'draft' | 'active' | 'closed' | 'archived';
  start_date: string;
  end_date: string;
  show_results_mode: 'immediate' | 'after_vote' | 'after_close';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VoteOption {
  id: string;
  vote_id: string;
  option_text: string;
  display_order: number;
  created_at: string;
}

export interface VoteResponse {
  id: string;
  vote_id: string;
  user_id: string;
  selected_options: string[]; // Array des IDs d'options sélectionnées
  created_at: string;
  updated_at: string;
}

// Types pour les formulaires
export interface CreateVoteData {
  title: string;
  description?: string;
  type: Vote['type'];
  start_date: string;
  end_date: string;
  show_results_mode: Vote['show_results_mode'];
  options?: string[]; // Pour les votes à choix multiples
}

// Types pour les résultats
export interface VoteResult {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}

// Type pour les données complètes d'un vote
export interface VoteWithDetails {
  vote: Vote;
  options: VoteOption[];
  responses: VoteResponse[];
  userResponse?: VoteResponse;
  results?: VoteResult[];
}

// Types pour les états de l'interface
export interface VoteState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Types pour les permissions
export interface VotePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canVote: boolean;
  canViewResults: boolean;
}

// Types pour les filtres
export interface VoteFilters {
  status?: Vote['status'];
  type?: Vote['type'];
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Types pour les statistiques
export interface VoteStats {
  totalVotes: number;
  activeVotes: number;
  totalParticipants: number;
  participationRate: number;
} 