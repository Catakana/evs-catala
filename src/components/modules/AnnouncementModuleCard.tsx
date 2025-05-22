
import React from 'react';
import { Bell } from 'lucide-react';
import ModuleCard from './ModuleCard';

const AnnouncementModuleCard: React.FC = () => {
  return (
    <ModuleCard
      icon={<Bell className="h-8 w-8" />}
      title="Annonces"
      description="Consultez les dernières annonces et informations importantes"
      href="/announcements"
      bgColor="bg-amber-100"
      iconColor="text-amber-500"
    />
  );
};

export default AnnouncementModuleCard;
