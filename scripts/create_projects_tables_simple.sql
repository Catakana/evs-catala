-- Script simple pour créer les tables de projets
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table principale des projets
CREATE TABLE IF NOT EXISTS evscatala_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table des membres du projet
CREATE TABLE IF NOT EXISTS evscatala_project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table des tâches du projet
CREATE TABLE IF NOT EXISTS evscatala_project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer la table des budgets du projet
CREATE TABLE IF NOT EXISTS evscatala_project_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Créer la table des documents du projet
CREATE TABLE IF NOT EXISTS evscatala_project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Créer la table des communications du projet
CREATE TABLE IF NOT EXISTS evscatala_project_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_urls TEXT[],
  type VARCHAR(50) NOT NULL DEFAULT 'poster',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 7. Activer RLS sur toutes les tables
ALTER TABLE evscatala_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_communications ENABLE ROW LEVEL SECURITY;

-- 8. Créer des politiques RLS simples

-- Politiques pour evscatala_projects
DROP POLICY IF EXISTS "Lecture publique des projets" ON evscatala_projects;
CREATE POLICY "Lecture publique des projets" ON evscatala_projects
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Création libre de projets" ON evscatala_projects;
CREATE POLICY "Création libre de projets" ON evscatala_projects
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Modification libre de projets" ON evscatala_projects;
CREATE POLICY "Modification libre de projets" ON evscatala_projects
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Suppression libre de projets" ON evscatala_projects;
CREATE POLICY "Suppression libre de projets" ON evscatala_projects
  FOR DELETE TO authenticated USING (true);

-- Politiques pour evscatala_project_members
DROP POLICY IF EXISTS "Gestion libre des membres" ON evscatala_project_members;
CREATE POLICY "Gestion libre des membres" ON evscatala_project_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques pour evscatala_project_tasks
DROP POLICY IF EXISTS "Gestion libre des tâches" ON evscatala_project_tasks;
CREATE POLICY "Gestion libre des tâches" ON evscatala_project_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques pour evscatala_project_budgets
DROP POLICY IF EXISTS "Gestion libre des budgets" ON evscatala_project_budgets;
CREATE POLICY "Gestion libre des budgets" ON evscatala_project_budgets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques pour evscatala_project_documents
DROP POLICY IF EXISTS "Gestion libre des documents" ON evscatala_project_documents;
CREATE POLICY "Gestion libre des documents" ON evscatala_project_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Politiques pour evscatala_project_communications
DROP POLICY IF EXISTS "Gestion libre des communications" ON evscatala_project_communications;
CREATE POLICY "Gestion libre des communications" ON evscatala_project_communications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON evscatala_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON evscatala_projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON evscatala_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON evscatala_project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON evscatala_project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON evscatala_project_tasks(assigned_to);

-- 10. Insérer un projet de test
INSERT INTO evscatala_projects (
  title,
  description,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  'Projet de test - Diagnostic',
  'Projet créé automatiquement pour tester la création depuis l''interface',
  'planning',
  (SELECT id FROM auth.users LIMIT 1), -- Premier utilisateur disponible
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Message de confirmation
SELECT 'Tables de projets créées avec succès !' as result;
SELECT COUNT(*) as nombre_projets FROM evscatala_projects; 