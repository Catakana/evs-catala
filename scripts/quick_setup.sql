-- Script de création rapide des tables manquantes pour EVS-Catala
-- Copiez et collez ce script dans l'éditeur SQL de Supabase

-- 1. Créer la table des participants aux événements (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS evscatala_event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES evscatala_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent', 'maybe')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- 2. Créer la table principale des projets
CREATE TABLE IF NOT EXISTS evscatala_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'canceled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_event_id ON evscatala_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_user_id ON evscatala_event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_created_by ON evscatala_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_status ON evscatala_projects(status);

-- 4. Activer RLS
ALTER TABLE evscatala_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_projects ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour evscatala_event_participants
DROP POLICY IF EXISTS "Lecture des participants" ON evscatala_event_participants;
CREATE POLICY "Lecture des participants" 
ON evscatala_event_participants FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Inscription aux événements" ON evscatala_event_participants;
CREATE POLICY "Inscription aux événements" 
ON evscatala_event_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 6. Politiques RLS pour evscatala_projects
DROP POLICY IF EXISTS "Lecture des projets" ON evscatala_projects;
CREATE POLICY "Lecture des projets" 
ON evscatala_projects FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Création de projets" ON evscatala_projects;
CREATE POLICY "Création de projets" 
ON evscatala_projects FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

-- 7. Vérification des tables créées
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('evscatala_event_participants', 'evscatala_projects')
GROUP BY table_name
ORDER BY table_name; 