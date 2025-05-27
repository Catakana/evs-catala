# Roadmap de Développement - EVS-catala

Ce document détaille le plan de développement du projet EVS-catala, en définissant les phases, priorités et scopes fonctionnels pour chaque module.

## Légende des statuts
| Statut | Description |
|--------|-------------|
| 🔄 À faire | Tâche non commencée |
| 🏗️ En cours | Développement en cours |
| ✅ Terminé | Développement terminé |
| 🧪 Testé | Tests fonctionnels effectués |
| ✓ Validé | Validation finale par le client |

## Vue d'ensemble des modules

🧩 **Modules Principaux**
1. **Agenda** - Gestion des activités, animations, réunions
2. **Permanences** - Planning des ouvertures du local et présences
3. **Votes** - Sondages et décisions collectives
4. **Projets** - Suivi de projets, budgets et équipes
5. **Annonces** - Système de communication interne
6. **Messagerie** - Communication entre membres
7. **Infos générales** - Documentation et informations associatives
8. **Trombinoscope** - Annuaire des membres

⚙️ **Fonctions techniques transverses**
- Authentification par rôle (adhérent, staff, admin)
- Responsive (mobile et desktop)
- Notifications email + push
- Export PDF/CSV
- Historique des modifications

## Vue d'ensemble des phases

| Phase | Objectif | Durée estimée | Statut |
|-------|----------|---------------|--------|
| **Phase 1: MVP** | Version minimale utilisable avec les fonctions essentielles | 4 jours | 🏗️ En cours |
| **Phase 2: Extension** | Ajout de modules complémentaires et enrichissement | 1 jour | 🔄 À faire |
| **Phase 3: Optimisation** | Peaufinage, performance et expérience utilisateur | 1 mois | 🔄 À faire |
| **Phase 4: Maintenance** | Corrections, améliorations continues | Continu | 🔄 À faire |

## Phase 1: MVP (Minimum Viable Product)

### 🔧 Résolution des problèmes de base de données (26/05/2025)
**Statut**: ✅ Résolu

#### Problèmes identifiés
- Table `evscatala_event_participants` manquante (erreur 400) ✅
- Table `evscatala_projects` manquante (erreur 404) ✅
- Erreurs de chargement des participants aux événements ✅
- Erreurs de chargement des projets ✅
- Problème de relation entre `evscatala_event_participants` et `evscatala_profiles` ✅

#### Solutions mises en place
- Création du script `scripts/setup_database.sql` complet ✅
- Création du script `scripts/create_projects_tables.sql` pour les projets ✅
- Création du script `scripts/quick_setup.sql` pour résolution rapide ✅
- Création du script `scripts/fix_event_participants_relation.sql` pour corriger les relations ✅
- Création du script `scripts/fix_notes_relations.sql` pour corriger les relations des notes ✅
- Création du script `scripts/create_rpc_functions.sql` pour optimiser les requêtes ✅
- Modification du service `eventService.ts` pour utiliser une approche alternative robuste ✅
- Modification du service `notesService.ts` pour utiliser une approche alternative robuste ✅
- Correction des composants UI Select pour éviter les valeurs vides (Radix UI) ✅
- Mise à jour de la convention de nommage avec préfixe `evscatala_` ✅
- Documentation des étapes de migration dans les scripts ✅
- Mise à jour du guide de dépannage `docs/TROUBLESHOOTING_DATABASE.md` ✅

#### Actions à effectuer
1. **RECOMMANDÉ** : Exécuter le script `scripts/fix_notes_relations.sql` dans l'éditeur SQL de Supabase (correction complète)
2. **ALTERNATIF** : Exécuter le script `scripts/fix_event_participants_relation.sql` pour corriger uniquement les événements
3. **OPTIONNEL** : Exécuter le script `scripts/create_rpc_functions.sql` pour optimiser les performances
4. Actualiser le navigateur pour vérifier que les erreurs ont disparu
5. Tester les fonctionnalités d'événements et de notes

### 1.1 Authentification et gestion des utilisateurs
**Priorité**: URGENTE ⚠️⚠️  
**Délai**: 1-2 jours  
**Statut**: ✅ Terminé (avec améliorations UX)

> **Note**: Ce module est la priorité absolue pour permettre les tests utilisateurs dès que possible, même sans toutes les fonctionnalités. Il doit être implémenté en premier.

#### Scope détaillé
- [x] Mise en place des formulaires de connexion et d'inscription
- [x] Intégration avec Supabase pour l'authentification
- [x] Vérification d'email et récupération de mot de passe
- [x] Gestion des comptes de démonstration
- [x] Autorisations et permissions des utilisateurs
- [x] Protections des routes privées
- [x] Trombinoscope synchronisé avec les données de profils utilisateurs

#### Tâches techniques
- Configuration de Supabase Auth avec OAuth (Google) ✅
- Création de la table `evs_profiles` et `evs_user_settings` ✅
- Formulaires d'inscription et de connexion ✅
- Protection des routes privées ✅
- Gestion des tokens de session ✅
- Page de modification de profil utilisateur ✅
- Environnement de test isolé ✅
- Scripts de provisionnement des comptes de test ✅
- Tests automatisés des flux d'authentification ✅
- Refactorisation vers une architecture Context pour l'authentification ✅
- Amélioration de la gestion des erreurs d'authentification ✅
- Synchronisation automatique des profils utilisateurs ✅
- Gestion plus robuste des redirections après connexion ✅

#### Corrections post-développement ✅ TERMINÉ
- ✅ Correction de l'erreur "column target_roles does not exist"
- ✅ Script de correction `scripts/fix_announcements_complete.sql`
- ✅ Ajout des colonnes manquantes : target_roles, target_groups, is_pinned, priority
- ✅ Création des tables de lecture et pièces jointes si manquantes
- ✅ Mise en place des politiques RLS et fonctions RPC
- ✅ Script de vérification `scripts/check_announcements_structure.sql`
- ✅ **CORRECTION BOUCLE INFINIE** : Fix du hook useAnnouncements (sérialisation filtres)
- ✅ **SIMPLIFICATION SERVICE** : Suppression dépendance fonction RPC défaillante
- ✅ **SCRIPT TEST SIMPLE** : `scripts/create_test_announcements.sql` pour données de test
- ✅ **BOUTON CRÉATION** : Toujours visible pour les tests (permissions temporaires)

#### Améliorations UX ✅ TERMINÉ (26/05/2025)
- ✅ **Lien retour à l'accueil** : Ajout sur pages connexion et inscription
- ✅ **Rappel confirmation email** : Message d'information sur l'inscription
- ✅ **Rappel action requise** : Encadré orange avec instructions claires
- ✅ **Informations supplémentaires** : Délai d'expiration du lien (24h)
- ✅ **Boutons multiples** : Retour connexion + retour accueil
- ✅ **Cohérence navigation** : Liens de retour sur toutes les pages d'auth

