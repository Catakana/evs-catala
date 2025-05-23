import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

/**
 * Composant de test pour vérifier la connexion à Supabase
 * Utiliser ce composant pour tester la nouvelle instance Supabase après migration
 */
export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const [tablesStatus, setTablesStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tablesDetails, setTablesDetails] = useState<string[]>([]);
  
  // Tester la connexion à Supabase
  const testConnection = async () => {
    try {
      setConnectionStatus('loading');
      
      // Récupérer les paramètres de connexion depuis les variables d'environnement
      const url = import.meta.env.VITE_SUPABASE_URL || 'https://oybpmjjtbmlesvhlgabn.supabase.co';
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      // Masquer la clé d'API pour la sécurité
      const keyFirstChars = key.substring(0, 10);
      const keyLastChars = key.substring(key.length - 5);
      
      // Tester une requête simple
      const { data, error } = await supabase.from('evscatala_profiles').select('count(*)', { count: 'exact' });
      
      if (error) throw error;
      
      setConnectionStatus('success');
      setConnectionDetails(`Connexion réussie à ${url} (Clé: ${keyFirstChars}...${keyLastChars})`);
    } catch (error: any) {
      setConnectionStatus('error');
      setConnectionDetails(`Erreur de connexion: ${error.message || 'Erreur inconnue'}`);
    }
  };
  
  // Tester l'accès aux tables principales
  const checkTables = async () => {
    const tables = [
      'evscatala_profiles',
      'evscatala_events',
      'evscatala_announcements',
      'evscatala_permanences'
    ];
    
    setTablesStatus('loading');
    setTablesDetails([]);
    
    try {
      const results = [];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            results.push(`❌ ${table}: ${error.message}`);
          } else {
            results.push(`✅ ${table}: ${count || 0} enregistrements`);
          }
        } catch (e: any) {
          results.push(`❌ ${table}: ${e.message || 'Erreur inconnue'}`);
        }
      }
      
      setTablesDetails(results);
      setTablesStatus('success');
    } catch (error: any) {
      setTablesStatus('error');
      setTablesDetails([`Erreur lors de la vérification des tables: ${error.message || 'Erreur inconnue'}`]);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test de connexion Supabase</CardTitle>
        <CardDescription>
          Vérifiez la connexion à la nouvelle base de données Supabase après migration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-medium">État de la connexion:</h3>
            {connectionStatus === 'idle' && <Badge variant="outline">En attente</Badge>}
            {connectionStatus === 'loading' && <Badge variant="outline" className="bg-amber-100">Chargement...</Badge>}
            {connectionStatus === 'success' && <Badge variant="outline" className="bg-green-100">Connecté</Badge>}
            {connectionStatus === 'error' && <Badge variant="destructive">Erreur</Badge>}
          </div>
          {connectionDetails && (
            <p className="text-sm mt-1">{connectionDetails}</p>
          )}
        </div>
        
        {connectionStatus === 'success' && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium">Vérification des tables:</h3>
              {tablesStatus === 'idle' && <Badge variant="outline">En attente</Badge>}
              {tablesStatus === 'loading' && <Badge variant="outline" className="bg-amber-100">Chargement...</Badge>}
              {tablesStatus === 'success' && <Badge variant="outline" className="bg-green-100">Vérifié</Badge>}
              {tablesStatus === 'error' && <Badge variant="destructive">Erreur</Badge>}
            </div>
            {tablesDetails.length > 0 && (
              <ul className="text-sm mt-1 space-y-1">
                {tablesDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={testConnection} 
          disabled={connectionStatus === 'loading'}
        >
          Tester la connexion
        </Button>
        {connectionStatus === 'success' && (
          <Button 
            onClick={checkTables} 
            disabled={tablesStatus === 'loading'}
            variant="outline"
          >
            Vérifier les tables
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 