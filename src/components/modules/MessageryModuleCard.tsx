import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const MessageryModuleCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Messagerie</CardTitle>
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Communiquez avec les membres</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Conversations privées et groupes</p>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-4 mt-auto">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate('/messages')}
        >
          Accéder à la messagerie
        </Button>
      </div>
    </Card>
  );
};

export default MessageryModuleCard; 