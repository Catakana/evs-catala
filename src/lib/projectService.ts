import { supabase } from './supabase';
import { 
  Project, 
  ProjectStatus, 
  ProjectMember, 
  ProjectTask, 
  ProjectBudget, 
  ProjectDocument, 
  ProjectCommunication,
  TaskStatus,
  TaskPriority,
  BudgetStatus
} from '@/types/project';

// Interface pour les données brutes de projet dans la base de données
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  location?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les données brutes des membres du projet
export interface ProjectMemberData {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  joined_at: string;
}

// Interface pour les données brutes des tâches
export interface ProjectTaskData {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les données brutes des budgets
export interface ProjectBudgetData {
  id: string;
  project_id: string;
  title: string;
  amount: number;
  status: BudgetStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour les données brutes des documents
export interface ProjectDocumentData {
  id: string;
  project_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

// Interface pour les données brutes des communications
export interface ProjectCommunicationData {
  id: string;
  project_id: string;
  title: string;
  description: string;
  media_urls?: string[];
  type: 'poster' | 'social' | 'email' | 'press';
  created_at: string;
  published_at?: string;
}

// Interface pour le formulaire de création/modification de projet
export interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
}

// Service pour les projets
export const projectService = {
  // Récupérer tous les projets
  async getProjects() {
    const { data, error } = await supabase
      .from('evscatala_projects')
      .select('*');

    if (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw error;
    }

    return this.convertToProjectPartials(data || []);
  },

  // Récupérer un projet par ID avec tous ses détails
  async getProjectById(id: string) {
    // Récupérer les données du projet
    const { data: projectData, error: projectError } = await supabase
      .from('evscatala_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, projectError);
      throw projectError;
    }

    // Récupérer les membres du projet
    const { data: membersData, error: membersError } = await supabase
      .from('evscatala_project_members')
      .select('*')
      .eq('project_id', id);

    if (membersError) {
      console.error(`Erreur lors de la récupération des membres du projet ${id}:`, membersError);
      throw membersError;
    }

    // Récupérer les tâches du projet
    const { data: tasksData, error: tasksError } = await supabase
      .from('evscatala_project_tasks')
      .select('*')
      .eq('project_id', id);

    if (tasksError) {
      console.error(`Erreur lors de la récupération des tâches du projet ${id}:`, tasksError);
      throw tasksError;
    }

    // Récupérer les budgets du projet
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('evscatala_project_budgets')
      .select('*')
      .eq('project_id', id);

    if (budgetsError) {
      console.error(`Erreur lors de la récupération des budgets du projet ${id}:`, budgetsError);
      throw budgetsError;
    }

    // Récupérer les documents du projet
    const { data: documentsData, error: documentsError } = await supabase
      .from('evscatala_project_documents')
      .select('*')
      .eq('project_id', id);

    if (documentsError) {
      console.error(`Erreur lors de la récupération des documents du projet ${id}:`, documentsError);
      throw documentsError;
    }

    // Récupérer les communications du projet
    const { data: communicationsData, error: communicationsError } = await supabase
      .from('evscatala_project_communications')
      .select('*')
      .eq('project_id', id);

    if (communicationsError) {
      console.error(`Erreur lors de la récupération des communications du projet ${id}:`, communicationsError);
      throw communicationsError;
    }

    // Convertir les données en objets typés
    const members = this.convertToProjectMembers(membersData || []);
    const tasks = this.convertToProjectTasks(tasksData || []);
    const budgets = this.convertToProjectBudgets(budgetsData || []);
    const documents = this.convertToProjectDocuments(documentsData || []);
    const communications = this.convertToProjectCommunications(communicationsData || []);

    // Assembler le projet complet
    return this.convertToProject({
      ...projectData,
      members,
      tasks,
      budgets,
      documents,
      communications
    });
  },

  // Créer un nouveau projet
  async createProject(formData: ProjectFormData, userId: string) {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('evscatala_projects')
      .insert({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        location: formData.location || null,
        created_by: userId,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }

    // Ajouter automatiquement le créateur comme membre du projet
    await this.addProjectMember(data.id, userId, 'admin');

    return this.convertToProject({
      ...data,
      members: [{
        id: '', // sera généré par Supabase
        userId,
        projectId: data.id,
        role: 'admin',
        joinedAt: new Date(now)
      }],
      tasks: [],
      budgets: [],
      documents: [],
      communications: []
    });
  },

  // Mettre à jour un projet
  async updateProject(id: string, formData: ProjectFormData) {
    const { data, error } = await supabase
      .from('evscatala_projects')
      .update({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        location: formData.location || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
      throw error;
    }

    return this.convertToProjectPartial(data);
  },

  // Supprimer un projet
  async deleteProject(id: string) {
    // Supprimer d'abord toutes les entités liées
    await Promise.all([
      supabase.from('evscatala_project_members').delete().eq('project_id', id),
      supabase.from('evscatala_project_tasks').delete().eq('project_id', id),
      supabase.from('evscatala_project_budgets').delete().eq('project_id', id),
      supabase.from('evscatala_project_documents').delete().eq('project_id', id),
      supabase.from('evscatala_project_communications').delete().eq('project_id', id)
    ]);

    // Supprimer le projet lui-même
    const { error } = await supabase
      .from('evscatala_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du projet ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === Gestion des membres du projet ===

  // Ajouter un membre à un projet
  async addProjectMember(projectId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from('evscatala_project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout du membre au projet ${projectId}:`, error);
      throw error;
    }

    return this.convertToProjectMember(data);
  },

  // Modifier le rôle d'un membre
  async updateProjectMemberRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('evscatala_project_members')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du rôle du membre ${id}:`, error);
      throw error;
    }

    return this.convertToProjectMember(data);
  },

  // Supprimer un membre d'un projet
  async removeProjectMember(id: string) {
    const { error } = await supabase
      .from('evscatala_project_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du membre ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === Gestion des tâches du projet ===

  // Ajouter une tâche
  async addProjectTask(projectId: string, task: Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('evscatala_project_tasks')
      .insert({
        project_id: projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assignedTo || null,
        due_date: task.dueDate ? task.dueDate.toISOString() : null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout de la tâche au projet ${projectId}:`, error);
      throw error;
    }

    return this.convertToProjectTask(data);
  },

  // Mettre à jour une tâche
  async updateProjectTask(id: string, taskUpdate: Partial<ProjectTask>) {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (taskUpdate.title !== undefined) updateData.title = taskUpdate.title;
    if (taskUpdate.description !== undefined) updateData.description = taskUpdate.description;
    if (taskUpdate.status !== undefined) updateData.status = taskUpdate.status;
    if (taskUpdate.priority !== undefined) updateData.priority = taskUpdate.priority;
    if (taskUpdate.assignedTo !== undefined) updateData.assigned_to = taskUpdate.assignedTo || null;
    if (taskUpdate.dueDate !== undefined) updateData.due_date = taskUpdate.dueDate ? taskUpdate.dueDate.toISOString() : null;

    const { data, error } = await supabase
      .from('evscatala_project_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
      throw error;
    }

    return this.convertToProjectTask(data);
  },

  // Supprimer une tâche
  async deleteProjectTask(id: string) {
    const { error } = await supabase
      .from('evscatala_project_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === Gestion des budgets du projet ===

  // Ajouter un budget
  async addProjectBudget(projectId: string, budget: Omit<ProjectBudget, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('evscatala_project_budgets')
      .insert({
        project_id: projectId,
        title: budget.title,
        amount: budget.amount,
        status: budget.status,
        description: budget.description || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout du budget au projet ${projectId}:`, error);
      throw error;
    }

    return this.convertToProjectBudget(data);
  },

  // Mettre à jour un budget
  async updateProjectBudget(id: string, budgetUpdate: Partial<ProjectBudget>) {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (budgetUpdate.title !== undefined) updateData.title = budgetUpdate.title;
    if (budgetUpdate.amount !== undefined) updateData.amount = budgetUpdate.amount;
    if (budgetUpdate.status !== undefined) updateData.status = budgetUpdate.status;
    if (budgetUpdate.description !== undefined) updateData.description = budgetUpdate.description || null;

    const { data, error } = await supabase
      .from('evscatala_project_budgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du budget ${id}:`, error);
      throw error;
    }

    return this.convertToProjectBudget(data);
  },

  // Supprimer un budget
  async deleteProjectBudget(id: string) {
    const { error } = await supabase
      .from('evscatala_project_budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du budget ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === Gestion des documents du projet ===

  // Ajouter un document
  async addProjectDocument(projectId: string, document: Omit<ProjectDocument, 'id' | 'projectId' | 'uploadedAt'>, file: File) {
    // 1. Uploader le fichier sur Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `projects/${projectId}/${fileName}`;
    
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('documents')
      .upload(filePath, file);

    if (fileError) {
      console.error(`Erreur lors de l'upload du fichier pour le projet ${projectId}:`, fileError);
      throw fileError;
    }

    // 2. Obtenir l'URL publique du fichier
    const { data: urlData } = await supabase
      .storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // 3. Enregistrer les métadonnées du document dans la base de données
    const { data, error } = await supabase
      .from('evscatala_project_documents')
      .insert({
        project_id: projectId,
        title: document.title,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: document.uploadedBy,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout du document au projet ${projectId}:`, error);
      throw error;
    }

    return this.convertToProjectDocument(data);
  },

  // Supprimer un document
  async deleteProjectDocument(id: string, fileUrl: string) {
    // 1. Supprimer le fichier du stockage
    const filePath = fileUrl.split('/').pop() || '';
    
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error(`Avertissement: Impossible de supprimer le fichier ${filePath}:`, storageError);
      // Continuer même si la suppression du fichier échoue
    }

    // 2. Supprimer l'entrée de la base de données
    const { error } = await supabase
      .from('evscatala_project_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du document ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === Gestion des communications du projet ===

  // Ajouter une communication
  async addProjectCommunication(
    projectId: string, 
    communication: Omit<ProjectCommunication, 'id' | 'projectId' | 'createdAt' | 'publishedAt'>,
    files?: File[]
  ) {
    let mediaUrls: string[] = [];

    // 1. Uploader les fichiers médias si fournis
    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `projects/${projectId}/media/${fileName}`;
        
        const { data: fileData, error: fileError } = await supabase
          .storage
          .from('media')
          .upload(filePath, file);

        if (fileError) {
          console.error(`Erreur lors de l'upload du média pour le projet ${projectId}:`, fileError);
          throw fileError;
        }

        const { data: urlData } = await supabase
          .storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrls.push(urlData.publicUrl);
      }
    }

    // 2. Enregistrer la communication dans la base de données
    const { data, error } = await supabase
      .from('evscatala_project_communications')
      .insert({
        project_id: projectId,
        title: communication.title,
        description: communication.description,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        type: communication.type,
        created_at: new Date().toISOString(),
        published_at: null // Sera mis à jour lors de la publication
      })
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de l'ajout de la communication au projet ${projectId}:`, error);
      throw error;
    }

    return this.convertToProjectCommunication(data);
  },

  // Publier une communication
  async publishProjectCommunication(id: string) {
    const { data, error } = await supabase
      .from('evscatala_project_communications')
      .update({
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la publication de la communication ${id}:`, error);
      throw error;
    }

    return this.convertToProjectCommunication(data);
  },

  // Mettre à jour une communication
  async updateProjectCommunication(id: string, communicationUpdate: Partial<ProjectCommunication>) {
    const updateData: any = {};

    if (communicationUpdate.title !== undefined) updateData.title = communicationUpdate.title;
    if (communicationUpdate.description !== undefined) updateData.description = communicationUpdate.description;
    if (communicationUpdate.type !== undefined) updateData.type = communicationUpdate.type;
    if (communicationUpdate.mediaUrls !== undefined) updateData.media_urls = communicationUpdate.mediaUrls;

    const { data, error } = await supabase
      .from('evscatala_project_communications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour de la communication ${id}:`, error);
      throw error;
    }

    return this.convertToProjectCommunication(data);
  },

  // Supprimer une communication
  async deleteProjectCommunication(id: string) {
    const { error } = await supabase
      .from('evscatala_project_communications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de la communication ${id}:`, error);
      throw error;
    }

    return true;
  },

  // === Fonctions de conversion de données ===

  // Convertir les données brutes en objets Project
  convertToProject(data: any): Project {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      location: data.location,
      members: data.members || [],
      tasks: data.tasks || [],
      budgets: data.budgets || [],
      documents: data.documents || [],
      communications: data.communications || [],
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Version partielle d'un projet (sans les détails complets)
  convertToProjectPartial(data: ProjectData): Project {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      startDate: data.start_date ? new Date(data.start_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      location: data.location,
      members: [],
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Convertir plusieurs projets
  convertToProjectPartials(data: ProjectData[]): Project[] {
    return data.map(item => this.convertToProjectPartial(item));
  },

  // Convertir un membre de projet
  convertToProjectMember(data: ProjectMemberData): ProjectMember {
    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      role: data.role,
      joinedAt: new Date(data.joined_at)
    };
  },

  // Convertir plusieurs membres
  convertToProjectMembers(data: ProjectMemberData[]): ProjectMember[] {
    return data.map(item => this.convertToProjectMember(item));
  },

  // Convertir une tâche
  convertToProjectTask(data: ProjectTaskData): ProjectTask {
    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assigned_to,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Convertir plusieurs tâches
  convertToProjectTasks(data: ProjectTaskData[]): ProjectTask[] {
    return data.map(item => this.convertToProjectTask(item));
  },

  // Convertir un budget
  convertToProjectBudget(data: ProjectBudgetData): ProjectBudget {
    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      amount: data.amount,
      status: data.status,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Convertir plusieurs budgets
  convertToProjectBudgets(data: ProjectBudgetData[]): ProjectBudget[] {
    return data.map(item => this.convertToProjectBudget(item));
  },

  // Convertir un document
  convertToProjectDocument(data: ProjectDocumentData): ProjectDocument {
    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      fileUrl: data.file_url,
      fileType: data.file_type,
      fileSize: data.file_size,
      uploadedBy: data.uploaded_by,
      uploadedAt: new Date(data.uploaded_at)
    };
  },

  // Convertir plusieurs documents
  convertToProjectDocuments(data: ProjectDocumentData[]): ProjectDocument[] {
    return data.map(item => this.convertToProjectDocument(item));
  },

  // Convertir une communication
  convertToProjectCommunication(data: ProjectCommunicationData): ProjectCommunication {
    return {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      description: data.description,
      mediaUrls: data.media_urls,
      type: data.type,
      createdAt: new Date(data.created_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined
    };
  },

  // Convertir plusieurs communications
  convertToProjectCommunications(data: ProjectCommunicationData[]): ProjectCommunication[] {
    return data.map(item => this.convertToProjectCommunication(item));
  },

  // Convertir un projet en données de formulaire
  convertToFormData(project: Project): ProjectFormData {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      startDate: project.startDate?.toISOString().split('T')[0],
      endDate: project.endDate?.toISOString().split('T')[0],
      location: project.location
    };
  }
}; 