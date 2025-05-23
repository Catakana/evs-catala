# Scripts de migration Supabase

Ce dossier contient les scripts SQL de migration pour créer et mettre à jour la structure de base de données dans Supabase.

## Structure des tables

Les tables sont préfixées par `evscatala_` pour éviter les conflits avec d'autres applications.

## Ordre d'exécution des migrations

Voici l'ordre recommandé pour exécuter les scripts de migration :

1. `base_schema.sql` - Tables fondamentales (profiles, etc.)
2. `votes_migration.sql` - Module de votes
3. `messages_migration.sql` - Module de messagerie
4. `permanences_migration.sql` - Module de permanences (à venir)
5. `projects_migration.sql` - Module de projets (à venir)

## Comment exécuter une migration

1. Connectez-vous à l'interface d'administration Supabase
2. Allez dans "SQL Editor"
3. Créez une nouvelle requête
4. Copiez-collez le contenu du script
5. Exécutez la requête

## Notes importantes

- Les politiques RLS (Row Level Security) sont incluses dans chaque script
- Respectez l'ordre des migrations pour éviter les problèmes de clés étrangères
- Testez toujours dans un environnement de développement avant de déployer en production

# Procédure de migration Supabase pour EVS-catala

Ce dossier contient tous les scripts nécessaires pour migrer l'application EVS-catala vers une nouvelle base de données Supabase.

## Nouvelles informations de connexion

## Migration

Le processus de migration se déroule en plusieurs étapes :

### 1. Exporter les données de l'ancienne base

```bash
node ../export_data.js
```

Cela va créer un dossier `data_export` contenant les données au format JSON.

### 2. Créer la structure de la nouvelle base

Connectez-vous à l'interface Supabase et exécutez le script SQL contenu dans `../migration.sql`.

### 3. Importer les données dans la nouvelle base

```bash
node ../import_data.js
```

### 4. Mettre à jour les variables d'environnement

Modifiez les fichiers `.env`, `.env.production` et `.env.example` pour utiliser les nouvelles clés Supabase.

### 5. Mettez à jour le code

Tous les fichiers qui interagissent avec la base de données ont été mis à jour pour utiliser le nouveau préfixe `evscatala_` pour les tables.

### 6. Tester l'application

Démarrez l'application et vérifiez que toutes les fonctionnalités fonctionnent correctement, notamment :
- L'authentification
- L'agenda
- Les annonces
- Le trombinoscope
- Les permanences

## Retour en arrière

En cas de problème, vous pouvez revenir à l'ancienne base de données en :
1. Remplaçant les variables d'environnement par les anciennes valeurs
2. Revertant les changements de code liés aux noms des tables

## Support

En cas de problème lors de la migration, contactez l'administrateur système. 

## Supprimer d'abord les tables dépendantes
DROP TABLE IF EXISTS evscatala_permanence_participants;
-- Puis la table principale
DROP TABLE IF EXISTS evscatala_permanences; 

-- Exemple d'ajout de colonnes manquantes (à adapter selon ce qui existe déjà)
ALTER TABLE evscatala_permanences 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS required_volunteers INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_volunteers INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS min_volunteers INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS notes TEXT; 

## Scripts de migration

Ce dossier contient les scripts de migration pour la base de données Supabase.

### Optimisation des politiques RLS (Row Level Security)

Nous avons deux scripts pour optimiser les politiques RLS :

1. `optimize_rls_policies.sql` - Version complète qui redéfinit toutes les politiques
2. `optimize_rls_policies_safe.sql` - Version sécurisée qui ne modifie que les politiques existantes

#### Approche recommandée

Pour éviter les erreurs liées aux noms de colonnes inconnus, suivez ces étapes :

1. **Examinez d'abord la structure de votre base de données** :
   ```bash
   # Exécutez ce script dans l'éditeur SQL de Supabase
   scripts/supabase-migration/check_tables_structure.sql
   ```
   
   Ce script affichera la liste de toutes les colonnes de vos tables et les politiques RLS existantes.

2. **Utilisez la version sécurisée** :
   ```bash
   # Exécutez ce script dans l'éditeur SQL de Supabase
   scripts/supabase-migration/optimize_rls_policies_safe.sql
   ```
   
   Cette version n'essaie pas de créer de nouvelles politiques, elle optimise uniquement celles qui existent déjà, en remplaçant les appels directs à `auth.*()` par la syntaxe recommandée `(SELECT auth.*())`.

#### Problème identifié

Lorsque les politiques RLS utilisent directement des appels à `auth.<function>()` ou `current_setting()`, ces fonctions sont réévaluées pour chaque ligne lors de l'exécution des requêtes. Cette approche crée un problème de performance qui s'aggrave à mesure que le nombre de lignes dans la table augmente.

Par exemple, une politique comme celle-ci:

```sql
CREATE POLICY "Mise à jour par créateur" 
ON public.evscatala_events
FOR UPDATE
USING (created_by = auth.uid() OR auth.role() IN ('staff', 'admin'));
```

Évalue `auth.uid()` et `auth.role()` pour chaque ligne de la table lors de chaque requête.

#### Solution appliquée

Le script remplace tous ces appels par la syntaxe recommandée utilisant des sous-requêtes :

```sql
CREATE POLICY "Mise à jour par créateur" 
ON public.evscatala_events
FOR UPDATE
USING (
  created_by = (SELECT auth.uid()) OR 
  (SELECT auth.role()) IN ('staff', 'admin')
);
```

Cette modification garantit que les fonctions ne sont évaluées qu'une seule fois par requête, plutôt que pour chaque ligne, ce qui améliore considérablement les performances, surtout lorsque les tables contiennent de nombreuses lignes.

#### Tables concernées

L'optimisation s'applique à toutes les tables dont le nom commence par `evscatala_`.

### Autres scripts de migration
