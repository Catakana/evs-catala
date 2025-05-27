-- Script pour vérifier les notes créées par le debugger
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier l'utilisateur actuel
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- 2. Compter toutes les notes de l'utilisateur
SELECT 
  COUNT(*) as total_notes_user
FROM evscatala_notes 
WHERE author_id = auth.uid();

-- 3. Voir les dernières notes créées
SELECT 
  id,
  title,
  content,
  context_type,
  status,
  tags,
  is_private,
  created_at,
  updated_at
FROM evscatala_notes
WHERE author_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- 4. Vérifier les notes de test spécifiquement
SELECT 
  id,
  title,
  content,
  tags,
  created_at
FROM evscatala_notes
WHERE author_id = auth.uid()
  AND (
    content LIKE '%debugger%' 
    OR content LIKE '%service%'
    OR tags && ARRAY['test', 'debug', 'service']
  )
ORDER BY created_at DESC;

-- 5. Statistiques par statut
SELECT 
  status,
  COUNT(*) as count
FROM evscatala_notes
WHERE author_id = auth.uid()
GROUP BY status; 