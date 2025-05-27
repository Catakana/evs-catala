-- Script de création des tables pour le module Votes v2
-- Architecture simplifiée : pas de jointures complexes

-- Table principale des votes
CREATE TABLE evscatala_votes_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('yes_no', 'single_choice', 'multiple_choice')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  show_results_mode TEXT NOT NULL DEFAULT 'after_vote' CHECK (show_results_mode IN ('immediate', 'after_vote', 'after_close')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options de vote (pour choix multiples)
CREATE TABLE evscatala_vote_options_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES evscatala_votes_v2(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Réponses des utilisateurs
CREATE TABLE evscatala_vote_responses_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES evscatala_votes_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL, -- Array des IDs d'options sélectionnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, user_id) -- Un seul vote par utilisateur
);

-- Index pour les performances
CREATE INDEX idx_votes_v2_status ON evscatala_votes_v2(status);
CREATE INDEX idx_votes_v2_dates ON evscatala_votes_v2(start_date, end_date);
CREATE INDEX idx_vote_options_v2_vote_id ON evscatala_vote_options_v2(vote_id);
CREATE INDEX idx_vote_responses_v2_vote_id ON evscatala_vote_responses_v2(vote_id);
CREATE INDEX idx_vote_responses_v2_user_id ON evscatala_vote_responses_v2(user_id);

-- Politiques RLS (Row Level Security)

-- Votes : lecture pour tous, création pour staff+
ALTER TABLE evscatala_votes_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture des votes" ON evscatala_votes_v2;
CREATE POLICY "Lecture des votes" ON evscatala_votes_v2
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Création de votes" ON evscatala_votes_v2
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Modification de votes" ON evscatala_votes_v2
  FOR UPDATE TO authenticated 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Suppression de votes" ON evscatala_votes_v2
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Options : lecture pour tous, création pour le créateur du vote
ALTER TABLE evscatala_vote_options_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des options" ON evscatala_vote_options_v2
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Création des options" ON evscatala_vote_options_v2
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_votes_v2 
      WHERE id = vote_id 
      AND (created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin'))
    )
  );

-- Réponses : lecture pour tous, création pour soi-même
ALTER TABLE evscatala_vote_responses_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des réponses" ON evscatala_vote_responses_v2
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Création de réponses" ON evscatala_vote_responses_v2
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modification de réponses" ON evscatala_vote_responses_v2
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_votes_v2_updated_at BEFORE UPDATE ON evscatala_votes_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vote_responses_v2_updated_at BEFORE UPDATE ON evscatala_vote_responses_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE evscatala_votes_v2 IS 'Table principale des votes - version 2 simplifiée';
COMMENT ON TABLE evscatala_vote_options_v2 IS 'Options de vote pour les choix multiples';
COMMENT ON TABLE evscatala_vote_responses_v2 IS 'Réponses des utilisateurs aux votes';

COMMENT ON COLUMN evscatala_votes_v2.type IS 'Type de vote: yes_no, single_choice, multiple_choice';
COMMENT ON COLUMN evscatala_votes_v2.status IS 'Statut: draft, active, closed, archived';
COMMENT ON COLUMN evscatala_votes_v2.show_results_mode IS 'Quand afficher les résultats: immediate, after_vote, after_close';
COMMENT ON COLUMN evscatala_vote_responses_v2.selected_options IS 'Array JSON des IDs d''options sélectionnées'; 