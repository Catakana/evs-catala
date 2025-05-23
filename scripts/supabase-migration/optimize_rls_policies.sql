-- Script pour optimiser les politiques RLS qui utilisent auth.* et current_setting()
-- Ce script remplace les appels directs à auth.* par (SELECT auth.*) pour améliorer les performances

-- 1. Politiques pour evscatala_events
DROP POLICY IF EXISTS "Mise à jour d'événement par créateur, staff ou admin" ON public.evscatala_events;
CREATE POLICY "Mise à jour d'événement par créateur, staff ou admin" 
ON public.evscatala_events
FOR UPDATE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Lecture d'événements pour tous les utilisateurs authentifiés" ON public.evscatala_events;
CREATE POLICY "Lecture d'événements pour tous les utilisateurs authentifiés" 
ON public.evscatala_events
FOR SELECT
USING ((SELECT auth.role()) IS NOT NULL);

DROP POLICY IF EXISTS "Suppression d'événement par créateur, staff ou admin" ON public.evscatala_events;
CREATE POLICY "Suppression d'événement par créateur, staff ou admin" 
ON public.evscatala_events
FOR DELETE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Création d'événements pour les utilisateurs authentifiés" ON public.evscatala_events;
CREATE POLICY "Création d'événements pour les utilisateurs authentifiés" 
ON public.evscatala_events
FOR INSERT
WITH CHECK ((SELECT auth.role()) IS NOT NULL);

-- 2. Politiques pour evscatala_profiles
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON public.evscatala_profiles;
CREATE POLICY "Les utilisateurs peuvent voir tous les profils" 
ON public.evscatala_profiles
FOR SELECT
USING ((SELECT auth.role()) IS NOT NULL);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON public.evscatala_profiles;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
ON public.evscatala_profiles
FOR UPDATE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

-- 3. Politiques pour evscatala_announcements
DROP POLICY IF EXISTS "Lecture d'annonces pour tous les utilisateurs authentifiés" ON public.evscatala_announcements;
CREATE POLICY "Lecture d'annonces pour tous les utilisateurs authentifiés" 
ON public.evscatala_announcements
FOR SELECT
USING ((SELECT auth.role()) IS NOT NULL);

DROP POLICY IF EXISTS "Mise à jour d'annonce par créateur, staff ou admin" ON public.evscatala_announcements;
CREATE POLICY "Mise à jour d'annonce par créateur, staff ou admin" 
ON public.evscatala_announcements
FOR UPDATE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Suppression d'annonce par créateur, staff ou admin" ON public.evscatala_announcements;
CREATE POLICY "Suppression d'annonce par créateur, staff ou admin" 
ON public.evscatala_announcements
FOR DELETE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Création d'annonces pour staff et admin" ON public.evscatala_announcements;
CREATE POLICY "Création d'annonces pour staff et admin" 
ON public.evscatala_announcements
FOR INSERT
WITH CHECK ((SELECT auth.role()) IN ('staff', 'admin'));

-- 4. Politiques pour evscatala_announcement_reads
DROP POLICY IF EXISTS "Les utilisateurs peuvent marquer les annonces comme lues" ON public.evscatala_announcement_reads;
CREATE POLICY "Les utilisateurs peuvent marquer les annonces comme lues" 
ON public.evscatala_announcement_reads
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres lectures" ON public.evscatala_announcement_reads;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres lectures" 
ON public.evscatala_announcement_reads
FOR SELECT
USING (user_id = (SELECT auth.uid()));

-- 5. Politiques pour evscatala_votes
DROP POLICY IF EXISTS "Lecture de votes pour tous les utilisateurs authentifiés" ON public.evscatala_votes;
CREATE POLICY "Lecture de votes pour tous les utilisateurs authentifiés" 
ON public.evscatala_votes
FOR SELECT
USING ((SELECT auth.role()) IS NOT NULL);

