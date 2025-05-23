import React from 'react';
import { t } from '@/lib/textBank';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-muted py-6 border-t ${className}`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground mb-4 md:mb-0">
          {t('app.footer')}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <a href="#" className="hover:underline mr-4">Mentions légales</a>
          <a href="#" className="hover:underline mr-4">Politique de confidentialité</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
