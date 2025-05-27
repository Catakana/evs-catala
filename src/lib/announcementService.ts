/**
 * Service de gestion des annonces
 * Gère les opérations CRUD et les fonctionnalités avancées des annonces
 */

import { supabase } from './supabase';
import type { Announcement, AnnouncementCategory } from '../types/announcement';

export interface CreateAnnouncementData {
  title: string;
  content: string;
  category: AnnouncementCategory;
  targetRoles?: string[];
  targetGroups?: string[];
  publishDate?: Date;
  expireDate?: Date;
  isPinned?: boolean;
  priority?: number;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  category?: AnnouncementCategory;
  targetRoles?: string[];
  targetGroups?: string[];
  publishDate?: Date;
  expireDate?: Date;
  isPinned?: boolean;
  priority?: number;
  isArchived?: boolean;
}

export interface AnnouncementFilters {
  category?: AnnouncementCategory;
  searchTerm?: string;
  includeArchived?: boolean;
  authorId?: string;
}

export interface AnnouncementAttachment {
  id: string;
  announcementId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: Date;
}

class AnnouncementService {
  /**
   * Récupère toutes les annonces avec filtres
   */
  async getAnnouncements(filters: AnnouncementFilters = {}): Promise<Announcement[]> {
    try {
      console.log('📢 Récupération des annonces avec filtres:', filters);

      // Utiliser directement la requête simple (pas de RPC pour éviter l'erreur 400)
      const { data, error } = await supabase
        .from('evscatala_announcements')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des annonces:', error);
        throw error;
      }

      if (!data) {
        console.log('Aucune annonce trouvée');
        return [];
      }

      // Transformer les données pour correspondre au type Announcement
      let announcements: Announcement[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        authorId: item.author_id,
        authorName: 'Utilisateur', // Nom par défaut
        targetRoles: item.target_roles || ['member'],
        targetGroups: item.target_groups || [],
        publishDate: new Date(item.publish_date),
        expireDate: item.expire_date ? new Date(item.expire_date) : undefined,
        isArchived: item.is_archived || false,
        isPinned: item.is_pinned || false,
        priority: item.priority || 0,
        attachmentsCount: 0, // Par défaut
        createdAt: new Date(item.created_at)
      }));

      // Appliquer les filtres côté client
      announcements = this.applyFilters(announcements, filters);

      console.log(`✅ ${announcements.length} annonces récupérées`);
      return announcements;

    } catch (error) {
      console.error('Erreur dans getAnnouncements:', error);
      throw new Error('Impossible de récupérer les annonces');
    }
  }

  /**
   * Récupère une annonce par son ID
   */
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    try {
      console.log('📢 Récupération de l\'annonce:', id);

      const { data, error } = await supabase
        .from('evscatala_announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Annonce non trouvée:', id);
          return null;
        }
        console.error('Erreur lors de la récupération de l\'annonce:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      const announcement: Announcement = {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        authorId: data.author_id,
        authorName: 'Utilisateur',
        targetRoles: data.target_roles || ['member'],
        targetGroups: data.target_groups || [],
        publishDate: new Date(data.publish_date),
        expireDate: data.expire_date ? new Date(data.expire_date) : undefined,
        isArchived: data.is_archived || false,
        isPinned: data.is_pinned || false,
        priority: data.priority || 0,
        attachments: [],
        createdAt: new Date(data.created_at)
      };

      console.log('✅ Annonce récupérée:', announcement.title);
      return announcement;

    } catch (error) {
      console.error('Erreur dans getAnnouncementById:', error);
      throw new Error('Impossible de récupérer l\'annonce');
    }
  }

  /**
   * Crée une nouvelle annonce
   */
  async createAnnouncement(announcementData: CreateAnnouncementData): Promise<Announcement> {
    try {
      console.log('📢 Création d\'une nouvelle annonce:', announcementData.title);

      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('evscatala_announcements')
        .insert({
          title: announcementData.title,
          content: announcementData.content,
          category: announcementData.category,
          author_id: user.id,
          target_roles: announcementData.targetRoles || ['member'],
          target_groups: announcementData.targetGroups || [],
          publish_date: announcementData.publishDate || new Date(),
          expire_date: announcementData.expireDate,
          is_pinned: announcementData.isPinned || false,
          priority: announcementData.priority || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'annonce:', error);
        throw error;
      }

      console.log('✅ Annonce créée avec succès:', data.id);

      // Récupérer l'annonce complète avec les informations de l'auteur
      const createdAnnouncement = await this.getAnnouncementById(data.id);
      if (!createdAnnouncement) {
        throw new Error('Impossible de récupérer l\'annonce créée');
      }

      return createdAnnouncement;

    } catch (error) {
      console.error('Erreur dans createAnnouncement:', error);
      throw new Error('Impossible de créer l\'annonce');
    }
  }

  /**
   * Met à jour une annonce
   */
  async updateAnnouncement(id: string, updates: UpdateAnnouncementData): Promise<Announcement> {
    try {
      console.log('📢 Mise à jour de l\'annonce:', id);

      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.targetRoles !== undefined) updateData.target_roles = updates.targetRoles;
      if (updates.targetGroups !== undefined) updateData.target_groups = updates.targetGroups;
      if (updates.publishDate !== undefined) updateData.publish_date = updates.publishDate;
      if (updates.expireDate !== undefined) updateData.expire_date = updates.expireDate;
      if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;

      const { data, error } = await supabase
        .from('evscatala_announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'annonce:', error);
        throw error;
      }

      console.log('✅ Annonce mise à jour avec succès');

      // Récupérer l'annonce complète mise à jour
      const updatedAnnouncement = await this.getAnnouncementById(id);
      if (!updatedAnnouncement) {
        throw new Error('Impossible de récupérer l\'annonce mise à jour');
      }

      return updatedAnnouncement;

    } catch (error) {
      console.error('Erreur dans updateAnnouncement:', error);
      throw new Error('Impossible de mettre à jour l\'annonce');
    }
  }

  /**
   * Supprime une annonce
   */
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      console.log('📢 Suppression de l\'annonce:', id);

      const { error } = await supabase
        .from('evscatala_announcements')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'annonce:', error);
        throw error;
      }

      console.log('✅ Annonce supprimée avec succès');

    } catch (error) {
      console.error('Erreur dans deleteAnnouncement:', error);
      throw new Error('Impossible de supprimer l\'annonce');
    }
  }

  /**
   * Archive une annonce
   */
  async archiveAnnouncement(id: string): Promise<void> {
    try {
      await this.updateAnnouncement(id, { isArchived: true });
      console.log('✅ Annonce archivée avec succès');
    } catch (error) {
      console.error('Erreur dans archiveAnnouncement:', error);
      throw new Error('Impossible d\'archiver l\'annonce');
    }
  }

  /**
   * Marque une annonce comme lue
   */
  async markAsRead(announcementId: string): Promise<void> {
    try {
      console.log('📢 Marquage de l\'annonce comme lue:', announcementId);
      // Pour l'instant, on simule le marquage comme lu
      console.log('✅ Annonce marquée comme lue (simulé)');
    } catch (error) {
      console.error('Erreur dans markAsRead:', error);
      throw new Error('Impossible de marquer l\'annonce comme lue');
    }
  }

  /**
   * Récupère les statuts de lecture de l'utilisateur
   */
  async getUserReadStatus(): Promise<Record<string, Date>> {
    try {
      console.log('📢 Récupération des statuts de lecture');
      // Pour l'instant, on retourne un objet vide
      return {};
    } catch (error) {
      console.error('Erreur dans getUserReadStatus:', error);
      throw new Error('Impossible de récupérer les statuts de lecture');
    }
  }

  /**
   * Récupère les pièces jointes d'une annonce
   */
  async getAnnouncementAttachments(announcementId: string): Promise<AnnouncementAttachment[]> {
    try {
      console.log('📎 Récupération des pièces jointes pour l\'annonce:', announcementId);
      // Pour l'instant, on retourne un tableau vide
      return [];
    } catch (error) {
      console.error('Erreur dans getAnnouncementAttachments:', error);
      throw new Error('Impossible de récupérer les pièces jointes');
    }
  }

  /**
   * Ajoute une pièce jointe à une annonce
   */
  async addAttachment(
    announcementId: string, 
    file: File
  ): Promise<AnnouncementAttachment> {
    try {
      console.log('📎 Ajout d\'une pièce jointe:', file.name);
      throw new Error('Fonctionnalité des pièces jointes non encore implémentée');
    } catch (error) {
      console.error('Erreur dans addAttachment:', error);
      throw new Error('Impossible d\'ajouter la pièce jointe');
    }
  }

  /**
   * Supprime une pièce jointe
   */
  async removeAttachment(attachmentId: string): Promise<void> {
    try {
      console.log('📎 Suppression de la pièce jointe:', attachmentId);
      throw new Error('Fonctionnalité des pièces jointes non encore implémentée');
    } catch (error) {
      console.error('Erreur dans removeAttachment:', error);
      throw new Error('Impossible de supprimer la pièce jointe');
    }
  }

  /**
   * Applique les filtres aux annonces
   */
  private applyFilters(announcements: Announcement[], filters: AnnouncementFilters): Announcement[] {
    let filtered = announcements;

    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.content.toLowerCase().includes(searchLower)
      );
    }

    if (filters.authorId) {
      filtered = filtered.filter(a => a.authorId === filters.authorId);
    }

    if (!filters.includeArchived) {
      filtered = filtered.filter(a => !a.isArchived);
    }

    return filtered;
  }
}

// Instance unique du service
export const announcementService = new AnnouncementService(); 