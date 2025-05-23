import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { projectService } from '@/lib/projectService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calendar, MapPin, Users, Folder, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectsListProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
  userId?: string;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onProjectSelect, onCreateProject, userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, statusFilter, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les projets. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    // Filtre par terme de recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.title.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredProjects(filtered);
  };

  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await projectService.deleteProject(projectId);
      toast({
        title: 'Succès',
        description: 'Le projet a été supprimé avec succès.',
      });
      loadProjects();
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le projet. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      planning: { label: 'Planification', className: 'bg-blue-500 hover:bg-blue-600' },
      active: { label: 'En cours', className: 'bg-green-500 hover:bg-green-600' },
      paused: { label: 'En pause', className: 'bg-amber-500 hover:bg-amber-600' },
      completed: { label: 'Terminé', className: 'bg-purple-500 hover:bg-purple-600' },
      canceled: { label: 'Annulé', className: 'bg-red-500 hover:bg-red-600' },
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un projet..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="planning">Planification</SelectItem>
              <SelectItem value="active">En cours</SelectItem>
              <SelectItem value="paused">En pause</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="canceled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={onCreateProject} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>
      
      {loading ? (
        // Affichage du chargement
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5 mb-2" />
                <Skeleton className="h-3 w-3/5" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        // Aucun projet trouvé
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Aucun projet trouvé</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm || statusFilter !== 'all'
              ? "Aucun projet ne correspond à vos critères de recherche."
              : "Commencez par créer votre premier projet."}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={onCreateProject} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Créer un projet
            </Button>
          )}
        </div>
      ) : (
        // Liste des projets
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onProjectSelect(project.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                <CardDescription className="line-clamp-1">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-sm">
                <div className="space-y-2">
                  {project.startDate && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {project.startDate && project.endDate ? (
                        <span>
                          Du {format(project.startDate, 'd MMM yyyy', { locale: fr })} au {format(project.endDate, 'd MMM yyyy', { locale: fr })}
                        </span>
                      ) : (
                        <span>Début: {format(project.startDate, 'd MMM yyyy', { locale: fr })}</span>
                      )}
                    </div>
                  )}
                  
                  {project.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{project.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{project.members.length} membre{project.members.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  onProjectSelect(project.id);
                }}>
                  <Edit className="h-4 w-4 mr-1" />
                  Détails
                </Button>
                
                {project.createdBy === userId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList; 