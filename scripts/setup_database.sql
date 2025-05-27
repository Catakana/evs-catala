-- Script de configuration de la base de données EVS-catala
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'evscatala_%'
ORDER BY table_name;

-- 2. Créer la table des profils si elle n'existe pas
CREATE TABLE IF NOT EXISTS evscatala_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'staff', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 3. Créer la table des événements si elle n'existe pas
CREATE TABLE IF NOT EXISTS evscatala_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('reunion', 'animation', 'atelier', 'permanence', 'autre')),
  location VARCHAR(255),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table des participants aux événements
CREATE TABLE IF NOT EXISTS evscatala_event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES evscatala_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent', 'maybe')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- 5. Créer la table des notes rapides
CREATE TABLE IF NOT EXISTS evscatala_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_type VARCHAR(20) DEFAULT 'free' CHECK (context_type IN ('event', 'project', 'free')),
  context_id UUID, -- Référence vers l'événement ou projet lié (optionnel)
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'pending')),
  tags TEXT[] DEFAULT '{}', -- Array de tags
  shared_with UUID[] DEFAULT '{}', -- Array d'IDs utilisateurs ayant accès
  title VARCHAR(255), -- Titre optionnel pour la note
  is_private BOOLEAN DEFAULT false -- Note privée ou visible aux membres autorisés
);

-- 6. Créer les index
CREATE INDEX IF NOT EXISTS idx_evscatala_profiles_user_id ON evscatala_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_created_by ON evscatala_events(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_events_start_datetime ON evscatala_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_event_id ON evscatala_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_user_id ON evscatala_event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_author_id ON evscatala_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_type ON evscatala_notes(context_type);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_id ON evscatala_notes(context_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_status ON evscatala_notes(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_created_at ON evscatala_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_tags ON evscatala_notes USING GIN(tags);

-- 7. Activer RLS sur toutes les tables
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_notes ENABLE ROW LEVEL SECURITY;

-- 8. Politiques RLS pour evscatala_profiles
DROP POLICY IF EXISTS "Lecture des profils" ON evscatala_profiles;
CREATE POLICY "Lecture des profils" 
ON evscatala_profiles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Insertion du profil personnel" ON evscatala_profiles;
CREATE POLICY "Insertion du profil personnel" 
ON evscatala_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mise à jour du profil personnel" ON evscatala_profiles;
CREATE POLICY "Mise à jour du profil personnel" 
ON evscatala_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Politiques RLS pour evscatala_events
DROP POLICY IF EXISTS "Lecture des événements" ON evscatala_events;
CREATE POLICY "Lecture des événements" 
ON evscatala_events FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Création d'événements" ON evscatala_events;
CREATE POLICY "Création d'événements" 
ON evscatala_events FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Modification d'événements" ON evscatala_events;
CREATE POLICY "Modification d'événements" 
ON evscatala_events FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
)
WITH CHECK (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Suppression d'événements" ON evscatala_events;
CREATE POLICY "Suppression d'événements" 
ON evscatala_events FOR DELETE 
TO authenticated 
USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

-- 10. Politiques RLS pour evscatala_event_participants
DROP POLICY IF EXISTS "Lecture des participants" ON evscatala_event_participants;
CREATE POLICY "Lecture des participants" 
ON evscatala_event_participants FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Inscription aux événements" ON evscatala_event_participants;
CREATE POLICY "Inscription aux événements" 
ON evscatala_event_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Modification de participation" ON evscatala_event_participants;
CREATE POLICY "Modification de participation" 
ON evscatala_event_participants FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
)
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Désinscription des événements" ON evscatala_event_participants;
CREATE POLICY "Désinscription des événements" 
ON evscatala_event_participants FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

-- 11. Politiques RLS pour evscatala_notes
DROP POLICY IF EXISTS "Lecture des notes" ON evscatala_notes;
CREATE POLICY "Lecture des notes" 
ON evscatala_notes FOR SELECT 
TO authenticated 
USING (
  auth.uid() = author_id OR
  (NOT is_private AND EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))) OR
  auth.uid() = ANY(shared_with) OR
  (context_type = 'event' AND context_id IS NOT NULL AND NOT is_private)
);

