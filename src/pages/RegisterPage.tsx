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
import { authService } from '@/lib/supabase';
import { t } from '@/lib/textBank';

// Schéma de validation
const registerSchema = z.object({
  firstname: z.string().min(1, t('errors.required')),
  lastname: z.string().min(1, t('errors.required')),
  email: z.string().email(t('errors.invalid')).min(1, t('errors.required')),
  password: z.string().min(8, t('auth.passwordMinLength')),
  confirmPassword: z.string().min(1, t('errors.required')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.passwordsDoNotMatch'),
  path: ['confirmPassword'],
});

type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: signUpError } = await authService.signUp(
        data.email, 
        data.password, 
        { 
          firstname: data.firstname, 
          lastname: data.lastname
        }
      );
      
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      
      setIsSuccess(true);
      
      // Redirection vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.register')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.createAccount')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <Alert>
              <AlertDescription>
                {t('auth.registerSuccess')}
              </AlertDescription>
            </Alert>
          ) : (
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
                          <Input {...field} disabled={isSubmitting} />
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
                          <Input {...field} disabled={isSubmitting} />
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
                  {isSubmitting ? t('common.processing') : t('auth.register')}
                </Button>
              </form>
            </Form>
          )}
          
          {!isSuccess && (
            <>
              <Separator className="my-4" />
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  {t('auth.alreadyHaveAccount')}
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                  {t('auth.login')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage; 