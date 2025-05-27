-- Test d'insertion simple pour les notes
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier l'utilisateur actuel
SELECT 
  auth.uid() as user_id,
  auth.email() as user_email;

-- 2. Test d'insertion simple
INSERT INTO evscatala_notes (
  content, 
  author_id, 
  title, 
  context_type, 
  status, 
  tags, 
  is_private
) VALUES (
  'Test d''insertion simple - ' || NOW()::text,
  auth.uid(),
  'Note de test simple',
  'free',
  'draft',
  ARRAY['test'],
  false
);

-- 3. Vérifier l'insertion
SELECT 
  id,
  title,
  content,
  author_id,
  created_at
FROM evscatala_notes
WHERE author_id = auth.uid()
ORDER BY created_at DESC
LIMIT 3; 