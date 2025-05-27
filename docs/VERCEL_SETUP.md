# Configuration Vercel pour EVS-CATALA

## 🚀 Variables d'environnement requises

Pour que l'application fonctionne correctement en production sur Vercel, vous devez configurer les variables d'environnement suivantes :

### Variables Supabase

```
VITE_SUPABASE_URL = https://oybpmjjtbmlesvhlgabn.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI
```

## 📋 Configuration via Dashboard Vercel

1. **Allez sur le dashboard Vercel** : https://vercel.com/dashboard
2. **Sélectionnez votre projet** : `evs-catala`
3. **Allez dans Settings** → **Environment Variables**
4. **Ajoutez chaque variable** :
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://oybpmjjtbmlesvhlgabn.supabase.co`
   - Environment: `Production`
   
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI`
   - Environment: `Production`

## 🔧 Configuration via Vercel CLI

Si vous avez installé Vercel CLI (`npm i -g vercel`), vous pouvez utiliser :

```bash
vercel env add VITE_SUPABASE_URL production
# Entrez la valeur: https://oybpmjjtbmlesvhlgabn.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Entrez la valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI
```

## 🔄 Redéploiement

Après avoir configuré les variables d'environnement :

1. **Redéployez l'application** depuis le dashboard Vercel
2. **Ou poussez un nouveau commit** pour déclencher un redéploiement automatique

## 🔍 Vérification

Une fois redéployé, vous pouvez vérifier que les variables sont bien configurées :

1. **Ouvrez l'application** en production
2. **Cliquez sur le bouton "🔧 Debug Prod"** en bas à droite
3. **Vérifiez que** :
   - `supabase.url` est définie
   - `supabase.anonKey` est "Définie"
   - `supabase.anonKeyLength` > 0

## ⚠️ Problèmes courants

### Variables non définies
- Vérifiez que les variables sont bien ajoutées dans l'environnement "Production"
- Redéployez après avoir ajouté les variables

### Données ne se chargent pas
- Vérifiez la console du navigateur pour les erreurs Supabase
- Utilisez le debugger de production pour diagnostiquer

### Erreurs de connexion Supabase
- Vérifiez que l'URL Supabase est correcte
- Vérifiez que la clé anonyme n'a pas expiré 