-- Script pour créer un profil pour l'utilisateur existant
INSERT INTO public.evscatala_profiles (
  user_id, 
  email, 
  firstname, 
  lastname, 
  role, 
  status, 
  created_at, 
  updated_at
)
VALUES (
  '1cf4d0ea-1f4c-4812-bf77-6524080621ba', -- ID de l'utilisateur existant
  'nguyenvanjean@gmail.com',
  'Jean',
  'NGUYEN',
  'member',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING; -- Ne pas insérer si le profil existe déjà

-- Vérification que le profil a été créé
SELECT * FROM public.evscatala_profiles WHERE user_id = '1cf4d0ea-1f4c-4812-bf77-6524080621ba'; 