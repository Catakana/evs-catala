/**
 * Statuts possibles pour une permanence
 */
export enum PermanenceStatus {
  OPEN = 'open',
  FULL = 'full',
  CANCELED = 'canceled',
  COMPLETED = 'completed'
}

/**
 * Types possibles pour le statut d'un participant
 */
export enum ParticipantStatus {
  REGISTERED = 'registered',
  PRESENT = 'present',
  ABSENT = 'absent'
}

/**
 * Type de participant pour une permanence
 */
export interface PermanenceParticipant {
  id?: string;
  permanence_id: string;
  user_id: string;
  status?: ParticipantStatus | string;
  checked_by?: string;
  check_time?: string;
  user?: {
    id: string;
    firstname: string;
    lastname: string;
    avatar_url?: string;
  };
  created_at?: string;
}

/**
 * Structure d'une permanence
 */
export interface Permanence {
  id: string;
  title: string;
  description?: string;
  
  // Champs pour le formulaire et la compatibilité
  date?: string;
  start_time?: string;
  end_time?: string;
  
  // Nouveaux champs correspondant à la base de données
  start_date: string;
  end_date: string;
  
  location: string;
  required_volunteers: number;
  max_volunteers?: number;
  min_volunteers?: number;
  status: PermanenceStatus;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  participants?: PermanenceParticipant[];
}
