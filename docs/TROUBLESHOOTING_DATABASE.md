# Guide de dépannage - Base de données

## Problème : Tables manquantes ou relations incorrectes dans Supabase

### Symptômes
- Erreur 400 : `evscatala_event_participants` introuvable
- Erreur 404 : `evscatala_projects` introuvable
- Message "Impossible de charger les projets" dans l'interface
- Erreurs dans la console du navigateur concernant les participants aux événements
- Erreur de relation : "Could not find a relationship between 'evscatala_event_participants' and 'evscatala_profiles'"

### Causes possibles
1. Les tables nécessaires au bon fonctionnement de l'application n'ont pas encore été créées dans votre base de données Supabase
2. Les relations entre les tables ne sont pas correctement configurées
3. Les fonctions RPC pour les requêtes complexes ne sont pas créées

## Solution rapide (recommandée)

### Étape 1 : Accéder à l'éditeur SQL de Supabase
1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet EVS-Catala
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Exécuter le script de création rapide
1. Copiez le contenu du fichier `scripts/quick_setup.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Cliquez sur **"Run"** pour exécuter le script

### Étape 3 : Vérifier la création des tables
Après l'exécution, vous devriez voir un résultat similaire à :
```
table_name                    | column_count
------------------------------|-------------
evscatala_event_participants  | 6
evscatala_projects           | 9
```

### Étape 4 : Corriger les relations (si nécessaire)
Si vous avez encore des erreurs de relation, exécutez également :
1. Copiez le contenu du fichier `scripts/fix_event_participants_relation.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Cliquez sur **"Run"** pour exécuter le script

### Étape 5 : Créer les fonctions RPC (optionnel mais recommandé)
Pour optimiser les performances :
1. Copiez le contenu du fichier `scripts/create_rpc_functions.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Cliquez sur **"Run"** pour exécuter le script

### Étape 6 : Redémarrer l'application
1. Actualisez votre navigateur
2. Les erreurs devraient avoir disparu

## Solution complète (optionnelle)

Si vous voulez installer toutes les tables d'un coup, utilisez le script complet :

### Fichier à exécuter
`scripts/setup_database.sql`

### Tables créées
- `evscatala_profiles` - Profils utilisateurs
- `evscatala_events` - Événements
- `evscatala_event_participants` - Participants aux événements
- `evscatala_notes` - Notes rapides
- `evscatala_projects` - Projets principaux
- `evscatala_project_members` - Membres des projets
- `evscatala_project_tasks` - Tâches des projets
- `evscatala_project_budgets` - Budgets des projets
- `evscatala_project_documents` - Documents des projets
- `evscatala_project_communications` - Communications des projets

## Vérification post-installation

### Dans l'interface Supabase
1. Allez dans **"Table Editor"**
2. Vérifiez que toutes les tables `evscatala_*` sont présentes
3. Vérifiez que les politiques RLS sont activées (icône de cadenas)

### Dans l'application
1. Actualisez la page
2. Naviguez vers la section "Projets"
3. Vérifiez qu'il n'y a plus d'erreur "Impossible de charger les projets"
4. Testez la création d'un événement et l'inscription

## Problèmes persistants

### Si les erreurs persistent après l'exécution du script
1. Vérifiez que vous êtes connecté au bon projet Supabase
2. Vérifiez que votre utilisateur a les permissions d'administration
3. Consultez les logs d'erreur dans l'onglet "Logs" de Supabase

### Si certaines fonctionnalités ne marchent pas
1. Vérifiez que les politiques RLS sont correctement configurées
2. Assurez-vous que votre utilisateur a un profil dans `evscatala_profiles`
3. Vérifiez les permissions de votre rôle utilisateur

## Contact

Si le problème persiste, contactez l'équipe de développement avec :
- Les messages d'erreur exacts
- Les captures d'écran de l'interface Supabase
- Votre rôle utilisateur dans l'application 