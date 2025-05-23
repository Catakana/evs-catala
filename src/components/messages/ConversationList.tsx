import React from 'react';
import { Conversation } from '@/types/message';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  isLoading?: boolean;
  profiles: Record<string, { firstName: string; lastName: string; avatar?: string }>;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  isLoading = false,
  profiles
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement des conversations...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <div className="text-muted-foreground">
          <p>Aucune conversation</p>
          <p className="text-xs mt-1">Commencez une nouvelle discussion en cliquant sur "Nouveau message"</p>
        </div>
      </div>
    );
  }

  // Fonctions utilitaires pour l'affichage des conversations
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) {
      return conversation.title;
    }
    
    // Pour les conversations privées, montrer le nom de l'autre participant
    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      
      if (otherParticipant && otherParticipant.userId in profiles) {
        const profile = profiles[otherParticipant.userId];
        return `${profile.firstName} ${profile.lastName}`;
      }
      
      return 'Conversation privée';
    }
    
    return 'Groupe sans nom';
  };
  
  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return 'Pas de messages';
    }
    
    const isSelf = conversation.lastMessage.senderId === currentUserId;
    const prefix = isSelf ? 'Vous: ' : '';
    
    // Tronquer le message s'il est trop long
    const content = conversation.lastMessage.content;
    const maxLength = isSelf ? 25 : 30;
    
    return `${prefix}${content.length > maxLength ? content.substring(0, maxLength) + '...' : content}`;
  };
  
  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.lastMessageAt) {
      return '';
    }
    
    const date = new Date(conversation.lastMessageAt);
    const now = new Date();
    
    // Si le message date d'aujourd'hui, afficher l'heure
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm');
    }
    
    // Si le message date d'hier, afficher "Hier"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    
    // Si le message date de moins d'une semaine, afficher le jour
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEEE', { locale: fr });
    }
    
    // Sinon afficher la date
    return format(date, 'dd/MM/yyyy');
  };
  
  const getAvatarForConversation = (conversation: Conversation) => {
    // Pour les conversations privées, montrer l'avatar de l'autre participant
    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      
      if (otherParticipant && otherParticipant.userId in profiles) {
        const profile = profiles[otherParticipant.userId];
        
        if (profile.avatar) {
          return (
            <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
          );
        } else {
          return (
            <AvatarFallback>
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </AvatarFallback>
          );
        }
      }
    }
    
    // Pour les groupes ou si pas d'avatar trouvé
    return (
      <AvatarFallback>
        <Users className="h-4 w-4" />
      </AvatarFallback>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map(conversation => {
          const isSelected = selectedConversationId === conversation.id;
          const title = getConversationTitle(conversation);
          const lastMessagePreview = getLastMessagePreview(conversation);
          const lastMessageTime = getLastMessageTime(conversation);
          
          return (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors",
                isSelected 
                  ? "bg-primary/10 dark:bg-primary/20" 
                  : "hover:bg-muted"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <Avatar className="h-10 w-10">
                {getAvatarForConversation(conversation)}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">{title}</h3>
                  {lastMessageTime && (
                    <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {lastMessagePreview}
                </p>
              </div>
              
              {conversation.type === 'group' && (
                <div className="flex items-center justify-center rounded-full bg-muted h-5 w-5">
                  <Users className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationList; 