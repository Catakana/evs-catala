# 📺 Page d'Affichage Public - EVS CATALA

## Vue d'ensemble

La page d'affichage public est conçue pour être affichée en permanence sur un écran dans les locaux de l'association. Elle présente les informations importantes en rotation automatique avec des animations fluides.

## 🎯 Objectif

Fournir un affichage continu d'informations importantes pour les membres et visiteurs :
- **Dernières annonces** : Communication officielle
- **Prochains événements** : Agenda des activités
- **Projets en cours** : Suivi des initiatives
- **Votes en cours** : Sondages et décisions collectives

## 📱 Spécifications Techniques

### Format d'écran
- **Résolution** : 1920x1080 (Full HD)
- **Ratio** : 16:9
- **Orientation** : Paysage
- **Mode** : Plein écran recommandé

### URL d'accès
```
https://votre-domaine.com/public-display
```

## 🔄 Fonctionnement

### Cycle automatique
La page fonctionne en boucle automatique avec 4 tableaux :

1. **Annonces** (30 secondes)
   - Affichage plein écran
   - Une annonce à la fois
   - Défilement toutes les 8 secondes
   - Filtrage automatique (non archivées, non expirées)

2. **Événements** (25 secondes)
   - Affichage en cartes
   - 3 événements visibles simultanément
   - Défilement vertical toutes les 4 secondes
   - Triés par date (plus proche en premier)

3. **Projets** (20 secondes)
   - Affichage en cartes
   - 2 projets visibles simultanément
   - Défilement vertical toutes les 4 secondes
   - Statuts : "En cours" et "Planification"

4. **Votes** (15 secondes)
   - Affichage en cartes
   - 2 votes visibles simultanément
   - Défilement vertical toutes les 4 secondes
   - Statuts : "Actif" et non expirés

### Animations
- **Transitions fluides** entre les tableaux
- **Animations séquencées** pour les éléments
- **Indicateurs visuels** de progression
- **Effets de parallaxe** et d'échelle

## 🎨 Interface Utilisateur

### Header
- **Titre dynamique** selon le tableau actuel
- **Icône animée** (rotation continue)
- **Horloge en temps réel** avec date
- **Boutons de navigation** : Précédent/Suivant avec raccourcis clavier
- **Barre de progression** du cycle

### Contenu principal
- **Animations d'entrée/sortie** pour chaque tableau
- **Typographie optimisée** pour la lisibilité à distance
- **Couleurs contrastées** pour une bonne visibilité
- **Badges colorés** pour les catégories

### Footer
- **Indicateurs de navigation** (points colorés)
- **Progression visuelle** du cycle en cours

## 🎮 Contrôles

### Navigation manuelle
- **Bouton "Précédent"** : Revenir au tableau précédent
- **Bouton "Suivant"** : Passer au tableau suivant
- **Raccourcis clavier** :
  - `Barre d'espace` ou `Flèche droite` : Tableau suivant
  - `Flèche gauche` : Tableau précédent

### Cycle automatique
Le cycle continue automatiquement même après navigation manuelle.

## 🛠️ Configuration

### Durées personnalisables
```typescript
const displayConfigs: DisplayConfig[] = [
  {
    mode: 'announcements',
    duration: 30, // Modifiable
    title: 'Dernières Annonces',
    icon: <Bell className="w-8 h-8" />
  },
  // ...
];
```

### Filtres de contenu
- **Annonces** : Non archivées, non expirées, 10 max
- **Événements** : Futurs uniquement, 8 max
- **Projets** : Actifs et en planification, 6 max
- **Votes** : Actifs et non expirés, 6 max

## 🚀 Installation et Déploiement

### Accès rapide depuis l'application
La page d'affichage public est accessible rapidement depuis l'interface principale :

#### 📱 **Depuis le header (toujours visible)**
- **Bouton Monitor** : Cliquer sur l'icône d'écran dans le header
- **Ouverture** : S'ouvre automatiquement dans un nouvel onglet
- **Avantage** : Accessible depuis toutes les pages de l'application

#### 📱 **Depuis la navigation mobile**
- **Menu Infos** : Ouvrir le menu "Infos" dans la barre de navigation inférieure
- **Item "Affichage Public"** : Sélectionner l'option avec l'icône Monitor
- **Ouverture** : S'ouvre automatiquement dans un nouvel onglet
- **Avantage** : Accessible facilement sur mobile et tablette

