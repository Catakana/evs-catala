import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService, UserProfile } from '@/lib/supabase';
import { t } from '@/lib/textBank';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Schéma de validation
const profileSchema = z.object({
  firstname: z.string().min(1, t('errors.required')),
  lastname: z.string().min(1, t('errors.required')),
  email: z.string().email(t('errors.invalid')).min(1, t('errors.required')),
  phone: z.string().optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Initialisation du formulaire
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
    },
  });

  // Chargement des données utilisateur
  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
          window.location.href = '/login';
          return;
        }
        
        setUser(currentUser);
        
        const userProfile = await authService.getUserProfile(currentUser.id);
        if (userProfile) {
          setProfile(userProfile);
          
          // Initialiser le formulaire avec les données du profil
          form.reset({
            firstname: userProfile.firstname,
            lastname: userProfile.lastname,
            email: userProfile.email,
            phone: userProfile.phone || '',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [form]);

  // Soumission du formulaire
  async function onSubmit(data: ProfileSchema) {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { error: updateError } = await authService.updateUserProfile(user.id, {
        ...profile,
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone || null,
      });
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccessMessage'),
      });
      
      // Mettre à jour le profil local
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          firstname: data.firstname,
          lastname: data.lastname,
          phone: data.phone || null,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setIsSaving(false);
    }
  }

  // Fonction pour générer les initiales de l'utilisateur
  const getInitials = () => {
    if (!profile) return '?';
    return `${profile.firstname.charAt(0)}${profile.lastname.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container flex-1 py-8 flex items-center justify-center">
          <p>{t('common.loading')}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container flex-1 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
        
        <div className="grid md:grid-cols-[1fr_3fr] gap-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.firstname || ''} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold">{profile?.firstname} {profile?.lastname}</h2>
              <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
              
              <Button variant="outline" className="mt-4 w-full">
                {t('profile.changeAvatar')}
              </Button>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">{t('profile.personalInfo')}</TabsTrigger>
              <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('profile.preferences')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.personalInfo')}</CardTitle>
                  <CardDescription>{t('profile.updatePersonalInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.firstname')}</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={isSaving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.lastname')}</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={isSaving} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.email')}</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={true} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.phone')}</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSaving} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        type="submit" 
                        disabled={isSaving}
                      >
                        {isSaving ? t('common.processing') : t('profile.saveChanges')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.security')}</CardTitle>
                  <CardDescription>{t('profile.securitySettings')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => window.location.href = '/forgot-password'}>
                    {t('profile.changePassword')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.preferences')}</CardTitle>
                  <CardDescription>{t('profile.preferencesSettings')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{t('profile.preferencesComingSoon')}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage; 