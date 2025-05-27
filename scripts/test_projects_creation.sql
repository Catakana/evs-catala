-- Script de diagnostic pour la création de projets
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier que toutes les tables existent
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'evscatala_project%'
ORDER BY table_name;

-- 2. Vérifier la structure de la table principale
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'evscatala_projects'
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
WHERE tablename LIKE 'evscatala_project%'
ORDER BY tablename, policyname;

-- 4. Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename LIKE 'evscatala_project%'
ORDER BY tablename;

-- 5. Test d'insertion simple (remplacer l'UUID par un vrai user_id)
-- ATTENTION: Remplacer 'USER_ID_ICI' par un vrai UUID d'utilisateur
/*
INSERT INTO evscatala_projects (
  title,
  description,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'Test Projet Diagnostic',
  'Projet créé pour tester la création depuis SQL',
  'planning',
  'USER_ID_ICI', -- Remplacer par un vrai user_id
  NOW(),
  NOW()
);
*/

-- 6. Vérifier les utilisateurs disponibles (pour récupérer un user_id valide)
SELECT 
  id,
  email,
  created_at
FROM auth.users 
LIMIT 5;

-- 7. Compter les projets existants
SELECT COUNT(*) as nombre_projets FROM evscatala_projects;

-- 8. Vérifier les dernières erreurs dans les logs (si disponible)
-- Cette requête peut ne pas fonctionner selon la configuration
SELECT 
  *
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%evscatala_projects%'
LIMIT 5; 