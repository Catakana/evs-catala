# Solution rapide - Erreurs de relations base de données

## 🚨 Problèmes actuels
Vous avez des erreurs dans la console :
```
Could not find a relationship between 'evscatala_event_participants' and 'evscatala_profiles'
Could not find a relationship between 'evscatala_notes' and 'evscatala_profiles'
```

## ⚡ Solution immédiate (5 minutes)

### Étape 1 : Accéder à Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet EVS-Catala
3. Cliquez sur **"SQL Editor"** dans le menu de gauche

### Étape 2 : Choisir le script approprié

#### Option A : Correction complète (recommandée)
Pour corriger tous les problèmes de relations, utilisez le script `scripts/fix_notes_relations.sql`

#### Option B : Correction rapide participants seulement
Si vous voulez juste corriger les participants aux événements, utilisez le script ci-dessous :

### Étape 3 : Exécuter le script de correction
Copiez-collez le script choisi dans l'éditeur SQL et cliquez sur **"Run"** :

```sql
-- Correction rapide des relations participants/profils
-- Script à exécuter dans l'éditeur SQL de Supabase

-- 1. S'assurer que la table evscatala_profiles existe
CREATE TABLE IF NOT EXISTS evscatala_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'staff', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. S'assurer que la table evscatala_event_participants existe
CREATE TABLE IF NOT EXISTS evscatala_event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES evscatala_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'present', 'absent', 'maybe')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 3. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_evscatala_profiles_user_id ON evscatala_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_event_id ON evscatala_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_event_participants_user_id ON evscatala_event_participants(user_id);

-- 4. Activer RLS
ALTER TABLE evscatala_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_event_participants ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour evscatala_profiles
DROP POLICY IF EXISTS "Lecture des profils" ON evscatala_profiles;
CREATE POLICY "Lecture des profils" 
ON evscatala_profiles FOR SELECT 
TO authenticated 
USING (true);

-- 6. Politiques RLS pour evscatala_event_participants
DROP POLICY IF EXISTS "Lecture des participants" ON evscatala_event_participants;
CREATE POLICY "Lecture des participants" 
ON evscatala_event_participants FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Inscription aux événements" ON evscatala_event_participants;
CREATE POLICY "Inscription aux événements" 
ON evscatala_event_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 7. Vérification
SELECT 'Configuration terminée ✅' as status;
```

### Étape 3 : Vérifier le résultat
Après l'exécution, vous devriez voir :
```
status
Configuration terminée ✅
```

### Étape 4 : Actualiser l'application
1. Retournez sur votre application EVS-Catala
2. Actualisez la page (F5 ou Ctrl+R)
3. Les erreurs devraient avoir disparu

## 🔍 Vérification
Pour vérifier que tout fonctionne :
1. Allez dans la section "Agenda"
2. Cliquez sur un événement
3. La modal de détail devrait s'ouvrir sans erreur
4. La section "Participants" devrait être visible

## 📞 Si le problème persiste
Si vous avez encore des erreurs :
1. Exécutez le script `scripts/verify_database_setup.sql` dans Supabase
2. Consultez le fichier `docs/TROUBLESHOOTING_DATABASE.md`
3. Contactez l'équipe de développement avec les messages d'erreur exacts

## 🎯 Résultat attendu
- ✅ Plus d'erreur 400 dans la console
- ✅ Les participants aux événements s'affichent correctement
- ✅ Les notes se chargent sans erreur
- ✅ L'application fonctionne normalement

## 📋 Scripts disponibles
- `scripts/fix_notes_relations.sql` - Correction complète (notes + événements + profils)
- `scripts/fix_event_participants_relation.sql` - Correction participants seulement
- `scripts/cleanup_votes_tables.sql` - **NOUVEAU** : Nettoyage des tables de votes (suppression)
- `scripts/create_rpc_functions.sql` - Fonctions optimisées (optionnel)
- `scripts/verify_database_setup.sql` - Vérification de l'installation

## 🚀 Optimisation (optionnel)
Pour de meilleures performances, exécutez aussi le script `scripts/create_rpc_functions.sql` après la correction principale. 