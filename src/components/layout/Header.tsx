import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authService } from '@/lib/supabase';
import { t } from '@/lib/textBank';
import { UserProfile } from '@/lib/supabase';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          const profile = await authService.getUserProfile(user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setUserProfile(null);
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
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          
          {!isLoading && (
            currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profil</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userProfile ? `${userProfile.firstname} ${userProfile.lastname}` : currentUser.email}
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
    </header>
  );
};

export default Header;
