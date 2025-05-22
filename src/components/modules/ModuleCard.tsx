import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  disabled?: boolean;
  onClick?: () => void;
  connections?: string[];
  href?: string;
  bgColor?: string;
  iconColor?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  color = "text-primary",
  disabled = false,
  onClick,
  connections,
  href,
  bgColor,
  iconColor
}) => {
  return (
    <Card className={cn(
      "module-card flex flex-col h-full transition-all duration-300",
      disabled && "opacity-60 cursor-not-allowed",
      bgColor
    )}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full bg-muted", color, iconColor)}>
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription className="pt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {connections && connections.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Connexions:</p>
            <div className="flex flex-wrap gap-1">
              {connections.map((connection) => (
                <span 
                  key={connection} 
                  className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                >
                  {connection}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onClick}
          disabled={disabled}
          variant="ghost"
          className="w-full justify-between hover:bg-muted"
          asChild={!!href}
        >
          {href ? (
            <a href={href}>
              <span>Accéder</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <>
              <span>Accéder</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
