export type ConversationType = 'private' | 'group';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Profile {
  firstname: string;
  lastname: string;
  avatarUrl?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  createdAt: Date;
}

export interface MessagePreview {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  isReported: boolean;
  isPinned: boolean;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  isAdmin?: boolean;
  joinedAt: Date;
  lastReadAt?: Date;
  profile?: Profile;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string; // Optionnel pour les conversations privées
  participants: ConversationParticipant[];
  lastMessageId?: string;
  lastMessageAt?: Date;
  lastMessage?: MessagePreview; // Pour l'affichage dans la liste des conversations
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 