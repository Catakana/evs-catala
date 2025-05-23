import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageList from '@/components/messages/MessageList';
import MessageInput from '@/components/messages/MessageInput';
import ConversationList from '@/components/messages/ConversationList';
import NewConversationModal, { ProfileSummary } from '@/components/messages/NewConversationModal';
import { supabase } from '@/lib/supabase';
import { Conversation, Message, ConversationType } from '@/types/message';
import messageService from '@/lib/messageService';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMessagesSubscription, useConversationsSubscription } from '@/hooks/useMessagesSubscription';

const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<ProfileSummary[]>([]);
  
  // Structure pour stocker les profils
  const [profiles, setProfiles] = useState<Record<string, { 
    firstName: string;
    lastName: string;
    avatar?: string;
  }>>({});
  
  const location = useLocation();
  const navigate = useNavigate();

  // Utiliser le hook de souscription aux nouveaux messages
  const newMessage = useMessagesSubscription(selectedConversationId, currentUserId);
  const { shouldRefresh, resetRefresh } = useConversationsSubscription(currentUserId);
  
  // Récupérer l'utilisateur connecté et les conversations au chargement
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchProfiles();
        fetchConversations();
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Vérifier si une conversation est spécifiée dans l'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const conversationId = queryParams.get('conversation');
    
    if (conversationId && conversationId !== selectedConversationId) {
      // Sélectionner la conversation si elle existe
      if (conversations.some(conv => conv.id === conversationId)) {
        setSelectedConversationId(conversationId);
        fetchMessages(conversationId);
      } else if (!isLoadingConversations) {
        // Vérifier si la conversation existe dans Supabase
        messageService.getConversationById(conversationId)
          .then(conversation => {
            // Ajouter la conversation à la liste si elle n'y est pas déjà
            if (!conversations.some(conv => conv.id === conversation.id)) {
              setConversations(prev => [conversation, ...prev]);
            }
            setSelectedConversationId(conversationId);
            fetchMessages(conversationId);
          })
          .catch(error => {
            console.error('Conversation non trouvée:', error);
            // Supprimer le paramètre d'URL invalide
            navigate('/messages', { replace: true });
          });
      }
    }
  }, [location.search, conversations, isLoadingConversations]);

  // Récupérer les conversations
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const conversationsList = await messageService.getUserConversations();
      setConversations(conversationsList);
      
      // Vérifier si une conversation est spécifiée dans l'URL
      const queryParams = new URLSearchParams(location.search);
      const conversationId = queryParams.get('conversation');
      
      if (conversationId && conversationsList.some(conv => conv.id === conversationId)) {
        setSelectedConversationId(conversationId);
        fetchMessages(conversationId);
      }
      // Sinon, sélectionner automatiquement la première conversation
      else if (conversationsList.length > 0 && !selectedConversationId) {
        setSelectedConversationId(conversationsList[0].id);
        fetchMessages(conversationsList[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Récupérer les messages d'une conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const messagesList = await messageService.getConversationMessages(conversationId);
      setMessages(messagesList);
      
      // Mettre à jour l'URL pour refléter la conversation active
      if (conversationId !== new URLSearchParams(location.search).get('conversation')) {
        navigate(`/messages?conversation=${conversationId}`, { replace: true });
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages de la conversation ${conversationId}:`, error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Récupérer tous les profils pour la création de conversations
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select('id, firstname, lastname, avatar_url');
      
      if (error) {
        throw error;
      }
      
      // Transformer les données pour nos composants
      const profilesMap: Record<string, { firstName: string; lastName: string; avatar?: string }> = {};
      const availableProfilesList: ProfileSummary[] = [];
      
      data.forEach(profile => {
        const profileData = {
          firstName: profile.firstname,
          lastName: profile.lastname,
          avatar: profile.avatar_url || undefined
        };
        
        profilesMap[profile.id] = profileData;
        
        availableProfilesList.push({
          id: profile.id,
          ...profileData
        });
      });
      
      setProfiles(profilesMap);
      setAvailableProfiles(availableProfilesList);
    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error);
    }
  };

  // Gérer la sélection d'une conversation
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    fetchMessages(conversationId);
  };

  // Envoyer un message
  const handleSendMessage = async (content: string, attachments: File[]) => {
    if (!selectedConversationId) return;
    
    try {
      setIsSending(true);
      const message = await messageService.sendMessage(selectedConversationId, content, attachments);
      
      // Ajouter le nouveau message à la liste
      setMessages(prev => [message, ...prev]);
      
      // Mettre à jour la conversation dans la liste avec le dernier message
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt
            },
            lastMessageAt: message.createdAt
          };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Épingler/désépingler un message
  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      await messageService.togglePinMessage(messageId, isPinned);
      
      // Mettre à jour l'état local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPinned } : msg
      ));
    } catch (error) {
      console.error('Erreur lors de l\'épinglage/désépinglage du message:', error);
    }
  };

  // Signaler un message
  const handleReportMessage = async (messageId: string) => {
    try {
      await messageService.reportMessage(messageId);
      
      // Mettre à jour l'état local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isReported: true } : msg
      ));
    } catch (error) {
      console.error('Erreur lors du signalement du message:', error);
    }
  };

  // Supprimer un message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      
      // Mettre à jour l'état local
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  // Créer une nouvelle conversation
  const handleCreateConversation = async (type: ConversationType, title: string | null, participantIds: string[]) => {
    try {
      setIsModalOpen(false);
      const conversation = await messageService.createConversation(type, title, participantIds);
      
      // Ajouter la nouvelle conversation à la liste et la sélectionner
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversationId(conversation.id);
      fetchMessages(conversation.id);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  // Filtrer les conversations si une recherche est en cours
  const filteredConversations = searchQuery
    ? conversations.filter(conv => {
        // Rechercher dans le titre pour les groupes
        if (conv.title && conv.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        
        // Rechercher dans les noms des participants pour les conversations privées
        return conv.participants.some(participant => {
          const profile = profiles[participant.userId];
          if (!profile) return false;
          
          return `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
        });
      })
    : conversations;

  // Ajouter le nouveau message à la liste quand il est reçu
  useEffect(() => {
    if (newMessage) {
      // Ajouter le message uniquement s'il n'est pas déjà dans la liste
      if (!messages.some(msg => msg.id === newMessage.id)) {
        setMessages(prev => [newMessage, ...prev]);
      }
    }
  }, [newMessage]);
  
  // Rafraîchir la liste des conversations quand nécessaire
  useEffect(() => {
    if (shouldRefresh && currentUserId) {
      fetchConversations();
      resetRefresh();
    }
  }, [shouldRefresh, currentUserId]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container flex-1 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messagerie</h1>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button 
              className="gap-1" 
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              <Users className="h-4 w-4" />
              Nouveau groupe
            </Button>
            
            <Button 
              className="gap-1"
              onClick={() => setIsModalOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
              Nouveau message
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Panel de gauche pour les conversations */}
          <div className="border rounded-lg h-[600px] flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ConversationList
              conversations={filteredConversations}
              currentUserId={currentUserId}
              selectedConversationId={selectedConversationId || undefined}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoadingConversations}
              profiles={profiles}
            />
          </div>
          
          {/* Panel de droite pour les messages */}
          <div className="border rounded-lg h-[600px] flex flex-col col-span-1 md:col-span-2">
            {selectedConversationId ? (
              <>
                {/* En-tête de la conversation */}
                <div className="p-3 border-b flex items-center justify-between">
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversationId);
                    if (!conversation) return <div>Chargement...</div>;
                    
                    let title = conversation.title;
                    
                    // Pour les conversations privées, afficher le nom de l'autre participant
                    if (conversation.type === 'private') {
                      const otherParticipant = conversation.participants.find(
                        p => p.userId !== currentUserId
                      );
                      
                      if (otherParticipant && profiles[otherParticipant.userId]) {
                        const profile = profiles[otherParticipant.userId];
                        title = `${profile.firstName} ${profile.lastName}`;
                      }
                    }
                    
                    return (
                      <div className="font-medium">{title || 'Conversation'}</div>
                    );
                  })()}
                </div>
                
                {/* Liste des messages */}
                <MessageList
                  messages={messages}
                  currentUserId={currentUserId}
                  onPinMessage={handlePinMessage}
                  onReportMessage={handleReportMessage}
                  onDeleteMessage={handleDeleteMessage}
                  isLoading={isLoadingMessages}
                  profiles={profiles}
                  className="flex-1"
                />
                
                {/* Champ de saisie */}
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  isLoading={isSending}
                  className="border-t"
                />
              </>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Sélectionnez une conversation pour afficher les messages</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 gap-1"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal pour nouvelle conversation */}
      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateConversation={handleCreateConversation}
        availableProfiles={availableProfiles}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default MessagesPage; 