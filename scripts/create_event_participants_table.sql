-- Script de création de la table des participants aux événements
-- À exécuter dans l'interface SQL de Supabase

-- Vérifier si la table evscatala_profiles existe, sinon la créer
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

-- Index pour evscatala_profiles
CREATE INDEX IF NOT EXISTS idx_evscatala_profiles_user_id ON evscatala_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_profiles_role ON evscatala_profiles(role);

-- Activer RLS pour evscatala_profiles
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les profils
DROP POLICY IF EXISTS "Lecture des profils pour tous les utilisateurs authentifiés" ON evscatala_profiles;
CREATE POLICY "Lecture des profils pour tous les utilisateurs authentifiés" 
ON evscatala_profiles FOR SELECT 
TO authenticated 
USING (true);

-- Création de la table evscatala_event_participants
CREATE TABLE IF NOT EXISTS evscatala_event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES evscatala_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent', 'maybe')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité : un utilisateur ne peut s'inscrire qu'une fois par événement
  UNIQUE(event_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_event_id ON evscatala_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_user_id ON evscatala_event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_status ON evscatala_event_participants(status);

-- Activer RLS (Row Level Security)
ALTER TABLE evscatala_event_participants ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : tous les utilisateurs authentifiés peuvent voir les participants
DROP POLICY IF EXISTS "Lecture des participants pour tous les utilisateurs authentifiés" ON evscatala_event_participants;
CREATE POLICY "Lecture des participants pour tous les utilisateurs authentifiés" 
ON evscatala_event_participants FOR SELECT 
TO authenticated 
USING (true);

-- Politique d'insertion : les utilisateurs peuvent s'inscrire eux-mêmes
DROP POLICY IF EXISTS "Inscription personnelle aux événements" ON evscatala_event_participants;
CREATE POLICY "Inscription personnelle aux événements" 
ON evscatala_event_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour : les utilisateurs peuvent modifier leur propre statut, staff/admin peuvent modifier tous les statuts
DROP POLICY IF EXISTS "Mise à jour du statut de participation" ON evscatala_event_participants;
CREATE POLICY "Mise à jour du statut de participation" 
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

-- Politique de suppression : les utilisateurs peuvent se désinscrire eux-mêmes, staff/admin peuvent supprimer toute participation
DROP POLICY IF EXISTS "Suppression de participation" ON evscatala_event_participants;
CREATE POLICY "Suppression de participation" 
ON evscatala_event_participants FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_evscatala_event_participants_updated_at ON evscatala_event_participants;
CREATE TRIGGER update_evscatala_event_participants_updated_at
BEFORE UPDATE ON evscatala_event_participants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour evscatala_profiles
DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
BEFORE UPDATE ON evscatala_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE evscatala_event_participants IS 'Table des participants aux événements de l''agenda';
COMMENT ON COLUMN evscatala_event_participants.id IS 'Identifiant unique de la participation';
COMMENT ON COLUMN evscatala_event_participants.event_id IS 'Référence vers l''événement';
COMMENT ON COLUMN evscatala_event_participants.user_id IS 'Référence vers l''utilisateur participant';
COMMENT ON COLUMN evscatala_event_participants.status IS 'Statut de participation : registered, present, absent, maybe';
COMMENT ON COLUMN evscatala_event_participants.registered_at IS 'Date et heure d''inscription';
COMMENT ON COLUMN evscatala_event_participants.updated_at IS 'Date et heure de dernière modification';

COMMENT ON TABLE evscatala_profiles IS 'Table des profils utilisateurs';
COMMENT ON COLUMN evscatala_profiles.user_id IS 'Référence vers l''utilisateur auth';
COMMENT ON COLUMN evscatala_profiles.firstname IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN evscatala_profiles.lastname IS 'Nom de l''utilisateur';
COMMENT ON COLUMN evscatala_profiles.role IS 'Rôle de l''utilisateur : member, staff, admin';

-- Vérification de la création
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('evscatala_event_participants', 'evscatala_profiles')
ORDER BY table_name, ordinal_position;

-- Données de test (optionnel - à commenter en production)
/*
-- Exemple d'insertion de participants de test
INSERT INTO evscatala_event_participants (event_id, user_id, status) VALUES
  -- Remplacer par des IDs réels d'événements et d'utilisateurs
  ('event-uuid-1', 'user-uuid-1', 'registered'),
  ('event-uuid-1', 'user-uuid-2', 'maybe'),
  ('event-uuid-2', 'user-uuid-1', 'present');
*/ 