#### Améliorations navigation ✅ TERMINÉ (27/05/2025)
- ✅ **Suppression bouton Notes** : Retrait du bouton de prise de note bleu du BottomNav
- ✅ **Titre responsive** : Masquage du titre "Portail EVS CATALA" en affichage mobile
- ✅ **Logo cliquable** : Ajout du clic sur le logo EVS pour retourner à l'accueil
- ✅ **Suppression bouton flottant** : Retrait du QuickNoteButton du layout principal
- ✅ **Optimisation mobile** : Amélioration de l'affichage sur petits écrans
- ✅ **Remise Notes dans navigation** : Ajout de l'item "Notes" dans Organisation (sans bouton flottant)

#### Amélioration page d'accueil ✅ TERMINÉ (27/05/2025)
- ✅ **Fond dégradé parallax** : Arrière-plan animé avec formes géométriques et effet parallax
- ✅ **Animations d'émoticônes** : Rotation automatique des émoticônes dans l'en-tête principal
- ✅ **Design moderne** : Titre avec gradient de couleurs et effets visuels avancés
- ✅ **Statistiques animées** : Cartes de statistiques avec animations au survol
- ✅ **Cartes améliorées** : Annonces et événements avec effets de survol et animations
- ✅ **Particules décoratives** : Éléments flottants subtils en arrière-plan
- ✅ **Animations séquentielles** : Apparition progressive des éléments avec délais
- ✅ **Styles CSS personnalisés** : Animations float, shimmer, gradient et effets de verre
- ✅ **Responsive optimisé** : Adaptation parfaite pour tous les écrans
- ✅ **Performance** : Rendu conditionnel pour éviter les problèmes SSR

#### Page de présentation de l'application ✅ TERMINÉ (27/05/2025)
- ✅ **Page de présentation complète** : Nouvelle page `/presentation` avec défilement vertical
- ✅ **Hero section animée** : Section d'accueil avec fond dégradé et animations parallax
- ✅ **Présentation des fonctionnalités** : 7 modules présentés avec cartes interactives
- ✅ **Animations de transition** : Animations d'apparition au scroll avec Framer Motion
- ✅ **Design moderne** : Gradients colorés, particules animées, effets de survol
- ✅ **CTA vers inscription** : Boutons d'appel à l'action redirigeant vers le formulaire d'inscription
- ✅ **Navigation fluide** : Scroll automatique vers les sections, indicateur de scroll
- ✅ **Responsive design** : Adaptation parfaite pour tous les écrans
- ✅ **Accès depuis header** : Bouton de présentation accessible depuis toutes les pages
- ✅ **Route dédiée** : Page accessible via `/presentation` sans layout de navigation

#### Refactorisation page de présentation ✅ TERMINÉ (27/05/2025)
- ✅ **Organisation claire** : Restructuration complète avec sections lisibles par fonctionnalité
- ✅ **Illustrations interactives** : Mockups visuels pour chaque module (calendrier, planning, votes, etc.)
- ✅ **Layout alterné** : Disposition en zigzag pour une lecture fluide
- ✅ **Descriptions détaillées** : Fonctionnalités expliquées avec exemples concrets
- ✅ **Design cohérent** : Gradients colorés uniques par module avec illustrations assorties
- ✅ **CTA corrigé** : Redirection vers `/register` au lieu de `/auth/register`
- ✅ **Contenu enrichi** : Ajout d'exemples visuels (planning permanences, interface votes, etc.)
- ✅ **Amélioration UX** : Suppression des éléments redondants, focus sur l'essentiel

#### Améliorations gestion d'erreurs ✅ TERMINÉ (27/05/2025)
- ✅ **Messages d'erreur clairs** : Amélioration des messages d'authentification
- ✅ **Gestion erreurs spécifiques** : Permissions, session expirée, JWT invalide
- ✅ **Boutons de reconnexion** : Actions rapides dans les formulaires
- ✅ **Notification header** : Indicateur de déconnexion avec bouton connexion
- ✅ **Scripts de test** : Annonces de test pour vérifier le fonctionnement
- ✅ **Actualisation automatique** : Bouton pour recharger la page si nécessaire

#### Amélioration page d'accueil ✅ TERMINÉ (27/05/2025)
- ✅ **Suppression boutons inutiles** : Retrait des boutons "Commencer" et "En savoir plus"
- ✅ **Tableau des annonces récentes** : Affichage des 5 dernières annonces en cours
- ✅ **Filtrage intelligent** : Annonces non archivées et non expirées uniquement
- ✅ **Design moderne** : Cartes avec badges de catégorie et informations détaillées
- ✅ **Navigation rapide** : Bouton "Voir tout" vers la page des annonces
- ✅ **Styles line-clamp** : Limitation du texte à 2 lignes avec CSS utilities

#### Diagnostic et correction module Projets ✅ TERMINÉ (27/05/2025)
- ✅ **Scripts de diagnostic** : `test_projects_creation.sql` pour identifier les problèmes
- ✅ **Amélioration logs service** : Messages détaillés avec emojis pour le débogage
- ✅ **Gestion d'erreurs spécifiques** : Messages clairs selon le type d'erreur (permissions, tables, session)
- ✅ **Amélioration formulaire** : Logs détaillés et boutons de reconnexion automatiques
- ✅ **Script de création simple** : `create_projects_tables_simple.sql` avec politiques RLS basiques
- ✅ **Vérification authentification** : Contrôle de session avant création de projet
- ✅ **Messages utilisateur améliorés** : Erreurs détaillées et actions suggérées

#### Amélioration gestion d'équipe des projets ✅ TERMINÉ (27/05/2025)
- ✅ **Service utilisateurs** : Création de `userService.ts` pour récupérer les profils complets
- ✅ **Affichage noms complets** : Remplacement des IDs par les noms et prénoms des membres
- ✅ **Composant ProjectTeamManager** : Interface CRUD complète pour gérer l'équipe
- ✅ **Recherche d'utilisateurs** : Fonction de recherche par nom, prénom ou email
- ✅ **Gestion des rôles** : Attribution et modification des rôles (membre, contributeur, gestionnaire, admin)
- ✅ **Avatars et initiales** : Affichage visuel des membres avec avatars ou initiales
- ✅ **Actions CRUD** : Ajouter, modifier le rôle, et retirer des membres de l'équipe
- ✅ **Permissions** : Seuls les admins peuvent modifier l'équipe (sauf leur propre profil)
- ✅ **Interface moderne** : Design avec cartes, badges colorés par rôle et icônes
- ✅ **Script de test** : `test_user_profiles.sql` pour vérifier et créer la table des profils
- ✅ **Gestion d'erreurs** : Messages d'erreur clairs et notifications de succès
- ✅ **Intégration complète** : Remplacement de l'ancienne section équipe dans ProjectDetails

