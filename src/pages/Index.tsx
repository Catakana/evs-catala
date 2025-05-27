import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Welcome from '@/components/home/Welcome';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import ModuleSection from '@/components/home/ModuleSection';

const Index = () => {
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  
  // Transformations parallax pour le fond
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Welcome />
        <UpcomingEvents />
        <ModuleSection />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond dégradé animé avec parallax */}
      <div className="fixed inset-0 -z-10">
        {/* Couche de base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50" />
        
        {/* Formes géométriques animées en arrière-plan */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y2, opacity }}
          className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/20 to-blue-300/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-300/20 rounded-full blur-3xl"
        />
        
        {/* Grille subtile */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Contenu principal */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Welcome />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <UpcomingEvents />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ModuleSection />
          </motion.div>
        </div>
      </motion.div>

      {/* Particules flottantes décoratives */}
      <div className="fixed inset-0 pointer-events-none -z-5">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
