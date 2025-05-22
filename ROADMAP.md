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
| **Phase 1: MVP** | Version minimale utilisable avec les fonctions essentielles | 2-3 mois | 🏗️ En cours |
| **Phase 2: Extension** | Ajout de modules complémentaires et enrichissement | 2-3 mois | 🔄 À faire |
| **Phase 3: Optimisation** | Peaufinage, performance et expérience utilisateur | 1-2 mois | 🔄 À faire |
| **Phase 4: Maintenance** | Corrections, améliorations continues | Continu | 🔄 À faire |

## Phase 1: MVP (Minimum Viable Product)

### 1.1 Authentification et gestion des utilisateurs
**Priorité**: URGENTE ⚠️⚠️  
**Délai**: 1-2 semaines  
**Statut**: 🏗️ En cours

> **Note**: Ce module est la priorité absolue pour permettre les tests utilisateurs dès que possible, même sans toutes les fonctionnalités. Il doit être implémenté en premier.

#### Scope détaillé
- Système d'inscription par email/mot de passe 🏗️
- Validation des comptes par email 🔄
- Profils de base avec nom, prénom, photo 🏗️
- Gestion des rôles (membre, staff, admin) 🏗️
- Réinitialisation de mot de passe 🔄
- Pages de connexion/déconnexion sécurisées ✅
- Système de persistance de session (cookies) ✅
- Comptes de démonstration préconfigurés pour tests 🔄
- Mode invité pour consultation limitée 🔄

#### Tâches techniques
- Configuration de Supabase Auth avec OAuth (Google) 🏗️
- Création de la table `evs_profiles` et `evs_user_settings` ✅
- Formulaires d'inscription et de connexion ✅
- Protection des routes privées 🏗️
- Gestion des tokens de session ✅
- Page de modification de profil utilisateur 🔄
- Environnement de test isolé 🔄
- Scripts de provisionnement des comptes de test 🔄
- Tests automatisés des flux d'authentification 🔄

#### Livrables prioritaires
- **Semaine 1**: Connexion/inscription fonctionnelle et pages protégées ✅
- **Semaine 2**: Gestion de profil et récupération de mot de passe 🏗️

### 1.2 UI Kit et TextBank
**Priorité**: Haute ⚠️  
**Délai**: 2 semaines  
**Statut**: 🏗️ En cours

#### Scope détaillé
- Création d'un système de design cohérent ✅
- Définition des composants UI réutilisables ✅
- Mise en place d'une banque de textes centralisée 🔄
- Gestion des textes variables et des noms provisoires (app, association) 🔄
- Documentation des composants et guides d'usage 🔄
- Palette de couleurs et typographie standardisées ✅

#### Tâches techniques
- Développement des composants UI atomiques avec Shadcn/UI ✅
- Création du fichier `texts.fr.csv` pour centraliser tous les textes 🔄
- Mise en place d'un système de substitution de variables 🔄
- Fonction `getText(id, vars)` pour l'affichage dynamique 🔄
- Catalogue de composants avec états et variantes ✅
- Système pour gérer les éléments à noms variables (app, association) 🔄

### 1.3 Module Agenda (base)
**Priorité**: Haute  
**Délai**: 3 semaines  
**Statut**: 🏗️ En cours

#### Scope détaillé
- Affichage calendrier mensuel, hebdomadaire ✅
- Création d'événements simples (titre, date, lieu) 🏗️
- Catégorisation des événements (activités, animations, réunions) 🏗️
- Filtrage par type d'événement 🔄
- Vue détaillée par événement 🔄
- Consultation par tous les membres ✅
- Contrôle des droits d'ajout d'événements 🔄

#### Tâches techniques
- Création des tables `evs_events` ✅
- Composants de calendrier (vue mois/semaine) ✅
- Formulaires de création/édition d'événements 🏗️
- Filtres par catégorie 🔄
- Intégration date-fns pour gestion des dates ✅

### 1.4 Module Trombinoscope (base)
**Priorité**: Moyenne  
**Délai**: 2 semaines  
**Statut**: 🏗️ En cours

#### Scope détaillé
- Affichage en grille des membres ✅
- Fiche membre avec photo et rôle 🏗️
- Filtrage par rôle/commission/projet 🔄
- Coordonnées masquées pour non-admin 🔄
- Export CSV basique (admin) 🔄

#### Tâches techniques
- Extension des tables `evs_profiles` et `evs_users` ✅
- Création des composants d'affichage en grille/liste ✅
- Upload et redimensionnement photos 🏗️
- Filtres par commission/projet 🔄
- Gestion des permissions de visibilité 🔄

### 1.5 Module Annonces (base)
**Priorité**: Moyenne  
**Délai**: 2 semaines  
**Statut**: 🏗️ En cours

#### Scope détaillé
- Création d'annonces textuelles simples ✅
- Publication immédiate ✅
- Ciblage de tous les membres 🔄
- Vue chronologique des annonces ✅
- Archivage manuel 🔄
- Notification par email basique 🔄

