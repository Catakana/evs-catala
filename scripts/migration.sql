-- Migration des données de l'ancienne base de données vers la nouvelle base de données Supabase
-- Nouvelle convention de nommage : evscatala_* pour toutes les tables

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS evscatala_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'staff', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Création de la politique RLS pour la table des profils
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les profils
CREATE POLICY "Profils publics en lecture" ON evscatala_profiles
  FOR SELECT USING (true);

-- Politique d'insertion pour les profils (utilisateur authentifié)
CREATE POLICY "Insertion de profil par utilisateur authentifié" ON evscatala_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour pour les profils (utilisateur lui-même ou admin)
CREATE POLICY "Mise à jour de profil par propriétaire ou admin" ON evscatala_profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Table des événements
CREATE TABLE IF NOT EXISTS evscatala_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('reunion', 'animation', 'atelier', 'permanence', 'autre')),
  location TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Création de la politique RLS pour la table des événements
ALTER TABLE evscatala_events ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les événements
CREATE POLICY "Événements publics en lecture" ON evscatala_events
  FOR SELECT USING (true);

-- Politique d'insertion pour les événements (staff ou admin uniquement)
CREATE POLICY "Insertion d'événement par staff ou admin" ON evscatala_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de mise à jour pour les événements (créateur, staff ou admin)
CREATE POLICY "Mise à jour d'événement par créateur, staff ou admin" ON evscatala_events
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de suppression pour les événements (créateur, staff ou admin)
CREATE POLICY "Suppression d'événement par créateur, staff ou admin" ON evscatala_events
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Table des annonces
CREATE TABLE IF NOT EXISTS evscatala_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('urgent', 'info', 'event', 'project')),
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expire_date TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Création de la politique RLS pour la table des annonces
ALTER TABLE evscatala_announcements ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les annonces
CREATE POLICY "Annonces publiques en lecture" ON evscatala_announcements
  FOR SELECT USING (true);

-- Politique d'insertion pour les annonces (staff ou admin uniquement)
CREATE POLICY "Insertion d'annonce par staff ou admin" ON evscatala_announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de mise à jour pour les annonces (auteur, staff ou admin)
CREATE POLICY "Mise à jour d'annonce par auteur, staff ou admin" ON evscatala_announcements
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de suppression pour les annonces (auteur, staff ou admin)
CREATE POLICY "Suppression d'annonce par auteur, staff ou admin" ON evscatala_announcements
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Table des lectures d'annonces
CREATE TABLE IF NOT EXISTS evscatala_announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  announcement_id UUID REFERENCES evscatala_announcements(id) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- Création de la politique RLS pour la table des lectures d'annonces
ALTER TABLE evscatala_announcement_reads ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les lectures d'annonces (utilisateur lui-même)
CREATE POLICY "Lecture de ses propres lectures d'annonces" ON evscatala_announcement_reads
  FOR SELECT USING (auth.uid() = user_id);

-- Politique d'insertion pour les lectures d'annonces (utilisateur lui-même)
CREATE POLICY "Insertion de lectures d'annonces par utilisateur" ON evscatala_announcement_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table des permanences
CREATE TABLE IF NOT EXISTS evscatala_permanences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  type TEXT NOT NULL CHECK (type IN ('public', 'internal', 'maintenance')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  min_required INTEGER DEFAULT 1,
  max_allowed INTEGER DEFAULT 10,
  notes TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Création de la politique RLS pour la table des permanences
ALTER TABLE evscatala_permanences ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les permanences
CREATE POLICY "Permanences publiques en lecture" ON evscatala_permanences
  FOR SELECT USING (true);

-- Politique d'insertion pour les permanences (staff ou admin uniquement)
CREATE POLICY "Insertion de permanence par staff ou admin" ON evscatala_permanences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Politique de mise à jour pour les permanences (staff ou admin)
CREATE POLICY "Mise à jour de permanence par staff ou admin" ON evscatala_permanences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Table des participants aux permanences
CREATE TABLE IF NOT EXISTS evscatala_permanence_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permanence_id UUID REFERENCES evscatala_permanences(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent')),
  checked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(permanence_id, user_id)
);

-- Création de la politique RLS pour la table des participants aux permanences
ALTER TABLE evscatala_permanence_participants ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les participants aux permanences
CREATE POLICY "Participants aux permanences publics en lecture" ON evscatala_permanence_participants
  FOR SELECT USING (true);

-- Politique d'insertion pour les participants aux permanences (utilisateur lui-même)
CREATE POLICY "Inscription à une permanence par utilisateur" ON evscatala_permanence_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour pour les participants aux permanences (utilisateur lui-même ou staff/admin)
CREATE POLICY "Mise à jour d'inscription par utilisateur, staff ou admin" ON evscatala_permanence_participants
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Fonction pour migrer les données existantes (si nécessaire)
-- Note: Adaptez cette fonction selon les besoins réels
CREATE OR REPLACE FUNCTION migrate_data() RETURNS void AS $$
BEGIN
  -- Exemple de migration de profils (à adapter selon la structure réelle de vos anciennes tables)
  -- INSERT INTO evscatala_profiles (user_id, firstname, lastname, email, role, status, created_at, updated_at)
  -- SELECT user_id, firstname, lastname, email, role, status, created_at, updated_at
  -- FROM evs_profiles;

  -- Exemple de migration d'événements (à adapter selon la structure réelle de vos anciennes tables)
  -- INSERT INTO evscatala_events (title, description, start_datetime, end_datetime, category, location, created_by, created_at, updated_at)
  -- SELECT title, description, start_datetime, end_datetime, category, location, created_by, created_at, updated_at
  -- FROM evs_events;

  -- Autres migrations de données...

  RAISE NOTICE 'Migration des données terminée.';
END;
$$ LANGUAGE plpgsql; 