import React from 'react';
import TrombinoscopeHeader from '@/components/trombinoscope/TrombinoscopeHeader';
import MembersList from '@/components/trombinoscope/MembersList';

const TrombinoscopePage: React.FC = () => {
  return (
    <div className="container py-6">
      <TrombinoscopeHeader />
      <MembersList />
    </div>
  );
};

export default TrombinoscopePage;
