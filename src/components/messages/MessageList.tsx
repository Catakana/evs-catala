import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { File, Pin, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onPinMessage?: (messageId: string, isPinned: boolean) => void;
  onReportMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  isLoading?: boolean;
  className?: string;
  showActions?: boolean;
  profiles: Record<string, { firstName: string; lastName: string; avatar?: string }>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onPinMessage,
  onReportMessage,
  onDeleteMessage,
  isLoading = false,
  className,
  showActions = true,
  profiles
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Défiler vers le bas quand de nouveaux messages sont chargés
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement des messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Aucun message dans cette conversation</div>
      </div>
    );
  }

  // Grouper les messages par jour
  const messagesByDay: Record<string, Message[]> = {};
  
  messages.forEach(message => {
    const day = format(message.createdAt, 'yyyy-MM-dd');
    if (!messagesByDay[day]) {
      messagesByDay[day] = [];
    }
    messagesByDay[day].push(message);
  });

  // Trier les jours
  const sortedDays = Object.keys(messagesByDay).sort((a, b) => b.localeCompare(a));

  return (
    <div className={cn("flex-1 flex flex-col-reverse overflow-y-auto p-4 gap-4", className)}>
      <div ref={messagesEndRef} />
      
      {sortedDays.map(day => (
        <div key={day} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {format(new Date(day), 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
          </div>
          
          {messagesByDay[day].map(message => {
            const isOwnMessage = message.senderId === currentUserId;
            const profile = profiles[message.senderId] || { 
              firstName: 'Utilisateur', 
              lastName: 'Inconnu'
            };
            
            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex gap-3 max-w-[80%]", 
                  isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto",
                  message.isPinned && "border-l-4 border-amber-500 pl-2"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                  ) : (
                    <AvatarFallback>
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isOwnMessage ? 'Vous' : `${profile.firstName} ${profile.lastName}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(message.createdAt, 'HH:mm')}
                    </span>
                    
                    {message.isPinned && (
                      <Pin className="h-3 w-3 text-amber-500" />
                    )}
                    
                    {message.isReported && (
                      <Flag className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg break-words",
                    isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {message.content}
                  </div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.attachments.map(attachment => (
                        <a 
                          key={attachment.id} 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-muted hover:bg-muted/90 rounded p-1.5 text-xs"
                        >
                          <File className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{attachment.fileName}</span>
                          <span className="text-muted-foreground">
                            ({Math.round(attachment.fileSize / 1024)} Ko)
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {showActions && isOwnMessage && (
                    <div className="flex gap-1 justify-end mt-1">
                      <TooltipProvider>
                        {onPinMessage && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onPinMessage(message.id, !message.isPinned)}
                              >
                                <Pin className={cn(
                                  "h-3 w-3",
                                  message.isPinned ? "text-amber-500" : "text-muted-foreground"
                                )} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {message.isPinned ? 'Désépingler' : 'Épingler'}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {onDeleteMessage && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => {
                                  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
                                    onDeleteMessage(message.id);
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Supprimer
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  )}
                  
                  {showActions && !isOwnMessage && onReportMessage && (
                    <div className="flex justify-end mt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                if (window.confirm('Signaler ce message ?')) {
                                  onReportMessage(message.id);
                                }
                              }}
                            >
                              <Flag className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Signaler
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MessageList; 