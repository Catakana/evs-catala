import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Script pour créer la table des événements
const eventsMigrationSQL = `
-- Table des événements
CREATE TABLE IF NOT EXISTS evscatala_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reunion', 'animation', 'atelier', 'permanence', 'autre')),
  location TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Création de la politique RLS pour la table des événements
ALTER TABLE evscatala_events ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les événements
CREATE POLICY "Événements publics en lecture" ON evscatala_events
  FOR SELECT USING (true);

-- Politique d'insertion pour les événements (staff ou admin uniquement)
CREATE POLICY "Insertion d'événement par staff ou admin" ON evscatala_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de mise à jour pour les événements (créateur, staff ou admin)
CREATE POLICY "Mise à jour d'événement par créateur, staff ou admin" ON evscatala_events
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de suppression pour les événements (créateur, staff ou admin)
CREATE POLICY "Suppression d'événement par créateur, staff ou admin" ON evscatala_events
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_evscatala_events_start_datetime ON evscatala_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_end_datetime ON evscatala_events(end_datetime);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_category ON evscatala_events(category);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_created_by ON evscatala_events(created_by);
`;

const EventsMigrationTest: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const runMigration = async () => {
    try {
      setLoading(true);
      addLog('Début de la migration SQL pour la table des événements...');
      
      const { error } = await supabase.rpc('pgup_runtime', { source: eventsMigrationSQL });
      
      if (error) {
        addLog(`Erreur: ${error.message}`);
        setResponse(JSON.stringify(error, null, 2));
      } else {
        addLog('Migration réussie !');
        setResponse('La migration de la table des événements a été effectuée avec succès.');
      }
    } catch (err) {
      console.error('Erreur lors de la migration:', err);
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
          <CardTitle>Migration de la table des événements</CardTitle>
          <CardDescription>
            Cette page permet d'exécuter la migration SQL pour la table des événements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runMigration} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Migration en cours...' : 'Exécuter la migration SQL'}
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

export default EventsMigrationTest; 