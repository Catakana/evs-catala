import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const TrombinoscopeModuleCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Trombinoscope</CardTitle>
          <UserCircle className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Découvrez les membres de l'association</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Profils et contacts des membres</p>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate('/trombinoscope')}
        >
          Consulter le trombinoscope
        </Button>
      </div>
    </Card>
  );
};

export default TrombinoscopeModuleCard; 