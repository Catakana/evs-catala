import { supabase } from './supabase';
import { 
  Conversation, 
  ConversationParticipant, 
  Message, 
  Attachment, 
  ConversationType,
  MessageStatus 
} from '@/types/message';

/**
 * Service pour la gestion des messages et conversations
 */
export const messageService = {
  /**
   * Récupérer toutes les conversations de l'utilisateur
   * @returns {Promise<Conversation[]>} Liste des conversations
   */
  async getUserConversations(): Promise<Conversation[]> {
    try {
      // Récupération des conversations auxquelles l'utilisateur participe
      const { data: participations, error: participationsError } = await supabase
        .from('evscatala_conversation_participants')
        .select('conversation_id')
        .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id));

      if (participationsError) {
        console.error('Erreur lors de la récupération des participations:', participationsError);
        throw participationsError;
      }

      if (!participations || participations.length === 0) {
        return [];
      }

      const conversationIds = participations.map(p => p.conversation_id);

      // Récupération des conversations avec les derniers messages
      const { data: conversations, error: conversationsError } = await supabase
        .from('evscatala_conversations')
        .select(`
          *,
          participants:evscatala_conversation_participants(
            id,
            user_id,
            is_admin,
            joined_at,
            last_read_at
          ),
          last_message:evscatala_messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Erreur lors de la récupération des conversations:', conversationsError);
        throw conversationsError;
      }

      // Transformation des données
      return conversations.map(conv => this.convertToConversation(conv));
    } catch (error) {
      console.error('Erreur dans getUserConversations:', error);
      throw error;
    }
  },

  /**
   * Récupérer une conversation par son ID
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<Conversation>} Détails de la conversation
   */
  async getConversationById(conversationId: string): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('evscatala_conversations')
        .select(`
          *,
          participants:evscatala_conversation_participants(
            id,
            user_id,
            is_admin,
            joined_at,
            last_read_at,
            profiles:evscatala_profiles(
              firstname,
              lastname,
              avatar_url
            )
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error(`Erreur lors de la récupération de la conversation ${conversationId}:`, error);
        throw error;
      }

      return this.convertToConversation(data);
    } catch (error) {
      console.error('Erreur dans getConversationById:', error);
      throw error;
    }
  },

  /**
   * Récupérer les messages d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {number} limit - Nombre maximum de messages à récupérer
   * @param {number} offset - Décalage pour la pagination
   * @returns {Promise<Message[]>} Liste des messages
   */
  async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('evscatala_messages')
        .select(`
          *,
          attachments:evscatala_message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error(`Erreur lors de la récupération des messages de la conversation ${conversationId}:`, error);
        throw error;
      }

      // Marquer les messages comme lus
      await this.markMessagesAsRead(conversationId);

      return data.map(msg => this.convertToMessage(msg));
    } catch (error) {
      console.error('Erreur dans getConversationMessages:', error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle conversation
   * @param {ConversationType} type - Type de conversation (private ou group)
   * @param {string} title - Titre (pour les conversations de groupe uniquement)
   * @param {string[]} participantIds - IDs des participants
   * @returns {Promise<Conversation>} Conversation créée
   */
  async createConversation(
    type: ConversationType,
    title: string | null = null,
    participantIds: string[]
  ): Promise<Conversation> {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      // S'assurer que l'utilisateur actuel est inclus dans les participants
      if (!participantIds.includes(userId)) {
        participantIds.push(userId);
      }

      // Vérifier si une conversation privée existe déjà entre ces deux utilisateurs
      if (type === 'private' && participantIds.length === 2) {
        const existingConversation = await this.findPrivateConversation(participantIds[0], participantIds[1]);
        if (existingConversation) {
          return existingConversation;
        }
      }

      // Créer la conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('evscatala_conversations')
        .insert({
          type,
          title: type === 'group' ? title : null,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (conversationError) {
        console.error('Erreur lors de la création de la conversation:', conversationError);
        throw conversationError;
      }

      // Ajouter les participants
      const participantsToInsert = participantIds.map(pid => ({
        conversation_id: conversationData.id,
        user_id: pid,
        is_admin: pid === userId, // Le créateur est admin
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      }));

      const { error: participantsError } = await supabase
        .from('evscatala_conversation_participants')
        .insert(participantsToInsert);

      if (participantsError) {
        console.error('Erreur lors de l\'ajout des participants:', participantsError);
        throw participantsError;
      }

      // Récupérer la conversation complète
      return this.getConversationById(conversationData.id);
    } catch (error) {
      console.error('Erreur dans createConversation:', error);
      throw error;
    }
  },

  /**
   * Trouver une conversation privée entre deux utilisateurs
   * @param {string} user1Id - ID du premier utilisateur
   * @param {string} user2Id - ID du second utilisateur
   * @returns {Promise<Conversation | null>} Conversation si elle existe
   */
  async findPrivateConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
    try {
      // Trouver les IDs de conversations auxquelles user1 participe
      const { data: user1Conversations, error: user1Error } = await supabase
        .from('evscatala_conversation_participants')
        .select('conversation_id')
        .eq('user_id', user1Id);

      if (user1Error) {
        console.error('Erreur lors de la recherche des conversations de user1:', user1Error);
        throw user1Error;
      }

      if (!user1Conversations || user1Conversations.length === 0) {
        return null;
      }

      const conversationIds = user1Conversations.map(c => c.conversation_id);

      // Trouver les conversations privées auxquelles user2 participe parmi celles de user1
      const { data: privateConversations, error: privateError } = await supabase
        .from('evscatala_conversations')
        .select(`
          *,
          participants:evscatala_conversation_participants(user_id)
        `)
        .in('id', conversationIds)
        .eq('type', 'private');

      if (privateError) {
        console.error('Erreur lors de la recherche des conversations privées:', privateError);
        throw privateError;
      }

      // Filtrer les conversations qui ont exactement ces deux participants
      for (const conv of privateConversations) {
        const participantIds = conv.participants.map((p: any) => p.user_id);
        if (participantIds.length === 2 && 
            participantIds.includes(user1Id) && 
            participantIds.includes(user2Id)) {
          return this.getConversationById(conv.id);
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur dans findPrivateConversation:', error);
      throw error;
    }
  },

  /**
   * Envoyer un message dans une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} content - Contenu du message
   * @param {File[]} attachments - Pièces jointes (optionnel)
   * @returns {Promise<Message>} Message envoyé
   */
  async sendMessage(
    conversationId: string, 
    content: string, 
    attachments: File[] = []
  ): Promise<Message> {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      // Créer le message
      const { data: messageData, error: messageError } = await supabase
        .from('evscatala_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          status: 'sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) {
        console.error('Erreur lors de l\'envoi du message:', messageError);
        throw messageError;
      }

      // Mettre à jour la dernière activité de la conversation
      await supabase
        .from('evscatala_conversations')
        .update({
          last_message_id: messageData.id,
          last_message_at: messageData.created_at,
          updated_at: messageData.created_at
        })
        .eq('id', conversationId);

      // Gérer les pièces jointes si nécessaire
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          // Upload du fichier dans le bucket de stockage
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `messages/${conversationId}/${messageData.id}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Erreur lors de l\'upload de la pièce jointe:', uploadError);
            continue; // On continue avec les autres pièces jointes
          }

          // Récupérer l'URL du fichier
          const { data: urlData } = await supabase
            .storage
            .from('attachments')
            .getPublicUrl(filePath);

          // Enregistrer les métadonnées de la pièce jointe
          await supabase
            .from('evscatala_message_attachments')
            .insert({
              message_id: messageData.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              url: urlData.publicUrl,
              created_at: new Date().toISOString()
            });
        }
      }

      // Récupérer le message complet avec ses pièces jointes
      const { data: completeMessage, error: completeError } = await supabase
        .from('evscatala_messages')
        .select(`
          *,
          attachments:evscatala_message_attachments(*)
        `)
        .eq('id', messageData.id)
        .single();

      if (completeError) {
        console.error('Erreur lors de la récupération du message complet:', completeError);
        throw completeError;
      }

      return this.convertToMessage(completeMessage);
    } catch (error) {
      console.error('Erreur dans sendMessage:', error);
      throw error;
    }
  },

  /**
   * Marquer les messages d'une conversation comme lus
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<void>}
   */
  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      // Mettre à jour le last_read_at du participant
      await supabase
        .from('evscatala_conversation_participants')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Erreur dans markMessagesAsRead:', error);
      throw error;
    }
  },

  /**
   * Épingler ou désépingler un message
   * @param {string} messageId - ID du message
   * @param {boolean} isPinned - État d'épinglage
   * @returns {Promise<void>}
   */
  async togglePinMessage(messageId: string, isPinned: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('evscatala_messages')
        .update({
          is_pinned: isPinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur lors de l\'épinglage/désépinglage du message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans togglePinMessage:', error);
      throw error;
    }
  },

  /**
   * Signaler un message
   * @param {string} messageId - ID du message
   * @returns {Promise<void>}
   */
  async reportMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('evscatala_messages')
        .update({
          is_reported: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur lors du signalement du message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans reportMessage:', error);
      throw error;
    }
  },

  /**
   * Ajouter un participant à une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} userId - ID de l'utilisateur à ajouter
   * @param {boolean} isAdmin - Est-ce que le nouveau participant est admin
   * @returns {Promise<void>}
   */
  async addParticipant(conversationId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    try {
      const { error } = await supabase
        .from('evscatala_conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          is_admin: isAdmin,
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de l\'ajout du participant:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans addParticipant:', error);
      throw error;
    }
  },

  /**
   * Quitter une conversation
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<void>}
   */
  async leaveConversation(conversationId: string): Promise<void> {
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('evscatala_conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la sortie de la conversation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans leaveConversation:', error);
      throw error;
    }
  },

  /**
   * Supprimer un message
   * @param {string} messageId - ID du message
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      // D'abord supprimer les pièces jointes
      const { error: attachmentsError } = await supabase
        .from('evscatala_message_attachments')
        .delete()
        .eq('message_id', messageId);

      if (attachmentsError) {
        console.error('Erreur lors de la suppression des pièces jointes:', attachmentsError);
        throw attachmentsError;
      }

      // Puis supprimer le message
      const { error: messageError } = await supabase
        .from('evscatala_messages')
        .delete()
        .eq('id', messageId);

      if (messageError) {
        console.error('Erreur lors de la suppression du message:', messageError);
        throw messageError;
      }
    } catch (error) {
      console.error('Erreur dans deleteMessage:', error);
      throw error;
    }
  },

  /**
   * Convertir les données brutes en objet Conversation
   * @param {any} rawData - Données brutes de la base
   * @returns {Conversation} Objet Conversation formaté
   */
  convertToConversation(rawData: any): Conversation {
    const participants: ConversationParticipant[] = rawData.participants ? 
      rawData.participants.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        conversationId: rawData.id,
        isAdmin: p.is_admin,
        joinedAt: new Date(p.joined_at),
        lastReadAt: p.last_read_at ? new Date(p.last_read_at) : undefined,
        // Ajouter les infos du profil si disponibles
        profile: p.profiles ? {
          firstname: p.profiles.firstname,
          lastname: p.profiles.lastname,
          avatarUrl: p.profiles.avatar_url
        } : undefined
      })) : [];

    return {
      id: rawData.id,
      type: rawData.type as ConversationType,
      title: rawData.title,
      participants,
      lastMessageId: rawData.last_message_id,
      lastMessageAt: rawData.last_message_at ? new Date(rawData.last_message_at) : undefined,
      createdBy: rawData.created_by,
      createdAt: new Date(rawData.created_at),
      updatedAt: new Date(rawData.updated_at),
      // Dernier message si disponible
      lastMessage: rawData.last_message && rawData.last_message.length > 0 ? {
        id: rawData.last_message[0].id,
        content: rawData.last_message[0].content,
        senderId: rawData.last_message[0].sender_id,
        createdAt: new Date(rawData.last_message[0].created_at)
      } : undefined
    };
  },

  /**
   * Convertir les données brutes en objet Message
   * @param {any} rawData - Données brutes de la base
   * @returns {Message} Objet Message formaté
   */
  convertToMessage(rawData: any): Message {
    const attachments: Attachment[] = rawData.attachments ? 
      rawData.attachments.map((a: any) => ({
        id: a.id,
        fileName: a.file_name,
        fileType: a.file_type,
        fileSize: a.file_size,
        url: a.url,
        createdAt: new Date(a.created_at)
      })) : [];

    return {
      id: rawData.id,
      conversationId: rawData.conversation_id,
      senderId: rawData.sender_id,
      content: rawData.content,
      status: rawData.status as MessageStatus,
      isReported: rawData.is_reported,
      isPinned: rawData.is_pinned,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: new Date(rawData.created_at),
      updatedAt: new Date(rawData.updated_at)
    };
  }
};

export default messageService; 