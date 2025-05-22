
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Member } from '@/types/member';
import { MemberDetailModal } from './MemberDetailModal';

interface MemberCardProps {
  member: Member;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
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
      <Card className="overflow-hidden">
        <CardHeader className="p-0 pb-4">
          <div className="bg-muted h-24 flex items-center justify-center">
            <Avatar className="w-16 h-16 border-4 border-background">
              <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div>
            <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
            <Badge variant={getBadgeVariant(member.role)} className="mt-1">
              {member.role}
            </Badge>
          </div>
          
          {member.groups && member.groups.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {member.groups.map((group, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {group}
                </Badge>
              ))}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full" 
            onClick={() => setIsDetailOpen(true)}
          >
            Voir la fiche
          </Button>
        </CardContent>
      </Card>
      
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
