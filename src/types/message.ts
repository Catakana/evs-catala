export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ConversationType = 'private' | 'group';

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
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
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string; // Optionnel pour les conversations privées
  participants: ConversationParticipant[];
  lastMessageId?: string;
  lastMessageAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 