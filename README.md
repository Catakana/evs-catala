# Documentation du Projet EVS-catala

## Vue d'ensemble du projet

L'application EVS-catala est un portail communautaire complet développé pour faciliter la gestion et la communication au sein de l'Espace de Vie Sociale CATALA. Cette plateforme intègre plusieurs modules fonctionnels permettant aux membres, au staff et aux administrateurs de coordonner leurs activités, partager des informations et gérer collectivement l'association.

## Architecture technique

### Stack technologique
- **Frontend**: React avec Vite, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Déploiement**: GitHub (versionning), Vercel (hébergement)

### Structure du projet
```
EVS-catala/
├── public/              # Ressources statiques
├── src/
│   ├── components/      # Composants React organisés par modules
│   │   ├── agenda/      # Gestion du calendrier et des événements
│   │   ├── announcements/ # Système d'annonces et notifications
│   │   ├── home/        # Pages d'accueil et composants généraux
│   │   ├── layout/      # Structure globale de l'application
│   │   ├── modules/     # Cartes de modules pour la page d'accueil
│   │   ├── permanences/ # Gestion des présences et permanences
│   │   ├── trombinoscope/ # Annuaire des membres
│   │   └── ui/          # Composants d'interface utilisateur réutilisables
│   ├── hooks/           # Hooks React personnalisés
│   ├── lib/             # Utilitaires et services
│   ├── pages/           # Pages principales de l'application
│   └── types/           # Définitions de types TypeScript
└── vite.config.ts       # Configuration de Vite
```

## Modules fonctionnels

### 0. Navigation et structure de l'application

**Objectif**: Offrir une navigation intuitive et cohérente dans l'ensemble de l'application.

**Fonctionnalités principales**:
- Barre de navigation inférieure (fixed bottom) présente sur toutes les pages
- Organisation en catégories avec sous-menus intuitifs
  - **Accueil**: Accès direct à la page d'accueil
  - **Organisation**: Agenda, Permanences, Votes, Annonces
  - **Infos**: Messages, Trombinoscope, Infos générales
  - **Profil**: Compte utilisateur, Paramètres, Déconnexion
- Animation fluide des transitions via Framer Motion
- Comportement intelligent: disparition au défilement vers le bas, réapparition au défilement vers le haut
- Design avec effet de flou (backdrop-blur) pour une interface moderne
- Affichage de sous-menus contextuels centrés sur l'écran
- Gestion automatique des routes actives et des indicateurs visuels

**Implémentation technique**:
- Composant AppLayout centralisant la structure globale
- Injection de la barre de navigation dans toutes les routes hors authentification
- Gestion d'état avec React Hooks (useState, useEffect, useLocation)
- Animations avec Framer Motion (AnimatePresence, motion)
- Intégration avec TailwindCSS pour le design responsive
- Structure modulaire permettant l'extension future

**Permissions**:
La barre de navigation est accessible à tous les utilisateurs connectés, avec certaines fonctionnalités conditionnelles selon le rôle (membre, staff, admin).

### 1. Module Agenda
**Objectif**: Permettre la visualisation et la gestion des événements de l'association.

**Fonctionnalités principales**:
- Vue calendrier (jour/semaine/mois)
- Création/édition/suppression d'événements (staff, admin)
- Filtrage par catégorie d'événement
- Notifications automatiques

**Structure de données**:
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date_start: Date;
  date_end: Date;
  location: string;
  type: EventType; // "meeting", "activity", "workshop", etc.
  created_by: string; // User ID
  project_id?: string; // Optional related project
  is_recurring: boolean;
  visibility: "public" | "members" | "staff";
}

interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: "present" | "maybe" | "absent";
}
```

**Permissions**:
| Action | Membre | Staff | Admin |
|--------|--------|-------|-------|
| Voir les événements | ✅ | ✅ | ✅ |
| Créer/Modifier un événement | ❌ | ✅ | ✅ |
| Supprimer un événement | ❌ | ✅* | ✅ |
| Gérer sa participation | ✅ | ✅ | ✅ |

\* selon permissions spéciales (créateur de l'événement)

### 2. Module Permanences
**Objectif**: Organiser et visualiser les périodes d'ouverture du local avec la présence des membres.

**Fonctionnalités principales**:
- Planning hebdomadaire/mensuel des permanences
- Inscription aux créneaux de présence
- Historique des présences
- Rappels automatiques

**Structure de données**:
```typescript
interface Permanence {
  id: string;
  date_start: Date;
  date_end: Date;
  location: string;
  type: "public" | "internal" | "maintenance";
  created_by: string; // User ID
  min_required: number; // Minimum members required
  max_allowed: number; // Maximum members allowed
  notes: string;
  visibility: "public" | "members" | "staff";
}

