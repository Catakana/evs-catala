-- Script de correction des politiques RLS pour les tables votes v2
-- Corrige les erreurs 406 (Not Acceptable) sur evscatala_vote_responses_v2

-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Lecture des réponses" ON evscatala_vote_responses_v2;
DROP POLICY IF EXISTS "Création de réponses" ON evscatala_vote_responses_v2;
DROP POLICY IF EXISTS "Modification de réponses" ON evscatala_vote_responses_v2;

-- Recréer les politiques avec une syntaxe optimisée
CREATE POLICY "Lecture des réponses" ON evscatala_vote_responses_v2
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Création de réponses" ON evscatala_vote_responses_v2
  FOR INSERT TO authenticated 
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Modification de réponses" ON evscatala_vote_responses_v2
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = user_id);

-- Vérifier et corriger les politiques des votes si nécessaire
DROP POLICY IF EXISTS "Création de votes" ON evscatala_votes_v2;
DROP POLICY IF EXISTS "Modification de votes" ON evscatala_votes_v2;

CREATE POLICY "Création de votes" ON evscatala_votes_v2
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Modification de votes" ON evscatala_votes_v2
  FOR UPDATE TO authenticated 
  USING (
    created_by = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Corriger les politiques des options de vote
DROP POLICY IF EXISTS "Création des options" ON evscatala_vote_options_v2;

CREATE POLICY "Création des options" ON evscatala_vote_options_v2
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_votes_v2 
      WHERE id = vote_id 
      AND (created_by = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
    )
  );

-- Ajouter une politique pour la modification des options
CREATE POLICY "Modification des options" ON evscatala_vote_options_v2
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes_v2 
      WHERE id = vote_id 
      AND (created_by = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
    )
  );

-- Ajouter une politique pour la suppression des options
CREATE POLICY "Suppression des options" ON evscatala_vote_options_v2
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM evscatala_votes_v2 
      WHERE id = vote_id 
      AND (created_by = (SELECT auth.uid()) OR 
           EXISTS (SELECT 1 FROM evscatala_profiles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'))
    )
  );

-- Vérification finale : afficher les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('evscatala_votes_v2', 'evscatala_vote_options_v2', 'evscatala_vote_responses_v2')
ORDER BY tablename, policyname; 