# 🚨 Solution Rapide - Problème d'affichage des annonces

## Problème identifié
- Erreur 400 : fonction RPC `get_announcements_with_author` non trouvée
- Colonnes manquantes dans la table `evscatala_announcements`
- Page des annonces affiche "Chargement des annonces..." en boucle

## 🛠️ Solution immédiate (2 minutes)

### Étape 1 : Exécuter le script d'urgence
Dans l'éditeur SQL de Supabase, copier-coller et exécuter le contenu du fichier :
```
scripts/fix_announcements_emergency.sql
```

### Étape 2 : Actualiser la page
1. Actualiser la page `/announcements` dans le navigateur
2. Vider le cache si nécessaire (Ctrl+F5)

## ✅ Résultat attendu
- La page des annonces affiche maintenant les annonces
- Au moins 2 annonces de test sont visibles
- Plus d'erreurs dans la console

## 🔧 Ce que fait le script d'urgence

1. **Corrige la table** : Ajoute toutes les colonnes manquantes
2. **Crée la fonction RPC** : Version simplifiée qui fonctionne
3. **Politiques RLS** : Politiques simples pour l'accès
4. **Données de test** : Ajoute 2 annonces pour tester

## 📊 Vérification

### Dans Supabase
```sql
-- Vérifier que la table a toutes les colonnes
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'evscatala_announcements';

-- Tester la fonction RPC
SELECT COUNT(*) FROM get_announcements_with_author();

-- Voir les annonces
SELECT title, category, is_pinned FROM evscatala_announcements;
```

### Dans l'application
- ✅ Page `/announcements` charge sans erreur
- ✅ Annonces visibles en mode grille
- ✅ Bouton "Créer une annonce" fonctionne
- ✅ Filtres par catégorie fonctionnent

## 🚀 Fonctionnalités disponibles après correction

### ✅ Fonctionnalités opérationnelles
- Affichage des annonces (grille/liste)
- Création d'annonces
- Modification d'annonces
- Suppression d'annonces
- Filtres par catégorie
- Recherche textuelle
- Épinglage et priorité

### 🔄 Fonctionnalités en développement
- Pièces jointes (désactivées temporairement)
- Marquage lu/non-lu (simulé)
- Notifications (à venir)

## 🐛 Si le problème persiste

### Vérifier les erreurs
1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet Console
3. Chercher les erreurs rouges

### Erreurs communes et solutions

#### Erreur : "Table does not exist"
```sql
-- Vérifier l'existence de la table
SELECT * FROM evscatala_announcements LIMIT 1;
```

#### Erreur : "Function does not exist"
```sql
-- Recréer la fonction
CREATE OR REPLACE FUNCTION get_announcements_with_author()
RETURNS TABLE (...) -- Voir le script complet
```

#### Erreur : "Permission denied"
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'evscatala_announcements';
```

## 📞 Support

Si le problème persiste après ces étapes :
1. Copier les erreurs de la console
2. Vérifier que le script a été exécuté entièrement
3. Redémarrer le serveur de développement

## 🎯 Prochaines étapes

Une fois les annonces fonctionnelles :
1. Tester la création d'annonces
2. Tester les filtres et la recherche
3. Vérifier les permissions par rôle
4. Implémenter les pièces jointes (optionnel) 