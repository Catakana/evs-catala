# Module Agenda - Fonctionnalités Implémentées

## Vue d'ensemble

Le module Agenda d'EVS-catala permet la gestion complète des événements de l'association avec des fonctionnalités avancées de filtrage, d'inscription et de visualisation.

## Fonctionnalités Principales

### 1. Gestion des Événements

#### Création et Modification
- **Qui peut créer** : Staff et Admin uniquement
- **Formulaire complet** avec validation :
  - Titre (obligatoire, min 3 caractères)
  - Description (optionnelle)
  - Date et heure de début/fin
  - Catégorie (réunion, animation, atelier, permanence, autre)
  - Lieu (optionnel)
- **Validation automatique** : la date de fin doit être postérieure à la date de début

#### Affichage Multi-Vues
- **Vue Mois** : Calendrier mensuel avec événements colorés par catégorie
- **Vue Semaine** : Planning hebdomadaire avec créneaux horaires
- **Vue Jour** : Timeline détaillée d'une journée
- **Vue Liste** : Liste chronologique avec groupement par mois

### 2. Système de Filtrage Avancé

#### Filtres Disponibles
- **Par catégorie** : Sélection multiple des types d'événements
- **Par période** : Date de début et date de fin
- **Par lieu** : Recherche textuelle dans les lieux
- **Indicateur visuel** : Badge avec nombre de filtres actifs

#### Interface Utilisateur
- **Popover dédié** avec formulaire de filtres
- **Application en temps réel** des filtres
- **Réinitialisation rapide** de tous les filtres
- **Persistance** des filtres pendant la session

### 3. Inscription aux Événements

#### Fonctionnalités d'Inscription
- **Inscription/Désinscription** en un clic
- **Statuts de participation** :
  - `registered` : Inscrit
  - `present` : Présent (marqué par staff/admin)
  - `absent` : Absent
  - `maybe` : Peut-être
- **Contrainte d'unicité** : Un utilisateur ne peut s'inscrire qu'une fois par événement

#### Interface Utilisateur
- **Modal de détail** avec informations complètes de l'événement
- **Liste des participants** avec avatars et statuts
- **Boutons d'action** contextuels selon le statut d'inscription
- **Notifications** de confirmation des actions

### 4. Permissions et Sécurité

#### Niveaux d'Accès
- **Membres** : Consultation et inscription aux événements
- **Staff** : Création, modification, gestion des présences
- **Admin** : Toutes les permissions + suppression

#### Sécurité Base de Données
- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques spécifiques** par type d'action
- **Validation côté serveur** des permissions

## Structure Technique

### Tables de Base de Données

#### `evscatala_events`
```sql
- id (UUID, PK)
- title (VARCHAR, NOT NULL)
- description (TEXT)
- start_datetime (TIMESTAMP WITH TIME ZONE)
- end_datetime (TIMESTAMP WITH TIME ZONE)
- category (VARCHAR, CHECK constraint)
- location (VARCHAR)
- created_by (UUID, FK vers auth.users)
- created_at, updated_at (TIMESTAMP)
```

#### `evscatala_event_participants`
```sql
- id (UUID, PK)
- event_id (UUID, FK vers evscatala_events)
- user_id (UUID, FK vers auth.users)
- status (VARCHAR, CHECK constraint)
- registered_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(event_id, user_id)
```

### Services et API

#### `eventService.ts`
- **CRUD complet** pour les événements
- **Gestion des participants** (inscription, désinscription, statuts)
- **Filtrage avancé** avec requêtes optimisées
- **Fonctions utilitaires** (conversion de formats, catégories)

#### Fonctions Principales
```typescript
// Gestion des événements
getEvents()
getEventsWithFilters(filters: EventFilters)
createEvent(eventData: EventData, userId: string)
updateEvent(id: string, eventData: EventData)
deleteEvent(id: string)

// Gestion des participants
registerToEvent(eventId: string, userId: string)
unregisterFromEvent(eventId: string, userId: string)
getEventParticipants(eventId: string)
isUserRegistered(eventId: string, userId: string)
```

