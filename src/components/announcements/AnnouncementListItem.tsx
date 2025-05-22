
import React from 'react';
import { Announcement } from '@/types/announcement';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAnnouncementStore } from '@/hooks/useAnnouncementStore';
import { cn } from '@/lib/utils';

interface AnnouncementListItemProps {
  announcement: Announcement;
}

const AnnouncementListItem: React.FC<AnnouncementListItemProps> = ({ announcement }) => {
  const { selectAnnouncement } = useAnnouncementStore();
  const isRead = true; // Mock - in real app, would come from user's read status

  const categoryStyles = {
    urgent: "bg-red-500",
    info: "bg-blue-500",
    event: "bg-green-500",
    project: "bg-purple-500"
  };

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        !isRead && "border-l-4 border-l-blue-500"
      )}
      onClick={() => selectAnnouncement(announcement)}
    >
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lg">{announcement.title}</h3>
            <Badge className={cn("ml-2 whitespace-nowrap", categoryStyles[announcement.category as keyof typeof categoryStyles])}>
              {announcement.category}
            </Badge>
          </div>
          
          <p className="line-clamp-2 text-sm mb-2">{announcement.content}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(announcement.publishDate), { addSuffix: true, locale: fr })}
            </div>
            
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {announcement.attachments.length} pièce(s) jointe(s)
              </div>
            )}
            
            <span>Par {announcement.authorName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementListItem;
