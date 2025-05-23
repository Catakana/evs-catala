import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Un simple test en faisant une requête qui devrait toujours fonctionner
      const { error } = await supabase.from('evs_profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Erreur de connexion Supabase:', error);
        setConnectionStatus('error');
        setErrorMessage(error.message);
      } else {
        console.log('Connexion Supabase réussie');
        setConnectionStatus('success');
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setConnectionStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="mb-8">
      {connectionStatus === 'loading' && (
        <Alert>
          <AlertTitle>Test de connexion Supabase en cours...</AlertTitle>
          <AlertDescription>
            Vérification de la configuration...
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle>Connexion Supabase établie avec succès!</AlertTitle>
          <AlertDescription>
            Les variables d'environnement sont correctement configurées.
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Erreur de connexion Supabase</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={testConnection} 
        className="mt-4"
        disabled={connectionStatus === 'loading'}
      >
        Tester à nouveau
      </Button>
    </div>
  );
};

export default SupabaseTest; 