DROP POLICY IF EXISTS "Mise à jour de vote par créateur, staff ou admin" ON public.evscatala_votes;
CREATE POLICY "Mise à jour de vote par créateur, staff ou admin" 
ON public.evscatala_votes
FOR UPDATE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Suppression de vote par créateur, staff ou admin" ON public.evscatala_votes;
CREATE POLICY "Suppression de vote par créateur, staff ou admin" 
ON public.evscatala_votes
FOR DELETE
USING (
  user_id = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Création de votes pour staff et admin" ON public.evscatala_votes;
CREATE POLICY "Création de votes pour staff et admin" 
ON public.evscatala_votes
FOR INSERT
WITH CHECK ((SELECT auth.role()) IN ('staff', 'admin'));

-- 6. Politiques pour evscatala_permanences
DROP POLICY IF EXISTS "Lecture de permanences pour tous les utilisateurs authentifiés" ON public.evscatala_permanences;
CREATE POLICY "Lecture de permanences pour tous les utilisateurs authentifiés" 
ON public.evscatala_permanences
FOR SELECT
USING ((SELECT auth.role()) IS NOT NULL);

DROP POLICY IF EXISTS "Mise à jour de permanence par créateur, staff ou admin" ON public.evscatala_permanences;
CREATE POLICY "Mise à jour de permanence par créateur, staff ou admin" 
ON public.evscatala_permanences
FOR UPDATE
USING (
  created_by = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Suppression de permanence par créateur, staff ou admin" ON public.evscatala_permanences;
CREATE POLICY "Suppression de permanence par créateur, staff ou admin" 
ON public.evscatala_permanences
FOR DELETE
USING (
  created_by = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);

DROP POLICY IF EXISTS "Création de permanences pour staff et admin" ON public.evscatala_permanences;
CREATE POLICY "Création de permanences pour staff et admin" 
ON public.evscatala_permanences
FOR INSERT
WITH CHECK ((SELECT auth.role()) IN ('staff', 'admin'));

-- 7. Politiques pour evscatala_permanence_participants
DROP POLICY IF EXISTS "Les utilisateurs peuvent s'inscrire à des permanences" ON public.evscatala_permanence_participants;
CREATE POLICY "Les utilisateurs peuvent s'inscrire à des permanences" 
ON public.evscatala_permanence_participants
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les participants aux permanences" ON public.evscatala_permanence_participants;
CREATE POLICY "Les utilisateurs peuvent voir les participants aux permanences" 
ON public.evscatala_permanence_participants
FOR SELECT
USING ((SELECT auth.role()) IS NOT NULL);

DROP POLICY IF EXISTS "Les utilisateurs peuvent se désinscrire de leurs permanences" ON public.evscatala_permanence_participants;
CREATE POLICY "Les utilisateurs peuvent se désinscrire de leurs permanences" 
ON public.evscatala_permanence_participants
FOR DELETE
USING (user_id = (SELECT auth.uid()));

-- 8. Politiques pour evscatala_conversations
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

-- 9. Politiques pour evscatala_conversation_participants
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les participants de leurs conversations" ON public.evscatala_conversation_participants;
CREATE POLICY "Les utilisateurs peuvent voir les participants de leurs conversations" 
ON public.evscatala_conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.evscatala_conversation_participants 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- 10. Politiques pour evscatala_messages
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les messages de leurs conversations" ON public.evscatala_messages;
CREATE POLICY "Les utilisateurs peuvent voir les messages de leurs conversations" 
ON public.evscatala_messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.evscatala_conversation_participants 
    WHERE user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages dans leurs conversations" ON public.evscatala_messages;
CREATE POLICY "Les utilisateurs peuvent envoyer des messages dans leurs conversations" 
ON public.evscatala_messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.evscatala_conversation_participants 
    WHERE user_id = (SELECT auth.uid())
  ) AND 
  sender_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres messages" ON public.evscatala_messages;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres messages" 
ON public.evscatala_messages
FOR UPDATE
USING (sender_id = (SELECT auth.uid()));

-- Assurez-vous que le RLS est activé pour toutes les tables concernées
ALTER TABLE public.evscatala_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_permanence_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evscatala_messages ENABLE ROW LEVEL SECURITY; 