import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/message';
import messageService from '@/lib/messageService';

/**
 * Hook personnalisé pour s'abonner aux nouveaux messages en temps réel
 * @param conversationId ID de la conversation à surveiller
 * @param currentUserId ID de l'utilisateur actuel
 * @returns Les nouveaux messages reçus
 */
export function useMessagesSubscription(
  conversationId: string | null,
  currentUserId: string | null
) {
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    
    // Créer un canal pour écouter les nouveaux messages de cette conversation
    const subscription = supabase
      .channel(`messages_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'evscatala_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        if (payload.new && payload.new.sender_id !== currentUserId) {
          try {
            // Récupérer le message complet avec ses pièces jointes
            const { data, error } = await supabase
              .from('evscatala_messages')
              .select(`
                *,
                attachments:evscatala_message_attachments(*)
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (error) {
              console.error('Erreur lors de la récupération du message complet:', error);
              return;
            }
            
            // Convertir le message brut en objet Message formaté
            const formattedMessage = messageService.convertToMessage(data);
            setNewMessage(formattedMessage);
            
            // Marquer automatiquement comme "livré" si l'utilisateur est sur la page
            if (document.visibilityState === 'visible') {
              await messageService.markMessagesAsRead(conversationId);
            }
          } catch (error) {
            console.error('Erreur dans le traitement du nouveau message:', error);
          }
        }
      })
      .subscribe();
    
    // Nettoyage de la souscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId, currentUserId]);
  
  return newMessage;
}

/**
 * Hook personnalisé pour s'abonner aux mises à jour de conversations en temps réel
 * @param userId ID de l'utilisateur actuel
 * @returns Signal indiquant qu'il faut rafraîchir la liste des conversations
 */
export function useConversationsSubscription(userId: string | null) {
  const [shouldRefresh, setShouldRefresh] = useState<boolean>(false);
  
  useEffect(() => {
    if (!userId) return;
    
    // Canal pour les nouveaux messages dans toutes les conversations
    const messagesSubscription = supabase
      .channel('all_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'evscatala_messages'
      }, (payload) => {
        if (payload.new) {
          setShouldRefresh(true);
        }
      })
      .subscribe();
    
    // Canal pour les nouvelles conversations
    const conversationsSubscription = supabase
      .channel('new_conversations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'evscatala_conversation_participants',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          setShouldRefresh(true);
        }
      })
      .subscribe();
    
    // Nettoyage des souscriptions
    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [userId]);
  
  // Réinitialiser le signal après consommation
  const resetRefresh = () => {
    setShouldRefresh(false);
  };
  
  return { shouldRefresh, resetRefresh };
}

export default { useMessagesSubscription, useConversationsSubscription }; 