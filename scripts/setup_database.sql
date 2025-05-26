-- Script de configuration de la base de données EVS-catala
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'evscatala_%'
ORDER BY table_name;

-- 2. Créer la table des profils si elle n'existe pas
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

-- 3. Créer la table des événements si elle n'existe pas
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table des participants aux événements
CREATE TABLE IF NOT EXISTS evscatala_event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES evscatala_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent', 'maybe')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- 5. Créer les index
CREATE INDEX IF NOT EXISTS idx_evscatala_profiles_user_id ON evscatala_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_created_by ON evscatala_events(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_start_datetime ON evscatala_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_event_id ON evscatala_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_user_id ON evscatala_event_participants(user_id);

-- 6. Activer RLS sur toutes les tables
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_event_participants ENABLE ROW LEVEL SECURITY;

-- 7. Politiques RLS pour evscatala_profiles
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

-- 8. Politiques RLS pour evscatala_events
DROP POLICY IF EXISTS "Lecture des événements" ON evscatala_events;
CREATE POLICY "Lecture des événements" 
ON evscatala_events FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Création d'événements" ON evscatala_events;
CREATE POLICY "Création d'événements" 
ON evscatala_events FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

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

-- 9. Politiques RLS pour evscatala_event_participants
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

DROP POLICY IF EXISTS "Modification de participation" ON evscatala_event_participants;
CREATE POLICY "Modification de participation" 
ON evscatala_event_participants FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
)
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Désinscription des événements" ON evscatala_event_participants;
CREATE POLICY "Désinscription des événements" 
ON evscatala_event_participants FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

-- 10. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
BEFORE UPDATE ON evscatala_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_events_updated_at ON evscatala_events;
CREATE TRIGGER update_evscatala_events_updated_at
BEFORE UPDATE ON evscatala_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_event_participants_updated_at ON evscatala_event_participants;
CREATE TRIGGER update_evscatala_event_participants_updated_at
BEFORE UPDATE ON evscatala_event_participants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Vérification finale
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('evscatala_profiles', 'evscatala_events', 'evscatala_event_participants')
GROUP BY table_name
ORDER BY table_name; 