import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/supabase';
import { t } from '@/lib/textBank';

// Schéma de validation
const resetPasswordSchema = z.object({
  password: z.string().min(8, t('auth.passwordMinLength')),
  confirmPassword: z.string().min(1, t('errors.required')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.passwordsDoNotMatch'),
  path: ['confirmPassword'],
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Vérifier si l'URL contient un token de réinitialisation
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      // Rediriger vers la page de demande de réinitialisation s'il n'y a pas de token
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ResetPasswordSchema) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: resetError } = await authService.updatePassword(data.password);
      
      if (resetError) {
        throw new Error(resetError.message);
      }
      
      setIsSuccess(true);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.resetPassword')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.enterNewPassword')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <Alert>
              <AlertDescription>
                {t('auth.resetSuccess')}
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.processing') : t('auth.resetPassword')}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {!isSuccess && (
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => navigate('/login')}>
              {t('auth.backToLogin')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage; 