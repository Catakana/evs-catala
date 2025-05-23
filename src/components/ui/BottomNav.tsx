import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Users,
  FileText,
  Bell,
  MessageSquare,
  Info,
  User,
  ChevronUp,
  Grid,
  Vote,
  Settings,
  LogOut,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/textBank';
import { useAuth } from '@/contexts/AuthContext';

// Définition des catégories de navigation et leurs items
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

/**
 * Barre de navigation inférieure responsive pour toutes les résolutions
 * Avec sous-menus organisés en catégories
 */
const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setActiveCategory(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Catégories et items de navigation
  const navCategories: NavCategory[] = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: <Home size={24} />,
      items: [
        { path: '/', label: t('nav.home'), icon: <Home size={20} /> }
      ]
    },
    {
      id: 'organisation',
      label: 'Organisation',
      icon: <Grid size={24} />,
      items: [
        { path: '/agenda', label: t('nav.agenda'), icon: <Calendar size={20} /> },
        { path: '/permanences', label: t('nav.permanences'), icon: <FileText size={20} /> },
        { path: '/projects', label: 'Projets', icon: <Briefcase size={20} /> },
        { path: '/votes', label: t('nav.votes'), icon: <Vote size={20} /> },
        { path: '/announcements', label: t('nav.announcements'), icon: <Bell size={20} /> }
      ]
    },
    {
      id: 'infos',
      label: 'Infos',
      icon: <Info size={24} />,
      items: [
        { path: '/messages', label: t('nav.messages'), icon: <MessageSquare size={20} /> },
        { path: '/trombinoscope', label: t('nav.trombinoscope'), icon: <Users size={20} /> },
        { path: '/infos', label: t('nav.infos'), icon: <Info size={20} /> }
      ]
    },
    {
      id: 'profile',
      label: t('profile.title'),
      icon: <User size={24} />,
      items: [
        { path: '/profile', label: t('profile.title'), icon: <User size={20} /> },
        { path: '/settings', label: 'Paramètres', icon: <Settings size={20} /> },
        { path: 'logout', label: t('auth.logout'), icon: <LogOut size={20} /> }
      ]
    }
  ];

  // Trouver la catégorie active en fonction du chemin actuel
  const findActiveCategory = () => {
    const currentPath = location.pathname;
    
    // Cas spécial pour la page d'accueil
    if (currentPath === '/') {
      return 'home';
    }
    
    // Trouver la catégorie qui contient l'item correspondant au chemin actuel
    for (const category of navCategories) {
      const matchingItem = category.items.find(item => 
        currentPath === item.path || currentPath.startsWith(`${item.path}/`)
      );
      
      if (matchingItem) {
        return category.id;
      }
    }
    
    return null;
  };

  // Gérer le comportement de défilement pour masquer/afficher la barre
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Toujours visible en haut de page
        setIsScrollingUp(true);
      } else if (currentScrollY < lastScrollY) {
        // Défilement vers le haut
        setIsScrollingUp(true);
      } else if (currentScrollY > lastScrollY + 5) {
        // Défilement vers le bas (avec seuil pour éviter les petits mouvements)
        setIsScrollingUp(false);
        // Fermer les sous-menus au défilement vers le bas
        setActiveCategory(null);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Basculer l'état d'un sous-menu
  const toggleCategory = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryId);
    }
  };

  // Trouver la catégorie active pour le rendu du sous-menu
  const activeSubMenu = activeCategory ? navCategories.find(cat => cat.id === activeCategory) : null;

  // Lien direct pour les items
  const handleItemClick = (category: NavCategory) => {
    if (category.id === 'home') {
      // Accueil est un lien direct
      window.location.href = '/';
    } else if (category.items.length === 1) {
      // Si la catégorie n'a qu'un seul item, c'est un lien direct aussi
      window.location.href = category.items[0].path;
    } else {
      // Sinon, afficher le sous-menu
      toggleCategory(category.id);
    }
  };

  // Gérer les clics sur les items du menu
  const handleMenuItemClick = (item: NavItem) => {
    setActiveCategory(null);
    
    // Cas spécial pour la déconnexion
    if (item.path === 'logout') {
      handleLogout();
      return;
    }
    
    // Navigation normale pour les autres items
    navigate(item.path);
  };

  return (
    <div className="relative">
      {/* Fond semi-transparent quand un sous-menu est ouvert */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCategory(null)}
          />
        )}
      </AnimatePresence>

      {/* Sous-menu central qui s'ouvre vers le haut */}
      <AnimatePresence>
        {activeSubMenu && activeCategory !== 'home' && (
          <motion.div
            className="fixed left-0 right-0 bottom-16 mx-auto bg-background/95 backdrop-blur-sm rounded-t-xl border border-border shadow-lg z-50 max-w-xs"
            style={{ width: 'calc(100% - 2rem)' }}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between py-3 px-4 border-b">
              <h3 className="font-medium">{activeSubMenu.label}</h3>
              <ChevronUp size={16} className="text-muted-foreground" />
            </div>
            
            <div className="py-2">
              {activeSubMenu.items.map((item) => (
                <div
                  key={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-accent/60 transition-colors cursor-pointer",
                    location.pathname === item.path && "bg-accent/80 text-primary"
                  )}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-muted">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      className="ml-auto w-2 h-2 rounded-full bg-primary"
                      layoutId={`indicator-${item.path}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de navigation inférieure */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-background/90 backdrop-blur-md border-t border-border z-50 shadow-md"
        initial={{ y: 0 }}
        animate={{ y: isScrollingUp ? 0 : 100 }}
        transition={{ duration: 0.3 }}
      >
        {navCategories.map((category) => (
          <div key={category.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex flex-col items-center justify-center h-16 w-16 sm:w-20 rounded-none relative",
                findActiveCategory() === category.id && "text-primary",
                activeCategory === category.id && "bg-accent/50"
              )}
              onClick={() => handleItemClick(category)}
            >
              <div className="relative">
                {findActiveCategory() === category.id && (
                  <motion.div
                    className="absolute inset-0 -z-10 bg-primary/10 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {category.icon}
                
                {activeCategory === category.id && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
              <motion.span 
                className="text-xs mt-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {category.label}
              </motion.span>
              
              {findActiveCategory() === category.id && (
                <motion.div
                  className="absolute -bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-10 bg-primary rounded-t-full"
                  layoutId="bottomNavIndicator"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </Button>
          </div>
        ))}
      </motion.nav>
    </div>
  );
};

export default BottomNav; 