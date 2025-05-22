import React from 'react';
import { cn } from "@/lib/utils";
import AgendaModuleCard from '@/components/modules/AgendaModuleCard';
import PermanencesModuleCard from '@/components/modules/PermanencesModuleCard';
import TrombinoscopeModuleCard from '@/components/modules/TrombinoscopeModuleCard';
import AnnouncementsModuleCard from '@/components/modules/AnnouncementsModuleCard';
import VotesModuleCard from '@/components/modules/VotesModuleCard';
import ProjectsModuleCard from '@/components/modules/ProjectsModuleCard';
import MessageryModuleCard from '@/components/modules/MessageryModuleCard';
import InfosModuleCard from '@/components/modules/InfosModuleCard';

interface ModuleSectionProps {
  className?: string;
}

const ModuleSection: React.FC<ModuleSectionProps> = ({ className }) => {
  return (
    <section className={cn("", className)}>
      <h2 className="text-2xl font-bold mb-6">Modules disponibles</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AgendaModuleCard />
        <PermanencesModuleCard />
        <AnnouncementsModuleCard />
        <TrombinoscopeModuleCard />
        <VotesModuleCard />
        <ProjectsModuleCard />
        <MessageryModuleCard />
        <InfosModuleCard />
      </div>
    </section>
  );
};

export default ModuleSection;
