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

-- Politiques RLS pour les votes
ALTER TABLE evscatala_votes ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les votes publics
CREATE POLICY "Votes publics visibles par tous" ON evscatala_votes
  FOR SELECT USING (
    visibility = 'public' OR 
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Les staffs et admins peuvent créer des votes
CREATE POLICY "Création de vote par staff et admin" ON evscatala_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Seul le créateur d'un vote et les admins peuvent le modifier
CREATE POLICY "Modification de vote par créateur ou admin" ON evscatala_votes
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Seul le créateur d'un vote et les admins peuvent le supprimer
CREATE POLICY "Suppression de vote par créateur ou admin" ON evscatala_votes
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Politiques RLS pour les options de vote
ALTER TABLE evscatala_vote_options ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les options des votes accessibles
CREATE POLICY "Options visibles par tous" ON evscatala_vote_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        visibility = 'public' OR 
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Les staffs et admins peuvent créer des options
CREATE POLICY "Création d'options par staff et admin" ON evscatala_vote_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Seul le créateur du vote et les admins peuvent modifier les options
CREATE POLICY "Modification d'options par créateur ou admin" ON evscatala_vote_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Seul le créateur du vote et les admins peuvent supprimer les options
CREATE POLICY "Suppression d'options par créateur ou admin" ON evscatala_vote_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Politiques RLS pour les réponses aux votes
ALTER TABLE evscatala_vote_responses ENABLE ROW LEVEL SECURITY;

-- Visibilité des réponses selon la configuration du vote
CREATE POLICY "Réponses visibles selon configuration" ON evscatala_vote_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_responses.vote_id AND (
        -- Le créateur et les admins peuvent toujours voir
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin') OR
        -- Affichage immédiat pour tous
        result_visibility = 'immediate' OR
        -- Après avoir voté
        (result_visibility = 'afterVote' AND EXISTS (
          SELECT 1 FROM evscatala_vote_responses
          WHERE vote_id = evscatala_vote_responses.vote_id AND user_id = auth.uid()
        )) OR
        -- Après clôture
        (result_visibility = 'afterClose' AND status = 'closed')
      )
    )
  );

-- Les utilisateurs authentifiés peuvent voter
CREATE POLICY "Vote par utilisateur authentifié" ON evscatala_vote_responses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_responses.vote_id AND status = 'active'
    ) AND
    NOT EXISTS (
      SELECT 1 FROM evscatala_vote_responses
      WHERE vote_id = evscatala_vote_responses.vote_id AND user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer leur propre vote tant que le vote est actif
CREATE POLICY "Suppression de son propre vote" ON evscatala_vote_responses
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_responses.vote_id AND status = 'active'
    )
  );

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique du champ updated_at
CREATE TRIGGER update_evscatala_votes_updated_at
BEFORE UPDATE ON evscatala_votes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 