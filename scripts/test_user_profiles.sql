-- Script de test pour la table evscatala_profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'existence de la table evscatala_profiles
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'evscatala_profiles';

-- 2. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'evscatala_profiles'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'evscatala_profiles';

-- 4. Compter le nombre de profils existants
SELECT COUNT(*) as total_profiles FROM evscatala_profiles;

-- 5. Afficher quelques exemples de profils (sans données sensibles)
SELECT 
    id,
    firstname,
    lastname,
    role,
    created_at
FROM evscatala_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Vérifier les utilisateurs auth sans profil
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE 
        WHEN ep.id IS NOT NULL THEN 'Profil existant'
        ELSE 'Profil manquant'
    END as status
FROM auth.users au
LEFT JOIN evscatala_profiles ep ON au.id = ep.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 7. Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS evscatala_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    firstname TEXT,
    lastname TEXT,
    role TEXT DEFAULT 'member',
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    bio TEXT,
    skills TEXT[],
    interests TEXT[],
    availability TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Activer RLS si pas déjà fait
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS de base
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON evscatala_profiles;
CREATE POLICY "Les utilisateurs peuvent voir tous les profils" 
ON evscatala_profiles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON evscatala_profiles;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
ON evscatala_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON evscatala_profiles;
CREATE POLICY "Les utilisateurs peuvent créer leur profil" 
ON evscatala_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 10. Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
    BEFORE UPDATE ON evscatala_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Créer des profils de test si aucun n'existe
INSERT INTO evscatala_profiles (id, email, firstname, lastname, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'firstname', 'Prénom'),
    COALESCE(au.raw_user_meta_data->>'lastname', 'Nom'),
    COALESCE(au.raw_user_meta_data->>'role', 'member')
FROM auth.users au
LEFT JOIN evscatala_profiles ep ON au.id = ep.id
WHERE ep.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 12. Vérification finale
SELECT 
    'evscatala_profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN firstname IS NOT NULL THEN 1 END) as with_firstname,
    COUNT(CASE WHEN lastname IS NOT NULL THEN 1 END) as with_lastname,
    COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as with_role
FROM evscatala_profiles; 