
// Define types for the permanence module

export type PermanenceStatus = 'confirmed' | 'pending' | 'canceled';
export type PermanenceType = 'public' | 'internal' | 'maintenance' | 'other';

export interface PermanenceParticipant {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'absent';
}

export interface Permanence {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: PermanenceStatus;
  type: PermanenceType;
  minMembers: number;
  maxMembers: number;
  participants: PermanenceParticipant[];
  notes?: string;
}
