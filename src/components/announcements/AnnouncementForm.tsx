/**
 * Composant de formulaire pour créer et éditer les annonces
 * Remplace AnnouncementCreateModal avec une approche plus flexible
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Calendar, Save, X, AlertCircle, Paperclip, Upload, AlertTriangle, LogIn } from 'lucide-react';
import { useAnnouncementActions } from '../../hooks/useAnnouncements';
import type { Announcement, AnnouncementCategory } from '../../types/announcement';
import type { CreateAnnouncementData, UpdateAnnouncementData } from '../../lib/announcementService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface AnnouncementFormProps {
  announcement?: Announcement; // Si fourni, mode édition
  onSuccess: (announcement: Announcement) => void;
  onCancel: () => void;
}

const CATEGORIES: { value: AnnouncementCategory; label: string; description: string }[] = [
  { value: 'info', label: 'Information', description: 'Information générale' },
  { value: 'urgent', label: 'Urgent', description: 'Annonce urgente nécessitant une attention immédiate' },
  { value: 'event', label: 'Événement', description: 'Annonce liée à un événement' },
  { value: 'project', label: 'Projet', description: 'Annonce liée à un projet' }
];

const TARGET_ROLES = [
  { value: 'member', label: 'Membres' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Administrateurs' }
];

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  announcement,
  onSuccess,
  onCancel
}) => {
  const { createAnnouncement, updateAnnouncement, loading, error } = useAnnouncementActions();
  const { user } = useAuth();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    category: announcement?.category as AnnouncementCategory || 'info',
    targetRoles: announcement?.targetRoles || ['member'],
    publishDate: announcement?.publishDate ? format(announcement.publishDate, 'yyyy-MM-dd\'T\'HH:mm') : '',
    expireDate: announcement?.expireDate ? format(announcement.expireDate, 'yyyy-MM-dd\'T\'HH:mm') : '',
    isPinned: announcement?.isPinned || false,
    priority: announcement?.priority || 0
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);

  const isEditing = !!announcement;

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Le titre est requis';
    } else if (formData.title.length > 255) {
      errors.title = 'Le titre ne peut pas dépasser 255 caractères';
    }

    if (!formData.content.trim()) {
      errors.content = 'Le contenu est requis';
    } else if (formData.content.length > 5000) {
      errors.content = 'Le contenu ne peut pas dépasser 5000 caractères';
    }

    if (formData.expireDate && formData.publishDate) {
      const publishDate = new Date(formData.publishDate);
      const expireDate = new Date(formData.expireDate);
      if (expireDate <= publishDate) {
        errors.expireDate = 'La date d\'expiration doit être postérieure à la date de publication';
      }
    }

    if (formData.priority < 0 || formData.priority > 100) {
      errors.priority = 'La priorité doit être entre 0 et 100';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data: CreateAnnouncementData | UpdateAnnouncementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        targetRoles: formData.targetRoles,
        publishDate: formData.publishDate ? new Date(formData.publishDate) : undefined,
        expireDate: formData.expireDate ? new Date(formData.expireDate) : undefined,
        isPinned: formData.isPinned,
        priority: formData.priority
      };

      let result: Announcement | null = null;

      if (isEditing && announcement) {
        result = await updateAnnouncement(announcement.id, data);
      } else {
        result = await createAnnouncement(data as CreateAnnouncementData);
      }

      if (result) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
    }
  };

  // Gestion des changements de champs
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Gestion des rôles cibles
  const toggleTargetRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  // Gestion des fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? 'Modifier l\'annonce' : 'Créer une nouvelle annonce'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Titre de l'annonce"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500">{validationErrors.title}</p>
              )}
            </div>

            {/* Contenu */}
            <div className="space-y-2">
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="Contenu de l'annonce"
                rows={6}
                className={validationErrors.content ? 'border-red-500' : ''}
              />
              {validationErrors.content && (
                <p className="text-sm text-red-500">{validationErrors.content}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.content.length}/5000 caractères
              </p>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleFieldChange('category', value as AnnouncementCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-sm text-muted-foreground">{cat.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rôles cibles */}
            <div className="space-y-2">
              <Label>Destinataires</Label>
              <div className="flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => (
                  <Badge
                    key={role.value}
                    variant={formData.targetRoles.includes(role.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTargetRole(role.value)}
                  >
                    {role.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishDate">Date de publication</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  value={formData.publishDate}
                  onChange={(e) => handleFieldChange('publishDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expireDate">Date d'expiration (optionnel)</Label>
                <Input
                  id="expireDate"
                  type="datetime-local"
                  value={formData.expireDate}
                  onChange={(e) => handleFieldChange('expireDate', e.target.value)}
                  className={validationErrors.expireDate ? 'border-red-500' : ''}
                />
                {validationErrors.expireDate && (
                  <p className="text-sm text-red-500">{validationErrors.expireDate}</p>
                )}
              </div>
            </div>

            {/* Options avancées */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium">Options avancées</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPinned">Épingler l'annonce</Label>
                  <p className="text-sm text-muted-foreground">
                    L'annonce apparaîtra en haut de la liste
                  </p>
                </div>
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => handleFieldChange('isPinned', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité (0-100)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 0)}
                  className={validationErrors.priority ? 'border-red-500' : ''}
                />
                {validationErrors.priority && (
                  <p className="text-sm text-red-500">{validationErrors.priority}</p>
                )}
              </div>
            </div>

            {/* Pièces jointes */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Pièces jointes</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="attachments"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Cliquez pour ajouter des fichiers
                  </span>
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Erreur générale */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{error}</p>
                    {(error.includes('connecté') || error.includes('session') || error.includes('permission')) && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = '/login'}
                          className="flex items-center gap-2"
                        >
                          <LogIn className="h-4 w-4" />
                          Se reconnecter
                        </Button>
                        {!user && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.reload()}
                          >
                            Actualiser la page
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer l\'annonce')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 