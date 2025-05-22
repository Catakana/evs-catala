import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Paperclip, Download, File, FileImage, FileText } from 'lucide-react';
import { Announcement } from '../../types/announcement';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

interface AnnouncementDetailModalProps {
  announcement: Announcement;
  onClose: () => void;
}

const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({ announcement, onClose }) => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = React.useState(true); // Mock admin status

  const categoryStyles = {
    urgent: "bg-red-500",
    info: "bg-blue-500",
    event: "bg-green-500",
    project: "bg-purple-500"
  };

  const getFileIcon = (attachment: string) => {
    const ext = attachment.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <File className="h-5 w-5" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const handleArchive = () => {
    toast({
      title: "Annonce archivée",
      description: "L'annonce a été archivée avec succès."
    });
    onClose();
  };

  const handleDelete = () => {
    toast({
      title: "Annonce supprimée",
      description: "L'annonce a été supprimée avec succès."
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl">{announcement.title}</DialogTitle>
            <Badge className={cn(categoryStyles[announcement.category as keyof typeof categoryStyles])}>
              {announcement.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(announcement.publishDate), 'PPP', { locale: fr })}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="whitespace-pre-wrap text-sm">
            {announcement.content}
          </div>
          
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Pièces jointes ({announcement.attachments.length})
              </h3>
              
              <div className="space-y-2">
                {announcement.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getFileIcon(attachment)}
                    <span className="text-sm flex-grow truncate">
                      {attachment.split('/').pop()}
                    </span>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3 w-3" />
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            Publié par {announcement.authorName}
          </div>
        </div>
        
        {isAdmin && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleArchive}>
              Archiver
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDetailModal;
