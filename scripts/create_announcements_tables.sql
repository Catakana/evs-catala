-- Script de création des tables pour le module Annonces
-- Tables : evscatala_announcements, evscatala_announcement_reads, evscatala_announcement_attachments

-- Table principale des annonces
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

-- Table pour marquer les annonces comme lues
CREATE TABLE IF NOT EXISTS evscatala_announcement_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES evscatala_announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);

-- Table pour les pièces jointes des annonces
CREATE TABLE IF NOT EXISTS evscatala_announcement_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES evscatala_announcements(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON evscatala_announcements(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON evscatala_announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_author ON evscatala_announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_archived ON evscatala_announcements(is_archived);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON evscatala_announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON evscatala_announcement_reads(announcement_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON evscatala_announcements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE evscatala_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_announcement_attachments ENABLE ROW LEVEL SECURITY;

-- Politiques pour evscatala_announcements
CREATE POLICY "Lecture des annonces" ON evscatala_announcements
  FOR SELECT TO authenticated 
  USING (
    NOT is_archived 
    AND (expire_date IS NULL OR expire_date > NOW())
    AND publish_date <= NOW()
  );

CREATE POLICY "Création d'annonces" ON evscatala_announcements
  FOR INSERT TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = author_id);

CREATE POLICY "Modification d'annonces" ON evscatala_announcements
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Suppression d'annonces" ON evscatala_announcements
  FOR DELETE TO authenticated 
  USING ((SELECT auth.uid()) = author_id);

-- Politiques pour evscatala_announcement_reads
CREATE POLICY "Lecture des statuts de lecture" ON evscatala_announcement_reads
  FOR SELECT TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Création des statuts de lecture" ON evscatala_announcement_reads
  FOR INSERT TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Modification des statuts de lecture" ON evscatala_announcement_reads
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

-- Politiques pour evscatala_announcement_attachments
CREATE POLICY "Lecture des pièces jointes" ON evscatala_announcement_attachments
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Création de pièces jointes" ON evscatala_announcement_attachments
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_announcements 
      WHERE id = announcement_id 
      AND author_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Suppression de pièces jointes" ON evscatala_announcement_attachments
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM evscatala_announcements 
      WHERE id = announcement_id 
      AND author_id = (SELECT auth.uid())
    )
  );

-- Fonction pour récupérer les annonces avec les informations de l'auteur
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
  LEFT JOIN evscatala_profiles p ON a.author_id = p.id
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

-- Fonction pour marquer une annonce comme lue
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

-- Fonction pour obtenir le statut de lecture des annonces pour un utilisateur
CREATE OR REPLACE FUNCTION get_user_announcement_reads(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  announcement_id UUID,
  read_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(user_uuid, (SELECT auth.uid()));
  
  RETURN QUERY
  SELECT 
    ar.announcement_id,
    ar.read_at
  FROM evscatala_announcement_reads ar
  WHERE ar.user_id = target_user_id;
END;
$$;

-- Commentaires pour la documentation
COMMENT ON TABLE evscatala_announcements IS 'Table principale des annonces de l''association';
COMMENT ON COLUMN evscatala_announcements.category IS 'Catégorie: info, urgent, event, project';
COMMENT ON COLUMN evscatala_announcements.target_roles IS 'Rôles ciblés: member, staff, admin';
COMMENT ON COLUMN evscatala_announcements.target_groups IS 'Groupes spécifiques ciblés';
COMMENT ON COLUMN evscatala_announcements.is_pinned IS 'Annonce épinglée en haut de la liste';
COMMENT ON COLUMN evscatala_announcements.priority IS 'Priorité d''affichage (plus élevé = plus prioritaire)';

COMMENT ON TABLE evscatala_announcement_reads IS 'Suivi des annonces lues par utilisateur';
COMMENT ON TABLE evscatala_announcement_attachments IS 'Pièces jointes des annonces';

-- Données de test (optionnel)
INSERT INTO evscatala_announcements (title, content, category, author_id, is_pinned, priority) 
VALUES 
  ('Bienvenue sur EVS-catala', 'Bienvenue sur la nouvelle plateforme de l''EVS CATALA ! Vous pouvez maintenant consulter les annonces, gérer votre agenda et bien plus encore.', 'info', (SELECT id FROM auth.users LIMIT 1), true, 10),
  ('Réunion mensuelle', 'La prochaine réunion mensuelle aura lieu le premier mardi du mois à 19h. Tous les membres sont invités à participer.', 'event', (SELECT id FROM auth.users LIMIT 1), false, 5)
ON CONFLICT DO NOTHING;

-- Affichage du résumé
SELECT 'Tables créées avec succès:' as message;
SELECT 'evscatala_announcements' as table_name, COUNT(*) as records FROM evscatala_announcements
UNION ALL
SELECT 'evscatala_announcement_reads' as table_name, COUNT(*) as records FROM evscatala_announcement_reads
UNION ALL
SELECT 'evscatala_announcement_attachments' as table_name, COUNT(*) as records FROM evscatala_announcement_attachments; 