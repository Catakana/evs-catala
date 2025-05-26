-- Script de création de la table des notes rapides
-- À exécuter dans l'interface SQL de Supabase

-- Création de la table evscatala_notes
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_author_id ON evscatala_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_type ON evscatala_notes(context_type);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_context_id ON evscatala_notes(context_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_status ON evscatala_notes(status);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_created_at ON evscatala_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_evscatala_notes_tags ON evscatala_notes USING GIN(tags);

-- Activer RLS (Row Level Security)
ALTER TABLE evscatala_notes ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : 
-- - Auteur peut voir ses notes
-- - Staff/Admin peuvent voir les notes non privées
-- - Utilisateurs dans shared_with peuvent voir les notes partagées
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

-- Politique d'insertion : utilisateurs authentifiés peuvent créer des notes
DROP POLICY IF EXISTS "Création de notes" ON evscatala_notes;
CREATE POLICY "Création de notes" 
ON evscatala_notes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

-- Politique de mise à jour : 
-- - Auteur peut modifier ses notes
-- - Staff/Admin peuvent modifier le statut des notes
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

-- Politique de suppression : 
-- - Auteur peut supprimer ses notes
-- - Admin peut supprimer toute note
DROP POLICY IF EXISTS "Suppression de notes" ON evscatala_notes;
CREATE POLICY "Suppression de notes" 
ON evscatala_notes FOR DELETE 
TO authenticated 
USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_evscatala_notes_updated_at ON evscatala_notes;
CREATE TRIGGER update_evscatala_notes_updated_at
BEFORE UPDATE ON evscatala_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE evscatala_notes IS 'Table des notes rapides pour la prise de notes dynamique';
COMMENT ON COLUMN evscatala_notes.id IS 'Identifiant unique de la note';
COMMENT ON COLUMN evscatala_notes.content IS 'Contenu de la note (markdown supporté)';
COMMENT ON COLUMN evscatala_notes.author_id IS 'Référence vers l''auteur de la note';
COMMENT ON COLUMN evscatala_notes.context_type IS 'Type de contexte : event, project, free';
COMMENT ON COLUMN evscatala_notes.context_id IS 'ID de l''élément lié (événement, projet)';
COMMENT ON COLUMN evscatala_notes.status IS 'Statut : draft, validated, pending';
COMMENT ON COLUMN evscatala_notes.tags IS 'Array de tags pour l''organisation';
COMMENT ON COLUMN evscatala_notes.shared_with IS 'Array d''IDs utilisateurs ayant accès';
COMMENT ON COLUMN evscatala_notes.is_private IS 'Note privée (visible uniquement à l''auteur)';

-- Vérification de la création
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evscatala_notes' 
ORDER BY ordinal_position; 