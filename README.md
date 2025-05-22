# Documentation du Projet EVS-catala

## Vue d'ensemble du projet

L'application EVS-catala est un portail communautaire complet développé pour faciliter la gestion et la communication au sein de l'Espace de Vie Sociale CATALA. Cette plateforme intègre plusieurs modules fonctionnels permettant aux membres, au staff et aux administrateurs de coordonner leurs activités, partager des informations et gérer collectivement l'association.

## Architecture technique

### Stack technologique
- **Frontend**: React avec Vite, TypeScript, TailwindCSS, Shadcn/UI
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

### Glossaire
- **EVS** : Espace de Vie Sociale
- **CATALA** : Nom de l'association communautaire
- **Staff** : Membres avec des responsabilités spécifiques
- **Permanence** : Période d'ouverture du local associatif
- **Module** : Composant fonctionnel de l'application
