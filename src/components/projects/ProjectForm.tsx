import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { ProjectFormData, projectService } from '@/lib/projectService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ProjectFormProps {
  projectId?: string;
  userId: string;
  onSuccess: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  projectId, 
  userId,
  onSuccess, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    location: '',
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const project = await projectService.getProjectById(projectId);
      const formattedData = projectService.convertToFormData(project);
      setFormData(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du projet. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as ProjectStatus }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Soumission du formulaire de projet:', {
      formData,
      userId,
      projectId,
      timestamp: new Date().toISOString()
    });
    
    // Validation de base
    if (!formData.title.trim()) {
      console.warn('⚠️ Validation échouée: titre manquant');
      toast({
        title: 'Erreur de validation',
        description: 'Le titre du projet est requis.',
        variant: 'destructive',
      });
      return;
    }
    
    // Valider que la date de fin est après la date de début
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        console.warn('⚠️ Validation échouée: dates incohérentes');
        toast({
          title: 'Erreur de validation',
          description: 'La date de fin doit être postérieure à la date de début.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    try {
      setLoading(true);
      console.log('🚀 Début de l\'opération de sauvegarde...');
      
      let project: Project;
      
      if (projectId) {
        // Mise à jour d'un projet existant
        console.log('📝 Mise à jour du projet existant:', projectId);
        project = await projectService.updateProject(projectId, formData);
        console.log('✅ Projet mis à jour avec succès');
        toast({
          title: 'Succès',
          description: 'Le projet a été mis à jour avec succès.',
        });
      } else {
        // Création d'un nouveau projet
        console.log('🆕 Création d\'un nouveau projet...');
        project = await projectService.createProject(formData, userId);
        console.log('✅ Projet créé avec succès');
        toast({
          title: 'Succès',
          description: 'Le projet a été créé avec succès.',
        });
      }
      
      console.log('🎉 Opération terminée, appel de onSuccess');
      onSuccess(project);
      
    } catch (error) {
      console.error('💥 Erreur lors de la sauvegarde du projet:', {
        error,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
        formData,
        userId,
        projectId
      });
      
      // Afficher un message d'erreur détaillé
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      toast({
        title: 'Erreur',
        description: `Impossible de ${projectId ? 'mettre à jour' : 'créer'} le projet. ${errorMessage}`,
        variant: 'destructive',
      });
      
      // Si c'est un problème d'authentification, proposer une reconnexion
      if (errorMessage.includes('connecté') || errorMessage.includes('session')) {
        setTimeout(() => {
          toast({
            title: 'Action requise',
            description: 'Veuillez vous reconnecter et réessayer.',
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/login'}
              >
                Se reconnecter
              </Button>
            ),
          });
        }, 2000);
      }
      
    } finally {
      setLoading(false);
      console.log('🏁 Fin de l\'opération de sauvegarde');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{projectId ? 'Modifier le projet' : 'Créer un nouveau projet'}</CardTitle>
        <CardDescription>
          {projectId 
            ? 'Modifiez les détails du projet existant' 
            : 'Remplissez les détails pour créer un nouveau projet'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nom du projet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description détaillée du projet"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planification</SelectItem>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="canceled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="startDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(new Date(formData.startDate), 'dd MMMM yyyy', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => {
                      handleDateChange('startDate', date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="endDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(new Date(formData.endDate), 'dd MMMM yyyy', { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={(date) => {
                      handleDateChange('endDate', date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => 
                      formData.startDate ? date < new Date(formData.startDate) : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="Lieu du projet"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Chargement...' : projectId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm; 