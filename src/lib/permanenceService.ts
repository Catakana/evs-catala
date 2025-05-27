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
      console.log("Récupération des permanences entre", startDate, "et", endDate);
      
      // Récupérer uniquement les permanences sans joindre les participants
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .select('*')
        .gte('start_date', `${startDate}T00:00:00`)
        .lte('start_date', `${endDate}T23:59:59`)
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("Aucune permanence trouvée pour cette période");
        return [];
      }
      
      console.log(`${data.length} permanences trouvées`);
      
      // Convertir les données en type Permanence
      const permanences: Permanence[] = data.map(p => ({
        ...p,
        participants: []
      }));
      
      // Récupérer les participants séparément si nécessaire
      if (permanences.length > 0) {
        try {
          // Récupérer tous les participants pour toutes les permanences de la période
          const permanenceIds = permanences.map(p => p.id);
          
          const { data: allParticipants, error: participantsError } = await supabase
            .from('evscatala_permanence_participants')
            .select('*')
            .in('permanence_id', permanenceIds);
          
          if (participantsError) {
            console.error("Erreur lors de la récupération des participants:", participantsError);
          } else if (allParticipants && allParticipants.length > 0) {
            console.log(`${allParticipants.length} participants trouvés au total`);
            
            // Distribuer les participants dans leurs permanences respectives
            for (const participant of allParticipants) {
              const permanence = permanences.find(p => p.id === participant.permanence_id);
              if (permanence && permanence.participants) {
                permanence.participants.push(participant);
              }
            }
          }
        } catch (e) {
          console.error("Erreur lors de la récupération des participants:", e);
        }
      }
      
      return permanences;
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
      console.log("Données reçues pour création:", JSON.stringify(permanenceData, null, 2));
      
      let formattedData: any = { ...permanenceData };
      
      // Si start_date et end_date sont déjà fournis, on les utilise directement
      if (permanenceData.start_date && permanenceData.end_date) {
        console.log("Utilisation directe des dates ISO fournies");
        
        // On conserve uniquement les champs nécessaires
        delete formattedData.date;
        delete formattedData.start_time;
        delete formattedData.end_time;
      } 
      // Sinon, on convertit date + start_time/end_time en dates ISO
      else if (permanenceData.date && permanenceData.start_time && permanenceData.end_time) {
        // Vérifier que les données date et time sont valides
        // S'assurer que date est au bon format (YYYY-MM-DD)
        let dateStr = permanenceData.date;
        if (typeof dateStr !== 'string' || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error("Format de date invalide:", dateStr);
          throw new Error("Format de date invalide");
        }
        
        // S'assurer que les heures sont au bon format (HH:MM)
        let startTimeStr = permanenceData.start_time;
        let endTimeStr = permanenceData.end_time;
        
        console.log("Heures reçues:", { startTimeStr, endTimeStr });
        
        // Valider et normaliser le format des heures
        const startTimeParts = startTimeStr.split(':');
        const endTimeParts = endTimeStr.split(':');
        
        if (startTimeParts.length < 2 || endTimeParts.length < 2) {
          console.error("Format d'heure invalide:", { startTimeStr, endTimeStr });
          throw new Error("Format d'heure invalide");
        }
        
        // Normaliser les heures au format HH:MM
        const normalizedStartTime = `${startTimeParts[0].padStart(2, '0')}:${startTimeParts[1].padStart(2, '0')}`;
        const normalizedEndTime = `${endTimeParts[0].padStart(2, '0')}:${endTimeParts[1].padStart(2, '0')}`;
        
        console.log("Heures normalisées:", { normalizedStartTime, normalizedEndTime });
        
        // Construction des dates ISO complètes
        const startISO = `${dateStr}T${normalizedStartTime}:00.000Z`;
        const endISO = `${dateStr}T${normalizedEndTime}:00.000Z`;
        
        console.log("Dates ISO formatées:", { startISO, endISO });
        
        // Préparation des données formatées sans utiliser d'objet Date
        formattedData.start_date = startISO;
        formattedData.end_date = endISO;
        
        // Suppression des champs individuels qui ne sont plus nécessaires
        delete formattedData.date;
        delete formattedData.start_time;
        delete formattedData.end_time;
      } else {
        throw new Error("Données de date et heure manquantes ou incomplètes");
      }

      console.log("Données formatées pour insertion:", formattedData);
      
      // Les champs created_at et updated_at seront automatiquement remplis par Supabase
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error("Erreur Supabase lors de l'insertion:", error);
        throw error;
      }
      
      console.log("Insertion réussie, données retournées:", data);
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
        let dateStr = updates.date;
        
        // S'assurer que la date est au bon format
        if (typeof dateStr !== 'string' || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error("Format de date invalide pour la mise à jour:", dateStr);
          throw new Error("Format de date invalide");
        }
        
        if (updates.start_time) {
          // Normaliser l'heure de début
          const startTimeParts = updates.start_time.split(':');
          if (startTimeParts.length < 2) {
            throw new Error("Format d'heure de début invalide");
          }
          const normalizedStartTime = `${startTimeParts[0].padStart(2, '0')}:${startTimeParts[1].padStart(2, '0')}`;
          const startDateStr = `${dateStr}T${normalizedStartTime}:00`;
          const startDate = new Date(startDateStr);
          
          if (isNaN(startDate.getTime())) {
            throw new Error("Date de début invalide après conversion");
          }
          
          formattedUpdates.start_date = startDate.toISOString();
          delete formattedUpdates.start_time;
        }
        
        if (updates.end_time) {
          // Normaliser l'heure de fin
          const endTimeParts = updates.end_time.split(':');
          if (endTimeParts.length < 2) {
            throw new Error("Format d'heure de fin invalide");
          }
          const normalizedEndTime = `${endTimeParts[0].padStart(2, '0')}:${endTimeParts[1].padStart(2, '0')}`;
          const endDateStr = `${dateStr}T${normalizedEndTime}:00`;
          const endDate = new Date(endDateStr);
          
          if (isNaN(endDate.getTime())) {
            throw new Error("Date de fin invalide après conversion");
          }
          
          formattedUpdates.end_date = endDate.toISOString();
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
  },

  /**
   * Fonction de débogage pour tester l'insertion d'une permanence
   * @returns {Promise<any>} Résultat du test
   */
  async testDirectInsertion(): Promise<any> {
    try {
      // Date future pour le test
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 7); // Une semaine dans le futur
      
      // Formater en ISO string sans millisecondes pour être plus propre
      const startDate = new Date(testDate);
      startDate.setHours(10, 0, 0, 0);
      
      const endDate = new Date(testDate);
      endDate.setHours(12, 0, 0, 0);
      
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();
      
      // Préparer une permanence avec le minimum de champs requis
      const testPermanence = {
        title: 'Test Permanence',
        start_date: startDateISO,
        end_date: endDateISO,
        location: 'Test Location',
        required_volunteers: 2,
        max_volunteers: 4,
        min_volunteers: 1,
        status: PermanenceStatus.OPEN,
        created_by: '1cf4d0ea-1f4c-4812-bf77-6524080621ba'
      };
      
      console.log("Test d'insertion directe:", testPermanence);
      
      // Effectuer l'insertion directe
      const { data, error } = await supabase
        .from('evscatala_permanences')
        .insert([testPermanence])
        .select()
        .single();
      
      if (error) {
        console.error("Erreur lors du test d'insertion directe:", error);
        
        // Analyse détaillée de l'erreur
        const errorDetails = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
        
        return { success: false, error: errorDetails };
      }
      
      console.log("Insertion directe réussie:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Exception lors du test d'insertion directe:", error);
      return { success: false, error };
    }
  },
}; 