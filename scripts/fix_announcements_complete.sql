-- Script de correction complète du module Annonces
-- Vérifie et crée/corrige toutes les tables nécessaires

-- 1. Corriger la table principale evscatala_announcements
-- Ajouter les colonnes manquantes si nécessaire

-- Vérifier si la table existe, sinon la créer
CREATE TABLE IF NOT EXISTS evscatala_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'info',
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes manquantes une par une
DO $$
BEGIN
  -- target_roles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'target_roles'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN target_roles TEXT[] DEFAULT ARRAY['member'];
    RAISE NOTICE 'Colonne target_roles ajoutée';
  END IF;

  -- target_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'target_groups'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN target_groups TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Colonne target_groups ajoutée';
  END IF;

  -- expire_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'expire_date'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN expire_date TIMESTAMPTZ;
    RAISE NOTICE 'Colonne expire_date ajoutée';
  END IF;

  -- is_archived
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Colonne is_archived ajoutée';
  END IF;

  -- is_pinned
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Colonne is_pinned ajoutée';
  END IF;

  -- priority
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE evscatala_announcements 
    ADD COLUMN priority INTEGER DEFAULT 0;
    RAISE NOTICE 'Colonne priority ajoutée';
  END IF;
END $$;

-- 2. Créer la table des lectures si elle n'existe pas
CREATE TABLE IF NOT EXISTS evscatala_announcement_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES evscatala_announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);

-- 3. Créer la table des pièces jointes si elle n'existe pas
CREATE TABLE IF NOT EXISTS evscatala_announcement_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES evscatala_announcements(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON evscatala_announcements(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON evscatala_announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_author ON evscatala_announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_archived ON evscatala_announcements(is_archived);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON evscatala_announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON evscatala_announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON evscatala_announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON evscatala_announcement_reads(announcement_id);

-- 5. Activer RLS sur toutes les tables
ALTER TABLE evscatala_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_announcement_attachments ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS si elles n'existent pas
-- Politiques pour evscatala_announcements
DROP POLICY IF EXISTS "Lecture des annonces" ON evscatala_announcements;
CREATE POLICY "Lecture des annonces" ON evscatala_announcements
  FOR SELECT TO authenticated 
  USING (
    NOT is_archived 
    AND (expire_date IS NULL OR expire_date > NOW())
    AND publish_date <= NOW()
  );

DROP POLICY IF EXISTS "Création d'annonces" ON evscatala_announcements;
CREATE POLICY "Création d'annonces" ON evscatala_announcements
  FOR INSERT TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Modification d'annonces" ON evscatala_announcements;
CREATE POLICY "Modification d'annonces" ON evscatala_announcements
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Suppression d'annonces" ON evscatala_announcements;
CREATE POLICY "Suppression d'annonces" ON evscatala_announcements
  FOR DELETE TO authenticated 
  USING ((SELECT auth.uid()) = author_id);

-- Politiques pour evscatala_announcement_reads
DROP POLICY IF EXISTS "Lecture des statuts de lecture" ON evscatala_announcement_reads;
CREATE POLICY "Lecture des statuts de lecture" ON evscatala_announcement_reads
  FOR SELECT TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Création des statuts de lecture" ON evscatala_announcement_reads;
CREATE POLICY "Création des statuts de lecture" ON evscatala_announcement_reads
  FOR INSERT TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Politiques pour evscatala_announcement_attachments
DROP POLICY IF EXISTS "Lecture des pièces jointes" ON evscatala_announcement_attachments;
CREATE POLICY "Lecture des pièces jointes" ON evscatala_announcement_attachments
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Création de pièces jointes" ON evscatala_announcement_attachments;
CREATE POLICY "Création de pièces jointes" ON evscatala_announcement_attachments
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_announcements 
      WHERE id = announcement_id 
      AND author_id = (SELECT auth.uid())
    )
  );

-- 7. Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_announcements_updated_at ON evscatala_announcements;
CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON evscatala_announcements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Créer les fonctions RPC
CREATE OR REPLACE FUNCTION get_announcements_with_author()
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  content TEXT,
  category VARCHAR,
  author_id UUID,
  author_name TEXT,
  target_roles TEXT[],
  target_groups TEXT[],
  publish_date TIMESTAMPTZ,
  expire_date TIMESTAMPTZ,
  is_archived BOOLEAN,
  is_pinned BOOLEAN,
  priority INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  attachments_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.content,
    a.category,
    a.author_id,
    COALESCE(p.first_name || ' ' || p.last_name, 'Utilisateur inconnu') as author_name,
    a.target_roles,
    a.target_groups,
    a.publish_date,
    a.expire_date,
    a.is_archived,
    a.is_pinned,
    a.priority,
    a.created_at,
    a.updated_at,
    COALESCE(att.attachments_count, 0) as attachments_count
  FROM evscatala_announcements a
  LEFT JOIN evscatala_profiles p ON a.author_id = p.user_id
  LEFT JOIN (
    SELECT 
      announcement_id, 
      COUNT(*) as attachments_count
    FROM evscatala_announcement_attachments 
    GROUP BY announcement_id
  ) att ON a.id = att.announcement_id
  WHERE 
    NOT a.is_archived 
    AND (a.expire_date IS NULL OR a.expire_date > NOW())
    AND a.publish_date <= NOW()
  ORDER BY a.is_pinned DESC, a.priority DESC, a.publish_date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION mark_announcement_as_read(announcement_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO evscatala_announcement_reads (user_id, announcement_id)
  VALUES ((SELECT auth.uid()), announcement_uuid)
  ON CONFLICT (user_id, announcement_id) 
  DO UPDATE SET read_at = NOW();
END;
$$;

-- 9. Mettre à jour les enregistrements existants avec les valeurs par défaut
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

-- 10. Vérification finale
SELECT 'Module Annonces - Correction terminée avec succès !' as result;
SELECT 'Tables créées/corrigées:' as section;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM (VALUES 
  ('evscatala_announcements'),
  ('evscatala_announcement_reads'),
  ('evscatala_announcement_attachments')
) AS t(table_name); 