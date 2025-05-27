// Composant EditVoteForm - Formulaire d'édition de vote
// Permet de modifier un vote existant et changer son statut

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, Save, X } from 'lucide-react';
import { voteService } from '../../lib/voteService';
import { useVoteForm } from '../../hooks/useVote';
import type { Vote } from '../../types/vote';

interface EditVoteFormProps {
  vote: Vote;
  onSuccess?: (vote: Vote) => void;
  onCancel?: () => void;
}

export function EditVoteForm({ vote, onSuccess, onCancel }: EditVoteFormProps) {
  const { loading, error, success, handleAction, setError, clearMessages } = useVoteForm();
  
  const [formData, setFormData] = useState({
    title: vote.title,
    description: vote.description || '',
    status: vote.status,
    start_date: vote.start_date.slice(0, 16), // Format pour datetime-local
    end_date: vote.end_date.slice(0, 16),
    show_results_mode: vote.show_results_mode
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearMessages();
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    if (formData.title.length > 200) {
      errors.push('Le titre ne peut pas dépasser 200 caractères');
    }
    
    if (formData.description.length > 1000) {
      errors.push('La description ne peut pas dépasser 1000 caractères');
    }
    
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.push('La date de fin doit être après la date de début');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      const updatedVote = await handleAction(async () => {
        return await voteService.updateVote(vote.id, {
          title: formData.title,
          description: formData.description,
          status: formData.status as Vote['status'],
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          show_results_mode: formData.show_results_mode as Vote['show_results_mode']
        });
      });
      
      if (onSuccess) {
        onSuccess(updatedVote);
      }
    } catch (err) {
      // L'erreur est déjà gérée par handleAction
    }
  };

  const getStatusBadge = (status: Vote['status']) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      active: { label: 'Actif', variant: 'default' as const },
      closed: { label: 'Fermé', variant: 'destructive' as const },
      archived: { label: 'Archivé', variant: 'outline' as const }
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const statusOptions = [
    { value: 'draft', label: 'Brouillon', description: 'Le vote n\'est pas encore visible' },
    { value: 'active', label: 'Actif', description: 'Le vote est ouvert aux participants' },
    { value: 'closed', label: 'Fermé', description: 'Le vote est fermé, résultats visibles' },
    { value: 'archived', label: 'Archivé', description: 'Le vote est archivé' }
  ];

  const resultsModeOptions = [
    { value: 'immediate', label: 'Immédiat', description: 'Résultats visibles en temps réel' },
    { value: 'after_vote', label: 'Après vote', description: 'Résultats visibles après avoir voté' },
    { value: 'after_close', label: 'Après clôture', description: 'Résultats visibles uniquement après la fin' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Modifier le vote</span>
          {getStatusBadge(formData.status as Vote['status'])}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Messages d'état */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre du vote *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Choix du lieu pour la prochaine sortie"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Détails supplémentaires sur le vote..."
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut du vote *</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.status === 'active' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✅ En passant le vote en "Actif", il sera visible et accessible aux membres pour voter.
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mode d'affichage des résultats */}
          <div className="space-y-2">
            <Label>Affichage des résultats</Label>
            <Select 
              value={formData.show_results_mode} 
              onValueChange={(value) => handleInputChange('show_results_mode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resultsModeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 