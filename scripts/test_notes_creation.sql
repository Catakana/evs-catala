-- Script de test pour vérifier la création de notes
-- À exécuter dans l'interface SQL de Supabase après avoir exécuté fix_notes_issue.sql

-- 1. Vérifier que la table existe et sa structure
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'evscatala_notes';

-- 2. Vérifier les colonnes de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evscatala_notes'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'evscatala_notes';

-- 4. Test d'insertion d'une note (décommentez pour tester)
/*
INSERT INTO evscatala_notes (
  content, 
  author_id, 
  title, 
  context_type, 
  status, 
  tags, 
  is_private
) VALUES (
  'Ceci est une note de test pour vérifier que l''enregistrement fonctionne correctement.',
  auth.uid(),
  'Note de test - ' || NOW()::text,
  'free',
  'draft',
  ARRAY['test', 'diagnostic', 'debug'],
  false
);
*/

-- 5. Vérifier les notes existantes
SELECT 
  id,
  title,
  content,
  author_id,
  context_type,
  status,
  tags,
  is_private,
  created_at
FROM evscatala_notes
ORDER BY created_at DESC
LIMIT 10;

-- 6. Compter le nombre total de notes
SELECT COUNT(*) as total_notes FROM evscatala_notes;

-- 7. Vérifier les utilisateurs qui ont des notes
SELECT 
  author_id,
  COUNT(*) as nombre_notes
FROM evscatala_notes
GROUP BY author_id; 