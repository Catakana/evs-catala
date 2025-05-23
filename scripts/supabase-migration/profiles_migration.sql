-- ==========================================
-- Table des profils utilisateurs
-- ==========================================
CREATE TABLE IF NOT EXISTS evscatala_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'staff', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS pour les profils
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profils publics en lecture" ON evscatala_profiles;
CREATE POLICY "Profils publics en lecture" ON evscatala_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion de profil par utilisateur authentifié" ON evscatala_profiles;
CREATE POLICY "Insertion de profil par utilisateur authentifié" ON evscatala_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mise à jour de profil par propriétaire ou admin" ON evscatala_profiles;
CREATE POLICY "Mise à jour de profil par propriétaire ou admin" ON evscatala_profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ==========================================
-- Trigger pour updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
BEFORE UPDATE ON evscatala_profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- Synchronisation des utilisateurs existants
-- ==========================================
INSERT INTO evscatala_profiles (user_id, firstname, lastname, email, role, status)
SELECT 
  auth.users.id, 
  COALESCE(auth.users.raw_user_meta_data->>'firstname', 'Utilisateur') as firstname,
  COALESCE(auth.users.raw_user_meta_data->>'lastname', 'Temporaire') as lastname,
  auth.users.email,
  COALESCE(auth.users.raw_user_meta_data->>'role', 'member') as role,
  'active' as status
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM evscatala_profiles WHERE evscatala_profiles.user_id = auth.users.id
) AND auth.users.email IS NOT NULL;