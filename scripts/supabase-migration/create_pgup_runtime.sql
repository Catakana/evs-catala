-- Création de la fonction pgup_runtime pour exécuter des scripts SQL dynamiques
CREATE OR REPLACE FUNCTION public.pgup_runtime(source text)
RETURNS void AS $$
BEGIN
  EXECUTE source;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exécution à la fonction
GRANT EXECUTE ON FUNCTION public.pgup_runtime(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pgup_runtime(text) TO anon;
GRANT EXECUTE ON FUNCTION public.pgup_runtime(text) TO service_role; 