interface PermanenceParticipant {
  id: string;
  permanence_id: string;
  user_id: string;
  status: "registered" | "present" | "absent";
  checked_by?: string; // User ID who confirmed presence
}
```

**Permissions**:
| Action | Membre | Staff | Admin |
|--------|--------|-------|-------|
| Voir le planning | ✅ | ✅ | ✅ |
| S'inscrire à un créneau | ✅ | ✅ | ✅ |
| Créer/éditer un créneau | ❌ | ✅ | ✅ |
| Marquer les présences | ❌ | ✅ | ✅ |
| Supprimer une permanence | ❌ | ✅ | ✅ |

### 3. Module Trombinoscope
**Objectif**: Afficher la liste des membres avec leurs rôles et informations de contact.

**Fonctionnalités principales**:
- Vue grille/liste des membres
- Filtrage par rôle/groupe/statut
- Fiches détaillées des membres
- Gestion des profils (admin)

**Structure de données**:
```typescript
interface Member {
  id: string; // Linked to auth user ID
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: "member" | "staff" | "admin";
  status: "active" | "inactive" | "pending";
  groups: string[]; // Committees/groups
  projects?: string[]; // IDs of linked projects
}
```

**Permissions**:
| Action | Membre | Staff | Admin |
|--------|--------|-------|-------|
| Voir le trombinoscope | ✅ | ✅ | ✅ |
| Voir coordonnées complètes | 🔒 | ✅ | ✅ |
| Modifier un profil | ❌ | ❌ | ✅ |
| Attribuer rôles/groupes | ❌ | ❌ | ✅ |
| Export CSV | ❌ | ✅ | ✅ |

### 4. Module Annonces
**Objectif**: Diffuser des informations importantes aux membres.

**Fonctionnalités principales**:
- Création d'annonces avec pièces jointes
- Catégorisation (urgent, info, événement, projet)
- Notifications automatiques
- Archivage manuel/automatique

**Structure de données**:
```typescript
interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "urgent" | "info" | "event" | "project";
  target_roles: string[]; // Roles targeted
  target_groups: string[]; // Groups targeted
  publish_date: Date;
  expire_date?: Date;
  author_id: string;
  is_archived: boolean;
  attachments?: string[]; // URLs to attached files
}

interface AnnouncementRead {
  id: string;
  user_id: string;
  announcement_id: string;
  read_at: Date;
}
```

**Permissions**:
| Action | Membre | Staff | Admin |
|--------|--------|-------|-------|
| Lire les annonces | ✅ | ✅ | ✅ |
| Créer une annonce | ❌ | ✅ | ✅ |
| Éditer/supprimer | ❌ | 🔒* | ✅ |
| Voir les archives | ✅ | ✅ | ✅ |

\* selon permissions (créateur de l'annonce)

### 5. Module Votes/Sondages
**Objectif**: Permettre aux membres de voter sur des décisions ou de répondre à des sondages.

**Fonctionnalités principales**:
- Création de votes (oui/non, choix multiple)
- Paramétrage de la durée et visibilité des résultats
- Système de confidentialité (vote anonyme/nominatif)
- Résultats et statistiques

**Structure de données**:
```typescript
interface Vote {
  id: string;
  title: string;
  description: string;
  type: "yes_no" | "radio" | "checkbox";
  is_anonymous: boolean;
  show_results: "immediate" | "after_close" | "admin_only";
  date_start: Date;
  date_end: Date;
  created_by: string;
}

interface VoteOption {
  id: string;
  vote_id: string;
  label: string;
}

