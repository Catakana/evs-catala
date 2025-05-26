# Guide de Dépannage - EVS-catala

## Problèmes de Base de Données

### Erreur 400 lors de la récupération des participants

**Symptôme :** 
```
Failed to load resource: the server responded with a status of 400 ()
Erreur lors de la récupération des participants: Object
```

**Cause :** La table `evscatala_event_participants` n'existe pas dans Supabase.

**Solution :**

1. **Connectez-vous à votre interface Supabase** :
   - Allez sur [supabase.com](https://supabase.com)
   - Connectez-vous à votre projet
   - Allez dans l'onglet "SQL Editor"

2. **Exécutez le script de configuration** :
   - Copiez le contenu du fichier `scripts/setup_database.sql`
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" pour exécuter le script

3. **Vérifiez la création des tables** :
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'evscatala_%'
   ORDER BY table_name;
   ```

   Vous devriez voir :
   - `evscatala_events`
   - `evscatala_event_participants`
   - `evscatala_profiles`

### Problème de profils utilisateur manquants

**Symptôme :** Les participants n'affichent pas de noms ou d'avatars.

**Cause :** La table `evscatala_profiles` est vide ou les profils ne sont pas créés automatiquement.

**Solution temporaire :**

1. **Créer un profil pour l'utilisateur connecté** :
   ```sql
   INSERT INTO evscatala_profiles (user_id, firstname, lastname, role)
   VALUES (auth.uid(), 'Votre Prénom', 'Votre Nom', 'admin');
   ```

2. **Ou créer des profils de test** :
   ```sql
   -- Remplacez les UUIDs par de vrais IDs d'utilisateurs
   INSERT INTO evscatala_profiles (user_id, firstname, lastname, role) VALUES
   ('uuid-utilisateur-1', 'Jean', 'Dupont', 'member'),
   ('uuid-utilisateur-2', 'Marie', 'Martin', 'staff');
   ```

## Problèmes d'Interface

### Avertissement DialogContent

**Symptôme :**
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**Solution :** Déjà corrigé dans le code avec l'ajout de `DialogDescription`.

### Erreurs de linter TypeScript

**Symptômes :** Erreurs d'imports React, types manquants, etc.

**Solutions :**

1. **Vérifier les dépendances** :
   ```bash
   npm install
   ```

2. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Vérifier les types** :
   ```bash
   npm run type-check
   ```

## Problèmes de Permissions

### Impossible de créer des événements

**Symptôme :** Erreur lors de la création d'événements.

**Cause :** L'utilisateur n'a pas le rôle `staff` ou `admin`.

**Solution :**

1. **Mettre à jour le rôle de l'utilisateur** :
   ```sql
   UPDATE evscatala_profiles 
   SET role = 'admin' 
   WHERE user_id = auth.uid();
   ```

2. **Ou modifier temporairement les politiques RLS** pour permettre à tous les utilisateurs de créer des événements :
   ```sql
   DROP POLICY IF EXISTS "Création d'événements" ON evscatala_events;
   CREATE POLICY "Création d'événements" 
   ON evscatala_events FOR INSERT 
   TO authenticated 
   WITH CHECK (auth.uid() = created_by);
   ```

## Problèmes de Connexion

### Erreurs runtime.lastError

**Symptôme :**
```
Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
```

**Cause :** Extensions de navigateur qui interfèrent avec l'application.

**Solution :**
- Désactiver temporairement les extensions de navigateur
- Ou utiliser un mode navigation privée
- Ces erreurs n'affectent pas le fonctionnement de l'application

## Scripts Utiles

### Réinitialiser les tables

```sql
-- ATTENTION : Ceci supprime toutes les données !
DROP TABLE IF EXISTS evscatala_event_participants CASCADE;
DROP TABLE IF EXISTS evscatala_events CASCADE;
DROP TABLE IF EXISTS evscatala_profiles CASCADE;

-- Puis réexécuter le script setup_database.sql
```

### Vérifier les données

```sql
-- Compter les événements
SELECT COUNT(*) as nb_events FROM evscatala_events;

-- Compter les participants
SELECT COUNT(*) as nb_participants FROM evscatala_event_participants;

-- Compter les profils
SELECT COUNT(*) as nb_profiles FROM evscatala_profiles;

-- Voir les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'evscatala_%';
```

### Données de test

```sql
-- Créer un événement de test (remplacez l'UUID par votre ID utilisateur)
INSERT INTO evscatala_events (title, description, start_datetime, end_datetime, category, location, created_by)
VALUES (
  'Réunion de test',
  'Ceci est un événement de test',
  '2024-12-20 14:00:00+00',
  '2024-12-20 16:00:00+00',
  'reunion',
  'Salle de réunion',
  'votre-user-id-ici'
);
```

## Contact

Si les problèmes persistent, vérifiez :
1. Les logs de la console du navigateur
2. Les logs de Supabase dans l'onglet "Logs"
3. La configuration des variables d'environnement
4. Les politiques RLS dans Supabase 