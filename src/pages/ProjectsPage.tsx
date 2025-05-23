import React, { useState } from 'react';
import ProjectsList from '@/components/projects/ProjectsList';
import ProjectForm from '@/components/projects/ProjectForm';
import ProjectDetails from '@/components/projects/ProjectDetails';
import { Project } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';

enum ViewMode {
  LIST = 'list',
  CREATE = 'create',
  EDIT = 'edit',
  DETAILS = 'details',
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode(ViewMode.DETAILS);
  };

  const handleCreateProject = () => {
    setSelectedProjectId(null);
    setViewMode(ViewMode.CREATE);
  };

  const handleEditProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode(ViewMode.EDIT);
  };

  const handleFormCancel = () => {
    // Si on était en mode édition, retourner aux détails
    if (viewMode === ViewMode.EDIT && selectedProjectId) {
      setViewMode(ViewMode.DETAILS);
    } else {
      // Sinon, retourner à la liste
      setViewMode(ViewMode.LIST);
    }
  };

  const handleFormSuccess = (project: Project) => {
    setSelectedProjectId(project.id);
    setViewMode(ViewMode.DETAILS);
  };

  const handleBackToList = () => {
    setViewMode(ViewMode.LIST);
    setSelectedProjectId(null);
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Veuillez vous connecter</h2>
          <p className="text-muted-foreground">
            Vous devez être connecté pour accéder à la gestion des projets.
          </p>
        </div>
      );
    }

    switch (viewMode) {
      case ViewMode.LIST:
        return (
          <ProjectsList
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
            userId={user.id}
          />
        );
      case ViewMode.CREATE:
        return (
          <ProjectForm
            userId={user.id}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case ViewMode.EDIT:
        return (
          <ProjectForm
            projectId={selectedProjectId || undefined}
            userId={user.id}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case ViewMode.DETAILS:
        return (
          <ProjectDetails
            projectId={selectedProjectId!}
            onBack={handleBackToList}
            onEdit={handleEditProject}
            userId={user.id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 max-w-7xl">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
        </div>
        
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 