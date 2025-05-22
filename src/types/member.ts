
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: string;      // admin | staff | member | volunteer
  status: string;    // active | inactive | pending
  groups?: string[];
  projects?: string[];
}
