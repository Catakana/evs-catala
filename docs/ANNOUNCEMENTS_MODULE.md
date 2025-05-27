# Module Annonces - Documentation

## Vue d'ensemble

Le module Annonces permet aux membres de l'association de créer, consulter et gérer des annonces internes. Il offre un système complet de communication avec catégorisation, ciblage par rôles, et gestion des pièces jointes.

## Fonctionnalités

### 🎯 Fonctionnalités principales

- **Création d'annonces** : Interface intuitive pour créer des annonces
- **Catégorisation** : 4 catégories (Information, Urgent, Événement, Projet)
- **Ciblage** : Par rôles utilisateur (membre, staff, admin)
- **Planification** : Publication immédiate ou programmée
- **Pièces jointes** : Upload et gestion de fichiers
- **Recherche et filtres** : Recherche textuelle et filtres par catégorie
- **Vues multiples** : Mode grille et liste
- **Suivi de lecture** : Marquage lu/non-lu par utilisateur

### 🔒 Système de permissions

- **Membres** : Consultation des annonces
- **Staff** : Création et modification de leurs annonces
- **Admin** : Gestion complète (création, modification, suppression, épinglage)

### 📊 Fonctionnalités avancées

- **Épinglage** : Annonces importantes en haut de liste
- **Priorité** : Système de priorité numérique (0-100)
- **Archivage** : Archivage sans suppression définitive
- **Expiration** : Date d'expiration automatique
- **Statistiques** : Suivi des lectures par utilisateur

## Architecture technique

### 🗄️ Base de données

#### Tables principales

```sql
-- Table des annonces
evscatala_announcements (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'info',
  author_id UUID REFERENCES auth.users(id),
  target_roles TEXT[] DEFAULT ARRAY['member'],
  target_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  expire_date TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de suivi des lectures
evscatala_announcement_reads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  announcement_id UUID REFERENCES evscatala_announcements(id),
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);

-- Table des pièces jointes
evscatala_announcement_attachments (
  id UUID PRIMARY KEY,
  announcement_id UUID REFERENCES evscatala_announcements(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fonctions RPC

- `get_announcements_with_author()` : Récupère les annonces avec informations auteur
- `mark_announcement_as_read(announcement_uuid)` : Marque une annonce comme lue
- `get_user_announcement_reads(user_uuid)` : Récupère les statuts de lecture

### 🔧 Services et hooks

#### Service principal
```typescript
// src/lib/announcementService.ts
class AnnouncementService {
  async getAnnouncements(filters?: AnnouncementFilters): Promise<Announcement[]>
  async getAnnouncementById(id: string): Promise<Announcement | null>
  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement>
  async updateAnnouncement(id: string, updates: UpdateAnnouncementData): Promise<Announcement>
  async deleteAnnouncement(id: string): Promise<void>
  async archiveAnnouncement(id: string): Promise<void>
  async markAsRead(announcementId: string): Promise<void>
  async getUserReadStatus(): Promise<Record<string, Date>>
  async addAttachment(announcementId: string, file: File): Promise<AnnouncementAttachment>
  async removeAttachment(attachmentId: string): Promise<void>
}
```

#### Hooks personnalisés
```typescript
// src/hooks/useAnnouncements.ts
export function useAnnouncements(filters?: AnnouncementFilters)
export function useAnnouncement(id: string | null)
export function useAnnouncementActions()
export function useAnnouncementReadStatus()
export function useAnnouncementFilters()
export function useAnnouncementPermissions()
```

### 🎨 Composants React

#### Structure des composants
```
src/components/announcements/
├── AnnouncementForm.tsx          // Formulaire création/édition
├── AnnouncementCard.tsx          // Carte d'affichage (existant)
├── AnnouncementListItem.tsx      // Item de liste (existant)
├── AnnouncementDetailModal.tsx   // Modal de détail (existant)
└── AnnouncementsHeader.tsx       // Header avec filtres (existant)
```

#### Page principale
```typescript
// src/pages/AnnouncementsPage.tsx
- Interface complète avec recherche, filtres, vues multiples
- Gestion des actions (création, édition, suppression, archivage)
- Intégration avec les hooks et services
```

## Installation et configuration

### 1. Base de données

Exécuter le script de création des tables :
```sql
-- Dans l'éditeur SQL de Supabase
\i scripts/create_announcements_tables.sql
```

### 2. Storage (pour les pièces jointes)

Créer un bucket `attachments` dans Supabase Storage avec les politiques appropriées.

### 3. Vérification

Exécuter le script de test :
```sql
-- Vérifier que tout fonctionne
\i scripts/test_announcements.sql
```

## Utilisation

### 🚀 Pour les utilisateurs

#### Consulter les annonces
1. Aller sur `/announcements`
2. Utiliser les filtres par catégorie
3. Rechercher dans le contenu
4. Changer de vue (grille/liste)

#### Créer une annonce (staff/admin)
1. Cliquer sur "Créer une annonce"
2. Remplir le formulaire :
   - Titre et contenu (obligatoires)
   - Catégorie
   - Destinataires (rôles)
   - Dates de publication/expiration
   - Options avancées (épinglage, priorité)
   - Pièces jointes
3. Enregistrer

#### Gérer ses annonces
- **Modifier** : Cliquer sur l'icône d'édition
- **Archiver** : Cliquer sur l'icône d'archivage
- **Supprimer** : Cliquer sur l'icône de suppression (admin uniquement)

### 🔧 Pour les développeurs

#### Ajouter une nouvelle catégorie
```typescript
// Dans src/types/announcement.ts
export type AnnouncementCategory = 'info' | 'urgent' | 'event' | 'project' | 'nouvelle_categorie';

