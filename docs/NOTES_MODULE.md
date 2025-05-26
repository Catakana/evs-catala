# Module Notes Rapides - EVS-catala

## 📝 Vue d'ensemble

Le module **Notes Rapides** permet aux membres de l'association de capturer rapidement des idées, compte-rendus, observations ou notes personnelles de manière fluide et organisée. Il s'intègre parfaitement dans l'écosystème EVS-catala avec des liens contextuels vers les événements et projets.

## 🎯 Objectifs

- **Capture rapide** : Créer une note en moins de 30 secondes
- **Organisation intelligente** : Système de tags et de contextes
- **Collaboration** : Partage et validation des notes
- **Accessibilité** : Disponible partout dans l'application
- **Sécurité** : Gestion fine des permissions et notes privées

## ⚙️ Fonctionnalités

### 🚀 Création Ultra-rapide

#### Bouton Flottant
- **Position** : Coin inférieur droit, toujours visible
- **Accès** : Un clic pour ouvrir le modal de création
- **Design** : Icône stylo avec animation au survol

#### Bouton Header
- **Position** : Barre de navigation supérieure
- **Format** : Bouton discret "+ Note"
- **Responsive** : Adapté mobile/desktop

#### Modal de Création
- **Champs principaux** :
  - Titre (optionnel)
  - Contenu (markdown supporté)
  - Contexte (libre, événement, projet)
  - Tags personnalisés
  - Statut (brouillon, à valider, validée)
  - Visibilité (privée/publique)

### 🗂️ Organisation & Tri

#### Système de Contextes
- **Note libre** : 📝 Sans lien spécifique
- **Événement** : 📅 Liée à une réunion/activité
- **Projet** : 📌 Liée à un projet en cours

#### Tags Dynamiques
- **Ajout libre** : Création de tags à la volée
- **Suggestions** : Basées sur les tags existants
- **Filtrage** : Recherche par tags multiples

#### Filtres Avancés
- **Recherche textuelle** : Dans titre et contenu
- **Filtre par contexte** : Type et élément lié
- **Filtre par statut** : Brouillon, en attente, validé
- **Filtre par auteur** : Pour les admins
- **Filtre par période** : Date de création/modification

### 👥 Collaboration & Partage

#### Statuts de Validation
- **📝 Brouillon** : Note personnelle en cours
- **⌛ À valider** : Soumise pour validation
- **✅ Validée** : Approuvée par staff/admin

#### Partage Sélectif
- **Notes privées** : Visibles uniquement par l'auteur
- **Notes publiques** : Visibles selon les permissions
- **Partage ciblé** : Avec utilisateurs spécifiques

#### Permissions
| Action | Membre | Staff | Admin |
|--------|--------|-------|-------|
| Créer note | ✅ | ✅ | ✅ |
| Modifier ses notes | ✅ | ✅ | ✅ |
| Voir notes publiques | 🔒 | ✅ | ✅ |
| Modifier statut | ❌ | ✅ | ✅ |
| Supprimer toute note | ❌ | ❌ | ✅ |

### 🔗 Intégrations

#### Liens Contextuels
- **Depuis un événement** : Bouton "Ajouter une note"
- **Depuis un projet** : Notes liées automatiquement
- **Depuis une annonce** : Génération de notes de suivi

#### Navigation Intelligente
- **Page dédiée** : `/notes` avec vue complète
- **Widget dashboard** : Notes récentes sur l'accueil
- **Notifications** : Nouvelles notes partagées

## 🏗️ Architecture Technique

### Base de Données

#### Table `evscatala_notes`
```sql
CREATE TABLE evscatala_notes (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  title VARCHAR(255),
  context_type VARCHAR(20) CHECK (context_type IN ('event', 'project', 'free')),
  context_id UUID,
  status VARCHAR(20) CHECK (status IN ('draft', 'validated', 'pending')),
  tags TEXT[],
  shared_with UUID[],
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Index Optimisés
- `idx_evscatala_notes_author_id` : Recherche par auteur
- `idx_evscatala_notes_context_type` : Filtrage par contexte
- `idx_evscatala_notes_status` : Filtrage par statut
- `idx_evscatala_notes_tags` : Recherche par tags (GIN)
- `idx_evscatala_notes_created_at` : Tri chronologique

#### Politiques RLS
- **Lecture** : Auteur + notes publiques selon rôle + partage
- **Écriture** : Auteur uniquement
- **Modification** : Auteur + staff/admin pour statut
- **Suppression** : Auteur + admin

### Services TypeScript

#### `notesService.ts`
```typescript
// CRUD complet
- getNotes(filters?: NoteFilters)
- createNote(noteData: NoteData, userId: string)
- updateNote(id: string, noteData: Partial<NoteData>)
- deleteNote(id: string)

