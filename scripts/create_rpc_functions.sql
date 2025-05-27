-- Script de création des fonctions RPC pour optimiser les requêtes
-- À exécuter dans l'interface SQL de Supabase

-- 1. Fonction pour récupérer les participants d'un événement avec leurs profils
CREATE OR REPLACE FUNCTION get_event_participants_with_profiles(event_id_param UUID)
RETURNS TABLE (
  id UUID,
  event_id UUID,
  user_id UUID,
  status VARCHAR(20),
  registered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.event_id,
    ep.user_id,
    ep.status,
    ep.registered_at,
    ep.updated_at,
    CASE 
      WHEN p.user_id IS NOT NULL THEN
        jsonb_build_object(
          'firstname', p.firstname,
          'lastname', p.lastname,
          'avatar_url', p.avatar_url,
          'role', p.role
        )
      ELSE NULL
    END as user
  FROM evscatala_event_participants ep
  LEFT JOIN evscatala_profiles p ON ep.user_id = p.user_id
  WHERE ep.event_id = event_id_param
  ORDER BY ep.registered_at ASC;
END;
$$;

-- 2. Fonction pour récupérer un événement avec ses participants
CREATE OR REPLACE FUNCTION get_event_with_participants(event_id_param UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  category VARCHAR(50),
  location VARCHAR(255),
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  participants JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_datetime,
    e.end_datetime,
    e.category,
    e.location,
    e.created_by,
    e.created_at,
    e.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ep.id,
            'user_id', ep.user_id,
            'status', ep.status,
            'registered_at', ep.registered_at,
            'user', CASE 
              WHEN p.user_id IS NOT NULL THEN
                jsonb_build_object(
                  'firstname', p.firstname,
                  'lastname', p.lastname,
                  'avatar_url', p.avatar_url,
                  'role', p.role
                )
              ELSE NULL
            END
          )
        )
        FROM evscatala_event_participants ep
        LEFT JOIN evscatala_profiles p ON ep.user_id = p.user_id
        WHERE ep.event_id = e.id
        ORDER BY ep.registered_at ASC
      ),
      '[]'::jsonb
    ) as participants
  FROM evscatala_events e
  WHERE e.id = event_id_param;
END;
$$;

-- 3. Fonction pour vérifier si un utilisateur est inscrit à un événement
CREATE OR REPLACE FUNCTION check_user_event_registration(event_id_param UUID, user_id_param UUID)
RETURNS TABLE (
  id UUID,
  status VARCHAR(20),
  registered_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.status,
    ep.registered_at
  FROM evscatala_event_participants ep
  WHERE ep.event_id = event_id_param AND ep.user_id = user_id_param;
END;
$$;

-- 4. Fonction pour récupérer les statistiques d'un événement
CREATE OR REPLACE FUNCTION get_event_statistics(event_id_param UUID)
RETURNS TABLE (
  total_participants INTEGER,
  registered_count INTEGER,
  present_count INTEGER,
  absent_count INTEGER,
  maybe_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_participants,
    COUNT(CASE WHEN status = 'registered' THEN 1 END)::INTEGER as registered_count,
    COUNT(CASE WHEN status = 'present' THEN 1 END)::INTEGER as present_count,
    COUNT(CASE WHEN status = 'absent' THEN 1 END)::INTEGER as absent_count,
    COUNT(CASE WHEN status = 'maybe' THEN 1 END)::INTEGER as maybe_count
  FROM evscatala_event_participants
  WHERE event_id = event_id_param;
END;
$$;

-- 5. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_event_participants_with_profiles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_with_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_event_registration(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_statistics(UUID) TO authenticated;

-- 6. Test des fonctions
-- Test de la fonction get_event_participants_with_profiles
SELECT 'Test get_event_participants_with_profiles' as test_name;

-- Test de la fonction get_event_statistics
SELECT 'Test get_event_statistics' as test_name;

-- Vérification que les fonctions ont été créées
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%event%'
ORDER BY routine_name; 