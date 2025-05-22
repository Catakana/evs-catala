
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Grid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrombinoscopeHeaderProps {
  onViewChange?: (view: 'grid' | 'list') => void;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (filter: string) => void;
}

const TrombinoscopeHeader: React.FC<TrombinoscopeHeaderProps> = ({
  onViewChange = () => {},
  onSearchChange = () => {},
  onFilterChange = () => {},
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
    onViewChange(newView);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trombinoscope</h1>
          <p className="text-muted-foreground">
            Retrouvez tous les membres de l'association
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Rechercher un membre..." 
              className="pl-10 w-full md:w-[250px]"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue={view} className="hidden md:flex">
            <TabsList>
              <TabsTrigger 
                value="grid" 
                onClick={() => handleViewChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                onClick={() => handleViewChange('list')}
              >
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={activeFilter === 'all' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => handleFilterChange('all')}
        >
          Tous
        </Badge>
        <Badge 
          variant={activeFilter === 'admin' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => handleFilterChange('admin')}
        >
          Administration
        </Badge>
        <Badge 
          variant={activeFilter === 'staff' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => handleFilterChange('staff')}
        >
          Staff
        </Badge>
        <Badge 
          variant={activeFilter === 'member' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => handleFilterChange('member')}
        >
          Membres
        </Badge>
        <Badge 
          variant={activeFilter === 'volunteer' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => handleFilterChange('volunteer')}
        >
          Bénévoles
        </Badge>
      </div>
    </div>
  );
};

export default TrombinoscopeHeader;
