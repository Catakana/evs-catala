
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Permanence } from '@/types/permanence';
import { cn } from '@/lib/utils';
import { User, Users, Clock } from 'lucide-react';

interface PermanenceItemProps {
  permanence: Permanence;
  onClick: () => void;
  isCompact?: boolean;
}

const PermanenceItem: React.FC<PermanenceItemProps> = ({ 
  permanence, 
  onClick,
  isCompact = false
}) => {
  const statusColors = {
    confirmed: "bg-emerald-500 hover:bg-emerald-600",
    pending: "bg-amber-500 hover:bg-amber-600",
    canceled: "bg-slate-500 hover:bg-slate-600 line-through"
  };

  const statusClass = statusColors[permanence.status];

  if (isCompact) {
    return (
      <div 
        onClick={onClick}
        className={cn(
          "px-1 py-0.5 rounded text-xs text-white cursor-pointer",
          statusClass
        )}
      >
        <div className="font-medium truncate">{permanence.title}</div>
        <div className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          <span>{format(permanence.startDate, 'HH:mm', { locale: fr })}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-sm mb-1 cursor-pointer text-white",
        statusClass
      )}
    >
      <div className="font-medium truncate">{permanence.title}</div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {format(permanence.startDate, 'HH:mm', { locale: fr })} - 
            {format(permanence.endDate, 'HH:mm', { locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{permanence.participants.length}/{permanence.maxMembers}</span>
        </div>
      </div>
    </div>
  );
};

export default PermanenceItem;
