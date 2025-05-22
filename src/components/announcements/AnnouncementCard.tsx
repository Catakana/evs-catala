
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Announcement } from '@/types/announcement';
import { Button } from '../ui/button';
import { useAnnouncementStore } from '@/hooks/useAnnouncementStore';
import { cn } from '@/lib/utils';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const { selectAnnouncement } = useAnnouncementStore();
  const isRead = true; // Mock - in real app, would come from user's read status

  const categoryStyles = {
    urgent: "bg-red-500",
    info: "bg-blue-500",
    event: "bg-green-500",
    project: "bg-purple-500"
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md cursor-pointer",
      !isRead && "border-l-4 border-l-blue-500"
    )}
    onClick={() => selectAnnouncement(announcement)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
          <Badge className={cn(categoryStyles[announcement.category as keyof typeof categoryStyles])}>
            {announcement.category}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {formatDistanceToNow(new Date(announcement.publishDate), { addSuffix: true, locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="line-clamp-3 text-sm mb-4">
          {announcement.content}
        </div>
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {announcement.attachments.length} pièce(s) jointe(s)
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground">Par {announcement.authorName}</div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;
