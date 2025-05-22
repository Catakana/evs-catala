import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ClipboardList, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const ProjectsModuleCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Projets</CardTitle>
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Suivez les projets et activités</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Budgets, tâches et équipes</p>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate('/projects')}
        >
          Gérer les projets
        </Button>
      </div>
    </Card>
  );
};

export default ProjectsModuleCard; 