#### Tâches techniques
- Création des tables `evs_announcements` ✅
- Interface de publication d'annonces ✅
- Affichage des annonces en fil ✅
- Marquage lu/non-lu basique 🔄
- Système d'archivage 🔄

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
**Délai**: 2 semaines  
**Statut**: ✅ Terminé

#### Scope détaillé
- Layout principal responsive ✅
- Menu de navigation ✅
- Page d'accueil avec modules disponibles ✅
- Footer avec informations générales ✅
- Gestion des erreurs basique ✅

#### Tâches techniques
- Structure de composants React avec Shadcn/UI ✅
- Routing avec React Router ✅
- Composants de navigation (desktop/mobile) ✅
- Écrans de chargement et gestion d'erreurs ✅

## Phase 2: Extension

### 2.1 Module Permanences (complet)
**Priorité**: Haute  
**Délai**: 3 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Définition des créneaux de permanence 🔄
- Agenda des ouvertures du local 🔄
- Qui est présent (planning de présence) 🔄
- Système d'engagement / inscription aux créneaux 🔄
- Vue par semaine/mois 🔄
- Historique de présence 🔄
- Statistiques simples par membre 🔄

#### Tâches techniques
- Création des tables `evs_permanences` et `evs_permanence_participants` ✅
- Interface d'inscription/désinscription 🔄
- Composants calendrier spécifiques 🔄
- Alertes de rappel automatiques 🔄
- Vue hebdomadaire condensée 🔄

### 2.2 Système de Notifications
**Priorité**: Moyenne  
**Délai**: 2 semaines  
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

### 2.3 Module Votes et Sondages
**Priorité**: Moyenne  
**Délai**: 3 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Création de votes Oui/Non et choix multiples 🔄
- Sondages ou décisions officielles 🔄
- Votes anonymes ou nominatifs 🔄
- Paramétrage durée et visibilité des résultats 🔄
- Résultats visibles en temps réel ou à la clôture 🔄
- Période de vote configurable 🔄
- Historique des décisions votées 🔄
- Export des résultats (admin) 🔄

#### Tâches techniques
- Création des tables `evs_votes`, `evs_vote_options`, `evs_vote_responses` ✅
- Formulaires de création de votes 🔄
- Composants de visualisation des résultats 🔄
- Protection contre les votes multiples 🔄
- Système d'anonymisation des votes 🔄
- Système d'export CSV 🔄

### 2.4 Module Agenda (avancé)
**Priorité**: Moyenne  
**Délai**: 2 semaines  
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
**Délai**: 4 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Fiches projet complètes :
  - Infos générales 🔄
  - Budget prévu / engagé 🔄
  - Communication liée (affiches, réseaux) 🔄
  - To-do list (avec attribution de tâches) 🔄
  - Équipe projet (rôles, contacts) 🔄
  - Documents liés 🔄
- Suivi d'avancement des projets 🔄
- Assignation de membres aux projets 🔄
- Gestion des tâches et deadlines 🔄
- Upload de documents 🔄

#### Tâches techniques
- Création/extension des tables `evs_projects`, `evs_project_tasks`, `evs_project_documents`, `evs_member_projects` ✅
- Interface de gestion de projets 🔄
- Vue Kanban pour les tâches 🔄
- Formulaires de budget 🔄
- Système d'upload et gestion de documents 🔄
- Notifications d'échéances 🔄

### 2.6 Module Messagerie
**Priorité**: Moyenne  
**Délai**: 3 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Conversations privées ou par groupe 🔄
- Notifications de nouveau message 🔄
- Épingles / favoris 🔄
- Option de signalement ou archivage 🔄
- Partage de fichiers basique 🔄
- Historique des conversations 🔄

#### Tâches techniques
- Création des tables `evs_conversations`, `evs_messages`, `evs_conversation_participants` ✅
- Interface de messagerie 🔄
- Système de notifications en temps réel 🔄
- Upload de fichiers 🔄
- Marquage et filtrage des messages 🔄

## Phase 3: Optimisation

### 3.1 Exports et Impressions
**Priorité**: Basse  
**Délai**: 2 semaines  
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

### 3.2 Extension UI Kit et TextBank
**Priorité**: Moyenne  
**Délai**: 2 semaines  
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
- Extension du fichier `texts.fr.csv` avec tous les textes stabilisés 🔄
- Système de versionning pour les textes 🔄
- Tests d'accessibilité (WCAG) 🔄
- Documentation complète du design system 🔄

### 3.3 Performance et UX
**Priorité**: Moyenne  
**Délai**: 2 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Optimisation des requêtes 🔄
- Mise en cache des données 🔄
- Lazy loading des images 🔄
- Amélioration des temps de chargement 🔄
- Animations et transitions 🔄
- Historique des modifications 🔄

#### Tâches techniques
- Optimisation des requêtes Supabase 🔄
- React Query pour cache et invalidation 🔄
- Stratégies de suspense et lazy loading 🔄
- Système d'audit des modifications 🔄
- Mesures de performance 🔄