interface VoteResponse {
  id: string;
  vote_id: string;
  option_id: string;
  user_id?: string; // Null if anonymous
  timestamp: Date;
}
```

**Permissions**:
| Action | Membre | Staff | Admin |
|--------|--------|-------|-------|
| Voter | ✅ | ✅ | ✅ |
| Créer/modifier un vote | ❌ | ✅ | ✅ |
| Voir résultats | 🔒* | ✅ | ✅ |
| Supprimer/archiver | ❌ | ❌ | ✅ |
| Exporter les résultats | ❌ | ✅ | ✅ |

\* selon la configuration de chaque vote

## Intégrations et connexions entre modules

### Tableau des interactions entre modules

| Module | Interactions principales |
|--------|--------------------------|
| Agenda | - Affichage des permanences<br>- Événements liés aux projets<br>- Publication d'annonces automatiques |
| Permanences | - Référence aux membres du trombinoscope<br>- Intégration avec l'agenda |
| Trombinoscope | - Profils liés aux permanences<br>- Visibilité conditionnelle des coordonnées |
| Annonces | - Publication automatique par événements<br>- Notifications pour votes et sondages |
| Votes | - Archivage des résultats<br>- Publication d'annonces automatiques |

## Modèle de déploiement et infrastructure

### Environnements
- **Développement** : Environnement local des développeurs
- **Staging** : Version de test pour validation des fonctionnalités
- **Production** : Application finale utilisée par les membres

### Base de données
Supabase PostgreSQL avec les tables principales (préfixe "evs_" pour toutes les tables) :
- `evs_profiles` : Informations des utilisateurs
- `evs_users` : Utilisateurs authentifiés
- `evs_groups` : Groupes et commissions
- `evs_member_groups` : Relations entre membres et groupes
- `evs_projects` : Projets de l'association
- `evs_member_projects` : Relations entre membres et projets
- `evs_events` : Événements de l'agenda
- `evs_event_participants` : Participants aux événements
- `evs_permanences` : Créneaux de permanence
- `evs_permanence_participants` : Inscriptions aux permanences
- `evs_announcements` : Annonces publiées
- `evs_announcement_reads` : Suivi des lectures d'annonces
- `evs_votes` : Votes et sondages
- `evs_vote_options` : Options de réponse aux votes
- `evs_vote_responses` : Réponses des utilisateurs

### Authentification
Système basé sur Supabase Auth avec :
- Connexion par email/mot de passe
- Système de rôles (membre, staff, admin)
- Sessions sécurisées avec tokens JWT

### Optimisation des performances

L'application a été optimisée pour offrir des performances optimales sur tous les appareils :

#### Stratégie de bundling
- **Chunking intelligent** : Séparation des dépendances React et des autres bibliothèques
- **Configuration Rollup** : Utilisation de `manualChunks` pour contrôler le découpage des bundles
- **Lazy loading** : Chargement à la demande des composants rarement utilisés

#### Métriques de performance
- **First Contentful Paint (FCP)** : < 1.8s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **First Input Delay (FID)** : < 100ms
- **Cumulative Layout Shift (CLS)** : < 0.1

#### Optimisations supplémentaires
- **Minification** : Réduction de la taille des fichiers CSS et JavaScript
- **Compression** : Utilisation de Gzip/Brotli pour la compression des assets
- **Cache** : Stratégie de mise en cache adaptée par type de ressource
- **Pré-chargement** : Préchargement des ressources critiques
- **Optimisation des médias** : Redimensionnement automatique des images

### Déploiement

L'application est déployée sur Vercel avec les configurations suivantes:

#### Variables d'environnement essentielles
- `VITE_SUPABASE_URL` : URL de l'instance Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `VITE_APP_ENV` : Environnement ('development', 'staging', 'production')

#### Optimisations de build
- Pré-rendering des routes statiques
- Optimisation des assets et minification du code
- Cache optimisé pour les composants réutilisables
- Configuration des redirections pour les routes dynamiques

#### Monitoring et performances
- Analyse des performances d'execution JavaScript
- Métriques Web Vitals (LCP, FID, CLS)
- Gestion des erreurs et notifications
- Logs de déploiement et d'utilisation

## Migration de la base de données Supabase

### Configuration pour la nouvelle base de données

La migration vers la nouvelle base de données Supabase implique plusieurs étapes :

1. **Mise à jour des variables d'environnement**

   Les nouvelles clés Supabase sont :
   ```
   V   ```

   Mettez à jour vos fichiers `.env`, `.env.production` et `.env.example`.

2. **Structure de la base de données**

   La nouvelle convention de nommage utilise `evscatala_` comme préfixe pour toutes les tables.

   Exécutez le script SQL de migration situé dans `scripts/migration.sql` dans l'interface SQL de Supabase.

3. **Migration des données**

   Pour migrer les données de l'ancienne base vers la nouvelle :

   - Exportez les données avec le script `scripts/export_data.js` :
     ```bash
     node scripts/export_data.js
     ```

   - Importez les données avec le script `scripts/import_data.js` :
     ```bash
     node scripts/import_data.js
     ```

4. **Vérification de la migration**

   Après la migration, vérifiez que :
   - Les utilisateurs peuvent se connecter avec leurs identifiants existants
   - Les événements de l'agenda sont correctement affichés
   - Les annonces et autres données sont accessibles
   - Les rôles et permissions fonctionnent comme prévu

### Mise à jour du code

Tous les fichiers qui interagissent avec Supabase ont été mis à jour pour utiliser les nouvelles tables préfixées `evscatala_`.

Si vous créez de nouveaux services ou fonctionnalités, assurez-vous de respecter cette nouvelle convention de nommage.

## Roadmap et priorités de développement

### Phase 1 - MVP
1. Système d'authentification et gestion des profils
2. Module Agenda (événements basiques)
3. Trombinoscope (liste des membres)
4. Annonces simples

### Phase 2 - Fonctionnalités avancées
1. Module Permanences complet
2. Système de notifications
3. Votes et sondages
4. Interactions entre modules

### Phase 3 - Optimisations
1. Exports PDF/CSV
2. Amélioration des performances
3. Optimisation mobile et accessibilité
4. Statistiques et tableaux de bord

## Bonnes pratiques de développement

### Conventions de code
- Composants React fonctionnels avec hooks
- TypeScript pour le typage des données
- Logique métier séparée de l'affichage
- Tests unitaires pour les fonctions critiques

### Gestion des données
- Utilisation du pattern SSOT (Single Source of Truth)
- Validation des données côté client et serveur
- Stockage sécurisé des informations sensibles

### UI/UX
- Interface responsive (mobile-first)
- Composants accessibles (WCAG)
- Thème cohérent avec l'identité visuelle de CATALA
- Feedback utilisateur pour chaque action importante
- Navigation inférieure centralisée avec accès à tous les modules de l'application
- Organisation logique des fonctionnalités en catégories pour simplifier l'accès
- Optimisation des animations (poids vs. impact UX)

#### Composants UI et Design System

L'application utilise un système de composants basé sur Shadcn/UI avec une personnalisation pour correspondre à l'identité visuelle de l'association :

- **Hiérarchie de composants** : Utilisation du pattern Atomic Design (atomes, molécules, organismes)
- **Système de thèmes** : Support des modes clair/sombre avec transitions fluides
- **Personnalisation** : Extension des composants Shadcn avec des variantes personnalisées
- **Accessibilité** : Contraste optimisé, support des lecteurs d'écran, navigation au clavier
- **États interactifs** : Tous les éléments interactifs ont des états visibles (hover, focus, active, disabled)
- **Iconographie** : Utilisation cohérente des icônes Lucide avec tailles et styles standardisés
- **Typographie** : Échelle typographique harmonieuse et adaptée à toutes les tailles d'écran
- **Animations** : Transitions subtiles pour améliorer l'expérience sans surcharger l'interface

#### Système TextBank

Le système TextBank permet une gestion centralisée de tous les textes de l'application, facilitant la maintenance et les futures traductions :

```typescript
// Exemple d'utilisation du TextBank
import { getText } from '@/lib/textBank';

