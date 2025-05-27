-- Script de correction de la table evscatala_announcements
-- Ajoute les colonnes manquantes pour le module annonces complet

-- Vérifier d'abord si la table existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'evscatala_announcements'
  ) THEN
    RAISE EXCEPTION 'La table evscatala_announcements n''existe pas. Veuillez d''abord exécuter le script create_announcements_tables.sql';
  END IF;
END $$;

-- Ajouter la colonne target_roles si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'target_roles'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN target_roles TEXT[] DEFAULT ARRAY['member'];
    RAISE NOTICE 'Colonne target_roles ajoutée';
  ELSE
    RAISE NOTICE 'Colonne target_roles existe déjà';
  END IF;
END $$;

-- Ajouter la colonne target_groups si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'target_groups'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN target_groups TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Colonne target_groups ajoutée';
  ELSE
    RAISE NOTICE 'Colonne target_groups existe déjà';
  END IF;
END $$;

-- Ajouter la colonne is_pinned si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Colonne is_pinned ajoutée';
  ELSE
    RAISE NOTICE 'Colonne is_pinned existe déjà';
  END IF;
END $$;

-- Ajouter la colonne priority si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN priority INTEGER DEFAULT 0;
    RAISE NOTICE 'Colonne priority ajoutée';
  ELSE
    RAISE NOTICE 'Colonne priority existe déjà';
  END IF;
END $$;

-- Vérifier que la colonne expire_date existe (optionnel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'expire_date'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN expire_date TIMESTAMPTZ;
    RAISE NOTICE 'Colonne expire_date ajoutée';
  ELSE
    RAISE NOTICE 'Colonne expire_date existe déjà';
  END IF;
END $$;

-- Vérifier que la colonne is_archived existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Colonne is_archived ajoutée';
  ELSE
    RAISE NOTICE 'Colonne is_archived existe déjà';
  END IF;
END $$;

-- Mettre à jour les valeurs par défaut pour les enregistrements existants
UPDATE evscatala_announcements 
SET 
  target_roles = COALESCE(target_roles, ARRAY['member']),
  target_groups = COALESCE(target_groups, ARRAY[]::TEXT[]),
  is_pinned = COALESCE(is_pinned, FALSE),
  priority = COALESCE(priority, 0),
  is_archived = COALESCE(is_archived, FALSE)
WHERE 
  target_roles IS NULL 
  OR target_groups IS NULL 
  OR is_pinned IS NULL 
  OR priority IS NULL 
  OR is_archived IS NULL;

-- Créer les index manquants si nécessaire
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON evscatala_announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON evscatala_announcements(priority);

-- Afficher la structure finale
SELECT 'Structure finale de la table evscatala_announcements:' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evscatala_announcements'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Correction de la table terminée avec succès !' as result; 