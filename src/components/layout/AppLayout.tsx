import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from '@/components/ui/BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  showHeader?: boolean;
}

/**
 * Layout principal de l'application
 * Intègre l'en-tête, le pied de page et la navigation inférieure
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showFooter = true,
  showHeader = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      
      <main className="flex-1 pb-20">
        {children}
      </main>

      <BottomNav />
      
      {showFooter && <Footer className="mt-20" />}
    </div>
  );
};

export default AppLayout; 