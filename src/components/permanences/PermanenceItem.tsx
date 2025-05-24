import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Permanence, PermanenceStatus } from '@/types/permanence';
import { cn } from '@/lib/utils';
import { User, Users, Clock, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermanenceItemProps {
  permanence: Permanence;
  onClick: () => void;
  isCompact?: boolean;
  isUserRegistered?: boolean;
  onRegister?: (permanenceId: string) => Promise<void>;
  onUnregister?: (permanenceId: string) => Promise<void>;
  currentUserId?: string;
}

const PermanenceItem: React.FC<PermanenceItemProps> = ({ 
  permanence, 
  onClick,
  isCompact = false,
  isUserRegistered = false,
  onRegister,
  onUnregister,
  currentUserId
}) => {
  // Log pour vérifier si les permanences et l'ID utilisateur sont correctement passés
  useEffect(() => {
    console.log("PermanenceItem rendered:", {
      permanenceId: permanence.id,
      isUserRegistered,
      currentUserId,
      hasCallbacks: !!onRegister && !!onUnregister
    });
  }, [permanence.id, isUserRegistered, currentUserId, onRegister, onUnregister]);

  const statusColors = {
    [PermanenceStatus.OPEN]: "bg-emerald-500 hover:bg-emerald-600",
    [PermanenceStatus.FULL]: "bg-amber-500 hover:bg-amber-600",
    [PermanenceStatus.CANCELED]: "bg-slate-500 hover:bg-slate-600 line-through",
    [PermanenceStatus.COMPLETED]: "bg-slate-600 hover:bg-slate-700"
  };

  const statusClass = statusColors[permanence.status] || "bg-slate-500 hover:bg-slate-600";

  const canRegister = currentUserId && 
    permanence.status === PermanenceStatus.OPEN && 
    (permanence.participants?.length || 0) < (permanence.max_volunteers || permanence.required_volunteers);

  const handleRegisterClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher l'ouverture de la modal
    console.log("Register button clicked:", { 
      isUserRegistered, 
      permanenceId: permanence.id,
      userId: currentUserId 
    });
    try {
      if (isUserRegistered && onUnregister) {
        await onUnregister(permanence.id);
      } else if (onRegister) {
        await onRegister(permanence.id);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription/désinscription:", error);
    }
  };

  if (isCompact) {
    return (
      <div className="relative">
        <div 
          onClick={onClick}
          className={cn(
            "px-1 py-0.5 rounded text-xs text-white cursor-pointer",
            statusClass
          )}
        >
          <div className="font-medium truncate">{permanence.title || "Permanence"}</div>
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            <span>{format(new Date(permanence.start_date), 'HH:mm', { locale: fr })}</span>
          </div>
        </div>
        
        <Button
          variant={isUserRegistered ? "destructive" : "default"}
          size="sm"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 shadow-lg border border-white z-10"
          onClick={handleRegisterClick}
        >
          {isUserRegistered ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        onClick={onClick}
        className={cn(
          "px-2 py-1 rounded text-sm mb-1 cursor-pointer text-white",
          statusClass
        )}
      >
        <div className="font-medium truncate">{permanence.title || "Permanence"}</div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {format(new Date(permanence.start_date), 'HH:mm', { locale: fr })} - 
              {format(new Date(permanence.end_date), 'HH:mm', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{permanence.participants?.length || 0}/{permanence.required_volunteers}</span>
          </div>
        </div>
      </div>
      
      <Button
        variant={isUserRegistered ? "destructive" : "default"}
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-lg border border-white z-10"
        onClick={handleRegisterClick}
      >
        {isUserRegistered ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      </Button>
    </div>
  );
};

export default PermanenceItem;
