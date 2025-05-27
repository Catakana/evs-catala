-- Script de debug pour tester l'insertion directe de notes
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier l'utilisateur actuel
SELECT auth.uid() as current_user_id;

-- 2. Vérifier si l'utilisateur a un profil
SELECT 
  user_id,
  firstname,
  lastname,
  role
FROM evscatala_profiles 
WHERE user_id = auth.uid();

-- 3. Test d'insertion directe avec l'utilisateur actuel
INSERT INTO evscatala_notes (
  content, 
  author_id, 
  title, 
  context_type, 
  status, 
  tags, 
  is_private
) VALUES (
  'Test d''insertion directe depuis SQL - ' || NOW()::text,
  auth.uid(),
  'Note de test SQL',
  'free',
  'draft',
  ARRAY['test', 'sql', 'debug'],
  false
);

-- 4. Vérifier que l'insertion a fonctionné
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
WHERE author_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- 5. Tester les politiques RLS en détail
-- Vérifier si l'utilisateur peut lire ses propres notes
SELECT 
  'Test lecture' as test_type,
  COUNT(*) as nombre_notes_visibles
FROM evscatala_notes
WHERE author_id = auth.uid();

-- 6. Vérifier les permissions sur la table
SELECT 
  has_table_privilege(auth.uid(), 'evscatala_notes', 'INSERT') as can_insert,
  has_table_privilege(auth.uid(), 'evscatala_notes', 'SELECT') as can_select,
  has_table_privilege(auth.uid(), 'evscatala_notes', 'UPDATE') as can_update,
  has_table_privilege(auth.uid(), 'evscatala_notes', 'DELETE') as can_delete;

-- 7. Vérifier les politiques RLS actives
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'evscatala_notes'
ORDER BY cmd; 