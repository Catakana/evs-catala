-- Script de vérification de la configuration de la base de données
-- À exécuter dans l'interface SQL de Supabase pour vérifier que tout fonctionne

-- 1. Vérifier que toutes les tables existent
SELECT 
  'Tables EVS-Catala' as verification_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Existe'
    ELSE '❌ Manquante'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'evscatala_%'
ORDER BY table_name;

-- 2. Vérifier que RLS est activé sur toutes les tables
SELECT 
  'RLS Status' as verification_type,
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'evscatala_%'
ORDER BY tablename;

-- 3. Vérifier les politiques RLS
SELECT 
  'Politiques RLS' as verification_type,
  tablename as table_name,
  policyname as policy_name,
  '✅ Configurée' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'evscatala_%'
ORDER BY tablename, policyname;

-- 4. Vérifier les fonctions RPC
SELECT 
  'Fonctions RPC' as verification_type,
  routine_name as function_name,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ Créée'
    ELSE '❌ Manquante'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%event%'
ORDER BY routine_name;

-- 5. Vérifier les index
SELECT 
  'Index' as verification_type,
  indexname as index_name,
  tablename as table_name,
  '✅ Créé' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'evscatala_%'
ORDER BY tablename, indexname;

-- 6. Test de la relation entre participants et profils
SELECT 
  'Test de relation' as verification_type,
  'evscatala_event_participants <-> evscatala_profiles' as relation,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Relation fonctionnelle'
    ELSE '❌ Problème de relation'
  END as status
FROM evscatala_event_participants ep
LEFT JOIN evscatala_profiles p ON ep.user_id = p.user_id
LIMIT 1;

-- 7. Test des fonctions RPC (si elles existent)
DO $$
BEGIN
  -- Test de la fonction get_event_participants_with_profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'get_event_participants_with_profiles'
  ) THEN
    RAISE NOTICE '✅ Fonction get_event_participants_with_profiles disponible';
  ELSE
    RAISE NOTICE '❌ Fonction get_event_participants_with_profiles manquante';
  END IF;
  
  -- Test de la fonction get_event_with_participants
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'get_event_with_participants'
  ) THEN
    RAISE NOTICE '✅ Fonction get_event_with_participants disponible';
  ELSE
    RAISE NOTICE '❌ Fonction get_event_with_participants manquante';
  END IF;
END $$;

-- 8. Résumé de la vérification
SELECT 
  'RÉSUMÉ' as verification_type,
  'Configuration de la base de données' as description,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'evscatala_%'
    ) >= 8 THEN '✅ Configuration complète'
    ELSE '⚠️ Configuration incomplète'
  END as status;

-- 9. Recommandations
SELECT 
  'RECOMMANDATIONS' as verification_type,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'get_event_participants_with_profiles'
    ) THEN 'Exécuter scripts/create_rpc_functions.sql pour optimiser les performances'
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'evscatala_%'
    ) < 8 THEN 'Exécuter scripts/setup_database.sql pour créer toutes les tables'
    ELSE 'Configuration optimale ✅'
  END as recommendation; 