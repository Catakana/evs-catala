import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Script pour créer les tables de vote
const voteMigrationSQL = `
-- Migration pour ajouter les tables liées aux votes
-- Préfixe: evscatala_ conformément à la convention

-- Table principale des votes
CREATE TABLE IF NOT EXISTS evscatala_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('binary', 'multiple', 'survey')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'anonymous')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  result_visibility TEXT NOT NULL DEFAULT 'immediate' CHECK (result_visibility IN ('immediate', 'afterVote', 'afterClose')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '1 week',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_evscatala_votes_status ON evscatala_votes(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_votes_created_by ON evscatala_votes(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_votes_dates ON evscatala_votes(start_date, end_date);

-- Table des options de vote
CREATE TABLE IF NOT EXISTS evscatala_vote_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID REFERENCES evscatala_votes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_options_vote_id ON evscatala_vote_options(vote_id);

-- Table des réponses aux votes
CREATE TABLE IF NOT EXISTS evscatala_vote_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID REFERENCES evscatala_votes(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES evscatala_vote_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances et empêcher les votes multiples
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_responses_vote_id ON evscatala_vote_responses(vote_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_responses_option_id ON evscatala_vote_responses(option_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_responses_user_id ON evscatala_vote_responses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evscatala_vote_responses_unique_vote ON evscatala_vote_responses(vote_id, user_id);
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
      addLog('Début de la migration SQL pour les tables de vote...');
      
      const { error } = await supabase.rpc('pgup_runtime', { source: voteMigrationSQL });
      
      if (error) {
        addLog(`Erreur: ${error.message}`);
        setResponse(JSON.stringify(error, null, 2));
      } else {
        addLog('Migration réussie !');
        setResponse('La migration des tables de vote a été effectuée avec succès.');
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
          <CardTitle>Migration des tables de vote</CardTitle>
          <CardDescription>
            Cette page permet d'exécuter la migration SQL pour les tables de vote.
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

export default MigrationTest; 