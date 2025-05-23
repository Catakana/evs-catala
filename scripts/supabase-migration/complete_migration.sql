-- Script de migration complet pour vérifier et recréer toutes les tables nécessaires
-- avec le préfixe evscatala_ conformément à la convention

-- ==========================================
-- Table des profils utilisateurs
-- ==========================================
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

-- RLS pour les profils
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profils publics en lecture" ON evscatala_profiles;
CREATE POLICY "Profils publics en lecture" ON evscatala_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion de profil par utilisateur authentifié" ON evscatala_profiles;
CREATE POLICY "Insertion de profil par utilisateur authentifié" ON evscatala_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mise à jour de profil par propriétaire ou admin" ON evscatala_profiles;
CREATE POLICY "Mise à jour de profil par propriétaire ou admin" ON evscatala_profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ==========================================
-- Table des événements
-- ==========================================
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

-- Index pour événements
CREATE INDEX IF NOT EXISTS idx_evscatala_events_start_datetime ON evscatala_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_end_datetime ON evscatala_events(end_datetime);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_category ON evscatala_events(category);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_created_by ON evscatala_events(created_by);

-- RLS pour événements
ALTER TABLE evscatala_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Événements publics en lecture" ON evscatala_events;
CREATE POLICY "Événements publics en lecture" ON evscatala_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion d'événement par staff ou admin" ON evscatala_events;
CREATE POLICY "Insertion d'événement par staff ou admin" ON evscatala_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Mise à jour d'événement par créateur, staff ou admin" ON evscatala_events;
CREATE POLICY "Mise à jour d'événement par créateur, staff ou admin" ON evscatala_events
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Suppression d'événement par créateur, staff ou admin" ON evscatala_events;
CREATE POLICY "Suppression d'événement par créateur, staff ou admin" ON evscatala_events
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- ==========================================
-- Table des annonces
-- ==========================================
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

