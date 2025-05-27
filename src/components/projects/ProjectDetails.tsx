import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Project, ProjectTask, TaskStatus, TaskPriority } from '@/types/project';
import { projectService } from '@/lib/projectService';
import ProjectTeamManager from './ProjectTeamManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clipboard, 
  DollarSign, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
  onEdit: (projectId: string) => void;
  userId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onBack, onEdit, userId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du projet:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du projet. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string, className: string }> = {
      planning: { label: 'Planification', className: 'bg-blue-500 hover:bg-blue-600' },
      active: { label: 'En cours', className: 'bg-green-500 hover:bg-green-600' },
      paused: { label: 'En pause', className: 'bg-amber-500 hover:bg-amber-600' },
      completed: { label: 'Terminé', className: 'bg-purple-500 hover:bg-purple-600' },
      canceled: { label: 'Annulé', className: 'bg-red-500 hover:bg-red-600' },
      
      // Pour les tâches
      todo: { label: 'À faire', className: 'bg-gray-500 hover:bg-gray-600' },
      inProgress: { label: 'En cours', className: 'bg-blue-500 hover:bg-blue-600' },
      review: { label: 'En revue', className: 'bg-amber-500 hover:bg-amber-600' },
      done: { label: 'Terminée', className: 'bg-green-500 hover:bg-green-600' },
      
      // Pour les priorités
      low: { label: 'Basse', className: 'bg-gray-500 hover:bg-gray-600' },
      medium: { label: 'Moyenne', className: 'bg-yellow-500 hover:bg-yellow-600' },
      high: { label: 'Haute', className: 'bg-orange-500 hover:bg-orange-600' },
      urgent: { label: 'Urgente', className: 'bg-red-500 hover:bg-red-600' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTaskStatusIcon = (status: TaskStatus) => {
    switch(status) {
      case 'todo':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'inProgress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch(priority) {
      case 'low':
        return <div className="w-3 h-3 rounded-full bg-gray-500" />;
      case 'medium':
        return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
      case 'high':
        return <div className="w-3 h-3 rounded-full bg-orange-500" />;
      case 'urgent':
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default:
        return null;
    }
  };

  const isUserAdmin = () => {
    if (!project || !userId) return false;
    
    // Le créateur est considéré comme admin
    if (project.createdBy === userId) return true;
    
    // Vérifier si l'utilisateur est membre avec le rôle admin
    const userMember = project.members.find(member => member.userId === userId);
    return userMember?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onBack}>Retour</Button>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack}>Retour</Button>
        <Card>
          <CardContent className="py-10 text-center">
            <h3 className="text-lg font-medium">Projet non trouvé</h3>
            <p className="text-muted-foreground mt-2">
              Le projet demandé n'existe pas ou n'est pas accessible.
            </p>
            <Button onClick={onBack} className="mt-4">
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>Retour</Button>
        {isUserAdmin() && (
          <Button onClick={() => onEdit(projectId)}>Modifier</Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            {getStatusBadge(project.status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.startDate && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Période</p>
                  <p className="text-sm text-muted-foreground">
                    {project.startDate && project.endDate ? (
                      <span>
                        Du {format(project.startDate, 'd MMM yyyy', { locale: fr })} au {format(project.endDate, 'd MMM yyyy', { locale: fr })}
                      </span>
                    ) : (
                      <span>Début: {format(project.startDate, 'd MMM yyyy', { locale: fr })}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
            
            {project.location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Lieu</p>
                  <p className="text-sm text-muted-foreground">{project.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Membres</p>
                <p className="text-sm text-muted-foreground">
                  {project.members.length} membre{project.members.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {project.description || "Aucune description détaillée n'a été fournie pour ce projet."}
                </p>
              </div>
              
              <ProjectTeamManager
                projectId={projectId}
                members={project.members}
                currentUserId={userId}
                isUserAdmin={isUserAdmin()}
                onMembersUpdate={loadProject}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Tâches</h3>
                  {project.tasks && project.tasks.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total: {project.tasks.length}</span>
                        <span>Terminées: {project.tasks.filter(task => task.status === 'done').length}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ 
                            width: `${project.tasks.filter(task => task.status === 'done').length / project.tasks.length * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune tâche n'a encore été créée.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Budget</h3>
                  {project.budgets && project.budgets.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total budgeté:</span>
                        <span className="font-medium">
                          {project.budgets.reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dépensé:</span>
                        <span className="font-medium">
                          {project.budgets.filter(b => b.status === 'spent').reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun budget n'a encore été défini.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Liste des tâches</h3>
                {isUserAdmin() && (
                  <Button size="sm">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Ajouter une tâche
                  </Button>
                )}
              </div>
              
              {(!project.tasks || project.tasks.length === 0) ? (
                <div className="text-center py-8 border rounded-lg bg-muted/50">
                  <Clipboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium">Aucune tâche</h4>
                  <p className="text-muted-foreground mt-2">
                    Ce projet n'a pas encore de tâches assignées.
                  </p>
                  {isUserAdmin() && (
                    <Button className="mt-4">
                      Créer la première tâche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {project.tasks.map(task => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className="flex border-l-4" style={{ 
                        borderLeftColor: 
                          task.priority === 'urgent' ? 'rgb(239, 68, 68)' : 
                          task.priority === 'high' ? 'rgb(249, 115, 22)' : 
                          task.priority === 'medium' ? 'rgb(234, 179, 8)' : 
                          'rgb(107, 114, 128)'
                      }}>
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              {getTaskStatusIcon(task.status)}
                              <h4 className="font-medium ml-2">{task.title}</h4>
                            </div>
                            <div className="flex space-x-2">
                              {getStatusBadge(task.status)}
                              {getStatusBadge(task.priority)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex justify-between mt-2 text-sm">
                            {task.dueDate && (
                              <span className="text-muted-foreground">
                                Échéance: {format(task.dueDate, 'd MMM yyyy', { locale: fr })}
                              </span>
                            )}
                            {task.assignedTo && (
                              <span className="text-muted-foreground">
                                Assignée à: {task.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="budget" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Budget du projet</h3>
                {isUserAdmin() && (
                  <Button size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Ajouter un budget
                  </Button>
                )}
              </div>
              
              {(!project.budgets || project.budgets.length === 0) ? (
                <div className="text-center py-8 border rounded-lg bg-muted/50">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium">Aucun budget</h4>
                  <p className="text-muted-foreground mt-2">
                    Ce projet n'a pas encore de budget défini.
                  </p>
                  {isUserAdmin() && (
                    <Button className="mt-4">
                      Définir un budget
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget total</h4>
                          <span className="text-2xl font-bold">
                            {project.budgets.reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Approuvé</h4>
                          <span className="text-2xl font-bold">
                            {project.budgets.filter(b => b.status === 'approved').reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Dépensé</h4>
                          <span className="text-2xl font-bold">
                            {project.budgets.filter(b => b.status === 'spent').reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-2">
                    {project.budgets.map(budget => (
                      <Card key={budget.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{budget.title}</h4>
                              {budget.description && (
                                <p className="text-sm text-muted-foreground mt-1">{budget.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold">{budget.amount.toLocaleString('fr-FR')} €</span>
                              {getStatusBadge(budget.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Documents</h3>
                {isUserAdmin() && (
                  <Button size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Ajouter un document
                  </Button>
                )}
              </div>
              
              {(!project.documents || project.documents.length === 0) ? (
                <div className="text-center py-8 border rounded-lg bg-muted/50">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium">Aucun document</h4>
                  <p className="text-muted-foreground mt-2">
                    Ce projet n'a pas encore de documents attachés.
                  </p>
                  {isUserAdmin() && (
                    <Button className="mt-4">
                      Ajouter un document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.documents.map(doc => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center mr-3">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{doc.title}</h4>
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span>{doc.fileType.split('/')[1]?.toUpperCase()}</span>
                              <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 px-4 py-2">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs text-muted-foreground">
                            Ajouté le {format(doc.uploadedAt, 'd MMM yyyy', { locale: fr })}
                          </span>
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              Télécharger
                            </a>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails; 