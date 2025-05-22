
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/member';
import { Mail, Phone, Users, FolderKanban } from 'lucide-react';

interface MemberDetailModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  // Generate initials for the avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Determine badge color based on role
  const getBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'default';
      case 'staff':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Determine badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Function to translate status to French
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fiche membre</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="text-2xl">{getInitials(member.firstName, member.lastName)}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">{member.firstName} {member.lastName}</h2>
            <div className="flex gap-2 justify-center mt-2">
              <Badge variant={getBadgeVariant(member.role)}>{member.role}</Badge>
              <Badge variant={getStatusBadgeVariant(member.status)}>{getStatusLabel(member.status)}</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Contact information */}
          {(member.email || member.phone) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Contact</h3>
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Groups */}
          {member.groups && member.groups.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">Groupes / Commissions</h3>
              </div>
              <div className="flex flex-wrap gap-1">
                {member.groups.map((group, index) => (
                  <Badge key={index} variant="outline">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Projects */}
          {member.projects && member.projects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">Projets</h3>
              </div>
              <div className="flex flex-wrap gap-1">
                {member.projects.map((project, index) => (
                  <Badge key={index} variant="outline">
                    {project}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
