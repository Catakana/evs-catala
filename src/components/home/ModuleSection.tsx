
import React from 'react';
import ModuleGrid from '../modules/ModuleGrid';
import { cn } from '@/lib/utils';

interface ModuleSectionProps {
  className?: string;
}

const ModuleSection: React.FC<ModuleSectionProps> = ({ className }) => {
  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-2xl font-bold mb-2">Modules disponibles</h2>
      <p className="text-muted-foreground mb-6">
        Explorez les fonctionnalités du portail EVS CATALA
      </p>
      <ModuleGrid />
    </section>
  );
};

export default ModuleSection;
