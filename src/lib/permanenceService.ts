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
        .order('start_date', { ascending: true });

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
          participants:evscatala_permanence_participants(
            user_id,
            status,
            user:evscatala_profiles(id, firstname, lastname, avatar_url)
          )
        `)
        .gte('start_date', `${startDate}T00:00:00`)
        .lte('start_date', `${endDate}T23:59:59`)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as unknown as Permanence[];
    } catch (error) {
      console.error('Erreur lors de la récupération des permanences par période:', error);
      return [];
    }
  },

  /**
   * Créer une nouvelle permanence
   * @param permanenceData Données de la permanence
   * @returns La permanence créée
   */
  async createPermanence(permanenceData: Omit<Permanence, 'id' | 'created_at' | 'updated_at'>): Promise<Permanence | null> {
    try {
      console.log("Données reçues pour création:", permanenceData);
      
      // Vérifier que les données date et time sont valides
      if (!permanenceData.date || !permanenceData.start_time || !permanenceData.end_time) {
        throw new Error("Date ou heure manquante");
      }
      
      // S'assurer que date est au bon format (YYYY-MM-DD)
      let dateStr = permanenceData.date;
      if (typeof dateStr !== 'string' || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.error("Format de date invalide:", dateStr);
        throw new Error("Format de date invalide");
      }
      
      // S'assurer que les heures sont au bon format (HH:MM)
      let startTimeStr = permanenceData.start_time;
      let endTimeStr = permanenceData.end_time;
      if (typeof startTimeStr !== 'string' || !startTimeStr.match(/^\d{1,2}:\d{2}$/)) {
        console.error("Format d'heure de début invalide:", startTimeStr);
        throw new Error("Format d'heure de début invalide");
      }
      if (typeof endTimeStr !== 'string' || !endTimeStr.match(/^\d{1,2}:\d{2}$/)) {
        console.error("Format d'heure de fin invalide:", endTimeStr);
        throw new Error("Format d'heure de fin invalide");
      }
      
      // Conversion en objets Date valides
      const startDateStr = `${dateStr}T${startTimeStr}:00`;
      const endDateStr = `${dateStr}T${endTimeStr}:00`;
      
      console.log("Dates et heures formatées:", { startDateStr, endDateStr });
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Vérifier que les dates sont valides
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Dates invalides après conversion:", { startDate, endDate });
        throw new Error("Dates invalides après conversion");
      }
      
      // Préparation des données formatées
      const formattedData = {
        ...permanenceData,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };
      
      // Suppression des champs individuels qui ne sont plus nécessaires
      delete formattedData.date;
      delete formattedData.start_time;
      delete formattedData.end_time;

      console.log("Données formatées pour insertion:", formattedData);
      
      // Les champs created_at et updated_at seront automatiquement remplis par Supabase
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .insert([formattedData])
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
      const formattedUpdates = { ...updates };
      
      // Si des champs de date/heure sont fournis, les convertir en timestamps
      if (updates.date && (updates.start_time || updates.end_time)) {
        if (updates.start_time) {
          formattedUpdates.start_date = new Date(`${updates.date}T${updates.start_time}`).toISOString();
          delete formattedUpdates.start_time;
        }
        
        if (updates.end_time) {
          formattedUpdates.end_date = new Date(`${updates.date}T${updates.end_time}`).toISOString();
          delete formattedUpdates.end_time;
        }
        
        delete formattedUpdates.date;
      }
      
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .update(formattedUpdates)
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
        .from('evscatala_permanence_participants')
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
        const { data: participants } = await supabase
          .from('evscatala_permanence_participants')
          .select('*')
          .eq('permanence_id', permanenceId);

        if (participants && participants.length >= permanence.required_volunteers) {
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
        .from('evscatala_permanence_participants')
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
        .from('evscatala_permanence_participants')
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