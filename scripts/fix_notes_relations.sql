-- Script de correction des relations pour les notes
-- À exécuter dans l'interface SQL de Supabase

-- 1. S'assurer que la table evscatala_profiles existe
CREATE TABLE IF NOT EXISTS evscatala_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'staff', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 2. S'assurer que la table evscatala_events existe
CREATE TABLE IF NOT EXISTS evscatala_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('reunion', 'animation', 'atelier', 'permanence', 'autre')),
  location VARCHAR(255),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  max_participants INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT
);

-- 3. Créer la table evscatala_notes avec toutes les relations
CREATE TABLE IF NOT EXISTS evscatala_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_type VARCHAR(20) DEFAULT 'free' CHECK (context_type IN ('event', 'project', 'free')),
  context_id UUID, -- Référence vers l'événement ou projet lié (optionnel)
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'pending')),
  tags TEXT[] DEFAULT '{}', -- Array de tags
  shared_with UUID[] DEFAULT '{}', -- Array d'IDs utilisateurs ayant accès
  title VARCHAR(255), -- Titre optionnel pour la note
  is_private BOOLEAN DEFAULT false -- Note privée ou visible aux membres autorisés
);

-- 4. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_evscatala_profiles_user_id ON evscatala_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_created_by ON evscatala_events(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_author_id ON evscatala_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_type ON evscatala_notes(context_type);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_id ON evscatala_notes(context_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_status ON evscatala_notes(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_created_at ON evscatala_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_tags ON evscatala_notes USING GIN(tags);

-- 5. Activer RLS sur toutes les tables
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_notes ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour evscatala_profiles
DROP POLICY IF EXISTS "Lecture des profils" ON evscatala_profiles;
CREATE POLICY "Lecture des profils" 
ON evscatala_profiles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Insertion du profil personnel" ON evscatala_profiles;
CREATE POLICY "Insertion du profil personnel" 
ON evscatala_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mise à jour du profil personnel" ON evscatala_profiles;
CREATE POLICY "Mise à jour du profil personnel" 
ON evscatala_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Politiques RLS pour evscatala_events
DROP POLICY IF EXISTS "Lecture des événements" ON evscatala_events;
CREATE POLICY "Lecture des événements" 
ON evscatala_events FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Création d'événements" ON evscatala_events;
CREATE POLICY "Création d'événements" 
ON evscatala_events FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Modification d'événements" ON evscatala_events;
CREATE POLICY "Modification d'événements" 
ON evscatala_events FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
)
WITH CHECK (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Suppression d'événements" ON evscatala_events;
CREATE POLICY "Suppression d'événements" 
ON evscatala_events FOR DELETE 
TO authenticated 
USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

-- 8. Politiques RLS pour evscatala_notes
DROP POLICY IF EXISTS "Lecture des notes" ON evscatala_notes;
CREATE POLICY "Lecture des notes" 
ON evscatala_notes FOR SELECT 
TO authenticated 
USING (
  auth.uid() = author_id OR
  (NOT is_private AND EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))) OR
  auth.uid() = ANY(shared_with) OR
  (context_type = 'event' AND context_id IS NOT NULL AND NOT is_private)
);

DROP POLICY IF EXISTS "Création de notes" ON evscatala_notes;
CREATE POLICY "Création de notes" 
ON evscatala_notes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Modification de notes" ON evscatala_notes;
CREATE POLICY "Modification de notes" 
ON evscatala_notes FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
)
WITH CHECK (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Suppression de notes" ON evscatala_notes;
CREATE POLICY "Suppression de notes" 
ON evscatala_notes FOR DELETE 
TO authenticated 
USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 9. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
BEFORE UPDATE ON evscatala_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_events_updated_at ON evscatala_events;
CREATE TRIGGER update_evscatala_events_updated_at
BEFORE UPDATE ON evscatala_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_notes_updated_at ON evscatala_notes;
CREATE TRIGGER update_evscatala_notes_updated_at
BEFORE UPDATE ON evscatala_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Vérification finale - Test des relations
SELECT 
  'evscatala_notes' as table_name,
  COUNT(*) as row_count
FROM evscatala_notes
UNION ALL
SELECT 
  'evscatala_profiles' as table_name,
  COUNT(*) as row_count
FROM evscatala_profiles
UNION ALL
SELECT 
  'evscatala_events' as table_name,
  COUNT(*) as row_count
FROM evscatala_events;

-- 12. Test de la structure des tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('evscatala_notes', 'evscatala_profiles', 'evscatala_events')
ORDER BY table_name, ordinal_position; 