import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Megaphone, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const AnnouncementsModuleCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Annonces</CardTitle>
          <Megaphone className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Consultez les dernières annonces</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Informations et communications</p>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate('/announcements')}
        >
          Voir les annonces
        </Button>
      </div>
    </Card>
  );
};

export default AnnouncementsModuleCard; 