### 1. Configuration de l'écran
```bash
# Ouvrir en mode plein écran
F11 (ou Fn+F11 selon le clavier)

# Ou via le navigateur
Ctrl+Shift+F (Chrome/Edge)
```

### 2. URL de démarrage automatique
Configurer le navigateur pour ouvrir automatiquement :
```
https://votre-domaine.com/public-display
```

### 3. Paramètres navigateur recommandés
- **Désactiver les notifications**
- **Désactiver la mise en veille**
- **Activer le mode kiosque** (optionnel)
- **Désactiver les mises à jour automatiques**

## 🔧 Maintenance

### Surveillance
- **Connexion internet** : Vérifier la connectivité
- **Données à jour** : Les informations se mettent à jour automatiquement
- **Performance** : Surveiller la fluidité des animations

### Dépannage courant

#### Page blanche ou erreur
1. Vérifier la connexion internet
2. Actualiser la page (F5)
3. Vider le cache navigateur

#### Données manquantes
1. Vérifier la base de données Supabase
2. Contrôler les permissions RLS
3. Examiner les logs de la console

#### Animations saccadées
1. Fermer les autres onglets
2. Redémarrer le navigateur
3. Vérifier les ressources système

## 📊 Données Affichées

### Annonces
- **Titre** : Titre principal
- **Contenu** : Description complète
- **Catégorie** : Badge coloré (urgent, info, événement, projet)
- **Auteur** : Nom de l'auteur
- **Date** : Temps relatif (il y a X heures/jours)

### Événements
- **Titre** : Nom de l'événement
- **Description** : Détails de l'événement
- **Date** : Jour complet en français
- **Heure** : Heure de début
- **Lieu** : Localisation (si spécifiée)
- **Participants** : Nombre d'inscrits/maximum

### Projets
- **Titre** : Nom du projet
- **Description** : Objectifs et détails
- **Statut** : Badge (En cours/Planification)
- **Budget** : Montant alloué (si spécifié)
- **Échéance** : Date limite (si spécifiée)

### Votes
- **Titre** : Nom du vote
- **Description** : Question et détails
- **Type** : Badge (Oui/Non, Choix unique, Choix multiple)
- **Fin du vote** : Date et heure limite
- **Temps restant** : Temps avant expiration

## 🎨 Personnalisation

### Couleurs et thèmes
Les couleurs peuvent être personnalisées via les classes Tailwind :

```typescript
// Couleurs des catégories d'annonces
const categoryStyles = {
  urgent: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
  event: "bg-green-500 text-white",
  project: "bg-purple-500 text-white"
};
```

### Animations
Les durées et effets peuvent être ajustés :

```typescript
// Durée des animations
transition={{ duration: 0.8 }}

// Délais séquentiels
delay: 0.2 + (index * 0.1)
```

## 🔒 Sécurité

### Accès public
- **Aucune authentification** requise
- **Données en lecture seule**
- **Pas d'actions utilisateur** possibles

### Données sensibles
- **Filtrage automatique** des contenus archivés
- **Respect des dates d'expiration**
- **Pas d'informations personnelles** affichées

## 📈 Évolutions Futures

### Fonctionnalités prévues
- [ ] **Météo locale** intégrée
- [ ] **Flux RSS** d'actualités
- [ ] **Photos de l'association** en arrière-plan
- [ ] **Statistiques** de fréquentation
- [ ] **Messages d'urgence** prioritaires
- [ ] **Mode nuit** automatique
- [ ] **Contrôle à distance** via interface admin

### Améliorations techniques
- [ ] **Cache intelligent** pour les performances
- [ ] **Mode hors ligne** avec données locales
- [ ] **Synchronisation temps réel** via WebSocket
- [ ] **Monitoring** de l'état de l'écran
- [ ] **Logs d'utilisation** et statistiques

## 📞 Support

### Contact technique
- **Développeur** : [Nom du développeur]
- **Email** : [email@association.com]
- **Documentation** : `/docs/PUBLIC_DISPLAY.md`

### Ressources
- **Code source** : `/src/pages/PublicDisplayPage.tsx`
- **Styles** : Tailwind CSS + Framer Motion
- **API** : Services Supabase (announcements, events, projects)

---

*Dernière mise à jour : [Date actuelle]*
*Version : 1.0.0* 