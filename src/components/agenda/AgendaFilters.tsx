import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { eventService, EventFilters } from '@/lib/eventService';

interface AgendaFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}) => {
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);
  const categoryOptions = eventService.getCategoryOptions();

  // Appliquer les filtres
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onToggle();
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    const emptyFilters: EventFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  // Gérer la sélection des catégories
  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    const currentCategories = localFilters.categories || [];
    
    if (checked) {
      setLocalFilters({
        ...localFilters,
        categories: [...currentCategories, categoryValue]
      });
    } else {
      setLocalFilters({
        ...localFilters,
        categories: currentCategories.filter(cat => cat !== categoryValue)
      });
    }
  };

  // Compter les filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.location) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="relative"
      >
        <Filter className="mr-1 h-4 w-4" />
        Filtrer
        {activeFiltersCount > 0 && (
          <Badge 
            className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 text-white"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtres</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Filtres par catégorie */}
            <div>
              <Label className="text-sm font-medium">Catégories</Label>
              <div className="mt-2 space-y-2">
                {categoryOptions.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={localFilters.categories?.includes(category.value) || false}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.value, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`category-${category.value}`}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <div className={cn("w-3 h-3 rounded", category.color)} />
                      <span>{category.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtre par date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-medium">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !localFilters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateFrom ? (
                        format(new Date(localFilters.dateFrom), "dd/MM/yyyy", { locale: fr })
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateFrom ? new Date(localFilters.dateFrom) : undefined}
                      onSelect={(date) => 
                        setLocalFilters({
                          ...localFilters,
                          dateFrom: date ? format(date, 'yyyy-MM-dd') : undefined
                        })
                      }
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-medium">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !localFilters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateTo ? (
                        format(new Date(localFilters.dateTo), "dd/MM/yyyy", { locale: fr })
                      ) : (
                        "Sélectionner"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateTo ? new Date(localFilters.dateTo) : undefined}
                      onSelect={(date) => 
                        setLocalFilters({
                          ...localFilters,
                          dateTo: date ? format(date, 'yyyy-MM-dd') : undefined
                        })
                      }
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filtre par lieu */}
            <div>
              <Label htmlFor="location-filter" className="text-sm font-medium">
                Lieu
              </Label>
              <Input
                id="location-filter"
                placeholder="Rechercher par lieu..."
                value={localFilters.location || ''}
                onChange={(e) => 
                  setLocalFilters({
                    ...localFilters,
                    location: e.target.value || undefined
                  })
                }
                className="mt-1"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Réinitialiser
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilters}
              >
                Appliquer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgendaFilters; 