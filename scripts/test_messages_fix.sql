-- Script de vérification des tables de messagerie
-- Vérifie que toutes les tables existent et sont correctement configurées

-- Vérifier l'existence des tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'evscatala_conversations',
  'evscatala_conversation_participants', 
  'evscatala_messages',
  'evscatala_message_attachments'
)
ORDER BY table_name;

-- Vérifier la structure de la table evscatala_conversation_participants
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'evscatala_conversation_participants'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
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
WHERE tablename IN (
  'evscatala_conversations',
  'evscatala_conversation_participants', 
  'evscatala_messages',
  'evscatala_message_attachments'
)
ORDER BY tablename, policyname;

-- Compter les enregistrements existants
SELECT 
  'evscatala_conversations' as table_name,
  COUNT(*) as record_count
FROM evscatala_conversations
UNION ALL
SELECT 
  'evscatala_conversation_participants' as table_name,
  COUNT(*) as record_count
FROM evscatala_conversation_participants
UNION ALL
SELECT 
  'evscatala_messages' as table_name,
  COUNT(*) as record_count
FROM evscatala_messages
UNION ALL
SELECT 
  'evscatala_message_attachments' as table_name,
  COUNT(*) as record_count
FROM evscatala_message_attachments; 