### 3.4 Optimisation Mobile
**Priorité**: Haute  
**Délai**: 2 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Adaptation complète pour smartphones 🔄
- Gestes tactiles pour navigation 🔄
- Modes d'affichage optimisés 🔄
- PWA (Progressive Web App) 🔄
- Navigation adaptée pour petit écran 🔄

#### Tâches techniques
- Media queries avancées 🔄
- Composants spécifiques mobile 🔄
- Configuration PWA avec service workers 🔄
- Tests cross-device 🔄
- Optimisation des performances sur mobile 🔄

### 3.5 Tableaux de bord et statistiques
**Priorité**: Basse  
**Délai**: 3 semaines  
**Statut**: 🔄 À faire

#### Scope détaillé
- Dashboard administrateur 🔄
- Statistiques de participation 🔄
- Graphiques d'activité 🔄
- KPIs pour le suivi associatif 🔄
- Rapports d'utilisation 🔄
- Vue consolidée des activités 🔄

#### Tâches techniques
- Intégration Recharts pour graphiques 🔄
- Agrégations SQL avancées 🔄
- Calculs statistiques côté serveur (Supabase Functions) 🔄
- Composants de data visualization 🔄
- Exports des tableaux de bord 🔄

## Phase 4: Maintenance et Évolutions

### 4.1 Corrections de bugs
**Priorité**: Continue  
**Délai**: Continu  
**Statut**: 🔄 À faire

#### Scope
- Correction des bugs signalés 🔄
- Tests automatisés 🔄
- Amélioration de la stabilité 🔄
- Compatibilité navigateurs 🔄

### 4.2 Sécurité et conformité
**Priorité**: Haute  
**Délai**: Continu  
**Statut**: 🔄 À faire

#### Scope
- Audits de sécurité réguliers 🔄
- Conformité RGPD 🔄
- Protection des données sensibles 🔄
- Journalisation des actions importantes 🔄
- Sauvegarde automatique des données 🔄

### 4.3 Nouvelles fonctionnalités
**Priorité**: Variable  
**Délai**: À définir  
**Statut**: 🔄 À faire

#### Scope potentiel
- Intégration avec services externes (Google, Outlook, etc.) 🔄
- Module de gestion financière/comptable avancé 🔄
- Application mobile native 🔄
- Système de visioconférence intégré 🔄
- Module de réservation de matériel 🔄
- Gestion documentaire avancée 🔄
- Autres besoins identifiés au cours de l'utilisation 🔄

## Rapports de progression

### Rapport au 22/05/2024
- **Phase 1 (MVP)**: ~45% complétée
  - Structure globale et navigation: 100% terminé
  - UI Kit de base: 75% terminé
  - Authentification: 60% en cours
  - Module Agenda (base): 50% en cours
  - Module Trombinoscope (base): 40% en cours
  - Module Annonces (base): 50% en cours
  - Module Infos générales: 60% en cours

- **Réalisations clés**:
  - Structure complète de l'application avec navigation
  - Composants UI de base avec Shadcn/UI
  - Authentification fonctionnelle avec Supabase
  - Structure de données pour tous les modules de base
  - Interface de calendrier pour les événements

- **Prochaines étapes prioritaires**:
  - Finaliser le système d'authentification
  - Compléter la gestion des profils utilisateurs
  - Terminer les formulaires d'événements pour l'agenda
  - Mettre en place la TextBank pour centraliser les textes

## Estimation des ressources

### Ressources humaines
- 1-2 développeurs frontend React
- 1 développeur backend/Supabase
- 1 designer UI/UX (temps partiel)
- 1 testeur
- Support utilisateurs

### Ressources techniques
- Hébergement Vercel (production/staging)
- Supabase (PostgreSQL, Auth, Storage)
- SendGrid/Resend pour emails
- Services de notification push (OneSignal)
- Services de monitoring (Sentry)
- GitHub (CI/CD, repository)

### Budget mensuel estimé
- Développement: selon ressources internes
- Infrastructure: ~100-150€/mois
  - Supabase: 25-50€
  - Vercel: 20€
  - Services emails: 10-20€
  - Notifications push: 0-15€
  - Monitoring/divers: 20-40€

## Indicateurs de suivi

- **Avancement**: % de fonctionnalités livrées par phase
- **Qualité**: Nombre de bugs par fonctionnalité 
- **Adoption**: Nombre d'utilisateurs actifs
- **Performance**: Temps de chargement moyen
- **Satisfaction**: Retours utilisateurs
- **Engagement**: Fréquence d'utilisation par module

---

## Notes et considérations

- Cette roadmap est évolutive et sera affinée en fonction des retours utilisateurs et des priorités identifiées en cours de projet.
- Les délais mentionnés sont indicatifs et dépendent des ressources disponibles.
- Les phases peuvent se chevaucher partiellement selon les besoins du projet.
- Des ajustements réguliers seront effectués lors de réunions de suivi de projet. 