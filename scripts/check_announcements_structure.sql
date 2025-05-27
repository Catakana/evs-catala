-- Script de vérification de la structure de la table evscatala_announcements
-- Identifie les colonnes manquantes et propose les corrections

-- Vérifier si la table existe
SELECT 'Vérification de l''existence de la table:' as section;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'evscatala_announcements';

-- Vérifier la structure actuelle
SELECT 'Structure actuelle de la table:' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'evscatala_announcements'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Lister les colonnes attendues vs présentes
SELECT 'Colonnes attendues pour le module annonces:' as section;
SELECT unnest(ARRAY[
  'id',
  'title', 
  'content',
  'category',
  'author_id',
  'target_roles',
  'target_groups', 
  'publish_date',
  'expire_date',
  'is_archived',
  'is_pinned',
  'priority',
  'created_at',
  'updated_at'
]) as expected_columns;

-- Identifier les colonnes manquantes
SELECT 'Colonnes manquantes:' as section;
SELECT unnest(ARRAY[
  'target_roles',
  'target_groups', 
  'is_pinned',
  'priority'
]) as missing_columns
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'evscatala_announcements'
  AND column_name = unnest(ARRAY[
    'target_roles',
    'target_groups', 
    'is_pinned',
    'priority'
  ])
); 