
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Member } from '@/types/member';
import { MemberDetailModal } from './MemberDetailModal';

interface MemberListItemProps {
  member: Member;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({ member }) => {
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  
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

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getBadgeVariant(member.role)}>
                {member.role}
              </Badge>
              {member.groups && member.groups.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {member.groups.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsDetailOpen(true)}
        >
          Voir la fiche
        </Button>
      </div>
      
      {isDetailOpen && (
        <MemberDetailModal 
          member={member}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
};
