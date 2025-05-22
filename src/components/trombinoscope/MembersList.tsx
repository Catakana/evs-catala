
import React, { useState } from 'react';
import { MemberCard } from './MemberCard';
import { MemberListItem } from './MemberListItem';
import { useMemberData } from '@/hooks/useMemberData';

const MembersList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
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

  // Handle view mode changes from header
  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Handle search changes from header
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes from header
  const handleFilterChange = (selectedFilter: string) => {
    setFilter(selectedFilter);
  };

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
      {/* Pass the handlers to the TrombinoscopeHeader */}
      <div style={{ display: 'none' }}>
        {/* This is for demonstration, these props would normally go to TrombinoscopeHeader */}
        <button onClick={() => handleViewChange('grid')}>Grid</button>
        <button onClick={() => handleSearchChange('search')}>Search</button>
        <button onClick={() => handleFilterChange('filter')}>Filter</button>
      </div>
      
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
