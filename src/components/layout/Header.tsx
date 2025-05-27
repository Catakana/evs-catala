import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut, PenTool, Monitor, AlertTriangle, LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { getText as t } from '@/lib/textBank';
import MessageNotification from '@/components/messages/MessageNotification';
import { QuickNoteModal } from '@/components/notes/QuickNoteModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading } = useAuth();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-evs-blue">
          <img 
            src="/logo-evs-catala.svg" 
            alt="EVS CATALA Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback if logo doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
          <span>Portail EVS CATALA</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification de déconnexion - visible seulement si pas connecté et pas en cours de chargement */}
          {!loading && !user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">Non connecté</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="h-6 px-2 text-xs border-orange-300 hover:bg-orange-100"
              >
                <LogIn className="h-3 w-3 mr-1" />
                Connexion
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          
          {/* Bouton d'accès rapide à l'affichage public - toujours visible */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.open('/public-display', '_blank')}
            title="Ouvrir l'affichage public"
            className="hover:bg-green-50 hover:text-green-600"
          >
            <Monitor className="h-5 w-5" />
            <span className="sr-only">Affichage public</span>
          </Button>
          
          {!loading && user && (
            <>
              <MessageNotification userId={user.id} />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsNoteModalOpen(true)}
                title="Nouvelle note rapide"
                className="hover:bg-blue-50 hover:text-blue-600"
              >
                <PenTool className="h-5 w-5" />
                <span className="sr-only">Nouvelle note</span>
              </Button>
            </>
          )}
          
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userProfile ? `${userProfile.firstname} ${userProfile.lastname}` : user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => navigate('/login')}>
                {t('auth.login')}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Modal de création de note */}
      <QuickNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteSaved={() => setIsNoteModalOpen(false)}
      />
    </header>
  );
};

export default Header;
