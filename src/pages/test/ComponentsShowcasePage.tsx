import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import UIComponentsShowcase from '@/components/ui/UIComponentsShowcase';

/**
 * Page de documentation des composants UI
 * Cette page présente le système de design et les composants UI disponibles
 */
const ComponentsShowcasePage: React.FC = () => {
  return (
    <AppLayout>
      <UIComponentsShowcase />
    </AppLayout>
  );
};

export default ComponentsShowcasePage; 