function WelcomeMessage({ userName }) {
  // Utilisation avec variable
  return <h1>{getText('welcome.user', { userName })}</h1>;
}

// Dans texts.fr.csv
// id,text,description
// welcome.user,"Bienvenue {{userName}} !","Message d'accueil avec nom d'utilisateur"
```

**Avantages du système** :
- Source unique de vérité pour tous les textes
- Support des variables pour les textes dynamiques
- Facilité de maintenance et de mise à jour
- Structure permettant l'internationalisation future
- Documentation contextuelle via le champ description

#### Accessibilité et inclusion

L'application EVS-catala est conçue pour être accessible à tous les utilisateurs, incluant ceux ayant des besoins spécifiques :

**Conformité WCAG** :
- Objectif de conformité WCAG 2.1 niveau AA
- Contraste des couleurs optimisé (ratio minimum 4.5:1 pour le texte)
- Structure sémantique du HTML pour les lecteurs d'écran
- Navigation au clavier complète avec indicateurs de focus visibles

**Fonctionnalités d'accessibilité** :
- Support des attributs ARIA pour les composants interactifs
- Alternatives textuelles pour tous les éléments non-textuels
- Messages d'erreur clairs et instructions pour les formulaires
- Skip links pour accéder rapidement au contenu principal

**Préférences utilisateur** :
- Mode sombre/clair pour s'adapter aux préférences visuelles
- Support de la préférence de réduction de mouvement
- Possibilité d'augmenter la taille du texte sans perte de fonctionnalité
- Options d'accessibilité configurables dans le profil utilisateur

**Tests d'accessibilité** :
- Audit régulier avec des outils automatisés (Lighthouse, axe)
- Tests manuels avec technologies d'assistance (lecteurs d'écran)
- Revue périodique des composants pour maintenir l'accessibilité
- Processus d'amélioration continue basé sur les retours utilisateurs

### Bonnes pratiques pour la navigation
- Tous les liens vers des modules doivent être accessibles depuis la barre de navigation
- Catégorisation logique des fonctionnalités (Organisation, Infos)
- Utilisation du TextBank pour tous les textes d'interface
- Maintenir la cohérence des animations et transitions
- Les éléments actifs doivent être visuellement identifiables
- Adapter la navigation au contexte de l'utilisateur (rôle, page actuelle)
- Assurer que tous les éléments sont correctement espacés pour faciliter le toucher sur mobile

### Guide de maintenance et d'extension de la navigation

#### Structure de la navigation
La barre de navigation est construite autour du concept de catégories et sous-menus :

```typescript
interface NavCategory {
  id: string;         // Identifiant unique de la catégorie
  label: string;      // Libellé affiché (via TextBank)
  icon: React.ReactNode; // Icône Lucide
  items: NavItem[];   // Sous-menus
}

