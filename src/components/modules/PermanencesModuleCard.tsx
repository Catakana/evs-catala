import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const PermanencesModuleCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Permanences</CardTitle>
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Gérez les permanences de l'association</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Planning des bénévoles</p>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate('/permanences')}
        >
          Gérer les permanences
        </Button>
      </div>
    </Card>
  );
};

export default PermanencesModuleCard; 