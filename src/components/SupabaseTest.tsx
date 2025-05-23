import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setConnectionStatus('loading');
      setErrorMessage(null);
      
      // Test simple pour vérifier que la connexion Supabase fonctionne
      const { data, error } = await supabase.from('evs_profiles').select('count()', { count: 'exact' });
      
      if (error) {
        console.error('Erreur Supabase:', error);
        setConnectionStatus('error');
        setErrorMessage(error.message);
        return;
      }
      
      console.log('Connexion Supabase OK:', data);
      setConnectionStatus('success');
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Test de connexion Supabase</h2>
      
      <div className="flex flex-col gap-4">
        <Button 
          onClick={testConnection}
          disabled={connectionStatus === 'loading'}
        >
          {connectionStatus === 'loading' ? 'Test en cours...' : 'Tester la connexion'}
        </Button>
        
        {connectionStatus === 'success' && (
          <div className="p-2 bg-green-100 text-green-800 rounded">
            Connexion réussie à Supabase! 
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div className="p-2 bg-red-100 text-red-800 rounded">
            <p>Erreur de connexion à Supabase!</p>
            {errorMessage && <p className="text-sm mt-1">{errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
} 