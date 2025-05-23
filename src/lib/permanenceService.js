import { supabase } from './supabase';
import { format } from 'date-fns';

/**
 * Service pour la gestion des permanences
 */
export const permanenceService = {
  /**
   * Récupérer les permanences pour une période donnée
   * @param {string} startDate - Date de début (format YYYY-MM-DD)
   * @param {string} endDate - Date de fin (format YYYY-MM-DD)
   * @returns {Promise<Array>} Liste des permanences
   */
  async getPermanencesByPeriod(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .select(`
          *,
          participants:evscatala_permanence_participants(*)
        `)
        .gte('start_date', `${startDate}T00:00:00`)
        .lte('start_date', `${endDate}T23:59:59`)
        .order('start_date')
        .order('end_date');

      if (error) throw error;

      return (data || []).map(permanence => {
        // Extraire la date et l'heure à partir de start_date et end_date
        const startDate = new Date(permanence.start_date);
        const endDate = new Date(permanence.end_date);
        
        return {
          id: permanence.id,
          title: permanence.title,
          // Pour la compatibilité, extraire la date de start_date
          date: format(startDate, 'yyyy-MM-dd'),
          startDate: startDate,
          endDate: endDate,
          location: permanence.location,
          status: permanence.status,
          minMembers: permanence.min_members || permanence.min_volunteers,
          maxMembers: permanence.max_members || permanence.max_volunteers,
          description: permanence.description,
          participants: permanence.participants || [],
          createdBy: permanence.created_by,
          createdAt: new Date(permanence.created_at),
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des permanences:', error);
      throw error;
    }
  },

  /**
   * S'inscrire à une permanence
   * @param {string} permanenceId - ID de la permanence
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  async registerForPermanence(permanenceId, userId) {
    try {
      // Vérifier si l'utilisateur est déjà inscrit
      const { count } = await supabase
        .from('evscatala_permanence_participants')
        .select('*', { count: 'exact' })
        .eq('permanence_id', permanenceId)
        .eq('user_id', userId);

      if (count && count > 0) {
        throw new Error('Vous êtes déjà inscrit à cette permanence');
      }

      // Ajouter l'utilisateur aux participants
      const { data, error } = await supabase
        .from('evscatala_permanence_participants')
        .insert([
          { 
            permanence_id: permanenceId,
            user_id: userId,
            status: 'confirmed',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      return data[0];
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la permanence:', error);
      throw error;
    }
  },

  /**
   * Se désinscrire d'une permanence
   * @param {string} permanenceId - ID de la permanence
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<boolean>} Succès de la désinscription
   */
  async unregisterFromPermanence(permanenceId, userId) {
    try {
      const { error } = await supabase
        .from('evscatala_permanence_participants')
        .delete()
        .eq('permanence_id', permanenceId)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erreur lors de la désinscription de la permanence:', error);
      throw error;
    }
  },

  /**
   * Vérifier si un utilisateur est inscrit à une permanence
   * @param {string} permanenceId - ID de la permanence
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<boolean>} True si l'utilisateur est inscrit
   */
  async isUserRegistered(permanenceId, userId) {
    try {
      const { count } = await supabase
        .from('evscatala_permanence_participants')
        .select('*', { count: 'exact' })
        .eq('permanence_id', permanenceId)
        .eq('user_id', userId);

      return count > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription:', error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle permanence
   * @param {Object} permanence - Données de la permanence
   * @returns {Promise<Object>} La permanence créée
   */
  async createPermanence(permanence) {
    try {
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .insert([
          {
            title: permanence.title,
            date: format(permanence.date, 'yyyy-MM-dd'),
            start_time: format(permanence.startDate, 'HH:mm:ss'),
            end_time: format(permanence.endDate, 'HH:mm:ss'),
            location: permanence.location,
            status: permanence.status || 'confirmed',
            min_members: permanence.minMembers || 1,
            max_members: permanence.maxMembers || 3,
            description: permanence.description,
            created_by: permanence.createdBy,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      return data[0];
    } catch (error) {
      console.error('Erreur lors de la création de la permanence:', error);
      throw error;
    }
  }
}; 