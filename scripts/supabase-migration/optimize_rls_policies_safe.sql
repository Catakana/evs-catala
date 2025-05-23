-- Script sécurisé pour optimiser les politiques RLS qui utilisent auth.* et current_setting()
-- Cette version plus prudente ne modifie que les politiques existantes
-- Exécutez d'abord check_tables_structure.sql pour examiner votre schéma

-- 1. Optimisation des politiques RLS pour toutes les tables (approche générique)
DO $$
DECLARE
    r RECORD;
    policy_def TEXT;
    new_policy_def TEXT;
BEGIN
    -- Parcourir toutes les politiques existantes
    FOR r IN (
        SELECT schemaname, tablename, policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename LIKE 'evscatala_%'
    ) LOOP
        -- Récupérer la définition SQL de la politique
        EXECUTE format('SELECT pg_get_expr(polqual, polrelid) FROM pg_policy WHERE polname = %L AND polrelid = %L::regclass', 
                      r.policyname, r.schemaname || '.' || r.tablename) INTO policy_def;
        
        IF policy_def IS NOT NULL THEN
            -- Remplacer auth.uid() par (SELECT auth.uid())
            new_policy_def := regexp_replace(policy_def, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
            -- Remplacer auth.role() par (SELECT auth.role())
            new_policy_def := regexp_replace(new_policy_def, 'auth\.role\(\)', '(SELECT auth.role())', 'g');
            -- Remplacer current_setting() par (SELECT current_setting())
            new_policy_def := regexp_replace(new_policy_def, 'current_setting\(([^)]+)\)', '(SELECT current_setting(\1))', 'g');
            
            -- Recréer la politique avec la définition optimisée
            IF new_policy_def != policy_def THEN
                EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                              r.policyname, r.schemaname, r.tablename);
                
                IF r.cmd = 'SELECT' THEN
                    EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT USING (%s)', 
                                  r.policyname, r.schemaname, r.tablename, new_policy_def);
                ELSIF r.cmd = 'INSERT' THEN
                    EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT WITH CHECK (%s)', 
                                  r.policyname, r.schemaname, r.tablename, new_policy_def);
                ELSIF r.cmd = 'UPDATE' THEN
                    EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s)', 
                                  r.policyname, r.schemaname, r.tablename, new_policy_def);
                ELSIF r.cmd = 'DELETE' THEN
                    EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE USING (%s)', 
                                  r.policyname, r.schemaname, r.tablename, new_policy_def);
                END IF;
                
                RAISE NOTICE 'Optimized policy % on table %.%', r.policyname, r.schemaname, r.tablename;
            END IF;
        END IF;
    END LOOP;
END
$$;

-- Assurez-vous que le RLS est activé pour toutes les tables concernées
SELECT format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'evscatala_%'; 