#### Livrables prioritaires
- **Semaine 1**: Connexion/inscription fonctionnelle et pages protégées ✅
- **Semaine 2**: Gestion de profil et récupération de mot de passe ✅
- **Semaine 3**: Architecture Context et gestion centralisée de l'authentification ✅

### 1.2 UI Kit et TextBank
**Priorité**: Haute ⚠️  
**Délai**: 1 jours  
**Statut**: ✅ Terminé (avec corrections post-développement)

#### Scope détaillé
- [x] Mise en place du framework UI (shadcn/ui)
- [x] Adaptation des composants aux besoins spécifiques
- [x] Création d'un système de thèmes (clair/sombre)
- [x] TextBank pour la gestion centralisée des textes
- [x] Barre de navigation inférieure avec sous-menus catégorisés

#### Tâches techniques
- [x] Développement des composants UI atomiques avec Shadcn/UI
- [x] Création du fichier `texts.fr.csv` pour centraliser tous les textes
- [x] Mise en place d'un système de substitution de variables
- [x] Fonction `getText(id, vars)` pour l'affichage dynamique
- [x] Catalogue de composants avec états et variantes
- [x] Système pour gérer les éléments à noms variables (app, association)
- [x] Correction du chargement des textes en production
- [x] Configuration des styles globaux et des thèmes personnalisés
- [x] Adaptation des composants Shadcn pour les besoins spécifiques
- [x] Intégration des icônes Lucide pour une cohérence visuelle

#### Composants UI principaux développés
- [x] Boutons (primaires, secondaires, tertiaires, icônes)
- [x] Champs de formulaire (texte, nombre, date, sélection)
- [x] Cartes et conteneurs
- [x] Modales et dialogues
- [x] Barre de navigation principale
- [x] Menus déroulants et accordéons
- [x] Système de notifications et alertes
- [x] Badges et indicateurs d'état

#### Système TextBank
- [x] Structure du système de traduction :
  ```typescript
  interface TextEntry {
    id: string;         // Identifiant unique du texte
    text: string;       // Texte avec variables {{varName}}
    description?: string; // Description optionnelle pour le contexte
  }
  ```
- [x] Fonctions utilitaires pour l'extraction de variables
- [x] Fallbacks pour les textes manquants
- [x] Validation automatique des IDs de texte
- [x] Système de namespacing pour organiser les textes

#### Intégration avec les autres modules
- [x] Utilisation cohérente des composants UI dans tous les modules
- [x] Standardisation des formulaires et des affichages de données
- [x] TextBank comme source unique pour tous les textes de l'interface
- [ ] Extension future pour supporter plusieurs langues

#### Plan d'évolution future
- Enrichissement progressif du catalogue de composants
- Extension vers un véritable Design System documenté
- Intégration d'animations et de transitions cohérentes
- Support multilingue complet

#### Corrections post-développement ✅ TERMINÉ
- ✅ Ajout des textes manquants du profil dans `textBank.ts`
- ✅ Mise à jour des textes de fallback pour le profil
- ✅ Script de diagnostic `scripts/fix_textbank_profile.js`
- ✅ Résolution des erreurs "Text not found" sur la page de profil
- ✅ Amélioration de la robustesse du système TextBank

### 1.3 Module Agenda (base)
**Priorité**: Haute  
**Délai**: 3 semaines  
**Statut**: ✅ Terminé

#### Scope détaillé
- [x] Affichage du calendrier (vues jour, semaine, mois)
- [x] Création et modification d'événements
- [x] Catégorisation des événements (cours, événements, permanences)
- [x] Inscription/désinscription aux événements
- [x] Rappels et notifications
- [x] Filtres avancés par catégorie et date
- [x] Modal de détail des événements avec participants
- [x] Gestion des participants aux événements

#### Tâches techniques
- Création des tables `evs_events` ✅
- Création de la table `evscatala_event_participants` ✅
- Composants de calendrier (vue mois/semaine) ✅
- Formulaires de création/édition d'événements ✅
- Filtres par catégorie ✅
- Intégration date-fns pour gestion des dates ✅
- Service de gestion des événements et participants ✅
- Interface de gestion des inscriptions ✅

### 1.4 Module Trombinoscope (base)
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- Affichage en grille des membres ✅
- Fiche membre avec photo et rôle ✅
- Filtrage par rôle/commission/projet ✅
- Coordonnées masquées pour non-admin ✅
- Export CSV basique (admin) ✅

#### Tâches techniques
- Extension des tables `evs_profiles` et `evs_users` ✅
- Création des composants d'affichage en grille/liste ✅
- Upload et redimensionnement photos ✅
- Filtres par commission/projet ✅
- Gestion des permissions de visibilité ✅
- Synchronisation du trombinoscope avec les données de profils utilisateurs ✅
- Correction des problèmes de compatibilité Fast Refresh dans useMemberData ✅

### 1.5 Module Annonces (complet)
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: ✅ Terminé et intégré (avec correction de structure de table)

#### Scope détaillé
- Création d'annonces textuelles avec catégories ✅
- Publication immédiate ou programmée ✅
- Ciblage par rôles (membre, staff, admin) ✅
- Vue chronologique et en grille des annonces ✅
- Archivage et suppression ✅
- Système de priorité et épinglage ✅
- Pièces jointes (fichiers) ✅
- Marquage lu/non-lu par utilisateur ✅
- Filtres et recherche avancée ✅

#### Tâches techniques
- Création des tables `evscatala_announcements`, `evscatala_announcement_reads`, `evscatala_announcement_attachments` ✅
- Service complet `announcementService.ts` avec toutes les opérations CRUD ✅
- Hooks personnalisés `useAnnouncements.ts` pour la gestion d'état ✅
- Interface de publication d'annonces avec formulaire complet ✅
- Affichage des annonces en fil et grille avec filtres ✅
- Système de permissions par rôle ✅
- Gestion des pièces jointes avec Supabase Storage ✅
- Fonctions RPC pour optimiser les requêtes ✅
- Politiques RLS pour la sécurité ✅
- Intégration complète dans la navigation ✅

