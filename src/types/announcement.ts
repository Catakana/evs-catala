
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string; // info, urgent, event, project, etc.
  authorId: string;
  authorName?: string; // For display purposes
  targetRoles?: string[]; // admin, staff, member, etc.
  targetGroups?: string[]; // specific groups
  publishDate: Date;
  expireDate?: Date;
  isArchived: boolean;
  attachments?: string[]; // URLs to attachments
  createdAt: Date;
}

export interface AnnouncementRead {
  id: string;
  userId: string;
  announcementId: string;
  readAt: Date;
}

export type AnnouncementCategory = 'info' | 'urgent' | 'event' | 'project';

export type AnnouncementStatus = 'published' | 'scheduled' | 'archived' | 'expired';

export type AnnouncementViewMode = 'list' | 'grid';
