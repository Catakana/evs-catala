import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Grid } from 'lucide-react';
import { getText } from '@/lib/textBank';
import AnnouncementsModuleCard from '@/components/modules/AnnouncementsModuleCard';
import AgendaModuleCard from '@/components/modules/AgendaModuleCard';
import PermanencesModuleCard from '@/components/modules/PermanencesModuleCard';
import { VotesModuleCard } from '@/components/modules/VotesModuleCard';
import TrombinoscopeModuleCard from '@/components/modules/TrombinoscopeModuleCard';
import ProjectsModuleCard from '@/components/modules/ProjectsModuleCard';
import MessageryModuleCard from '@/components/modules/MessageryModuleCard';
import InfosModuleCard from '@/components/modules/InfosModuleCard';

const ModuleSection: React.FC = () => {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);

  const moduleComponents = [
    AnnouncementsModuleCard,
    AgendaModuleCard,
    PermanencesModuleCard,
    VotesModuleCard,
    TrombinoscopeModuleCard,
    ProjectsModuleCard,
    MessageryModuleCard,
    InfosModuleCard,
  ];

  return (
    <div className="space-y-8">
      {/* En-tête de section */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="inline-flex items-center gap-3 mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Grid className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Modules disponibles
          </h2>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6 text-purple-500" />
          </motion.div>
        </motion.div>
        
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Explorez tous les outils à votre disposition pour une gestion optimale de l'association. 
          Chaque module est conçu pour simplifier vos tâches quotidiennes. ✨
        </motion.p>
      </motion.div>

      {/* Grille des modules avec animations */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {moduleComponents.map((ModuleComponent, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.1 * index,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <ModuleComponent />
          </motion.div>
        ))}
      </motion.div>

      {/* Message d'encouragement */}
      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-3"
          >
            <span className="text-3xl">🚀</span>
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Prêt à commencer votre aventure ?
          </h3>
          <p className="text-gray-600">
            Chaque module vous attend pour découvrir de nouvelles possibilités de collaboration et d'organisation. 
            L'avenir de votre association commence ici ! 💫
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ModuleSection;