// Fonctions spécialisées
- getNotesByContext(contextType, contextId)
- getRecentNotes(limit: number)
- shareNote(noteId: string, userIds: string[])
- getAvailableTags()
```

### Composants React

#### Structure des Composants
```
src/components/notes/
├── QuickNoteButton.tsx      # Bouton flottant + navbar
├── QuickNoteModal.tsx       # Modal de création/édition
├── NoteCard.tsx             # Affichage d'une note
├── NoteFilters.tsx          # Filtres et recherche
└── NotesWidget.tsx          # Widget pour dashboard
```

#### Pages
```
src/pages/
└── NotesPage.tsx            # Page principale des notes
```

## 🚀 Installation & Configuration

### 1. Base de Données
```sql
-- Exécuter dans Supabase SQL Editor
\i scripts/create_notes_table.sql
-- OU utiliser le script complet
\i scripts/setup_database.sql
```

### 2. Vérification
```sql
-- Vérifier la création
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'evscatala_notes';

-- Tester les permissions
SELECT * FROM evscatala_notes LIMIT 1;
```

### 3. Configuration Frontend
Les composants sont automatiquement intégrés dans :
- `AppLayout.tsx` : Bouton flottant
- `Header.tsx` : Bouton navbar
- `BottomNav.tsx` : Navigation
- `App.tsx` : Route `/notes`

## 📊 Utilisation

### Création Rapide
1. **Clic sur bouton flottant** ou bouton header
2. **Saisie du contenu** (obligatoire)
3. **Ajout titre** (optionnel)
4. **Sélection contexte** (libre par défaut)
5. **Tags** (optionnels)
6. **Enregistrement** (statut brouillon par défaut)

### Gestion des Notes
1. **Accès page `/notes`** via navigation
2. **Filtrage** par contexte, statut, tags
3. **Recherche textuelle** dans contenu/titre
4. **Actions** : éditer, supprimer, partager
5. **Validation** (staff/admin uniquement)

### Intégration Contextuelle
1. **Depuis événement** : Bouton "Ajouter note" dans détails
2. **Depuis projet** : Notes liées affichées automatiquement
3. **Dashboard** : Widget notes récentes

## 🔧 Maintenance

### Nettoyage Périodique
```sql
-- Supprimer les brouillons anciens (> 30 jours)
DELETE FROM evscatala_notes 
WHERE status = 'draft' 
AND created_at < NOW() - INTERVAL '30 days';
```

### Statistiques
```sql
-- Statistiques d'utilisation
SELECT 
  status,
  context_type,
  COUNT(*) as count,
  AVG(LENGTH(content)) as avg_length
FROM evscatala_notes 
GROUP BY status, context_type;
```

### Sauvegarde Tags
```sql
-- Exporter les tags populaires
SELECT 
  unnest(tags) as tag,
  COUNT(*) as usage_count
FROM evscatala_notes 
GROUP BY tag 
ORDER BY usage_count DESC;
```

## 🚀 Évolutions Futures

### Phase 2 - Fonctionnalités Avancées
- **Speech-to-text** : Dictée vocale
- **Notifications push** : Nouvelles notes partagées
- **Export PDF** : Génération de documents
- **Templates** : Modèles de notes prédéfinis

### Phase 3 - Collaboration Avancée
- **Édition collaborative** : Temps réel
- **Commentaires** : Sur les notes partagées
- **Historique** : Versions et modifications
- **Intégration messagerie** : Conversion discussions → notes

### Phase 4 - Intelligence
- **Suggestions tags** : IA basée sur contenu
- **Résumés automatiques** : Pour notes longues
- **Liens intelligents** : Détection automatique de contextes
- **Recherche sémantique** : Au-delà des mots-clés

## 🐛 Dépannage

### Erreurs Communes

#### Table non trouvée
```
Erreur: relation "evscatala_notes" does not exist
Solution: Exécuter scripts/create_notes_table.sql
```

#### Permissions insuffisantes
```
Erreur: new row violates row-level security policy
Solution: Vérifier profil utilisateur et rôles
```

#### Tags non sauvegardés
```
Problème: Tags disparaissent après sauvegarde
Solution: Vérifier format array PostgreSQL
```

### Logs Utiles
```sql
-- Vérifier politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'evscatala_notes';

-- Tester permissions utilisateur
SELECT auth.uid(), auth.role();

-- Vérifier données test
SELECT id, title, status, tags FROM evscatala_notes LIMIT 5;
```

## 📈 Métriques de Succès

### KPIs Fonctionnels
- **Temps de création** : < 30 secondes
- **Adoption** : > 80% des membres actifs
- **Utilisation** : > 5 notes/membre/mois
- **Satisfaction** : > 4/5 en feedback

### KPIs Techniques
- **Performance** : Chargement < 2s
- **Disponibilité** : > 99.5%
- **Erreurs** : < 1% des actions
- **Responsive** : Compatible tous devices

---

*Module développé pour EVS-catala - Association de volontaires*
*Documentation mise à jour : Décembre 2024* 