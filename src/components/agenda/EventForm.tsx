import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, MapPin, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/textBank';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Type de l'événement
export interface EventData {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  category: 'reunion' | 'animation' | 'atelier' | 'permanence' | 'autre';
  location?: string;
}

// Schéma de validation du formulaire
const eventFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  start_date: z.date({
    required_error: "La date de début est requise",
  }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  end_date: z.date({
    required_error: "La date de fin est requise",
  }),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  category: z.enum(['reunion', 'animation', 'atelier', 'permanence', 'autre'], {
    required_error: "La catégorie est requise",
  }),
  location: z.string().optional(),
}).refine(data => {
  // Vérification que la date de fin est égale ou postérieure à la date de début
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["end_date"],
});

type EventFormProps = {
  initialData?: Partial<EventData>;
  onSubmit: (data: EventData) => void;
  onCancel: () => void;
  isEditMode?: boolean;
};

export function EventForm({ initialData, onSubmit, onCancel, isEditMode = false }: EventFormProps) {
  // Initialisation du formulaire
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      start_date: initialData?.start_date ? parseISO(initialData.start_date) : new Date(),
      start_time: initialData?.start_time || '10:00',
      end_date: initialData?.end_date ? parseISO(initialData.end_date) : new Date(),
      end_time: initialData?.end_time || '12:00',
      category: (initialData?.category as any) || 'reunion',
      location: initialData?.location || '',
    },
  });

  // Soumission du formulaire
  const handleSubmit = (data: z.infer<typeof eventFormSchema>) => {
    // Convertir le format pour l'API
    const formattedData: EventData = {
      title: data.title,
      description: data.description || '',
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      start_time: data.start_time,
      end_date: format(data.end_date, 'yyyy-MM-dd'),
      end_time: data.end_time,
      category: data.category,
      location: data.location,
    };

    // Si on est en mode édition, conserver l'ID
    if (initialData?.id) {
      formattedData.id = initialData.id;
    }

    onSubmit(formattedData);
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input placeholder="Titre de l'événement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description de l'événement (optionnel)" 
                    {...field} 
                    value={field.value || ''}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de début</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="HH:MM" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure de fin</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="HH:MM" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reunion">Réunion</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="atelier">Atelier</SelectItem>
                    <SelectItem value="permanence">Permanence</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Lieu de l'événement (optionnel)" 
                      className="pl-8"
                      {...field} 
                      value={field.value || ''}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditMode ? 'Mettre à jour' : 'Créer l\'événement'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 