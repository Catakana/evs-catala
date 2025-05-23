-- Script pour vérifier la structure des tables avant de définir les politiques RLS

-- Vérifie les colonnes des tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name LIKE 'evscatala_%'
ORDER BY table_name, ordinal_position;

-- Vérifie les politiques RLS existantes
SELECT table_name, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename LIKE 'evscatala_%'
ORDER BY tablename, policyname; 