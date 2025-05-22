export type VoteType = 'binary' | 'multiple' | 'survey';
export type VoteStatus = 'draft' | 'active' | 'closed';
export type VoteVisibility = 'public' | 'private' | 'anonymous';
export type VoteResultVisibility = 'immediate' | 'afterVote' | 'afterClose';

export interface VoteOption {
  id: string;
  text: string;
  count?: number; // Nombre de votes (peut être null si les résultats ne sont pas visibles)
}

export interface VoteResponse {
  id: string;
  userId: string;
  voteId: string;
  optionId: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  type: VoteType;
  status: VoteStatus;
  visibility: VoteVisibility;
  resultVisibility: VoteResultVisibility;
  options: VoteOption[];
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  responses?: VoteResponse[]; // Optionnel selon les permissions
} 