import React from 'react';
import { MemberCard } from './MemberCard';
import { MemberListItem } from './MemberListItem';
import { useMemberData } from '@/hooks/useMemberData';

interface MembersListProps {
  viewMode?: 'grid' | 'list';
  searchQuery?: string;
  filter?: string;
}

const MembersList: React.FC<MembersListProps> = ({
  viewMode = 'grid',
  searchQuery = '',
  filter = 'all'
}) => {
  // Get member data from our custom hook
  const { members, isLoading } = useMemberData();
  
  // Filter members based on search query and selected filter
  const filteredMembers = React.useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchQuery === '' || 
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || member.role.toLowerCase() === filter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  }, [members, searchQuery, filter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p>Chargement des membres...</p>
      </div>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p>Aucun membre ne correspond à votre recherche.</p>
      </div>
    );
  }

  return (
    <div>      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <MemberListItem key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersList;