### Composants React

#### Composants Principaux
- **`AgendaPage`** : Page principale avec navigation et filtres
- **`AgendaCalendar`** : Calendrier multi-vues
- **`AgendaFilters`** : Interface de filtrage
- **`EventDetailModal`** : Modal de détail avec inscription
- **`EventForm`** : Formulaire de création/modification
- **`UpcomingEvents`** : Widget pour page d'accueil

#### Architecture
- **Hooks personnalisés** pour la gestion d'état
- **Composants réutilisables** avec props typées
- **Gestion d'erreurs** centralisée avec toasts
- **Optimisation des performances** avec lazy loading

## Installation et Configuration

### 1. Base de Données
```bash
# Exécuter le script de création de la table des participants
psql -f scripts/create_event_participants_table.sql
```

### 2. Variables d'Environnement
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Dépendances
```bash
npm install date-fns react-hook-form @hookform/resolvers zod
```

## Utilisation

### Pour les Utilisateurs

#### Consulter l'Agenda
1. Accéder à `/agenda`
2. Choisir la vue (mois, semaine, jour, liste)
3. Naviguer avec les boutons précédent/suivant
4. Cliquer sur un événement pour voir les détails

#### Filtrer les Événements
1. Cliquer sur "Filtrer"
2. Sélectionner les catégories souhaitées
3. Définir une plage de dates (optionnel)
4. Rechercher par lieu (optionnel)
5. Appliquer les filtres

#### S'Inscrire à un Événement
1. Cliquer sur un événement
2. Dans la modal de détail, cliquer "S'inscrire"
3. Confirmation par notification
4. Possibilité de se désinscrire de la même manière

### Pour les Staff/Admin

#### Créer un Événement
1. Cliquer "Nouvel événement"
2. Remplir le formulaire
3. Sauvegarder
4. L'événement apparaît immédiatement dans l'agenda

#### Gérer les Participants
1. Ouvrir un événement
2. Voir la liste des participants
3. Modifier les statuts de présence (staff/admin)
4. Exporter la liste (fonctionnalité future)

## Roadmap et Améliorations Futures

### Phase 2 - Fonctionnalités Avancées
- [ ] **Événements récurrents** (quotidien, hebdomadaire, mensuel)
- [ ] **Notifications automatiques** (email, push)
- [ ] **Export calendrier** (iCal, PDF)
- [ ] **Intégration Google Calendar**
- [ ] **Rappels personnalisés**

### Phase 3 - Optimisations
- [ ] **Cache intelligent** des événements
- [ ] **Synchronisation temps réel** des inscriptions
- [ ] **Mode hors ligne** avec synchronisation
- [ ] **Analytics** d'utilisation des événements

### Améliorations UX
- [ ] **Drag & drop** pour déplacer les événements
- [ ] **Vue agenda personnel** avec événements inscrits
- [ ] **Suggestions d'événements** basées sur l'historique
- [ ] **Partage d'événements** sur réseaux sociaux

## Tests et Validation

### Tests Fonctionnels
- [x] Création/modification/suppression d'événements
- [x] Inscription/désinscription aux événements
- [x] Filtrage par catégorie, date, lieu
- [x] Permissions selon les rôles utilisateur
- [x] Affichage multi-vues du calendrier

### Tests de Performance
- [x] Chargement rapide des événements (< 2s)
- [x] Filtrage en temps réel (< 500ms)
- [x] Responsive design (mobile/desktop)

### Tests de Sécurité
- [x] Validation des permissions RLS
- [x] Protection contre les injections SQL
- [x] Validation des données côté client et serveur

## Support et Maintenance

### Logs et Monitoring
- Erreurs de chargement des événements
- Échecs d'inscription/désinscription
- Performances des requêtes de filtrage

### Maintenance Régulière
- Nettoyage des événements anciens (> 1 an)
- Optimisation des index de base de données
- Mise à jour des dépendances

### Contact
Pour toute question ou problème technique, contacter l'équipe de développement via les issues GitHub du projet. 