interface NavItem {
  path: string;       // Route de destination
  label: string;      // Libellé du sous-menu
  icon: React.ReactNode; // Icône du sous-menu
}
```

#### Ajouter une nouvelle fonction à la navigation

1. **Identifier la catégorie appropriée** :
   - Accueil : Page principale
   - Organisation : Fonctionnalités administratives et de coordination
   - Infos : Communication et affichage d'informations
   - Profil : Fonctionnalités liées à l'utilisateur

2. **Ajouter le NavItem** dans la catégorie appropriée :
   ```typescript
   const navCategories: NavCategory[] = [
     // ...
     {
       id: 'organisation',
       label: 'Organisation',
       icon: <Grid size={24} />,
       items: [
         // Ajouter votre nouvel item ici :
         { 
           path: '/nouvelle-route', 
           label: t('nav.nouvelle_route'), 
           icon: <IconeAdaptee size={20} /> 
         },
         // ... autres items existants
       ]
     },
     // ...
   ];
   ```

3. **Ajouter la clé de traduction** dans le système TextBank :
   ```typescript
   // Dans textBank.ts
   const navTexts: TextEntry[] = [
     // ... textes existants
     { id: 'nav.nouvelle_route', text: 'Libellé de la nouvelle route' },
   ];
   ```

4. **Créer la route correspondante** dans App.tsx :
   ```tsx
   <Route
     path="/nouvelle-route"
     element={
       <AppLayout>
         <NouvelleRoutePage />
       </AppLayout>
     }
   />
   ```

#### Tests de la navigation
Après toute modification, vérifiez :
1. L'affichage correct sur mobile et desktop
2. L'indicateur actif sur la route correspondante
3. L'ouverture/fermeture correcte des sous-menus
4. Le comportement au défilement
5. Les animations fluides

## Annexes

### Guide d'installation pour les développeurs
```bash
# Cloner le dépôt
git clone https://github.com/Catakana/evs-catala.git
cd evs-catala

# Installer les dépendances
npm install --legacy-peer-deps

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec les identifiants Supabase

# Lancer le serveur de développement
npm run dev
```

### Guide des commandes de build et déploiement

```bash
# Construction optimisée pour la production
npm run build

# Prévisualisation locale du build de production
npm run preview

# Construction et déploiement sur Vercel
npm run deploy

# Analyse de la taille des bundles
npm run analyze
```

#### Configuration du build (vite.config.ts)

La configuration de build a été optimisée pour améliorer les performances :

```typescript
// Configuration des chunks pour optimiser le chargement
build: {
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // Regrouper les dépendances React
        if (id.includes('node_modules/react') || 
            id.includes('node_modules/react-dom') || 
            id.includes('node_modules/scheduler')) {
          return 'vendor-react';
        }
        
        // Regrouper les autres dépendances importantes
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      }
    }
  }
}
```

Cette configuration permet de :
- Séparer le code applicatif des bibliothèques externes
- Isoler React et React DOM dans un chunk séparé pour un meilleur cache
- Regrouper les autres dépendances dans un chunk vendor commun
- Éviter les warnings pour les chunks de grande taille

### Glossaire
- **EVS** : Espace de Vie Sociale
- **CATALA** : Nom du lieu. Terme temporaire pour désigner l'association.
- **Staff** : Membres avec des responsabilités spécifiques
- **Permanence** : Période d'ouverture du local associatif
- **Module** : Composant fonctionnel de l'application

Les Tables qui ne comportent pas le préfixe "evs_" sont des tables appartenant à d'autres applications. Elles doivent être ignorées.