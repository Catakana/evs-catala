-- Script de nettoyage des tables de votes
-- À exécuter dans l'éditeur SQL de Supabase pour supprimer complètement le module votes

-- ==========================================
-- SUPPRESSION DES TABLES DE VOTES
-- ==========================================

-- Supprimer les politiques RLS d'abord
DROP POLICY IF EXISTS "Lecture des votes" ON evscatala_votes;
DROP POLICY IF EXISTS "Création de votes" ON evscatala_votes;
DROP POLICY IF EXISTS "Modification de votes" ON evscatala_votes;
DROP POLICY IF EXISTS "Suppression de votes" ON evscatala_votes;

DROP POLICY IF EXISTS "Lecture des options de vote" ON evscatala_vote_options;
DROP POLICY IF EXISTS "Création d'options de vote" ON evscatala_vote_options;
DROP POLICY IF EXISTS "Modification d'options de vote" ON evscatala_vote_options;
DROP POLICY IF EXISTS "Suppression d'options de vote" ON evscatala_vote_options;

DROP POLICY IF EXISTS "Lecture des réponses de vote" ON evscatala_vote_responses;
DROP POLICY IF EXISTS "Création de réponses de vote" ON evscatala_vote_responses;
DROP POLICY IF EXISTS "Modification de réponses de vote" ON evscatala_vote_responses;
DROP POLICY IF EXISTS "Suppression de réponses de vote" ON evscatala_vote_responses;

-- Supprimer les index
DROP INDEX IF EXISTS idx_evscatala_votes_status;
DROP INDEX IF EXISTS idx_evscatala_votes_created_by;
DROP INDEX IF EXISTS idx_evscatala_votes_dates;
DROP INDEX IF EXISTS idx_evscatala_votes_type;
DROP INDEX IF EXISTS idx_evscatala_votes_created_at;
DROP INDEX IF EXISTS idx_evscatala_votes_start_date;
DROP INDEX IF EXISTS idx_evscatala_votes_end_date;

DROP INDEX IF EXISTS idx_evscatala_vote_options_vote_id;

DROP INDEX IF EXISTS idx_evscatala_vote_responses_vote_id;
DROP INDEX IF EXISTS idx_evscatala_vote_responses_option_id;
DROP INDEX IF EXISTS idx_evscatala_vote_responses_user_id;
DROP INDEX IF EXISTS idx_evscatala_vote_responses_unique_vote;

-- Supprimer les fonctions RPC liées aux votes
DROP FUNCTION IF EXISTS get_vote_statistics(UUID);
DROP FUNCTION IF EXISTS get_user_vote_status(UUID, UUID);
DROP FUNCTION IF EXISTS get_votes_with_stats();
DROP FUNCTION IF EXISTS submit_vote_response(UUID, UUID, UUID);

-- Supprimer les tables (dans l'ordre des dépendances)
DROP TABLE IF EXISTS evscatala_vote_responses CASCADE;
DROP TABLE IF EXISTS evscatala_vote_options CASCADE;
DROP TABLE IF EXISTS evscatala_votes CASCADE;

-- Vérification finale
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evscatala_votes') 
    THEN '❌ evscatala_votes existe encore'
    ELSE '✅ evscatala_votes supprimée'
  END as votes_table_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evscatala_vote_options') 
    THEN '❌ evscatala_vote_options existe encore'
    ELSE '✅ evscatala_vote_options supprimée'
  END as vote_options_table_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evscatala_vote_responses') 
    THEN '❌ evscatala_vote_responses existe encore'
    ELSE '✅ evscatala_vote_responses supprimée'
  END as vote_responses_table_status;

-- Message de confirmation
SELECT '🗑️ Nettoyage des tables de votes terminé' as status; 