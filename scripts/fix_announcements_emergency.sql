-- Script d'urgence pour corriger l'affichage des annonces
-- Corrige les problèmes de fonction RPC et de structure de table

-- 1. Vérifier et corriger la table principale
CREATE TABLE IF NOT EXISTS evscatala_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'info',
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_roles TEXT[] DEFAULT ARRAY['member'],
  target_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expire_date TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ajouter les colonnes manquantes si nécessaire
DO $$
BEGIN
  -- Vérifier et ajouter target_roles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'target_roles'
  ) THEN
    ALTER TABLE evscatala_announcements ADD COLUMN target_roles TEXT[] DEFAULT ARRAY['member'];
  END IF;

  -- Vérifier et ajouter target_groups
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'target_groups'
  ) THEN
    ALTER TABLE evscatala_announcements ADD COLUMN target_groups TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Vérifier et ajouter is_pinned
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE evscatala_announcements ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
  END IF;

  -- Vérifier et ajouter priority
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE evscatala_announcements ADD COLUMN priority INTEGER DEFAULT 0;
  END IF;

  -- Vérifier et ajouter expire_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'expire_date'
  ) THEN
    ALTER TABLE evscatala_announcements ADD COLUMN expire_date TIMESTAMPTZ;
  END IF;

  -- Vérifier et ajouter is_archived
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evscatala_announcements' 
    AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE evscatala_announcements ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 3. Activer RLS
ALTER TABLE evscatala_announcements ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques RLS simples
DROP POLICY IF EXISTS "Lecture des annonces" ON evscatala_announcements;
CREATE POLICY "Lecture des annonces" ON evscatala_announcements
  FOR SELECT TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Création d'annonces" ON evscatala_announcements;
CREATE POLICY "Création d'annonces" ON evscatala_announcements
  FOR INSERT TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Modification d'annonces" ON evscatala_announcements;
CREATE POLICY "Modification d'annonces" ON evscatala_announcements
  FOR UPDATE TO authenticated 
  USING (true);

-- 5. Créer une fonction RPC simplifiée
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
    'Utilisateur' as author_name,
    COALESCE(a.target_roles, ARRAY['member']) as target_roles,
    COALESCE(a.target_groups, ARRAY[]::TEXT[]) as target_groups,
    a.publish_date,
    a.expire_date,
    COALESCE(a.is_archived, FALSE) as is_archived,
    COALESCE(a.is_pinned, FALSE) as is_pinned,
    COALESCE(a.priority, 0) as priority,
    a.created_at,
    a.updated_at,
    0::BIGINT as attachments_count
  FROM evscatala_announcements a
  WHERE 
    COALESCE(a.is_archived, FALSE) = FALSE
    AND (a.expire_date IS NULL OR a.expire_date > NOW())
    AND a.publish_date <= NOW()
  ORDER BY COALESCE(a.is_pinned, FALSE) DESC, COALESCE(a.priority, 0) DESC, a.publish_date DESC;
END;
$$;

-- 6. Insérer quelques annonces de test si la table est vide
INSERT INTO evscatala_announcements (title, content, category, author_id, is_pinned, priority)
SELECT 
  'Bienvenue sur EVS-catala',
  'Bienvenue sur la nouvelle plateforme de l''EVS CATALA ! Vous pouvez maintenant consulter les annonces, gérer votre agenda et bien plus encore.',
  'info',
  (SELECT id FROM auth.users LIMIT 1),
  true,
  10
WHERE NOT EXISTS (SELECT 1 FROM evscatala_announcements)
AND EXISTS (SELECT 1 FROM auth.users);

INSERT INTO evscatala_announcements (title, content, category, author_id, priority)
SELECT 
  'Réunion mensuelle',
  'La prochaine réunion mensuelle aura lieu le premier mardi du mois à 19h. Tous les membres sont invités à participer.',
  'event',
  (SELECT id FROM auth.users LIMIT 1),
  5
WHERE (SELECT COUNT(*) FROM evscatala_announcements) < 2
AND EXISTS (SELECT 1 FROM auth.users);

-- 7. Vérification finale
SELECT 'Correction d''urgence terminée !' as result;
SELECT COUNT(*) as nombre_annonces FROM evscatala_announcements;
SELECT 'Test de la fonction RPC:' as test;
SELECT COUNT(*) as annonces_via_rpc FROM get_announcements_with_author(); 