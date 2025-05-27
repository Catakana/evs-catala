-- Script de test pour le module Annonces
-- Vérifie que toutes les tables et fonctions sont correctement créées

-- Vérifier l'existence des tables
SELECT 'Tables des annonces:' as test_section;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'evscatala_announcements',
  'evscatala_announcement_reads', 
  'evscatala_announcement_attachments'
)
ORDER BY table_name;

-- Vérifier la structure de la table principale
SELECT 'Structure de evscatala_announcements:' as test_section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evscatala_announcements'
ORDER BY ordinal_position;

-- Vérifier les index
SELECT 'Index des annonces:' as test_section;
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename LIKE 'evscatala_announcement%'
ORDER BY tablename, indexname;

-- Vérifier les politiques RLS
SELECT 'Politiques RLS:' as test_section;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename LIKE 'evscatala_announcement%'
ORDER BY tablename, policyname;

-- Vérifier les fonctions RPC
SELECT 'Fonctions RPC:' as test_section;
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_announcements_with_author',
  'mark_announcement_as_read',
  'get_user_announcement_reads'
)
ORDER BY routine_name;

-- Vérifier les triggers
SELECT 'Triggers:' as test_section;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table LIKE 'evscatala_announcement%'
ORDER BY event_object_table, trigger_name;

-- Test d'insertion d'une annonce de test (si un utilisateur existe)
DO $$
DECLARE
  test_user_id UUID;
  test_announcement_id UUID;
BEGIN
  -- Récupérer un utilisateur de test
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Insérer une annonce de test
    INSERT INTO evscatala_announcements (
      title, 
      content, 
      category, 
      author_id,
      is_pinned,
      priority
    ) VALUES (
      'Test Annonce - Script de vérification',
      'Ceci est une annonce de test créée par le script de vérification. Elle peut être supprimée en toute sécurité.',
      'info',
      test_user_id,
      false,
      1
    ) RETURNING id INTO test_announcement_id;
    
    RAISE NOTICE 'Annonce de test créée avec l''ID: %', test_announcement_id;
    
    -- Tester la fonction de marquage comme lu
    PERFORM mark_announcement_as_read(test_announcement_id);
    RAISE NOTICE 'Annonce marquée comme lue pour l''utilisateur: %', test_user_id;
    
  ELSE
    RAISE NOTICE 'Aucun utilisateur trouvé pour les tests';
  END IF;
END $$;

-- Tester la fonction get_announcements_with_author
SELECT 'Test de la fonction get_announcements_with_author:' as test_section;
SELECT 
  id,
  title,
  category,
  author_name,
  is_pinned,
  priority,
  attachments_count
FROM get_announcements_with_author()
LIMIT 5;

-- Compter les enregistrements dans chaque table
SELECT 'Nombre d''enregistrements par table:' as test_section;
SELECT 'evscatala_announcements' as table_name, COUNT(*) as records FROM evscatala_announcements
UNION ALL
SELECT 'evscatala_announcement_reads' as table_name, COUNT(*) as records FROM evscatala_announcement_reads
UNION ALL
SELECT 'evscatala_announcement_attachments' as table_name, COUNT(*) as records FROM evscatala_announcement_attachments;

-- Vérifier les contraintes de clés étrangères
SELECT 'Contraintes de clés étrangères:' as test_section;
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name LIKE 'evscatala_announcement%'
ORDER BY tc.table_name, tc.constraint_name;

SELECT 'Tests terminés avec succès !' as result; 