import React, { useState } from 'react';
import TrombinoscopeHeader from '@/components/trombinoscope/TrombinoscopeHeader';
import MembersList from '@/components/trombinoscope/MembersList';

const TrombinoscopePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="container py-6">
      <TrombinoscopeHeader 
        onViewChange={setViewMode}
        onSearchChange={setSearchQuery}
        onFilterChange={setActiveFilter}
      />
      <MembersList 
        viewMode={viewMode}
        searchQuery={searchQuery}
        filter={activeFilter}
      />
    </div>
  );
};

export default TrombinoscopePage;
