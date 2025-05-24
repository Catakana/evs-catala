-- Corriger la politique qui cause une récursion infinie
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs conversations" ON public.evscatala_conversations;
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations" 
ON public.evscatala_conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM public.evscatala_conversation_participants 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Modifier la politique pour participants aux conversations pour éviter la récursion
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les participants de leurs conversations" ON public.evscatala_conversation_participants;
CREATE POLICY "Les utilisateurs peuvent voir les participants de leurs conversations" 
ON public.evscatala_conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.evscatala_conversation_participants AS cp
    WHERE cp.user_id = (SELECT auth.uid())
  )
);

-- Activer la politique pour voir les participants aux permanences
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les participants aux permanences" ON public.evscatala_permanence_participants;
CREATE POLICY "Les utilisateurs peuvent voir les participants aux permanences" 
ON public.evscatala_permanence_participants
FOR SELECT
USING (true); 