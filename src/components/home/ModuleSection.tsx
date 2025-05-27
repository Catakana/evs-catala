import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getText } from '@/lib/textBank';
import AnnouncementsModuleCard from '@/components/modules/AnnouncementsModuleCard';
import AgendaModuleCard from '@/components/modules/AgendaModuleCard';
import PermanencesModuleCard from '@/components/modules/PermanencesModuleCard';
import { VotesModuleCard } from '@/components/modules/VotesModuleCard';
import TrombinoscopeModuleCard from '@/components/modules/TrombinoscopeModuleCard';
import ProjectsModuleCard from '@/components/modules/ProjectsModuleCard';
import MessageryModuleCard from '@/components/modules/MessageryModuleCard';
import InfosModuleCard from '@/components/modules/InfosModuleCard';

const ModuleSection: React.FC = () => {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnnouncementsModuleCard />
      <AgendaModuleCard />
      <PermanencesModuleCard />
      <VotesModuleCard />
      <TrombinoscopeModuleCard />
      <ProjectsModuleCard />
      <MessageryModuleCard />
      <InfosModuleCard />
    </div>
  );
};

export default ModuleSection;
