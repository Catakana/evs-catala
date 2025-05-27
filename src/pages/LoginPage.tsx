import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getText as t } from '@/lib/textBank';
import { Home } from 'lucide-react';

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email(t('common.errors.invalid')).min(1, t('common.errors.required')),
  password: z.string().min(1, t('common.errors.required')),
});

type LoginSchema = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'URL de redirection si elle existe
  const from = location.state?.from?.pathname || '/';

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
      const { error: signInError } = await signIn(data.email, data.password);
      
      if (signInError) {
        throw signInError;
      }
      
      // Redirection vers la page d'origine ou la page d'accueil
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      {/* Lien de retour à l'accueil */}
      <div className="absolute top-4 left-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm">Retour à l'accueil</span>
        </Link>
      </div>

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