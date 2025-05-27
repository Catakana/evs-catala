/**
 * Hooks personnalisés pour la gestion des annonces
 * Version simplifiée et robuste pour éviter les boucles infinies
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { announcementService, type CreateAnnouncementData, type UpdateAnnouncementData, type AnnouncementFilters } from '../lib/announcementService';
import type { Announcement, AnnouncementCategory } from '../types/announcement';

/**
 * Hook principal pour récupérer et gérer les annonces
 */
export function useAnnouncements(filters: AnnouncementFilters = {}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mémoriser les filtres pour éviter les re-renders inutiles
  const memoizedFilters = useMemo(() => filters, [
    filters.searchTerm,
    filters.includeArchived,
    filters.category,
    filters.authorId
  ]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await announcementService.getAnnouncements(memoizedFilters);
      setAnnouncements(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des annonces';
      setError(message);
      console.error('❌ Erreur dans useAnnouncements:', err);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const reload = useCallback(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    loading,
    error,
    reload
  };
}

/**
 * Hook pour récupérer une annonce spécifique
 */
export function useAnnouncement(id: string | null) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAnnouncement(null);
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await announcementService.getAnnouncementById(id);
        setAnnouncement(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'annonce';
        setError(message);
        console.error('Erreur dans useAnnouncement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const reload = useCallback(() => {
    if (id) {
      // Re-trigger useEffect
      setLoading(true);
    }
  }, [id]);

  return {
    announcement,
    loading,
    error,
    reload
  };
}

/**
 * Hook pour les actions sur les annonces (création, modification, suppression)
 */
export function useAnnouncementActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnnouncement = useCallback(async (data: CreateAnnouncementData): Promise<Announcement | null> => {
    try {
      setLoading(true);
      setError(null);
      const announcement = await announcementService.createAnnouncement(data);
      return announcement;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de l\'annonce';
      setError(message);
      console.error('Erreur dans createAnnouncement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, updates: UpdateAnnouncementData): Promise<Announcement | null> => {
    try {
      setLoading(true);
      setError(null);
      const announcement = await announcementService.updateAnnouncement(id, updates);
      return announcement;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'annonce';
      setError(message);
      console.error('Erreur dans updateAnnouncement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await announcementService.deleteAnnouncement(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'annonce';
      setError(message);
      console.error('Erreur dans deleteAnnouncement:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveAnnouncement = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await announcementService.archiveAnnouncement(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'archivage de l\'annonce';
      setError(message);
      console.error('Erreur dans archiveAnnouncement:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      await announcementService.markAsRead(id);
      return true;
    } catch (err) {
      console.error('Erreur dans markAsRead:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    archiveAnnouncement,
    markAsRead
  };
}

/**
 * Hook pour gérer les statuts de lecture des annonces
 */
export function useAnnouncementReadStatus() {
  const [readStatus, setReadStatus] = useState<Record<string, Date>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const status = await announcementService.getUserReadStatus();
        setReadStatus(status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement des statuts de lecture';
        setError(message);
        console.error('Erreur dans useAnnouncementReadStatus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReadStatus();
  }, []);

  const isRead = useCallback((announcementId: string): boolean => {
    return announcementId in readStatus;
  }, [readStatus]);

  const markAsRead = useCallback(async (announcementId: string): Promise<void> => {
    try {
      await announcementService.markAsRead(announcementId);
      setReadStatus(prev => ({
        ...prev,
        [announcementId]: new Date()
      }));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    // Re-trigger useEffect
  }, []);

  return {
    readStatus,
    loading,
    error,
    isRead,
    markAsRead,
    reload
  };
}

/**
 * Hook pour gérer les filtres et la recherche
 */
export function useAnnouncementFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AnnouncementCategory[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);

  const toggleCategory = useCallback((category: AnnouncementCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategories([]);
    setIncludeArchived(false);
  }, []);

  const filters: AnnouncementFilters = useMemo(() => ({
    searchTerm: searchTerm || undefined,
    includeArchived,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined
  }), [searchTerm, includeArchived, selectedCategories]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    includeArchived,
    setIncludeArchived,
    clearFilters,
    filters
  };
}

/**
 * Hook pour gérer les permissions des annonces
 */
export function useAnnouncementPermissions() {
  // TODO: Intégrer avec le système d'authentification pour récupérer le rôle de l'utilisateur
  // Pour l'instant, on donne les permissions de staff à tous les utilisateurs pour les tests
  const [userRole] = useState<'member' | 'staff' | 'admin'>('staff');

  const canCreate = true; // Temporairement activé pour tous
  const canEdit = userRole === 'staff' || userRole === 'admin';
  const canDelete = userRole === 'admin';
  const canArchive = userRole === 'staff' || userRole === 'admin';
  const canPin = userRole === 'admin';

  const canEditAnnouncement = useCallback((announcement: Announcement, currentUserId?: string): boolean => {
    // Temporairement, on permet l'édition à tous
    return true;
  }, [userRole]);

  const canDeleteAnnouncement = useCallback((announcement: Announcement, currentUserId?: string): boolean => {
    // Temporairement, on permet la suppression à tous
    return true;
  }, [userRole]);

  return {
    userRole,
    canCreate,
    canEdit,
    canDelete,
    canArchive,
    canPin,
    canEditAnnouncement,
    canDeleteAnnouncement
  };
} 