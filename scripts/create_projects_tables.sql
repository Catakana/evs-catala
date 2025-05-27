-- Script de création des tables pour le module Projets
-- À exécuter dans l'interface SQL de Supabase

-- 1. Table principale des projets
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

-- 2. Table des membres de projets
CREATE TABLE IF NOT EXISTS evscatala_project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES evscatala_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

-- 3. Table des tâches de projets
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

-- 4. Table des budgets de projets
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

-- 5. Table des documents de projets
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

-- 6. Table des communications de projets
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

-- 7. Création des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_created_by ON evscatala_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_status ON evscatala_projects(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_projects_dates ON evscatala_projects(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_evscatala_project_members_project_id ON evscatala_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_members_user_id ON evscatala_project_members(user_id);

CREATE INDEX IF NOT EXISTS idx_evscatala_project_tasks_project_id ON evscatala_project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_tasks_assigned_to ON evscatala_project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_tasks_status ON evscatala_project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_tasks_due_date ON evscatala_project_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_evscatala_project_budgets_project_id ON evscatala_project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_budgets_status ON evscatala_project_budgets(status);

CREATE INDEX IF NOT EXISTS idx_evscatala_project_documents_project_id ON evscatala_project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_documents_uploaded_by ON evscatala_project_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_evscatala_project_communications_project_id ON evscatala_project_communications(project_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_project_communications_type ON evscatala_project_communications(type);

-- 8. Activer RLS sur toutes les tables
ALTER TABLE evscatala_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_project_communications ENABLE ROW LEVEL SECURITY;

-- 9. Politiques RLS pour evscatala_projects
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
)
WITH CHECK (
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

-- 10. Politiques RLS pour evscatala_project_members
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

DROP POLICY IF EXISTS "Modification de membres de projets" ON evscatala_project_members;
CREATE POLICY "Modification de membres de projets" 
ON evscatala_project_members FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Suppression de membres de projets" ON evscatala_project_members;
CREATE POLICY "Suppression de membres de projets" 
ON evscatala_project_members FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

-- 11. Politiques RLS pour evscatala_project_tasks
DROP POLICY IF EXISTS "Lecture des tâches de projets" ON evscatala_project_tasks;
CREATE POLICY "Lecture des tâches de projets" 
ON evscatala_project_tasks FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Création de tâches de projets" ON evscatala_project_tasks;
CREATE POLICY "Création de tâches de projets" 
ON evscatala_project_tasks FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Modification de tâches de projets" ON evscatala_project_tasks;
CREATE POLICY "Modification de tâches de projets" 
ON evscatala_project_tasks FOR UPDATE 
TO authenticated 
USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Suppression de tâches de projets" ON evscatala_project_tasks;
CREATE POLICY "Suppression de tâches de projets" 
ON evscatala_project_tasks FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

-- 12. Politiques RLS pour evscatala_project_budgets
DROP POLICY IF EXISTS "Lecture des budgets de projets" ON evscatala_project_budgets;
CREATE POLICY "Lecture des budgets de projets" 
ON evscatala_project_budgets FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Création de budgets de projets" ON evscatala_project_budgets;
CREATE POLICY "Création de budgets de projets" 
ON evscatala_project_budgets FOR INSERT 
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

DROP POLICY IF EXISTS "Modification de budgets de projets" ON evscatala_project_budgets;
CREATE POLICY "Modification de budgets de projets" 
ON evscatala_project_budgets FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Suppression de budgets de projets" ON evscatala_project_budgets;
CREATE POLICY "Suppression de budgets de projets" 
ON evscatala_project_budgets FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

-- 13. Politiques RLS pour evscatala_project_documents
DROP POLICY IF EXISTS "Lecture des documents de projets" ON evscatala_project_documents;
CREATE POLICY "Lecture des documents de projets" 
ON evscatala_project_documents FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Ajout de documents de projets" ON evscatala_project_documents;
CREATE POLICY "Ajout de documents de projets" 
ON evscatala_project_documents FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Suppression de documents de projets" ON evscatala_project_documents;
CREATE POLICY "Suppression de documents de projets" 
ON evscatala_project_documents FOR DELETE 
TO authenticated 
USING (
  auth.uid() = uploaded_by OR
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

-- 14. Politiques RLS pour evscatala_project_communications
DROP POLICY IF EXISTS "Lecture des communications de projets" ON evscatala_project_communications;
CREATE POLICY "Lecture des communications de projets" 
ON evscatala_project_communications FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Création de communications de projets" ON evscatala_project_communications;
CREATE POLICY "Création de communications de projets" 
ON evscatala_project_communications FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Modification de communications de projets" ON evscatala_project_communications;
CREATE POLICY "Modification de communications de projets" 
ON evscatala_project_communications FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

DROP POLICY IF EXISTS "Suppression de communications de projets" ON evscatala_project_communications;
CREATE POLICY "Suppression de communications de projets" 
ON evscatala_project_communications FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM evscatala_projects p 
    WHERE p.id = project_id AND (
      p.created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin'))
    )
  )
);

-- 15. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Triggers pour updated_at
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

-- 17. Vérification finale
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name LIKE 'evscatala_project%'
GROUP BY table_name
ORDER BY table_name; 