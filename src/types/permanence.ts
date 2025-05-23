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
 * Type de participant pour une permanence
 */
export interface PermanenceParticipant {
  id?: string;
  permanence_id: string;
  user_id: string;
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
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  required_volunteers: number;
  status: PermanenceStatus;
  created_by: string;
  created_at: string;
  updated_at?: string;
  participants?: PermanenceParticipant[];
}