-- RLS pour annonces
ALTER TABLE evscatala_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Annonces publiques en lecture" ON evscatala_announcements;
CREATE POLICY "Annonces publiques en lecture" ON evscatala_announcements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion d'annonce par staff ou admin" ON evscatala_announcements;
CREATE POLICY "Insertion d'annonce par staff ou admin" ON evscatala_announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Mise à jour d'annonce par auteur, staff ou admin" ON evscatala_announcements;
CREATE POLICY "Mise à jour d'annonce par auteur, staff ou admin" ON evscatala_announcements
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Suppression d'annonce par auteur, staff ou admin" ON evscatala_announcements;
CREATE POLICY "Suppression d'annonce par auteur, staff ou admin" ON evscatala_announcements
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- ==========================================
-- Table des lectures d'annonces
-- ==========================================
CREATE TABLE IF NOT EXISTS evscatala_announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  announcement_id UUID REFERENCES evscatala_announcements(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- RLS pour lectures d'annonces
ALTER TABLE evscatala_announcement_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture de ses propres lectures d'annonces" ON evscatala_announcement_reads;
CREATE POLICY "Lecture de ses propres lectures d'annonces" ON evscatala_announcement_reads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Insertion de lectures d'annonces par utilisateur" ON evscatala_announcement_reads;
CREATE POLICY "Insertion de lectures d'annonces par utilisateur" ON evscatala_announcement_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- Table des permanences
-- ==========================================
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

-- RLS pour permanences
ALTER TABLE evscatala_permanences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permanences publiques en lecture" ON evscatala_permanences;
CREATE POLICY "Permanences publiques en lecture" ON evscatala_permanences
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertion de permanence par staff ou admin" ON evscatala_permanences;
CREATE POLICY "Insertion de permanence par staff ou admin" ON evscatala_permanences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Mise à jour de permanence par staff ou admin" ON evscatala_permanences;
CREATE POLICY "Mise à jour de permanence par staff ou admin" ON evscatala_permanences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- ==========================================
-- Table des participants aux permanences
-- ==========================================
CREATE TABLE IF NOT EXISTS evscatala_permanence_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permanence_id UUID REFERENCES evscatala_permanences(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent')),
  checked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(permanence_id, user_id)
);

-- RLS pour participants aux permanences
ALTER TABLE evscatala_permanence_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants aux permanences publics en lecture" ON evscatala_permanence_participants;
CREATE POLICY "Participants aux permanences publics en lecture" ON evscatala_permanence_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inscription à une permanence par utilisateur" ON evscatala_permanence_participants;
CREATE POLICY "Inscription à une permanence par utilisateur" ON evscatala_permanence_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mise à jour d'inscription par utilisateur, staff ou admin" ON evscatala_permanence_participants;
CREATE POLICY "Mise à jour d'inscription par utilisateur, staff ou admin" ON evscatala_permanence_participants
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- ==========================================
-- Tables de votes et sondages
-- ==========================================
CREATE TABLE IF NOT EXISTS evscatala_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('binary', 'multiple', 'survey')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'anonymous')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  result_visibility TEXT NOT NULL DEFAULT 'immediate' CHECK (result_visibility IN ('immediate', 'afterVote', 'afterClose')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '1 week',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour votes
CREATE INDEX IF NOT EXISTS idx_evscatala_votes_status ON evscatala_votes(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_votes_created_by ON evscatala_votes(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_votes_dates ON evscatala_votes(start_date, end_date);

-- Table des options de vote
CREATE TABLE IF NOT EXISTS evscatala_vote_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID REFERENCES evscatala_votes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour options de vote
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_options_vote_id ON evscatala_vote_options(vote_id);

-- Table des réponses aux votes
CREATE TABLE IF NOT EXISTS evscatala_vote_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID REFERENCES evscatala_votes(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES evscatala_vote_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour réponses
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_responses_vote_id ON evscatala_vote_responses(vote_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_responses_option_id ON evscatala_vote_responses(option_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_vote_responses_user_id ON evscatala_vote_responses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evscatala_vote_responses_unique_vote ON evscatala_vote_responses(vote_id, user_id);

-- RLS pour votes
ALTER TABLE evscatala_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Votes publics visibles par tous" ON evscatala_votes;
CREATE POLICY "Votes publics visibles par tous" ON evscatala_votes
  FOR SELECT USING (
    visibility = 'public' OR 
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Création de vote par staff et admin" ON evscatala_votes;
CREATE POLICY "Création de vote par staff et admin" ON evscatala_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

DROP POLICY IF EXISTS "Modification de vote par créateur ou admin" ON evscatala_votes;
CREATE POLICY "Modification de vote par créateur ou admin" ON evscatala_votes
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Suppression de vote par créateur ou admin" ON evscatala_votes;
CREATE POLICY "Suppression de vote par créateur ou admin" ON evscatala_votes
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS pour options de vote
ALTER TABLE evscatala_vote_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Options visibles par tous" ON evscatala_vote_options;
CREATE POLICY "Options visibles par tous" ON evscatala_vote_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        visibility = 'public' OR 
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Création d'options par staff et admin" ON evscatala_vote_options;
CREATE POLICY "Création d'options par staff et admin" ON evscatala_vote_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Modification d'options par créateur ou admin" ON evscatala_vote_options;
CREATE POLICY "Modification d'options par créateur ou admin" ON evscatala_vote_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Suppression d'options par créateur ou admin" ON evscatala_vote_options;
CREATE POLICY "Suppression d'options par créateur ou admin" ON evscatala_vote_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_options.vote_id AND (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- RLS pour réponses aux votes
ALTER TABLE evscatala_vote_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Réponses visibles selon configuration" ON evscatala_vote_responses;
CREATE POLICY "Réponses visibles selon configuration" ON evscatala_vote_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_responses.vote_id AND (
        -- Le créateur et les admins peuvent toujours voir
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin') OR
        -- Affichage immédiat pour tous
        result_visibility = 'immediate' OR
        -- Après avoir voté
        (result_visibility = 'afterVote' AND EXISTS (
          SELECT 1 FROM evscatala_vote_responses
          WHERE vote_id = evscatala_vote_responses.vote_id AND user_id = auth.uid()
        )) OR
        -- Après clôture
        (result_visibility = 'afterClose' AND status = 'closed')
      )
    )
  );

DROP POLICY IF EXISTS "Vote par utilisateur authentifié" ON evscatala_vote_responses;
CREATE POLICY "Vote par utilisateur authentifié" ON evscatala_vote_responses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_responses.vote_id AND status = 'active'
    ) AND
    NOT EXISTS (
      SELECT 1 FROM evscatala_vote_responses
      WHERE vote_id = evscatala_vote_responses.vote_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Suppression de son propre vote" ON evscatala_vote_responses;
CREATE POLICY "Suppression de son propre vote" ON evscatala_vote_responses
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM evscatala_votes
      WHERE id = evscatala_vote_responses.vote_id AND status = 'active'
    )
  );

-- ==========================================
-- Tables de messages
-- ==========================================
CREATE TABLE IF NOT EXISTS evscatala_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evscatala_conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES evscatala_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS evscatala_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES evscatala_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS evscatala_message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES evscatala_messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- Fonction pour mettre à jour automatiquement le champ updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Triggers pour mise à jour automatique du champ updated_at
-- ==========================================
DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
BEFORE UPDATE ON evscatala_profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_events_updated_at ON evscatala_events;
CREATE TRIGGER update_evscatala_events_updated_at
BEFORE UPDATE ON evscatala_events
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_announcements_updated_at ON evscatala_announcements;
CREATE TRIGGER update_evscatala_announcements_updated_at
BEFORE UPDATE ON evscatala_announcements
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_permanences_updated_at ON evscatala_permanences;
CREATE TRIGGER update_evscatala_permanences_updated_at
BEFORE UPDATE ON evscatala_permanences
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_permanence_participants_updated_at ON evscatala_permanence_participants;
CREATE TRIGGER update_evscatala_permanence_participants_updated_at
BEFORE UPDATE ON evscatala_permanence_participants
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_votes_updated_at ON evscatala_votes;
CREATE TRIGGER update_evscatala_votes_updated_at
BEFORE UPDATE ON evscatala_votes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_conversations_updated_at ON evscatala_conversations;
CREATE TRIGGER update_evscatala_conversations_updated_at
BEFORE UPDATE ON evscatala_conversations
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_messages_updated_at ON evscatala_messages;
CREATE TRIGGER update_evscatala_messages_updated_at
BEFORE UPDATE ON evscatala_messages
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Fin du script de migration 