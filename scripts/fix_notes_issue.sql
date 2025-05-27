-- Script de diagnostic et correction pour le problème d'enregistrement des notes
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier si la table existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'evscatala_notes';

-- 2. Si la table n'existe pas, la créer
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

-- 3. Créer la fonction update_updated_at_column si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_author_id ON evscatala_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_type ON evscatala_notes(context_type);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_id ON evscatala_notes(context_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_status ON evscatala_notes(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_created_at ON evscatala_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_tags ON evscatala_notes USING GIN(tags);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE evscatala_notes ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Lecture des notes" ON evscatala_notes;
DROP POLICY IF EXISTS "Création de notes" ON evscatala_notes;
DROP POLICY IF EXISTS "Modification de notes" ON evscatala_notes;
DROP POLICY IF EXISTS "Suppression de notes" ON evscatala_notes;

-- 7. Créer les politiques RLS simplifiées
-- Politique de lecture : utilisateurs authentifiés peuvent voir leurs notes et les notes publiques
CREATE POLICY "Lecture des notes" 
ON evscatala_notes FOR SELECT 
TO authenticated 
USING (
  auth.uid() = author_id OR
  NOT is_private OR
  auth.uid() = ANY(shared_with)
);

-- Politique d'insertion : utilisateurs authentifiés peuvent créer des notes
CREATE POLICY "Création de notes" 
ON evscatala_notes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

-- Politique de mise à jour : auteur peut modifier ses notes
CREATE POLICY "Modification de notes" 
ON evscatala_notes FOR UPDATE 
TO authenticated 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Politique de suppression : auteur peut supprimer ses notes
CREATE POLICY "Suppression de notes" 
ON evscatala_notes FOR DELETE 
TO authenticated 
USING (auth.uid() = author_id);

-- 8. Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_evscatala_notes_updated_at ON evscatala_notes;
CREATE TRIGGER update_evscatala_notes_updated_at
BEFORE UPDATE ON evscatala_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Test d'insertion pour vérifier que tout fonctionne
-- (Cette requête sera commentée, à décommenter pour tester)
/*
INSERT INTO evscatala_notes (
  content, 
  author_id, 
  title, 
  context_type, 
  status, 
  tags, 
  is_private
) VALUES (
  'Test de création de note',
  auth.uid(),
  'Note de test',
  'free',
  'draft',
  ARRAY['test', 'diagnostic'],
  false
);
*/

-- 10. Vérifier la structure finale de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evscatala_notes'
ORDER BY ordinal_position;

-- 11. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'evscatala_notes'; 