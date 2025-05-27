// Composant CreateVoteForm - Formulaire de création de vote
// Architecture simplifiée avec validation côté client

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { voteService } from '../../lib/voteService';
import { useVoteForm } from '../../hooks/useVote';
import type { CreateVoteData, Vote } from '../../types/vote';

interface CreateVoteFormProps {
  onSuccess?: (vote: Vote) => void;
  onCancel?: () => void;
}

export function CreateVoteForm({ onSuccess, onCancel }: CreateVoteFormProps) {
  const navigate = useNavigate();
  const { loading, error, success, handleAction, setError, clearMessages } = useVoteForm();
  
  const [formData, setFormData] = useState<CreateVoteData>({
    title: '',
    description: '',
    type: 'yes_no',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    show_results_mode: 'after_vote',
    options: []
  });

  const [customOptions, setCustomOptions] = useState<string[]>(['', '']);

  const handleInputChange = (field: keyof CreateVoteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearMessages();
  };

  const handleTypeChange = (type: Vote['type']) => {
    setFormData(prev => ({ ...prev, type }));
    
    // Réinitialiser les options selon le type
    if (type === 'yes_no') {
      setFormData(prev => ({ ...prev, options: ['Oui', 'Non'] }));
      setCustomOptions(['Oui', 'Non']);
    } else {
      setFormData(prev => ({ ...prev, options: customOptions.filter(opt => opt.trim()) }));
    }
  };

  const addOption = () => {
    if (customOptions.length < 10) {
      setCustomOptions(prev => [...prev, '']);
    }
  };

  const removeOption = (index: number) => {
    if (customOptions.length > 2) {
      const newOptions = customOptions.filter((_, i) => i !== index);
      setCustomOptions(newOptions);
      setFormData(prev => ({ ...prev, options: newOptions.filter(opt => opt.trim()) }));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...customOptions];
    newOptions[index] = value;
    setCustomOptions(newOptions);
    setFormData(prev => ({ ...prev, options: newOptions.filter(opt => opt.trim()) }));
  };

  const validateForm = (): string[] => {
    const errors = voteService.validateVote(formData);
    
    // Validation supplémentaire pour les options personnalisées
    if (formData.type !== 'yes_no') {
      const validOptions = customOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        errors.push('Au moins 2 options sont requises');
      }
      
      const duplicates = validOptions.filter((opt, index) => 
        validOptions.indexOf(opt) !== index
      );
      if (duplicates.length > 0) {
        errors.push('Les options doivent être uniques');
      }
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
      const vote = await handleAction(async () => {
        return await voteService.createVote(formData);
      });
      
      if (onSuccess) {
        onSuccess(vote);
      } else {
        navigate(`/votes/${vote.id}`);
      }
    } catch (err) {
      // L'erreur est déjà gérée par handleAction
    }
  };

  const typeOptions = [
    { value: 'yes_no', label: 'Oui/Non', description: 'Vote binaire simple' },
    { value: 'single_choice', label: 'Choix unique', description: 'Une seule option parmi plusieurs' },
    { value: 'multiple_choice', label: 'Choix multiple', description: 'Plusieurs options possibles' }
  ];

  const resultsModeOptions = [
    { value: 'immediate', label: 'Immédiat', description: 'Résultats visibles en temps réel' },
    { value: 'after_vote', label: 'Après vote', description: 'Résultats visibles après avoir voté' },
    { value: 'after_close', label: 'Après clôture', description: 'Résultats visibles uniquement après la fin' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Créer un nouveau vote</CardTitle>
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

          {/* Type de vote */}
          <div className="space-y-2">
            <Label>Type de vote *</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
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

          {/* Options personnalisées */}
          {formData.type !== 'yes_no' && (
            <div className="space-y-2">
              <Label>Options de vote *</Label>
              <div className="space-y-2">
                {customOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                    />
                    {customOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {customOptions.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une option
                  </Button>
                )}
              </div>
            </div>
          )}

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
              {loading ? 'Création...' : 'Créer le vote'}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 