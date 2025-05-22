export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'canceled';
export type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BudgetStatus = 'estimated' | 'approved' | 'spent';

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  joinedAt: Date;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: BudgetStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ProjectCommunication {
  id: string;
  projectId: string;
  title: string;
  description: string;
  mediaUrls?: string[];
  type: 'poster' | 'social' | 'email' | 'press';
  createdAt: Date;
  publishedAt?: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  members: ProjectMember[];
  tasks?: ProjectTask[];
  budgets?: ProjectBudget[];
  documents?: ProjectDocument[];
  communications?: ProjectCommunication[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 