// Dans src/components/announcements/AnnouncementForm.tsx
const CATEGORIES = [
  // ... catégories existantes
  { value: 'nouvelle_categorie', label: 'Nouvelle Catégorie', description: 'Description' }
];
```

#### Personnaliser les permissions
```typescript
// Dans src/hooks/useAnnouncements.ts
export function useAnnouncementPermissions() {
  // Modifier la logique de permissions selon les besoins
}
```

#### Ajouter des filtres
```typescript
// Dans src/hooks/useAnnouncements.ts
export function useAnnouncementFilters() {
  // Ajouter de nouveaux filtres
}
```

## Sécurité

### 🔒 Politiques RLS

- **Lecture** : Annonces non archivées et non expirées
- **Création** : Utilisateurs authentifiés (author_id = auth.uid())
- **Modification** : Auteur de l'annonce uniquement
- **Suppression** : Auteur de l'annonce uniquement

### 🛡️ Validation

- **Côté client** : Validation des formulaires avec messages d'erreur
- **Côté serveur** : Contraintes de base de données et politiques RLS
- **Upload** : Validation des types et tailles de fichiers

## Performance

### 📈 Optimisations

- **Index** : Sur publish_date, category, author_id, is_archived
- **RPC** : Fonctions optimisées pour éviter les N+1 queries
- **Cache** : Gestion d'état locale avec hooks personnalisés
- **Pagination** : Prête pour l'ajout de pagination si nécessaire

### 🚀 Bonnes pratiques

- Requêtes SQL simples sans jointures complexes
- Récupération séparée des données et assemblage côté client
- Gestion d'erreur robuste avec try/catch
- États de chargement clairs pour l'utilisateur

## Maintenance

### 🔧 Scripts utiles

- `scripts/create_announcements_tables.sql` : Création des tables
- `scripts/test_announcements.sql` : Tests de vérification
- Logs détaillés dans la console pour le débogage

### 📊 Monitoring

- Suivi des erreurs dans les services
- Métriques de performance des requêtes
- Logs d'actions utilisateur importantes

## Évolutions futures

### 🚀 Améliorations prévues

- **Notifications** : Email et push pour les nouvelles annonces
- **Modération** : Workflow de validation pour les annonces
- **Templates** : Modèles d'annonces prédéfinis
- **Statistiques** : Dashboard de statistiques détaillées
- **API** : Endpoints REST pour intégrations externes
- **Mobile** : Application mobile dédiée

### 🔄 Intégrations

- **Agenda** : Lien avec les événements
- **Projets** : Annonces liées aux projets
- **Messagerie** : Conversion d'annonces en discussions
- **Notifications** : Système de notifications centralisé

## Support

Pour toute question ou problème :
1. Consulter les logs de la console
2. Vérifier les politiques RLS dans Supabase
3. Exécuter le script de test pour diagnostiquer
4. Consulter la documentation des hooks et services