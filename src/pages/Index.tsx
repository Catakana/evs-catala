
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Welcome from '@/components/home/Welcome';
import ModuleSection from '@/components/home/ModuleSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-8">
        <Welcome />
        <ModuleSection className="mt-12" />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
