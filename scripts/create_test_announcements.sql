-- Script simple pour créer des annonces de test
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table si elle n'existe pas (version simplifiée)
CREATE TABLE IF NOT EXISTS evscatala_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'info',
  author_id UUID NOT NULL,
  target_roles TEXT[] DEFAULT ARRAY['member'],
  target_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expire_date TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS avec politique simple
ALTER TABLE evscatala_announcements ENABLE ROW LEVEL SECURITY;

-- Politique de lecture simple (tous les utilisateurs authentifiés)
DROP POLICY IF EXISTS "Lecture publique des annonces" ON evscatala_announcements;
CREATE POLICY "Lecture publique des annonces" ON evscatala_announcements
  FOR SELECT TO authenticated USING (true);

-- Politique de création simple
DROP POLICY IF EXISTS "Création libre d'annonces" ON evscatala_announcements;
CREATE POLICY "Création libre d'annonces" ON evscatala_announcements
  FOR INSERT TO authenticated WITH CHECK (true);

-- Politique de modification simple
DROP POLICY IF EXISTS "Modification libre d'annonces" ON evscatala_announcements;
CREATE POLICY "Modification libre d'annonces" ON evscatala_announcements
  FOR UPDATE TO authenticated USING (true);

-- 3. Supprimer les anciennes annonces de test
DELETE FROM evscatala_announcements WHERE title LIKE '%Test%' OR title LIKE '%Bienvenue%';

-- 4. Insérer des annonces de test avec un author_id générique
-- Utiliser un UUID fixe pour les tests (remplacer par un vrai user_id si disponible)
INSERT INTO evscatala_announcements (
  title, 
  content, 
  category, 
  author_id, 
  is_pinned, 
  priority,
  target_roles
) VALUES 
(
  'Bienvenue sur EVS-catala !',
  'Bienvenue sur la nouvelle plateforme de l''EVS CATALA ! Vous pouvez maintenant consulter les annonces, gérer votre agenda et bien plus encore. Cette plateforme vous permettra de rester connecté avec la communauté.',
  'info',
  '00000000-0000-0000-0000-000000000001',
  true,
  10,
  ARRAY['member', 'staff', 'admin']
),
(
  'Réunion mensuelle - Mars 2024',
  'La prochaine réunion mensuelle aura lieu le premier mardi du mois à 19h en salle de réunion. Ordre du jour : bilan des activités, projets en cours, et nouvelles initiatives. Tous les membres sont invités à participer.',
  'event',
  '00000000-0000-0000-0000-000000000001',
  false,
  5,
  ARRAY['member', 'staff']
),
(
  'Maintenance programmée du site',
  'Une maintenance technique est programmée ce weekend de 2h à 6h du matin. Le site pourra être temporairement inaccessible. Nous nous excusons pour la gêne occasionnée.',
  'urgent',
  '00000000-0000-0000-0000-000000000001',
  true,
  8,
  ARRAY['member', 'staff', 'admin']
),
(
  'Nouveau projet : Application mobile',
  'Nous lançons le développement d''une application mobile pour EVS-catala. Si vous êtes intéressé pour participer au projet, contactez l''équipe technique. Compétences recherchées : React Native, design UX/UI.',
  'project',
  '00000000-0000-0000-0000-000000000001',
  false,
  3,
  ARRAY['staff', 'admin']
);

-- 5. Vérification
SELECT 
  title,
  category,
  is_pinned,
  priority,
  target_roles,
  created_at
FROM evscatala_announcements 
ORDER BY is_pinned DESC, priority DESC, created_at DESC;

-- Message de confirmation
SELECT 'Annonces de test créées avec succès !' as result;
SELECT COUNT(*) as nombre_total_annonces FROM evscatala_announcements;

-- Vérifier d'abord que la table existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'evscatala_announcements';

-- Insérer quelques annonces de test
INSERT INTO evscatala_announcements (
  title,
  content,
  category,
  author_id,
  target_roles,
  target_groups,
  publish_date,
  expire_date,
  is_pinned,
  priority,
  is_archived,
  created_at,
  updated_at
) VALUES 
(
  'Bienvenue sur le nouveau portail !',
  'Nous sommes ravis de vous présenter le nouveau portail de l''EVS CATALA. Vous y trouverez toutes les informations importantes, les événements à venir, et pourrez participer à la vie de l''association.',
  'info',
  (SELECT id FROM auth.users LIMIT 1), -- Premier utilisateur disponible
  ARRAY['member', 'staff', 'admin'],
  ARRAY[]::text[],
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  90,
  false,
  NOW(),
  NOW()
),
(
  'Réunion mensuelle - Juin 2025',
  'La prochaine réunion mensuelle aura lieu le 15 juin 2025 à 19h00 dans nos locaux. Ordre du jour : bilan des activités, projets en cours, et préparation de l''événement d''été.',
  'event',
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['member', 'staff'],
  ARRAY[]::text[],
  NOW(),
  '2025-06-15 19:00:00'::timestamp,
  false,
  70,
  false,
  NOW(),
  NOW()
),
(
  'Nouveau projet : Jardin partagé',
  'Nous lançons un nouveau projet de jardin partagé ! Si vous êtes intéressé(e) pour participer à cette belle initiative, n''hésitez pas à nous contacter. Première réunion de planification prévue la semaine prochaine.',
  'project',
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['member'],
  ARRAY[]::text[],
  NOW(),
  NOW() + INTERVAL '60 days',
  false,
  50,
  false,
  NOW(),
  NOW()
);

-- Vérifier que les annonces ont été créées
SELECT 
  id,
  title,
  category,
  is_pinned,
  priority,
  publish_date,
  expire_date
FROM evscatala_announcements 
ORDER BY priority DESC, publish_date DESC; 