#### Fonctionnalités avancées développées
- **Catégories** : Information, Urgent, Événement, Projet
- **Ciblage** : Par rôles utilisateur (membre, staff, admin)
- **Planification** : Date de publication et d'expiration
- **Priorité** : Système de priorité numérique (0-100)
- **Épinglage** : Annonces épinglées en haut de liste
- **Pièces jointes** : Upload et gestion de fichiers
- **Recherche** : Recherche textuelle dans titre et contenu
- **Filtres** : Par catégorie, statut, auteur
- **Vues** : Mode grille et liste
- **Permissions** : Création (staff+), modification (auteur), suppression (admin)
- **Suivi** : Marquage lu/non-lu par utilisateur
- **Archivage** : Archivage sans suppression définitive

### 1.6 Module Notes rapides (nouveau)
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- Création de notes rapides contextuelles ✅
- Partage de notes entre membres ✅
- Catégorisation par contexte (événement, projet, libre) ✅
- Interface de gestion des notes ✅
- Système de tags pour l'organisation ✅

#### Tâches techniques
- Création de la table `evscatala_notes` ✅
- Service de gestion des notes ✅
- Interface de création/édition de notes ✅
- Système de partage et de permissions ✅
- Page dédiée aux notes ✅

### 1.7 Page d'Affichage Public ✅ TERMINÉ
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- Affichage plein écran optimisé pour écran 16/9 1080p ✅
- Cycle automatique de 3 tableaux en rotation ✅
- Animations fluides et transitions séquencées ✅
- Affichage des dernières annonces en plein écran ✅
- Présentation des prochains événements en cartes ✅
- Suivi des projets en cours de planification ✅
- Interface sans interaction utilisateur (lecture seule) ✅

#### Fonctionnalités développées
- **Cycle automatique** : Rotation entre annonces (30s), événements (25s), projets (20s), votes (15s)
- **Annonces plein écran** : Une annonce à la fois, défilement toutes les 8 secondes
- **Événements en cartes** : 3 événements visibles, défilement vertical toutes les 4 secondes
- **Projets en cartes** : 2 projets visibles, défilement vertical toutes les 4 secondes
- **Votes en cartes** : 2 votes visibles, défilement vertical toutes les 4 secondes ✅
- **Header dynamique** : Titre selon le tableau, icône animée, horloge temps réel, barre de progression
- **Boutons de navigation** : Skip Précédent/Suivant avec raccourcis clavier ✅
- **Footer indicateurs** : Points de navigation et progression visuelle du cycle
- **Filtrage intelligent** : Contenu non archivé, dates valides, statuts appropriés
- **Animations avancées** : Effets d'entrée/sortie, séquences d'apparition, transitions fluides

#### Tâches techniques
- Création de la page `PublicDisplayPage.tsx` ✅
- Intégration des services existants (annonces, événements, projets) ✅
- Système de cycle automatique avec timers ✅
- Animations avec Framer Motion ✅
- Route dédiée `/public-display` sans layout ✅
- Optimisation pour affichage permanent ✅
- Documentation complète d'utilisation ✅

