-- Appliquons la politique RLS modifiée
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les participants aux permanences" ON public.evscatala_permanence_participants;
CREATE POLICY "Les utilisateurs peuvent voir les participants aux permanences" 
ON public.evscatala_permanence_participants
FOR SELECT
USING (true); 