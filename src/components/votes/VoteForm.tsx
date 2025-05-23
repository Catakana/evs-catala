import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Calendar, MoreHorizontal, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getText } from '@/lib/textBank';
import { voteService } from '@/lib/voteService';
import { Vote, VoteType, VoteStatus, VoteVisibility, VoteResultVisibility, VoteOption } from '@/types/vote';
import { useAuth } from '@/hooks/useAuth';

interface VoteFormProps {
  vote?: Vote; // Pour l'édition, undefined pour création
  initialType?: VoteType; // Type initial pour un nouveau vote
  onSubmit: (vote: Vote) => void;
  onCancel: () => void;
}

export default function VoteForm({ vote, initialType = 'binary', onSubmit, onCancel }: VoteFormProps) {
  const t = (key: string, variables?: Record<string, string>) => getText(key, variables);
  const { user } = useAuth();
  const isEditing = !!vote;
  
  // État du formulaire
  const [title, setTitle] = useState(vote?.title || '');
  const [description, setDescription] = useState(vote?.description || '');
  const [type, setType] = useState<VoteType>(vote?.type || initialType);
  const [options, setOptions] = useState<Omit<VoteOption, 'id'>[]>(
    vote?.options.map(opt => ({ text: opt.text })) || 
    [{ text: t('votes.option.yes') }, { text: t('votes.option.no') }]
  );
  const [status, setStatus] = useState<VoteStatus>(vote?.status || 'draft');
  const [visibility, setVisibility] = useState<VoteVisibility>(vote?.visibility || 'public');
  const [resultVisibility, setResultVisibility] = useState<VoteResultVisibility>(vote?.resultVisibility || 'immediate');
  const [startDate, setStartDate] = useState<Date>(vote?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(
    vote?.endDate || new Date(new Date().setDate(new Date().getDate() + 7))
  );
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Gestion des options selon le type de vote
  useEffect(() => {
    if (type === 'binary' && options.length !== 2) {
      setOptions([{ text: t('votes.option.yes') }, { text: t('votes.option.no') }]);
    } else if (type !== 'binary' && options.length < 2) {
      setOptions([{ text: '' }, { text: '' }]);
    }
  }, [type, t]);
  
  const addOption = () => {
    setOptions([...options, { text: '' }]);
  };
  
  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Minimum 2 options
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { text };
    setOptions(newOptions);
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = t('votes.errors.title_required');
    if (!description.trim()) newErrors.description = t('votes.errors.description_required');
    
    // Valider les options
    let hasEmptyOption = false;
    options.forEach((option, index) => {
      if (!option.text.trim()) {
        hasEmptyOption = true;
      }
    });
    
    if (hasEmptyOption) newErrors.options = t('votes.errors.options_required');
    
    // Valider les dates
    if (!startDate) newErrors.startDate = t('votes.errors.start_date_required');
    if (!endDate) newErrors.endDate = t('votes.errors.end_date_required');
    
    if (startDate && endDate && startDate >= endDate) {
      newErrors.endDate = t('votes.errors.end_date_after_start');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && vote) {
        // Mise à jour d'un vote existant
        const updatedVote = await voteService.updateVote(vote.id, {
          title,
          description,
          type,
          status,
          visibility,
          resultVisibility,
          options: options.map(opt => ({ id: '', text: opt.text })),
          startDate,
          endDate
        });
        
        if (updatedVote) {
          onSubmit(updatedVote);
        }
      } else {
        // Création d'un nouveau vote
        const newVote = await voteService.createVote({
          title,
          description,
          type,
          status,
          visibility,
          resultVisibility,
          options: options.map(opt => ({ id: '', text: opt.text })),
          startDate,
          endDate,
          createdBy: user.id
        });
        
        onSubmit(newVote);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du vote:', error);
      setErrors({ submit: t('votes.errors.submit_error') });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none">
      <CardHeader>
        <CardTitle>{isEditing ? t('votes.edit_title') : t('votes.create_title')}</CardTitle>
        <CardDescription>
          {isEditing ? t('votes.edit_description') : t('votes.create_description')}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Titre et description */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="vote-title" className="text-base font-semibold">
                {t('votes.form.title')}
              </Label>
              <Input
                id="vote-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('votes.form.title_placeholder')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="vote-description" className="text-base font-semibold">
                {t('votes.form.description')}
              </Label>
              <Textarea
                id="vote-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('votes.form.description_placeholder')}
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Type de vote */}
          <div>
            <Label className="text-base font-semibold">
              {t('votes.form.type')}
            </Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as VoteType)}
              className="flex flex-col space-y-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="binary" id="binary" />
                <Label htmlFor="binary" className="font-normal">
                  {t('votes.type.binary')}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('votes.type.binary_description')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple" className="font-normal">
                  {t('votes.type.multiple')}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('votes.type.multiple_description')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="survey" id="survey" />
                <Label htmlFor="survey" className="font-normal">
                  {t('votes.type.survey')}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('votes.type.survey_description')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </RadioGroup>
          </div>
          
          {/* Options */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-base font-semibold">
                {t('votes.form.options')}
              </Label>
              
              {/* Ajouter une option (si pas en mode binaire) */}
              {type !== 'binary' && (
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('votes.form.add_option')}
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option.text}
                    onChange={e => updateOption(index, e.target.value)}
                    placeholder={`${t('votes.form.option')} ${index + 1}`}
                    disabled={type === 'binary'} // Options fixes pour le type binaire
                    className="flex-grow"
                  />
                  
                  {/* Bouton de suppression (seulement pour les types non binaires) */}
                  {type !== 'binary' && options.length > 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {errors.options && (
              <p className="text-sm text-red-500 mt-1">{errors.options}</p>
            )}
          </div>
          
          {/* Période de vote */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              {t('votes.form.period')}
            </Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">{t('votes.form.start_date')}</Label>
                <DatePicker 
                  id="start-date"
                  date={startDate} 
                  setDate={setStartDate} 
                  className="w-full"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="end-date">{t('votes.form.end_date')}</Label>
                <DatePicker 
                  id="end-date"
                  date={endDate} 
                  setDate={setEndDate} 
                  className="w-full"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Paramètres avancés */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              {t('votes.form.settings')}
            </Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Statut */}
              <div>
                <Label htmlFor="status">{t('votes.form.status')}</Label>
                <Select 
                  value={status} 
                  onValueChange={value => setStatus(value as VoteStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t('votes.form.select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('votes.status.draft')}</SelectItem>
                    <SelectItem value="active">{t('votes.status.active')}</SelectItem>
                    <SelectItem value="closed">{t('votes.status.closed')}</SelectItem>
                  </SelectContent>
                </Select>
                
                {status === 'draft' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('votes.status.draft_description')}
                  </p>
                )}
              </div>
              
              {/* Visibilité */}
              <div>
                <Label htmlFor="visibility">{t('votes.form.visibility')}</Label>
                <Select 
                  value={visibility} 
                  onValueChange={value => setVisibility(value as VoteVisibility)}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder={t('votes.form.select_visibility')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t('votes.visibility.public')}</SelectItem>
                    <SelectItem value="private">{t('votes.visibility.private')}</SelectItem>
                    <SelectItem value="anonymous">{t('votes.visibility.anonymous')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Visibilité des résultats */}
              <div>
                <Label htmlFor="result-visibility">{t('votes.form.result_visibility')}</Label>
                <Select 
                  value={resultVisibility} 
                  onValueChange={value => setResultVisibility(value as VoteResultVisibility)}
                >
                  <SelectTrigger id="result-visibility">
                    <SelectValue placeholder={t('votes.form.select_result_visibility')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">{t('votes.result_visibility.immediate')}</SelectItem>
                    <SelectItem value="afterVote">{t('votes.result_visibility.after_vote')}</SelectItem>
                    <SelectItem value="afterClose">{t('votes.result_visibility.after_close')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            {t('common.actions.cancel')}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.processing') : isEditing ? t('votes.form.update') : t('votes.form.create')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 