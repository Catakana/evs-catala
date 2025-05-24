-- Insérer une permanence de test
INSERT INTO public.evscatala_permanences (
  title, 
  description, 
  start_date, 
  end_date, 
  location, 
  required_volunteers, 
  max_volunteers,
  min_volunteers,
  status,
  created_by
) VALUES (
  'Permanence de Test',
  'Permanence pour tester l''inscription',
  '2025-05-25T09:00:00Z',
  '2025-05-25T12:00:00Z',
  'Local associatif',
  2,
  5,
  1,
  'open',
  '1cf4d0ea-1f4c-4812-bf77-6524080621ba'
);

-- Ajouter une autre permanence pour un jour différent
INSERT INTO public.evscatala_permanences (
  title, 
  description, 
  start_date, 
  end_date, 
  location, 
  required_volunteers, 
  max_volunteers,
  min_volunteers,
  status,
  created_by
) VALUES (
  'Permanence du Lundi',
  'Permanence régulière du lundi',
  '2025-05-26T14:00:00Z',
  '2025-05-26T17:00:00Z',
  'Local associatif',
  2,
  5,
  1,
  'open',
  '1cf4d0ea-1f4c-4812-bf77-6524080621ba'
); 