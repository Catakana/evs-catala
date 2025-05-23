import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SupabaseDebugTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setError(null);
    setSuccess(null);
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    clearLogs();

    try {
      addLog("Test de connexion à Supabase...");
      
      // Log configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '(fallback URL)';
      addLog(`URL Supabase: ${showSensitiveInfo ? supabaseUrl : '***redacted***'}`);
      addLog(`Variables d'environnement définies: URL=${!!import.meta.env.VITE_SUPABASE_URL}, ANON_KEY=${!!import.meta.env.VITE_SUPABASE_ANON_KEY}`);
      
      // Test basic connection
      addLog("Test de requête simple...");
      const { data, error } = await supabase.from('evscatala_profiles').select('count').limit(1);
      
      if (error) {
        addLog(`Erreur lors du test de connexion: ${error.message}`);
        setError(`Erreur de connexion: ${error.message}`);
      } else {
        addLog(`Connexion réussie, réponse: ${JSON.stringify(data)}`);
        setSuccess("Connexion à Supabase réussie!");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      addLog(`Exception lors du test de connexion: ${errorMessage}`);
      setError(`Exception: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseSchema = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    clearLogs();

    try {
      addLog("Vérification du schéma de la base de données...");
      
      // List of tables to check
      const tablesToCheck = [
        'evscatala_profiles',
        'evscatala_votes',
        'evscatala_vote_options',
        'evscatala_vote_responses',
        'evscatala_events',
        'evscatala_announcements',
        'evscatala_announcement_reads',
        'evscatala_permanences',
        'evscatala_permanence_participants',
        'evscatala_conversations',
        'evscatala_conversation_participants',
        'evscatala_messages'
      ];
      
      addLog(`Vérification de ${tablesToCheck.length} tables...`);
      
      const tableResults = [];
      
      for (const table of tablesToCheck) {
        try {
          // Try to get the count of records in the table
          const { data, error } = await supabase.from(table).select('count');
          
          if (error) {
            addLog(`Table ${table}: ERREUR - ${error.message}`);
            tableResults.push({ table, exists: false, error: error.message });
          } else {
            const count = data?.[0]?.count || 0;
            addLog(`Table ${table}: OK - ${count} enregistrements`);
            tableResults.push({ table, exists: true, count });
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
          addLog(`Table ${table}: EXCEPTION - ${errorMsg}`);
          tableResults.push({ table, exists: false, error: errorMsg });
        }
      }
      
      // Check auth.users table (need to be admin to access this, may fail)
      try {
        addLog("Vérification de la table auth.users...");
        const { data, error } = await supabase.from('auth').select('*').limit(1);
        
        if (error) {
          addLog(`Table auth.users: ERREUR - ${error.message} (c'est normal si vous n'êtes pas admin)`);
        } else {
          addLog(`Table auth.users: OK`);
        }
      } catch (err) {
        addLog(`Table auth.users: EXCEPTION - Accès probablement refusé (normal)`);
      }
      
      // Summary
      const existingTables = tableResults.filter(t => t.exists).length;
      const missingTables = tableResults.filter(t => !t.exists).length;
      
      if (missingTables === 0) {
        setSuccess(`Toutes les ${existingTables} tables existent dans la base de données!`);
      } else {
        setError(`${missingTables} tables manquantes sur ${tablesToCheck.length} tables vérifiées.`);
      }
      
      addLog(`Résumé: ${existingTables} tables existantes, ${missingTables} tables manquantes.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      addLog(`Exception lors de la vérification du schéma: ${errorMessage}`);
      setError(`Exception: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfiles = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    clearLogs();

    try {
      addLog("Vérification de la synchronisation entre auth.users et evscatala_profiles...");
      
      // Get profiles from evscatala_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('evscatala_profiles')
        .select('*');
      
      if (profilesError) {
        addLog(`Erreur lors de la récupération des profils: ${profilesError.message}`);
        setError(`Erreur: ${profilesError.message}`);
        return;
      }
      
      addLog(`${profiles?.length || 0} profils trouvés dans evscatala_profiles`);
      
      if (profiles && profiles.length > 0) {
        // Display sample profile (first one)
        const sampleProfile = profiles[0];
        addLog(`Exemple de profil (${sampleProfile.email || 'Email inconnu'}):`);
        addLog(JSON.stringify({
          id: sampleProfile.id,
          user_id: sampleProfile.user_id,
          email: sampleProfile.email,
          firstname: sampleProfile.firstname,
          lastname: sampleProfile.lastname,
          role: sampleProfile.role,
          status: sampleProfile.status
        }, null, 2));
      }
      
      // Try to get current user from auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addLog(`Erreur lors de la récupération de l'utilisateur authentifié: ${authError.message}`);
      } else if (authUser?.user) {
        addLog(`Utilisateur authentifié trouvé: ${authUser.user.email}`);
        
        // Check if this user has a profile
        const userProfile = profiles?.find(p => p.user_id === authUser.user.id);
        
        if (userProfile) {
          addLog(`Profil trouvé pour l'utilisateur authentifié: ${userProfile.email}`);
          setSuccess("Profil utilisateur synchronisé correctement!");
        } else {
          addLog(`Aucun profil trouvé pour l'utilisateur authentifié. Désynchronisation détectée!`);
          setError("Désynchronisation détectée: l'utilisateur authentifié n'a pas de profil");
        }
      } else {
        addLog('Aucun utilisateur authentifié trouvé');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      addLog(`Exception lors de la vérification des profils: ${errorMessage}`);
      setError(`Exception: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Diagnostic</CardTitle>
          <CardDescription>
            Outil pour diagnostiquer les problèmes de connexion à Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-sensitive-info" 
              checked={showSensitiveInfo} 
              onCheckedChange={(checked) => setShowSensitiveInfo(checked as boolean)} 
            />
            <Label htmlFor="show-sensitive-info">Afficher les informations sensibles (URL, etc.)</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              variant="default"
            >
              Tester la connexion
            </Button>
            <Button 
              onClick={checkDatabaseSchema} 
              disabled={loading}
              variant="secondary"
            >
              Vérifier le schéma de la BDD
            </Button>
            <Button 
              onClick={checkUserProfiles} 
              disabled={loading}
              variant="outline"
            >
              Vérifier les profils utilisateurs
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Logs:</h3>
            <Textarea 
              className="h-80 font-mono text-xs"
              readOnly
              value={logs.join('\n')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={clearLogs} variant="outline" size="sm">
            Effacer les logs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupabaseDebugTest; 