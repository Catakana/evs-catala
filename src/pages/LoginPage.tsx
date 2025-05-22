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
const loginSchema = z.object({
  email: z.string().email(t('errors.invalid')).min(1, t('errors.required')),
  password: z.string().min(1, t('errors.required')),
});

type LoginSchema = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginSchema) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: signInError } = await authService.signIn(data.email, data.password);
      
      if (signInError) {
        throw new Error(signInError.message);
      }
      
      // Redirection vers la page d'accueil
      navigate('/');
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
            {t('auth.login')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.welcome')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.processing') : t('auth.login')}
              </Button>
            </form>
          </Form>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              {t('auth.noAccountYet')}
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
              {t('auth.register')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 