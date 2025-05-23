import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import messageService from '@/lib/messageService';
import { toast } from '@/components/ui/use-toast';
import { Conversation } from '@/types/message';
import { cn } from '@/lib/utils';

interface MessageNotificationProps {
  userId: string;
  className?: string;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({ userId, className }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadConversations, setUnreadConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();
  
  // Récupérer le nombre de conversations non lues
  const fetchUnreadCount = async () => {
    try {
      if (!userId) return;
      
      const { data: userParticipations, error } = await supabase
        .from('evscatala_conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          conversation:evscatala_conversations(
            id,
            title,
            type,
            last_message_at,
            participants:evscatala_conversation_participants(user_id)
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erreur lors de la récupération des conversations non lues:', error);
        return;
      }
      
      // Filtrer les conversations avec des messages non lus
      const unread = userParticipations.filter(p => {
        const lastReadAt = new Date(p.last_read_at);
        const lastMessageAt = p.conversation?.last_message_at ? new Date(p.conversation.last_message_at) : null;
        
        return lastMessageAt && lastMessageAt > lastReadAt;
      });
      
      setUnreadCount(unread.length);
      
      // Récupérer les détails des conversations non lues
      if (unread.length > 0) {
        const conversations = await Promise.all(
          unread.map(async (p) => {
            const conv = await messageService.getConversationById(p.conversation_id);
            return conv;
          })
        );
        
        setUnreadConversations(conversations);
      }
    } catch (error) {
      console.error('Erreur dans fetchUnreadCount:', error);
    }
  };
  
  // Initialiser et mettre à jour le nombre de messages non lus
  useEffect(() => {
    if (!userId) return;
    
    fetchUnreadCount();
    
    // Souscrire aux changements dans les conversations
    const subscription = supabase
      .channel('evscatala_messages_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'evscatala_messages'
      }, (payload) => {
        // Vérifier si le message appartient à une conversation de l'utilisateur
        // et n'est pas envoyé par l'utilisateur lui-même
        if (payload.new && payload.new.sender_id !== userId) {
          fetchUnreadCount();
          
          // Afficher une notification toast pour le nouveau message
          toast({
            title: 'Nouveau message',
            description: 'Vous avez reçu un nouveau message',
            duration: 3000,
          });
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);
  
  // Ouvrir la conversation sélectionnée
  const handleOpenConversation = (conversationId: string) => {
    setIsOpen(false);
    navigate(`/messages?conversation=${conversationId}`);
  };
  
  // Marquer toutes les conversations comme lues
  const markAllAsRead = async () => {
    try {
      // Mettre à jour la date de dernière lecture pour toutes les conversations
      for (const conv of unreadConversations) {
        await messageService.markMessagesAsRead(conv.id);
      }
      
      setUnreadCount(0);
      setUnreadConversations([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <button 
        className="relative rounded-full p-2 hover:bg-muted transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">Messages non lus ({unreadCount})</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs text-primary hover:underline"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {unreadConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Vous n'avez pas de messages non lus</p>
              </div>
            ) : (
              <div>
                {unreadConversations.map(conv => {
                  // Déterminer le titre de la conversation
                  let title = conv.title || '';
                  let avatarText = title.substring(0, 2);
                  
                  if (conv.type === 'private') {
                    const otherParticipant = conv.participants.find(p => p.userId !== userId);
                    if (otherParticipant && otherParticipant.profile) {
                      title = `${otherParticipant.profile.firstname} ${otherParticipant.profile.lastname}`;
                      avatarText = `${otherParticipant.profile.firstname[0]}${otherParticipant.profile.lastname[0]}`;
                    }
                  }
                  
                  return (
                    <div 
                      key={conv.id}
                      className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handleOpenConversation(conv.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{avatarText}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{title}</div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage?.content || 'Nouveau message'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t">
            <button 
              className="w-full py-2 text-center text-sm text-primary hover:underline"
              onClick={() => navigate('/messages')}
            >
              Voir tous les messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageNotification; 