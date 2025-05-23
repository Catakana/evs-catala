import React from 'react';
import AgendaModuleCard from '@/components/modules/AgendaModuleCard';
import PermanencesModuleCard from '@/components/modules/PermanencesModuleCard';
import TrombinoscopeModuleCard from '@/components/modules/TrombinoscopeModuleCard';
import AnnouncementsModuleCard from '@/components/modules/AnnouncementsModuleCard';
import VotesModuleCard from '@/components/modules/VotesModuleCard';
import ProjectsModuleCard from '@/components/modules/ProjectsModuleCard';
import MessageryModuleCard from '@/components/modules/MessageryModuleCard';
import InfosModuleCard from '@/components/modules/InfosModuleCard';

const ModuleSection: React.FC = () => {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Modules disponibles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AgendaModuleCard />
        <PermanencesModuleCard />
        <TrombinoscopeModuleCard />
        <AnnouncementsModuleCard />
        <VotesModuleCard />
        <ProjectsModuleCard />
        <MessageryModuleCard />
        <InfosModuleCard />
      </div>
    </section>
  );
};

export default ModuleSection;
