
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeProps {
  className?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ className }) => {
  return (
    <section className={cn("text-center py-8", className)}>
      <div className="animate-float inline-block mb-6 p-3 bg-evs-blue/10 rounded-full text-evs-blue">
        <Calendar className="h-12 w-12" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">
        Bienvenue sur le Portail EVS CATALA
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Une plateforme conçue pour faciliter la gestion et la communication au sein de votre association.
        Découvrez les différents modules disponibles ci-dessous.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Button className="bg-evs-blue hover:bg-evs-blue-dark">
          Commencer
        </Button>
        <Button variant="outline">
          En savoir plus
        </Button>
      </div>
    </section>
  );
};

export default Welcome;
