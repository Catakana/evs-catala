import { supabase } from './supabase';
import { Permanence, PermanenceStatus } from '@/types/permanence';

/**
 * Service pour la gestion des permanences
 */
export const permanenceService = {
  /**
   * Récupérer toutes les permanences
   * @returns Liste des permanences
   */
  async getAllPermanences(): Promise<Permanence[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Permanence[];
    } catch (error) {
      console.error('Erreur lors de la récupération des permanences:', error);
      return [];
    }
  },

  /**
   * Récupérer les permanences pour une période donnée
   * @param startDate Date de début (format YYYY-MM-DD)
   * @param endDate Date de fin (format YYYY-MM-DD)
   * @returns Liste des permanences dans la période
   */
  async getPermanencesByPeriod(startDate: string, endDate: string): Promise<Permanence[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .select(`
          *,
          volunteers:evscatala_permanence_volunteers(
            user_id,
            user:evscatala_profiles(id, firstname, lastname, avatar_url)
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as unknown as Permanence[];
    } catch (error) {
      console.error('Erreur lors de la récupération des permanences par période:', error);
      return [];
    }
  },

  /**
   * Créer une nouvelle permanence
   * @param permanence Données de la permanence
   * @returns La permanence créée
   */
  async createPermanence(permanence: Omit<Permanence, 'id'>): Promise<Permanence | null> {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .insert([permanence])
        .select()
        .single();

      if (error) throw error;
      return data as Permanence;
    } catch (error) {
      console.error('Erreur lors de la création de la permanence:', error);
      return null;
    }
  },

  /**
   * Mettre à jour une permanence
   * @param id ID de la permanence
   * @param updates Modifications à appliquer
   * @returns La permanence mise à jour
   */
  async updatePermanence(id: string, updates: Partial<Permanence>): Promise<Permanence | null> {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Permanence;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la permanence:', error);
      return null;
    }
  },

  /**
   * Supprimer une permanence
   * @param id ID de la permanence
   * @returns true si la suppression a réussi, false sinon
   */
  async deletePermanence(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evscatala_permanences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la permanence:', error);
      return false;
    }
  },

  /**
   * S'inscrire à une permanence
   * @param permanenceId ID de la permanence
   * @param userId ID de l'utilisateur
   * @returns true si l'inscription a réussi, false sinon
   */
  async registerForPermanence(permanenceId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evscatala_permanence_volunteers')
        .insert([
          { permanence_id: permanenceId, user_id: userId }
        ]);

      if (error) throw error;

      // Mettre à jour le statut de la permanence si nécessaire
      const { data: permanence } = await supabase
        .from('evscatala_permanences')
        .select('*')
        .eq('id', permanenceId)
        .single();

      if (permanence && permanence.status === PermanenceStatus.OPEN) {
        const { data: volunteers } = await supabase
          .from('evscatala_permanence_volunteers')
          .select('*')
          .eq('permanence_id', permanenceId);

        if (volunteers && volunteers.length >= permanence.required_volunteers) {
          await this.updatePermanence(permanenceId, { status: PermanenceStatus.FULL });
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la permanence:', error);
      return false;
    }
  },

  /**
   * Se désinscrire d'une permanence
   * @param permanenceId ID de la permanence
   * @param userId ID de l'utilisateur
   * @returns true si la désinscription a réussi, false sinon
   */
  async unregisterFromPermanence(permanenceId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evscatala_permanence_volunteers')
        .delete()
        .eq('permanence_id', permanenceId)
        .eq('user_id', userId);

      if (error) throw error;

      // Mettre à jour le statut de la permanence si nécessaire
      const { data: permanence } = await supabase
        .from('evscatala_permanences')
        .select('*')
        .eq('id', permanenceId)
        .single();

      if (permanence && permanence.status === PermanenceStatus.FULL) {
        await this.updatePermanence(permanenceId, { status: PermanenceStatus.OPEN });
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la désinscription de la permanence:', error);
      return false;
    }
  },

  /**
   * Vérifier si un utilisateur est inscrit à une permanence
   * @param permanenceId ID de la permanence
   * @param userId ID de l'utilisateur
   * @returns true si l'utilisateur est inscrit, false sinon
   */
  async isUserRegistered(permanenceId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanence_volunteers')
        .select('*')
        .eq('permanence_id', permanenceId)
        .eq('user_id', userId);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription:', error);
      return false;
    }
  }
}; 