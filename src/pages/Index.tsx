import React from 'react';
import Welcome from '@/components/home/Welcome';
import ModuleSection from '@/components/home/ModuleSection';

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Welcome />
      <ModuleSection />
    </div>
  );
};

export default Index;
