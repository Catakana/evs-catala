import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Script de test général pour vérifier les migrations
const testMigrationSQL = `
-- Test de migration général
-- Vérification de l'état des tables principales

SELECT 
  'evscatala_profiles' as table_name,
  COUNT(*) as record_count
FROM evscatala_profiles
UNION ALL
SELECT 
  'evscatala_events' as table_name,
  COUNT(*) as record_count
FROM evscatala_events
UNION ALL
SELECT 
  'evscatala_event_participants' as table_name,
  COUNT(*) as record_count
FROM evscatala_event_participants
UNION ALL
SELECT 
  'evscatala_notes' as table_name,
  COUNT(*) as record_count
FROM evscatala_notes
ORDER BY table_name;
`;

const MigrationTest: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const runMigration = async () => {
    try {
      setLoading(true);
      addLog('Début du test de migration...');
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: testMigrationSQL });
      
      if (error) {
        addLog(`Erreur: ${error.message}`);
        setResponse(JSON.stringify(error, null, 2));
      } else {
        addLog('Test de migration réussi !');
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('Erreur lors du test:', err);
      addLog(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      setResponse(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de migration général</CardTitle>
          <CardDescription>
            Cette page permet de tester l'état des migrations de base de données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runMigration} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Test en cours...' : 'Exécuter le test de migration'}
            </Button>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">Journal</h3>
              <div className="h-40 overflow-y-auto bg-muted p-2 rounded">
                {log.map((entry, index) => (
                  <div key={index} className="text-sm">{entry}</div>
                ))}
                {log.length === 0 && (
                  <div className="text-sm text-muted-foreground">Aucune activité pour le moment</div>
                )}
              </div>
            </div>
            
            {response && (
              <div>
                <h3 className="text-lg font-medium mb-2">Réponse</h3>
                <Textarea 
                  value={response} 
                  readOnly 
                  className="h-40 font-mono text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationTest; 