DROP POLICY IF EXISTS "Création de notes" ON evscatala_notes;
CREATE POLICY "Création de notes" 
ON evscatala_notes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Modification de notes" ON evscatala_notes;
CREATE POLICY "Modification de notes" 
ON evscatala_notes FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
)
WITH CHECK (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Suppression de notes" ON evscatala_notes;
CREATE POLICY "Suppression de notes" 
ON evscatala_notes FOR DELETE 
TO authenticated 
USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 12. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_evscatala_profiles_updated_at ON evscatala_profiles;
CREATE TRIGGER update_evscatala_profiles_updated_at
BEFORE UPDATE ON evscatala_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_events_updated_at ON evscatala_events;
CREATE TRIGGER update_evscatala_events_updated_at
BEFORE UPDATE ON evscatala_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_event_participants_updated_at ON evscatala_event_participants;
CREATE TRIGGER update_evscatala_event_participants_updated_at
BEFORE UPDATE ON evscatala_event_participants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_notes_updated_at ON evscatala_notes;
CREATE TRIGGER update_evscatala_notes_updated_at
BEFORE UPDATE ON evscatala_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Créer les tables de projets
-- Table principale des projets
CREATE TABLE IF NOT EXISTS evscatala_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'canceled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres de projets
CREATE TABLE IF NOT EXISTS evscatala_project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

-- Table des tâches de projets
CREATE TABLE IF NOT EXISTS evscatala_project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inProgress', 'review', 'done')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des budgets de projets
CREATE TABLE IF NOT EXISTS evscatala_project_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'estimated' CHECK (status IN ('estimated', 'approved', 'spent')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents de projets
CREATE TABLE IF NOT EXISTS evscatala_project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des communications de projets
CREATE TABLE IF NOT EXISTS evscatala_project_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  media_urls TEXT[], -- Array d'URLs des médias
  type VARCHAR(20) NOT NULL CHECK (type IN ('poster', 'social', 'email', 'press')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les tables de projets
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_created_by ON evscatala_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_status ON evscatala_projects(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_members_project_id ON evscatala_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_members_user_id ON evscatala_project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_tasks_project_id ON evscatala_project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_tasks_assigned_to ON evscatala_project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_budgets_project_id ON evscatala_project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_documents_project_id ON evscatala_project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_communications_project_id ON evscatala_project_communications(project_id);

-- Activer RLS sur les tables de projets
ALTER TABLE evscatala_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_communications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour evscatala_projects
DROP POLICY IF EXISTS "Lecture des projets" ON evscatala_projects;
CREATE POLICY "Lecture des projets" 
ON evscatala_projects FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Création de projets" ON evscatala_projects;
CREATE POLICY "Création de projets" 
ON evscatala_projects FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
);

DROP POLICY IF EXISTS "Modification de projets" ON evscatala_projects;
CREATE POLICY "Modification de projets" 
ON evscatala_projects FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')) OR
  EXISTS (SELECT 1 FROM evscatala_project_members WHERE project_id = evscatala_projects.id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Suppression de projets" ON evscatala_projects;
CREATE POLICY "Suppression de projets" 
ON evscatala_projects FOR DELETE 
TO authenticated 
USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Politiques RLS pour evscatala_project_members
DROP POLICY IF EXISTS "Lecture des membres de projets" ON evscatala_project_members;
CREATE POLICY "Lecture des membres de projets" 
ON evscatala_project_members FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Ajout de membres de projets" ON evscatala_project_members;
CREATE POLICY "Ajout de membres de projets" 
ON evscatala_project_members FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

-- Triggers pour updated_at sur les tables de projets
DROP TRIGGER IF EXISTS update_evscatala_projects_updated_at ON evscatala_projects;
CREATE TRIGGER update_evscatala_projects_updated_at
BEFORE UPDATE ON evscatala_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_project_tasks_updated_at ON evscatala_project_tasks;
CREATE TRIGGER update_evscatala_project_tasks_updated_at
BEFORE UPDATE ON evscatala_project_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evscatala_project_budgets_updated_at ON evscatala_project_budgets;
CREATE TRIGGER update_evscatala_project_budgets_updated_at
BEFORE UPDATE ON evscatala_project_budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Vérification finale
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name LIKE 'evscatala_%'
GROUP BY table_name
ORDER BY table_name; 