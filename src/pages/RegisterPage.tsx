import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getText as t } from '@/lib/textBank';
import { Mail, Info, Home, AlertTriangle } from 'lucide-react';

// Schéma de validation
const registerSchema = z.object({
  firstname: z.string().min(1, t('common.errors.required')),
  lastname: z.string().min(1, t('common.errors.required')),
  email: z.string().email(t('common.errors.invalid')).min(1, t('common.errors.required')),
  password: z.string().min(8, t('auth.passwordMinLength')),
  confirmPassword: z.string().min(1, t('common.errors.required')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.passwordsDoNotMatch'),
  path: ['confirmPassword'],
});

type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterSchema) {
    console.log('[REGISTER] Démarrage de la soumission du formulaire d\'inscription');
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('[REGISTER] Données du formulaire:', {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        // Nous ne logons pas le mot de passe pour des raisons de sécurité
      });
      
      console.log('[REGISTER] Appel de la fonction signUp du contexte d\'authentification');
      const { error: signUpError } = await signUp(
        data.email, 
        data.password, 
        { 
          firstname: data.firstname, 
          lastname: data.lastname
        }
      );
      
      console.log('[REGISTER] Résultat de l\'inscription:', { 
        success: !signUpError, 
        error: signUpError ? signUpError.message : null 
      });
      
      if (signUpError) {
        console.error('[REGISTER] Erreur lors de l\'inscription:', signUpError);
        throw signUpError;
      }
      
      console.log('[REGISTER] Inscription réussie, affichage du message de succès');
      setIsSuccess(true);
      setRegisteredEmail(data.email);
      
      // Redirection vers la page de connexion désactivée - on affiche le message de vérification d'email
      // setTimeout(() => {
      //   navigate('/login');
      // }, 3000);
    } catch (err) {
      console.error('[REGISTER] Exception lors de l\'inscription:', err);
      setError(err instanceof Error ? err.message : t('common.errors.generic'));
    } finally {
      console.log('[REGISTER] Fin du processus d\'inscription');
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <div className="absolute top-4 left-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Retour à l'accueil</span>
          </Link>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {t('auth.verifyEmailTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.verifyEmailDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-800 mb-2">
                <span className="font-medium">{registeredEmail}</span>
              </p>
              <p className="text-sm text-green-700">
                {t('auth.verifyEmailInstructions')}
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800 mb-1">
                    Action requise : Confirmez votre email
                  </p>
                  <p className="text-sm text-orange-700">
                    Vous devez cliquer sur le lien de confirmation dans l'email que nous venons de vous envoyer pour activer votre compte.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('auth.checkInbox')}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('auth.checkSpam')}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Le lien de confirmation expire dans 24 heures.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
              Retour à la page de connexion
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <div className="absolute top-4 left-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm">Retour à l'accueil</span>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.register')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.createAccount')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Confirmation par email requise
                </p>
                <p className="text-sm text-blue-700">
                  Après inscription, vous recevrez un email de confirmation. Vous devez cliquer sur le lien pour activer votre compte.
                </p>
              </div>
            </div>
          </div>
          
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
                        <Input 
                          placeholder="Jean" 
                          {...field} 
                          disabled={isSubmitting}
                        />
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
                        <Input 
                          placeholder="Dupont" 
                          {...field} 
                          disabled={isSubmitting}
                        />
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
                      <Input 
                        placeholder="nom@exemple.fr" 
                        type="email"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="********"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="********"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.processing') : t('auth.register')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="underline text-primary hover:text-primary/80">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage; 