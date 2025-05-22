
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TrombinoscopeHeader from '@/components/trombinoscope/TrombinoscopeHeader';
import MembersList from '@/components/trombinoscope/MembersList';

const TrombinoscopePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-6">
        <TrombinoscopeHeader />
        <MembersList />
      </main>
      <Footer />
    </div>
  );
};

export default TrombinoscopePage;
