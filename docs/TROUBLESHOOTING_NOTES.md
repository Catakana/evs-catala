# Guide de dépannage - Module Notes

## Problème : L'enregistrement des notes ne fonctionne pas

### Symptômes
- Le formulaire de création de note ne s'enregistre pas
- Message d'erreur "Impossible de créer la note"
- La modal reste ouverte après tentative d'enregistrement

### Diagnostic

#### 1. Vérifier la console du navigateur
Ouvrez les outils de développement (F12) et regardez la console pour des messages d'erreur :

```
❌ Erreur Supabase lors de la création de la note: { code: "PGRST106", message: "..." }
```

#### 2. Messages d'erreur courants

| Code d'erreur | Message | Solution |
|---------------|---------|----------|
| `PGRST106` | Table does not exist | Exécuter le script `scripts/fix_notes_issue.sql` |
| `42501` | Insufficient privileges | Vérifier l'authentification utilisateur |
| `23505` | Duplicate key value | Conflit d'identifiant (rare) |

### Solutions

#### Solution 1 : Créer/Réparer la table des notes

1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Se connecter à votre projet
   - Aller dans "SQL Editor"

2. **Exécuter le script de réparation**
   ```sql
   -- Copier et coller le contenu du fichier scripts/fix_notes_issue.sql
   ```

3. **Vérifier la création**
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_name = 'evscatala_notes';
   ```

#### Solution 2 : Vérifier l'authentification

1. **Vérifier la connexion utilisateur**
   - S'assurer d'être connecté à l'application
   - Vérifier que le token de session est valide

2. **Tester avec un autre utilisateur**
   - Se déconnecter et se reconnecter
   - Essayer avec un compte admin

#### Solution 3 : Test manuel dans Supabase

1. **Aller dans "Table Editor" sur Supabase**
2. **Chercher la table `evscatala_notes`**
3. **Essayer d'insérer une ligne manuellement**
   ```sql
   INSERT INTO evscatala_notes (
     content, 
     author_id, 
     title, 
     context_type, 
     status, 
     tags, 
     is_private
   ) VALUES (
     'Test manuel',
     'YOUR_USER_ID_HERE',
     'Test',
     'free',
     'draft',
     ARRAY['test'],
     false
   );
   ```

### Scripts de diagnostic

#### Script 1 : Vérification complète
```bash
# Exécuter dans Supabase SQL Editor
-- Contenu du fichier scripts/test_notes_creation.sql
```

#### Script 2 : Réparation complète
```bash
# Exécuter dans Supabase SQL Editor
-- Contenu du fichier scripts/fix_notes_issue.sql
```

### Vérification post-correction

1. **Actualiser la page de l'application**
2. **Ouvrir la console du navigateur**
3. **Essayer de créer une note**
4. **Vérifier les logs :**
   ```
   🔄 Création de note en cours...
   ✅ Note créée avec succès:
   ```

### Logs de débogage

Pour activer les logs détaillés, ouvrir la console et vérifier :

```javascript
// Logs attendus lors de la création d'une note
🔄 Tentative de création de note... { formData: {...}, userId: "..." }
🔄 Création de note en cours... { noteData: {...}, userId: "..." }
✅ Note créée avec succès: { id: "...", content: "...", ... }
```

### Contact support

Si le problème persiste après avoir suivi ces étapes :

1. **Copier les logs d'erreur de la console**
2. **Noter les étapes exactes qui causent le problème**
3. **Vérifier la version de l'application**
4. **Contacter l'équipe de développement avec ces informations**

### Prévention

Pour éviter ce problème à l'avenir :

1. **Sauvegarder régulièrement la base de données**
2. **Tester les nouvelles fonctionnalités en environnement de développement**
3. **Maintenir les scripts de migration à jour**
4. **Documenter les changements de structure de base de données** 