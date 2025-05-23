import { supabase } from './supabase';
import { Permanence, PermanenceParticipant, PermanenceStatus, PermanenceType } from '@/types/permanence';

// Interface pour les données brutes de permanence dans la base de données
export interface PermanenceData {
  id: string;
  date_start: string;
  date_end: string;
  location: string;
  type: 'public' | 'internal' | 'maintenance';
  created_by: string;
  min_required: number;
  max_allowed: number;
  notes?: string;
  visibility: 'public' | 'members' | 'staff';
  created_at: string;
  updated_at: string;
}

// Interface pour le formulaire de création/modification de permanence
export interface PermanenceFormData {
  id?: string;
  title?: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location?: string;
  type: PermanenceType;
  min_members: number;
  max_members: number;
  notes?: string;
  visibility: 'public' | 'members' | 'staff';
}

// Service pour les permanences
export const permanenceService = {
  // Récupérer toutes les permanences
  async getPermanences() {
    const { data, error } = await supabase
      .from('evscatala_permanences')
      .select('*, evscatala_permanence_participants(*)');

    if (error) {
      console.error('Erreur lors de la récupération des permanences:', error);
      throw error;
    }

    return this.convertToPermanences(data);
  },

  // Récupérer les permanences pour une période donnée
  async getPermanencesByPeriod(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('evscatala_permanences')
      .select('*, evscatala_permanence_participants(*)')
      .gte('date_start', `${startDate}T00:00:00`)
      .lte('date_start', `${endDate}T23:59:59`)
      .order('date_start', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des permanences par période:', error);
      throw error;
    }

    return this.convertToPermanences(data);
  },

  // Récupérer une permanence par ID
  async getPermanenceById(id: string) {
    const { data, error } = await supabase
      .from('evscatala_permanences')
      .select('*, evscatala_permanence_participants(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de la permanence ${id}:`, error);
      throw error;
    }

    return this.convertToPermanence(data);
  },

  // Créer une permanence
  async createPermanence(formData: PermanenceFormData, userId: string) {
    // Formatage des dates
    const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
    const endDateTime = `${formData.end_date}T${formData.end_time}:00`;
    
    const { data, error } = await supabase
      .from('evscatala_permanences')
      .insert({
        date_start: startDateTime,
        date_end: endDateTime,
        location: formData.location || '',
        type: formData.type,
        created_by: userId,
        min_required: formData.min_members,
        max_allowed: formData.max_members,
        notes: formData.notes || '',
        visibility: formData.visibility,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la permanence:', error);
      throw error;
    }

    return this.convertToPermanence(data);
  },

  // Mettre à jour une permanence
  async updatePermanence(id: string, formData: PermanenceFormData) {
    // Formatage des dates
    const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
    const endDateTime = `${formData.end_date}T${formData.end_time}:00`;
    
    const { data, error } = await supabase
      .from('evscatala_permanences')
      .update({
        date_start: startDateTime,
        date_end: endDateTime,
        location: formData.location || '',
        type: formData.type,
        min_required: formData.min_members,
        max_allowed: formData.max_members,
        notes: formData.notes || '',
        visibility: formData.visibility,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour de la permanence ${id}:`, error);
      throw error;
    }

    return this.convertToPermanence(data);
  },

  // Supprimer une permanence
  async deletePermanence(id: string) {
    const { error } = await supabase
      .from('evscatala_permanences')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression de la permanence ${id}:`, error);
      throw error;
    }

    return true;
  },

  // Inscription d'un membre à une permanence
  async registerForPermanence(permanenceId: string, userId: string) {
    const { data, error } = await supabase
      .from('evscatala_permanence_participants')
      .insert({
        permanence_id: permanenceId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de l'inscription à la permanence ${permanenceId}:`, error);
      throw error;
    }

    return data;
  },

  // Désinscription d'un membre d'une permanence
  async unregisterFromPermanence(permanenceId: string, userId: string) {
    const { error } = await supabase
      .from('evscatala_permanence_participants')
      .delete()
      .eq('permanence_id', permanenceId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Erreur lors de la désinscription de la permanence ${permanenceId}:`, error);
      throw error;
    }

    return true;
  },

  // Marquer la présence d'un membre à une permanence
  async markAttendance(permanenceId: string, userId: string, status: 'present' | 'absent', checkedBy: string) {
    const { data, error } = await supabase
      .from('evscatala_permanence_participants')
      .update({
        status,
        checked_by: checkedBy,
        updated_at: new Date().toISOString()
      })
      .eq('permanence_id', permanenceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors du marquage de présence pour la permanence ${permanenceId}:`, error);
      throw error;
    }

    return data;
  },

  // Convertir les données brutes en permanence structurée
  convertToPermanence(data: any): Permanence {
    const participants: PermanenceParticipant[] = data.evscatala_permanence_participants 
      ? data.evscatala_permanence_participants.map((p: any) => ({
          id: p.user_id,
          name: p.user_id, // À remplacer par une fonction qui récupère le nom de l'utilisateur
          status: p.status === 'present' ? 'confirmed' : p.status === 'absent' ? 'absent' : 'pending'
        }))
      : [];

    return {
      id: data.id,
      title: `Permanence du ${new Date(data.date_start).toLocaleDateString('fr-FR')}`,
      startDate: new Date(data.date_start),
      endDate: new Date(data.date_end),
      location: data.location || '',
      status: 'confirmed', // À adapter selon les besoins
      type: data.type,
      minMembers: data.min_required,
      maxMembers: data.max_allowed,
      participants,
      notes: data.notes
    };
  },

  // Convertir plusieurs permanences
  convertToPermanences(data: any[]): Permanence[] {
    return data.map(item => this.convertToPermanence(item));
  },

  // Convertir une permanence en données de formulaire
  convertToFormData(permanence: Permanence): PermanenceFormData {
    return {
      id: permanence.id,
      title: permanence.title,
      start_date: permanence.startDate.toISOString().split('T')[0],
      start_time: permanence.startDate.toISOString().split('T')[1].substring(0, 5),
      end_date: permanence.endDate.toISOString().split('T')[0],
      end_time: permanence.endDate.toISOString().split('T')[1].substring(0, 5),
      location: permanence.location,
      type: permanence.type,
      min_members: permanence.minMembers,
      max_members: permanence.maxMembers,
      notes: permanence.notes,
      visibility: 'public' // Valeur par défaut, à adapter selon les besoins
    };
  }
}; 