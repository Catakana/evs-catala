import React from 'react';
import AgendaModuleCard from './AgendaModuleCard';
import PermanencesModuleCard from './PermanencesModuleCard';
import TrombinoscopeModuleCard from './TrombinoscopeModuleCard';
import AnnouncementModuleCard from './AnnouncementModuleCard';

const ModuleGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AgendaModuleCard />
      <PermanencesModuleCard />
      <TrombinoscopeModuleCard />
      <AnnouncementModuleCard />
      {/* Add more module cards here */}
    </div>
  );
};

export default ModuleGrid;
