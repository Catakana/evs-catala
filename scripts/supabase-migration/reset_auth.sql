-- Script de réinitialisation complète des tables d'authentification
-- ATTENTION : Ce script supprime toutes les données d'authentification !

-- Désactiver temporairement les contraintes de clé étrangère pour permettre la suppression
SET session_replication_role = 'replica';

-- Supprimer toutes les données des tables evscatala_*
TRUNCATE evscatala_profiles CASCADE;
TRUNCATE evscatala_votes CASCADE;
TRUNCATE evscatala_vote_options CASCADE;
TRUNCATE evscatala_vote_responses CASCADE;
TRUNCATE evscatala_events CASCADE;
TRUNCATE evscatala_announcements CASCADE;
TRUNCATE evscatala_announcement_reads CASCADE;
TRUNCATE evscatala_permanences CASCADE;
TRUNCATE evscatala_permanence_participants CASCADE;
TRUNCATE evscatala_conversations CASCADE;
TRUNCATE evscatala_conversation_participants CASCADE;
TRUNCATE evscatala_messages CASCADE;
TRUNCATE evscatala_message_attachments CASCADE;

-- Nettoyage complet du système d'authentification
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.flow_state;
DELETE FROM auth.identities;
DELETE FROM auth.audit_log_entries;
DELETE FROM auth.sessions;
DELETE FROM auth.users;

-- Réactiver les contraintes de clé étrangère
SET session_replication_role = 'origin';

-- Signaler le succès
SELECT 'Reinitialisation complete des tables d''authentification terminee avec succes!' as message; 