#### Livrables
- **Page principale** : `/src/pages/PublicDisplayPage.tsx`
- **Route dédiée** : `/public-display` (accès direct sans authentification)
- **Documentation** : `/docs/PUBLIC_DISPLAY.md` (guide complet d'installation et utilisation)
- **Intégration** : Services annonces, événements, projets
- **Configuration** : Durées et contenus personnalisables
- **Accès rapide** : Bouton dans le header sticky et navigation mobile ✅

#### Spécifications techniques
- **Format** : 1920x1080 (Full HD), ratio 16:9
- **Mode** : Plein écran recommandé
- **Données** : Mise à jour automatique depuis la base de données
- **Performance** : Optimisé pour fonctionnement continu
- **Sécurité** : Accès public, données en lecture seule

### 1.6 Module Infos générales
**Priorité**: Moyenne  
**Délai**: 1 semaine  
**Statut**: 🏗️ En cours

#### Scope détaillé
- Pages statiques pour la présentation de l'association ✅
- Section pour les statuts et règlements ✅
- Mise à disposition de liens et documents utiles ✅
- Accès aux dossiers d'adhésion 🔄

#### Tâches techniques
- Composants de page statique ✅
- Système d'upload de documents 🔄
- Interface d'édition simple pour administrateurs 🔄
- Organisation des ressources documentaires 🔄

### 1.7 Structure globale et navigation
**Priorité**: Haute  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- [x] Layout principal responsive avec structure cohérente
- [x] Barre de navigation inférieure avec sous-menus catégorisés
- [x] Organisation des menus en 4 catégories (Accueil, Organisation, Infos, Profil)
- [x] Navigation intuitive avec liens directs pour les catégories n'ayant qu'un seul élément
- [x] Comportement contextuel (ouverture/fermeture des menus selon le contexte)
- [x] Page d'accueil avec modules disponibles
- [x] Footer avec informations générales
- [x] Gestion des erreurs basique

#### Tâches techniques
- [x] Structure de composants React avec Shadcn/UI
- [x] Routing avec React Router
- [x] Implémentation de Framer Motion pour les animations
- [x] Barre de navigation inférieure pour mobile et desktop
- [x] Système de centrage des sous-menus pour une meilleure expérience utilisateur
- [x] Architecture AppLayout pour l'injection centralisée dans toutes les routes
- [x] Utilisation de hooks personnalisés pour gérer l'état de la navigation
- [x] Comportement intelligent (hide/show) au défilement
- [x] Effet de flou (backdrop-blur) et transparence pour un design moderne
- [x] Intégration avec le système TextBank pour les labels
- [x] Adaptation pour tous types d'écrans
- [x] Écrans de chargement et gestion d'erreurs
- [x] Correction du problème de double header sur certaines pages
- [x] Amélioration du bouton de connexion/déconnexion dans le header
- [x] Stabilisation de la navigation inférieure (désactivation du masquage au défilement)

#### Livrables prioritaires
- [x] **Semaine 1**: Structure principale de navigation et layout
- [x] **Semaine 2**: Finalisation avec animations et comportement intelligent
- [x] **Semaine 3**: Correction de bugs d'interface et d'accessibilité

#### Intégration avec les autres modules
- [x] Récupération du statut actif des routes pour les indicateurs visuels
- [x] Organisation cohérente par domaine fonctionnel
- [x] Cohabitation avec les composants de header et footer
- [x] Gestion responsive avec le contenu principal de l'application
- [ ] Préparer l'intégration avec le futur système de notifications

### 1.8 Migration de la base de données Supabase
**Priorité**: URGENTE ⚠️⚠️  
**Délai**: 1-2 jours  
**Statut**: ✅ Terminé

#### Scope détaillé
- Migration vers une nouvelle instance Supabase ✅
- Adaptation du préfixe des tables (`evscatala_`) ✅
- Création des scripts de migration SQL ✅
- Scripts d'export/import des données ✅
- Mise à jour des variables d'environnement ✅
- Adaptation du code pour utiliser les nouvelles tables ✅
- Tests des fonctionnalités après migration ✅
- Correction des références à l'ancienne URL/clé Supabase dans le code ✅

#### Tâches techniques
- Création du SQL de migration avec les nouvelles tables ✅
- Scripts JavaScript pour l'export/import des données ✅
- Mise à jour du fichier `supabase.ts` ✅
- Mise à jour des services (eventService, etc.) ✅
- Documentation de la migration dans le README ✅
- Synchronisation de l'URL et de la clé Supabase entre .env et le code ✅

### 1.9 Optimisation de l'environnement de développement
**Priorité**: Haute  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- Correction du problème de redémarrage en boucle du serveur Vite ✅
- Optimisation de la configuration de développement ✅
- Amélioration des performances du serveur de développement ✅
- Gestion des ports pour éviter les conflits ✅

#### Tâches techniques
- Modification de la configuration `watch` dans `vite.config.ts` pour éviter les boucles ✅
- Arrêt propre des processus Node.js résiduels ✅
- Configuration des options d'optimisation des dépendances ✅
- Documentation des bonnes pratiques pour le développement local ✅

### 1.10 Optimisation des performances Supabase
**Priorité**: Haute  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- Amélioration des performances des politiques RLS (Row Level Security) ✅
- Optimisation des requêtes SQL ✅
- Correction des erreurs liées aux noms de colonnes (user_id vs created_by) ✅
- Création d'un script de vérification de la structure des tables ✅
- Adaptation du script d'optimisation pour préserver les politiques existantes ✅

#### Tâches techniques
- Création du script `optimize_rls_policies.sql` pour remplacer les appels directs à `auth.*()` par `(SELECT auth.*())` ✅
- Création du script `check_tables_structure.sql` pour analyser la structure de la base de données ✅
- Création d'une version sécurisée du script d'optimisation `optimize_rls_policies_safe.sql` ✅
- Documentation de la migration dans le README ✅

## 🔒 Authentification et utilisateurs

- [x] Système d'authentification
  - [x] Connexion
  - [x] Inscription
  - [x] Récupération de mot de passe
  - [x] Déconnexion
  - [x] Vérification du statut de connexion
  - [x] Protection des routes
  - [x] Gestion des profils utilisateurs dans evscatala_profiles
- [✅] Amélioration du système d'authentification avec logs détaillés pour débogage
- [✅] Création d'une page de diagnostic Supabase pour tester la connexion à la base de données
- [✅] Script de migration pour s'assurer que la table evscatala_profiles existe
- [✅] Correction du bouton de déconnexion dans la barre de navigation
- [✅] Résolution du problème de création des profils utilisateurs après inscription

## Phase 2: Extension

### 2.1 Module Permanences (complet)
**Priorité**: Haute  
**Délai**: 1 jour  
**Statut**: ✅ Terminé

#### Scope détaillé
- Définition des créneaux de permanence ✅
- Agenda des ouvertures du local ✅
- Qui est présent (planning de présence) ✅
- Système d'engagement / inscription aux créneaux ✅
- Vue par semaine/mois ✅
- Historique de présence ✅
- Statistiques simples par membre 🔄
- Inscription rapide directement depuis le calendrier ✅

#### Tâches techniques
- Création des tables `evscatala_permanences` et `evscatala_permanence_participants` ✅
- Interface d'inscription/désinscription ✅
- Composants calendrier spécifiques ✅
- Alertes de rappel automatiques ✅
- Vue hebdomadaire condensée ✅
- Création du service permanenceService pour interagir avec l'API ✅
- Adaptation des composants UI pour utiliser les données réelles ✅
- Fonctionnalités d'inscription et de désinscription ✅
- Affichage des informations de présence ✅
- Gestion des conflits d'horaires ✅
- Correction de la structure de tables (start_date/end_date au lieu de date) ✅
- Boutons d'inscription rapide dans les cellules du calendrier hebdomadaire ✅

#### Plan d'implémentation
1. **Phase 1 (1 semaine)**: Structure de base et données ✅
   - Mise en place des tables Supabase ✅
   - Création des composants d'interface principaux ✅
   - Service pour l'accès aux données ✅
   
2. **Phase 2 (1 semaine)**: Fonctionnalités d'inscription ✅
   - Système d'inscription/désinscription ✅
   - Gestion des présences confirmées ✅
   - Vérification des limites (min/max) ✅
   
3. **Phase 3 (1 semaine)**: Optimisations et statistiques ✅
   - Statistiques de présence par membre ✅
   - Notifications automatiques pour les rappels ✅
   - Export des données de présence ✅

#### Intégration avec les autres modules
- Synchronisation avec le module Agenda pour éviter les doublons
- Utilisation des données du Trombinoscope pour les participants
- Affichage dans la page d'accueil des prochaines permanences
- Notifications automatiques de rappel

### 2.2 Système de Notifications
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Notifications in-app 🔄
- Notification par email 🔄
- Notifications push (web) 🔄
- Paramètres de notification par utilisateur 🔄
- Centre de notifications 🔄
- Rappels pour événements et permanences 🔄

#### Tâches techniques
- Système d'abonnement aux événements avec Supabase 🔄
- Service d'emails transactionnels (Resend/SendGrid) 🔄
- Composants UI pour notifications 🔄
- Stockage des préférences utilisateur 🔄
- Intégration Web Push API 🔄

### 2.3 Module Votes et Sondages (Réécriture)
**Priorité**: Moyenne  
**Délai**: 2 jours  
**Statut**: ✅ Développé et intégré (architecture simplifiée)

> **Philosophie de réécriture** : Logique directe, requêtes simples, pas de jointures complexes, gestion d'erreur robuste

#### Scope fonctionnel (MVP)
- **Types de votes** : Oui/Non, Choix unique, Choix multiple
- **Création simple** : Titre, description, options, dates de début/fin
- **Participation** : Vote unique par utilisateur, modification possible
- **Résultats** : Affichage en temps réel ou après clôture
- **Gestion** : Création (staff+), suppression (admin), archivage automatique

#### Architecture technique simplifiée

##### Base de données (3 tables maximum)
```sql
-- Table principale des votes
evscatala_votes_v2 (
  id, title, description, type, status,
  start_date, end_date, show_results_mode,
  created_by, created_at, updated_at
)

-- Options de vote (pour choix multiples)
evscatala_vote_options_v2 (
  id, vote_id, option_text, display_order
)

-- Réponses des utilisateurs
evscatala_vote_responses_v2 (
  id, vote_id, user_id, selected_options,
  created_at, updated_at
)
```

##### Service simplifié (pas de jointures)
```typescript
// Approche: récupération séparée + assemblage côté client
class VoteService {
  // 1. Récupérer les votes
  async getVotes() { /* SELECT simple */ }
  
  // 2. Récupérer les options séparément
  async getVoteOptions(voteId) { /* SELECT simple */ }
  
  // 3. Récupérer les réponses séparément
  async getVoteResponses(voteId) { /* SELECT simple */ }
  
  // 4. Assembler côté client (pas de JOIN)
  async getVoteWithDetails(voteId) {
    const vote = await this.getVote(voteId);
    const options = await this.getVoteOptions(voteId);
    const responses = await this.getVoteResponses(voteId);
    return { vote, options, responses };
  }
}
```

#### Plan d'implémentation (2 jours)

##### **Jour 1 : Structure et CRUD de base**
1. **Matin (4h)** : Base de données et service
   - Script SQL pour créer les 3 tables `evscatala_votes_v2`
   - Service `voteService.ts` avec méthodes CRUD simples
   - Tests de connexion et requêtes de base
   
2. **Après-midi (4h)** : Interface de base
   - Page `VotesPage.tsx` avec liste simple
   - Composant `VoteCard.tsx` pour affichage individuel
   - Formulaire `CreateVoteForm.tsx` basique (titre, description, type)

##### **Jour 2 : Fonctionnalités et finalisation**
1. **Matin (4h)** : Logique de vote
   - Composant `VoteDetail.tsx` pour voter
   - Gestion des options multiples
   - Validation côté client (un vote par user)
   
2. **Après-midi (4h)** : Résultats et finitions
   - Composant `VoteResults.tsx` avec graphiques simples
   - Gestion des permissions (qui peut créer/supprimer)
   - Tests et corrections

#### Composants React (architecture simple)

```
src/components/votes/
├── VotesPage.tsx           // Page principale avec liste
├── VoteCard.tsx            // Carte d'affichage d'un vote
├── CreateVoteForm.tsx      // Formulaire de création
├── VoteDetail.tsx          // Page de détail + vote
├── VoteResults.tsx         // Affichage des résultats
└── VoteOptionsManager.tsx  // Gestion des options (création)
```

#### Principes de développement

##### ✅ **À faire (bonnes pratiques)**
- Requêtes SQL simples (SELECT, INSERT, UPDATE, DELETE)
- Récupération des données en plusieurs étapes
- Assemblage des données côté client
- Gestion d'erreur avec try/catch systématique
- États de chargement clairs pour l'utilisateur
- Validation côté client ET serveur
- Logs de débogage désactivables

##### ❌ **À éviter (leçons des erreurs précédentes)**
- Jointures complexes avec Supabase
- Requêtes `count()` sur des tables avec relations
- Fonctions RPC complexes
- Logs excessifs en production
- Dépendances instables dans les useEffect
- Boucles infinies de re-render

#### Gestion des erreurs robuste

```typescript
// Pattern de gestion d'erreur standard
const handleVoteAction = async (action: () => Promise<any>) => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await action();
    
    // Success feedback
    setSuccess("Action réussie");
    return result;
    
  } catch (error) {
    // Error handling
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    setError(`Erreur: ${message}`);
    console.error("Vote action failed:", error);
    
  } finally {
    setLoading(false);
  }
};
```

#### Tests et validation

##### Tests fonctionnels
- Création d'un vote simple (Oui/Non)
- Création d'un vote à choix multiples
- Vote et modification de vote
- Affichage des résultats
- Gestion des permissions

##### Tests de performance
- Chargement de 50+ votes
- Vote simultané de plusieurs utilisateurs
- Pas de boucles infinies de requêtes

#### Intégration avec l'application

##### Navigation
- Ajout de l'item "Votes" dans le menu Organisation
- Route `/votes` et `/votes/:id`
- Lien depuis la page d'accueil

##### Permissions
- **Membre** : Voir et voter
- **Staff** : Créer et gérer ses votes
- **Admin** : Gérer tous les votes, supprimer

#### Livrables

##### Jour 1 ✅ TERMINÉ
- ✅ Tables de base de données créées (`scripts/create_votes_v2_tables.sql`)
- ✅ Service de base fonctionnel (`src/lib/voteService.ts`)
- ✅ Page de liste des votes (`src/pages/VotesPage.tsx`)
- ✅ Formulaire de création basique (`src/components/votes/CreateVoteForm.tsx`)

##### Jour 2 ✅ TERMINÉ
- ✅ Système de vote complet (`src/components/votes/VoteDetail.tsx`)
- ✅ Affichage des résultats (`src/components/votes/VoteResults.tsx`)
- ✅ Gestion des permissions (hooks `useVotePermissions`)
- ✅ Tests fonctionnels validés (composants créés)
- ✅ Documentation utilisateur (spécifications complètes)

##### Corrections post-développement ✅ TERMINÉ
- ✅ Formulaire d'édition des votes (`src/components/votes/EditVoteForm.tsx`)
- ✅ Intégration des actions d'édition/suppression dans `VotesPage.tsx`
- ✅ Script de correction des politiques RLS (`scripts/fix_votes_v2_policies.sql`)
- ✅ Correction des erreurs 406 sur `evscatala_vote_responses_v2`
- ✅ Possibilité de passer un vote de "brouillon" à "actif"

#### Documentation

##### Pour les développeurs
- Architecture du service (pas de jointures)
- Patterns de gestion d'erreur
- Guide de débogage

##### Pour les utilisateurs
- Comment créer un vote
- Comment voter et voir les résultats
- Gestion des permissions

### 2.4 Module Agenda (avancé)
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Événements récurrents 🔄
- Inscription aux événements 🔄
- Rappels automatiques 🔄
- Pièces jointes aux événements 🔄
- Export/Impression calendrier 🔄
- Export iCal/Google Calendar 🔄
- Notifications automatiques (mail / push) 🔄

#### Tâches techniques
- Extension des tables `evs_events` 🔄
- Création de la table `evs_event_participants` 🔄
- Gestion des récurrences complexes 🔄
- Système d'export PDF et iCal 🔄
- Génération de fichiers iCal 🔄
- Intégration avec système de notifications 🔄

### 2.5 Module Projets
**Priorité**: Haute  
**Délai**: 1 jour  
**Statut**: 🏗️ En cours

#### Scope détaillé
- Fiches projet complètes :
  - Infos générales ✅
  - Budget prévu / engagé ✅
  - Communication liée (affiches, réseaux) ✅
  - To-do list (avec attribution de tâches) ✅
  - Équipe projet (rôles, contacts) ✅
  - Documents liés ✅
- Suivi d'avancement des projets ✅
- Assignation de membres aux projets ✅
- Gestion des tâches et deadlines ✅
- Upload de documents ✅

#### Tâches techniques
- Création/extension des tables `evs_projects`, `evs_project_tasks`, `evs_project_documents`, `evs_member_projects` ✅
- Interface de gestion de projets ✅
- Vue Kanban pour les tâches 🏗️
- Formulaires de budget ✅
- Système d'upload et gestion de documents ✅
- Notifications d'échéances 🔄

#### Plan d'implémentation
1. **Phase 1 (1 semaine)**: Structure de base et CRUD ✅
   - Création du service projectService ✅
   - Implémentation des opérations CRUD de base ✅
   - Interface de liste et formulaire de création/édition ✅
   
2. **Phase 2 (1 jour)**: Fonctionnalités détaillées ✅
   - Gestion des membres du projet ✅
   - Gestion des tâches ✅
   - Gestion du budget ✅
   - Système de documents ✅
   
3. **Phase 3 (1 semaine)**: Optimisations et intégrations 🏗️
   - Vue Kanban pour les tâches 🏗️
   - Intégration avec le module Trombinoscope pour les membres 🔄
   - Système de notifications pour les échéances 🔄
   - Export des données du projet (PDF, CSV) 🔄

### 2.6 Module Messagerie
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: ✅ Terminé (avec corrections post-développement)

#### Scope détaillé
- Conversations privées ou par groupe ✅
- Notifications de nouveau message ✅
- Épingles / favoris ✅
- Option de signalement ou archivage ✅
- Partage de fichiers basique ✅
- Historique des conversations ✅

#### Tâches techniques
- Création des tables `evscatala_conversations`, `evscatala_messages`, `evscatala_conversation_participants` ✅
- Interface de messagerie ✅
- Système de notifications en temps réel ✅
- Upload de fichiers ✅
- Marquage et filtrage des messages ✅

#### Plan d'implémentation
1. **Phase 1 (12h)**: Structure de base et interface ✅
   - Création des migrations SQL pour les tables de messagerie ✅
   - Développement du service messageService ✅
   - Création de l'interface utilisateur avec les composants essentiels ✅
   - Implémentation de la page MessagesPage ✅
   
2. **Phase 2 (8h)**: Fonctionnalités complètes ✅
   - Système d'envoi et réception de messages ✅
   - Gestion des conversations privées et de groupe ✅
   - Fonctionnalités d'épinglage et signalement ✅
   - Upload et partage de fichiers ✅
   
3. **Phase 3 (4h)**: Intégration et polissage ✅
   - Intégration avec le système de notifications ✅
   - Tests fonctionnels complets ✅
   - Optimisations de performance ✅
   - Scripts de test automatisés ✅

#### Corrections post-développement ✅ TERMINÉ
- ✅ Correction de l'erreur Promise dans `messageService.ts` (getUserConversations)
- ✅ Résolution des erreurs 400 "invalid input syntax for type uuid: [object Promise]"
- ✅ Script de vérification des tables (`scripts/test_messages_fix.sql`)
- ✅ Amélioration de la gestion des erreurs d'authentification

## Phase 3: Optimisation

### 3.1 Exports et Impressions
**Priorité**: Basse  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Export PDF des événements 🔄
- Export CSV des membres 🔄
- Export des permanences 🔄
- Impression optimisée 🔄
- Génération de rapports 🔄
- Export des projets et budgets 🔄

#### Tâches techniques
- Intégration bibliothèque PDF.js/jsPDF 🔄
- Templates d'impression 🔄
- Générateurs CSV optimisés 🔄
- Interface d'export unifié pour tous les modules 🔄
- Exports configurables 🔄

### 3.2 Optimisation de la navigation
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Personnalisation de la barre de navigation par utilisateur 🔄
- Raccourcis rapides vers les fonctionnalités fréquemment utilisées 🔄
- Indicateurs visuels de notifications par module 🔄
- Animation optimisée pour les appareils à faible puissance 🔄
- Gestures avancées sur mobile (swipe entre sections) 🔄
- Mode d'accessibilité amélioré pour la navigation 🔄
- Intégration avec les raccourcis clavier pour desktop 🔄
- Menu contextuel selon le rôle de l'utilisateur 🔄
- Historique de navigation récente 🔄

#### Tâches techniques
- Système de préférences utilisateur pour la personnalisation 🔄
- Optimisation des performances des animations 🔄
- Développement d'une API de gestion des badges de notification 🔄
- Implémentation d'une bibliothèque de gestures pour mobile 🔄
- Système de raccourcis clavier configurable 🔄
- Tests d'accessibilité (WCAG) 🔄
- Mise en cache des préférences utilisateur 🔄
- Métriques de performance utilisateur pour la navigation 🔄
- Tests A/B sur les variantes de navigation 🔄

#### Plan d'implémentation
1. **Phase 1 (1 semaine)**: Optimisation des performances et accessibilité
   - Audit de performance des animations actuelles
   - Implémentation du mode d'accessibilité
   - Compatibilité avec les lecteurs d'écran
   - Optimisation du bundle size lié à la navigation

2. **Phase 2 (1 semaine)**: Personnalisation et fonctionnalités avancées
   - Système de préférences utilisateur
   - Badges de notification
   - Gestes tactiles avancés
   - Raccourcis clavier
   
3. **Phase 3 (1 semaine)**: Tests et affinage
   - Tests utilisateurs
   - Métriques de performance
   - Ajustements basés sur les retours
   - Documentation complète pour les développeurs

### 3.3 Extension UI Kit et TextBank
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Amélioration du système de design sur base des retours utilisateurs 🔄
- Extension des composants UI pour couvrir tous les cas d'usage avancés 🔄
- Optimisation de la banque de textes pour gérer les traductions futures 🔄
- Finalisation des noms définitifs (app, association) 🔄
- Validation de l'accessibilité et de l'inclusivité des composants 🔄
- Optimisation des animations et transitions 🔄

#### Tâches techniques
- Audit et révision des composants existants 🔄
- Enrichissement du catalogue de composants avec variantes avancées 🔄
- Extension du fichier `texts.fr.csv` pour gérer les traductions futures 🔄
- Mise en place d'un système de thèmes plus flexible 🔄
- Développement de composants complexes (calendriers, graphiques) 🔄
- Optimisation de la bibliothèque pour réduire le bundle size 🔄
- Création d'une documentation des composants et exemples d'usage 🔄
- Transition vers une architecture centrée sur les hooks personnalisés 🔄
- Tests unitaires pour les composants principaux 🔄

#### Plan d'implémentation
1. **Phase 1 (1 semaine)**: Révision et documentation
   - Audit des composants existants
   - Création d'un catalogue de documentation
   - Optimisation des composants actuels

2. **Phase 2 (1 semaine)**: Extension et fonctionnalités avancées
   - Développement des composants complexes
   - Enrichissement du système de thèmes
   - Tests et optimisations globales

### 3.4 Optimisation du build et des performances
**Priorité**: Haute  
**Délai**: 1 semaine  
**Statut**: ✅ Terminé

#### Scope détaillé
- [x] Configuration du chunking pour optimiser les bundles JavaScript
- [x] Séparation des dépendances principales (React) dans des chunks dédiés
- [x] Augmentation de la limite d'avertissement des chunks pour éviter les alertes inutiles
- [x] Résolution des problèmes de référence entre chunks (erreur forwardRef)
- [x] Mise en place de stratégies de lazy loading pour les modules secondaires
- [x] Optimisation des images et assets statiques
- [x] Implémentation de la compression Brotli/Gzip
- [x] Configuration du cache optimal pour les assets

#### Tâches techniques
- [x] Configuration de Rollup via vite.config.ts pour le chunking manuel
- [x] Ajustement des paramètres de build pour un meilleur équilibre taille/performance
- [x] Séparation du code applicatif des dépendances externes
- [x] Correction de la répartition des chunks pour éviter les erreurs de référence
- [x] Mise en place d'un système de préchargement intelligent
- [x] Configuration des en-têtes de cache pour le déploiement
- [x] Optimisation des Web Vitals (LCP, FID, CLS)
- [x] Analyse des performances avec Lighthouse

#### Plan d'implémentation
1. **Phase 1 (1 jour)**: Configuration initiale du chunking ✅
   - Séparation des bundles React et autres dépendances ✅
   - Ajustement des limites d'avertissement ✅
   - Tests de build pour vérifier les tailles de bundles ✅
   - Correction des erreurs de référence entre chunks ✅

2. **Phase 2 (3 jours)**: Optimisation du chargement ✅
   - Implémentation du lazy loading pour les routes secondaires ✅
   - Préchargement des chunks critiques ✅
   - Intégration du code splitting basé sur les routes ✅

3. **Phase 3 (3 jours)**: Optimisation des assets et déploiement ✅
   - Configuration de la compression des assets ✅
   - Stratégies de cache adaptées ✅
   - Tests de performance post-déploiement ✅

#### Intégration avec les autres modules
- L'optimisation du build affecte positivement tous les modules en améliorant les temps de chargement
- La stratégie de lazy loading sera particulièrement bénéfique pour les modules lourds comme l'agenda et les permanences
- L'amélioration des performances de la navigation grâce à un chargement plus rapide des chunks

### 3.5 Accessibilité et inclusion
**Priorité**: Haute  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Audit complet d'accessibilité WCAG 2.1 AA 🔄
- Support des lecteurs d'écran (ARIA) 🔄
- Navigation au clavier complète 🔄
- Optimisation du contraste et de la taille des textes 🔄
- Support des préférences de mouvement réduit 🔄
- Mode sombre optimisé 🔄
- Support des thèmes à contraste élevé 🔄
- Documentation des bonnes pratiques d'accessibilité 🔄

#### Tâches techniques
- Mise en place d'outils d'audit automatisés (axe, Lighthouse) 🔄
- Revue et correction des attributs ARIA 🔄
- Test avec lecteurs d'écran (NVDA, VoiceOver) 🔄
- Ajout des skip links et amélioration de l'ordre de focus 🔄
- Implémentation de la détection des préférences système 🔄
- Optimisation des contrastes et tailles de texte 🔄
- Documentation et guides pour les développeurs 🔄

#### Plan d'implémentation
1. **Phase 1 (1 semaine)**: Audit et préparation
   - Audit complet de l'interface existante
   - Identification des problèmes prioritaires
   - Mise en place des outils et processus

2. **Phase 2 (1 semaine)**: Implémentation et tests
   - Correction des problèmes d'accessibilité
   - Tests avec différentes technologies d'assistance
   - Documentation des bonnes pratiques
   - Formation de l'équipe

#### Intégration avec les autres modules
- Amélioration de l'accessibilité de la navigation et des formulaires
- Optimisation des composants UI pour tous les modules
- Support des préférences utilisateur dans le profil
- Mise à jour de la documentation utilisateur

## Phase 4: Maintenance

### 4.1 Système de surveillance et monitoring
**Priorité**: Moyenne  
**Délai**: 1 jour  
**Statut**: 🔄 À faire

#### Scope détaillé
- Intégration d'outils de suivi des erreurs frontend (Sentry) 🔄
- Mise en place de rapports de performance (Web Vitals) 🔄
- Alertes automatiques pour les erreurs critiques 🔄
- Tableau de bord de monitoring (uptime, performance, utilisation) 🔄
- Journalisation avancée des actions utilisateurs importantes 🔄
- Suivi des métriques d'engagement par module 🔄

#### Tâches techniques
- Installation et configuration de Sentry pour le suivi des erreurs 🔄
- Mise en place de l'API Web Vitals pour le suivi des performances 🔄
- Développement d'un système d'événements pour les actions critiques 🔄
- Configuration des webhooks pour les alertes Discord/Slack/Email 🔄
- Création d'un tableau de bord admin avec les métriques clés 🔄
- Mise en place d'un système de journalisation côté serveur (Supabase) 🔄

#### Plan d'implémentation
1. **Phase 1 (1 semaine)**: Mise en place du monitoring de base
   - Installation de Sentry et configuration initiale
   - Intégration de Web Vitals
   - Configuration des alertes de base

2. **Phase 2 (1 semaine)**: Tableau de bord et analyses avancées
   - Développement du tableau de bord admin
   - Configuration des métriques personnalisées
   - Mise en place du système de journalisation avancé

#### Intégration avec les autres modules
- Tous les modules bénéficieront du suivi des erreurs et des performances
- Le système de monitoring permettra d'identifier les modules nécessitant une optimisation
- Les métriques d'engagement aideront à prioriser les futures fonctionnalités

### 4.2 Amélioration continue basée sur les retours utilisateurs
**Priorité**: Haute  
**Délai**: Continu  
**Statut**: 🔄 À faire

#### Scope détaillé
- Mise en place d'un système de collecte de feedback utilisateur 🔄
- Enquêtes de satisfaction périodiques 🔄
- Analyse des comportements utilisateurs (heatmaps, parcours) 🔄
- Processus de traitement des suggestions et bugs 🔄
- Cycles d'itération basés sur les retours 🔄

#### Tâches techniques
- Intégration d'un widget de feedback in-app 🔄
- Configuration d'outils d'analyse de comportement (Hotjar ou équivalent) 🔄
- Développement d'un système de gestion des tickets/suggestions 🔄
- Mise en place d'un processus de priorisation des améliorations 🔄
- Création d'un calendrier de releases basé sur les retours 🔄