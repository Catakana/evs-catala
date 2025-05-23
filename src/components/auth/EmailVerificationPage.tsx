import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, authService } from '@/lib/supabase';
import { t } from '@/lib/textBank';

/**
 * Page de vérification d'email après inscription
 * Cette page est affichée lorsque l'utilisateur clique sur le lien de vérification d'email
 */
const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les paramètres du lien de vérification
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      setIsProcessing(true);
      setError(null);

      try {
        // Vérifier que les paramètres sont présents
        if (!token || !type || !email) {
          throw new Error('Lien de vérification invalide ou incomplet');
        }

        // Vérifier que le type est bien 'email_verification'
        if (type !== 'signup') {
          throw new Error('Ce lien n\'est pas un lien de vérification d\'email');
        }

        // Mettre à jour le statut du compte utilisateur
        const user = await getUserByEmail(email);
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }

        // Mettre à jour le statut dans la table des profils
        const { error: updateError } = await supabase
          .from('evscatala_profiles')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          throw new Error(`Erreur lors de la mise à jour du profil: ${updateError.message}`);
        }

        setIsSuccess(true);
      } catch (err) {
        setIsSuccess(false);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la vérification');
        console.error('Erreur de vérification d\'email:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    // Récupérer un utilisateur par son email
    const getUserByEmail = async (email: string) => {
      const { data, error } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      return data;
    };

    verifyEmail();
  }, [token, type, email]);

  // Rediriger vers la page de connexion
  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Rediriger vers la page d'accueil
  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Vérification de compte
          </CardTitle>
          <CardDescription className="text-center">
            Validation de votre adresse email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                Vérification de votre email en cours...
              </p>
            </div>
          )}

          {!isProcessing && isSuccess && (
            <div className="rounded-lg bg-green-50 p-6 flex flex-col items-center">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Compte vérifié avec succès !</h3>
              <p className="text-center text-green-700 mb-4">
                Votre compte a été activé. Vous pouvez maintenant vous connecter.
              </p>
              <Button onClick={handleGoToLogin} className="w-full mb-2">
                Se connecter
              </Button>
            </div>
          )}

          {!isProcessing && error && (
            <div className="rounded-lg bg-red-50 p-6 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Échec de la vérification</h3>
              <p className="text-center text-red-700 mb-4">
                {error}
              </p>
              <Button variant="outline" onClick={handleGoToHome} className="w-full">
                Retour à l'accueil
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Separator className="mb-4" />
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Besoin d'aide ?{' '}
              <a href="mailto:support@evscatala.fr" className="underline text-primary hover:text-primary/80">
                Contactez-nous
              </a>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerificationPage; 