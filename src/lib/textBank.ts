/**
 * TextBank - Système de gestion centralisée des textes de l'application
 * 
 * Ce système permet de :
 * - Centraliser tous les textes de l'interface
 * - Gérer les variables et textes dynamiques
 * - Faciliter les modifications globales (noms de l'app/association)
 * - Préparer l'internationalisation future
 */

// Variables globales (peuvent être modifiées par configuration)
export const APP_VARIABLES = {
  APP_NAME: 'EVS-catala',
  ASSOCIATION_NAME: 'Espace de Vie Sociale CATALA',
  ASSOCIATION_SHORT_NAME: 'CATALA',
  CURRENT_YEAR: new Date().getFullYear().toString(),
  CONTACT_EMAIL: 'contact@evs-catala.fr',
  SUPPORT_EMAIL: 'support@evs-catala.fr',
};

// Types de textes
export type TextCategory = 
  | 'common' 
  | 'auth' 
  | 'agenda' 
  | 'trombinoscope' 
  | 'annonces' 
  | 'permanences'
  | 'votes'
  | 'projects'
  | 'messages'
  | 'infos';

// Interface pour les entrées de texte
interface TextEntry {
  id: string;
  text: string;
  description?: string;
}

// Textes communs utilisés dans toute l'application
const commonTexts: TextEntry[] = [
  { id: 'common.app.name', text: APP_VARIABLES.APP_NAME },
  { id: 'common.app.association', text: APP_VARIABLES.ASSOCIATION_NAME },
  { id: 'common.app.slogan', text: 'Le portail communautaire de {{ASSOCIATION_SHORT_NAME}}' },
  { id: 'common.app.footer', text: '© {{CURRENT_YEAR}} {{ASSOCIATION_NAME}} - Tous droits réservés' },
  { id: 'common.nav.home', text: 'Accueil' },
  { id: 'common.nav.agenda', text: 'Agenda' },
  { id: 'common.nav.announcements', text: 'Annonces' },
  { id: 'common.nav.trombinoscope', text: 'Trombinoscope' },
  { id: 'common.nav.permanences', text: 'Permanences' },
  { id: 'common.nav.votes', text: 'Votes' },
  { id: 'common.nav.projects', text: 'Projets' },
  { id: 'common.nav.messages', text: 'Messagerie' },
  { id: 'common.nav.infos', text: 'Infos générales' },
  { id: 'common.actions.save', text: 'Enregistrer' },
  { id: 'common.actions.cancel', text: 'Annuler' },
  { id: 'common.actions.delete', text: 'Supprimer' },
  { id: 'common.actions.edit', text: 'Modifier' },
  { id: 'common.actions.view', text: 'Voir' },
  { id: 'common.actions.back', text: 'Retour' },
  { id: 'common.actions.next', text: 'Suivant' },
  { id: 'common.actions.previous', text: 'Précédent' },
  { id: 'common.actions.confirm', text: 'Confirmer' },
  { id: 'common.errors.required', text: 'Ce champ est requis' },
  { id: 'common.errors.invalid', text: 'Ce champ est invalide' },
  { id: 'common.errors.generic', text: 'Une erreur est survenue' },
  { id: 'common.errors.notFound', text: 'Page non trouvée' },
  { id: 'common.errors.unauthorized', text: 'Accès non autorisé' },
  { id: 'common.processing', text: 'Traitement en cours...' },
];

// Textes pour l'authentification
const authTexts: TextEntry[] = [
  { id: 'auth.login', text: 'Connexion' },
  { id: 'auth.logout', text: 'Déconnexion' },
  { id: 'auth.register', text: 'Inscription' },
  { id: 'auth.forgotPassword', text: 'Mot de passe oublié' },
  { id: 'auth.resetPassword', text: 'Réinitialiser le mot de passe' },
  { id: 'auth.email', text: 'Adresse email' },
  { id: 'auth.password', text: 'Mot de passe' },
  { id: 'auth.confirmPassword', text: 'Confirmer le mot de passe' },
  { id: 'auth.firstname', text: 'Prénom' },
  { id: 'auth.lastname', text: 'Nom' },
  { id: 'auth.welcome', text: 'Bienvenue sur {{APP_NAME}}' },
  { id: 'auth.loginSuccess', text: 'Connexion réussie' },
  { id: 'auth.logoutSuccess', text: 'Déconnexion réussie' },
  { id: 'auth.registerSuccess', text: 'Inscription réussie' },
  { id: 'auth.resetSuccess', text: 'Mot de passe réinitialisé avec succès' },
  { id: 'auth.resetInstructions', text: 'Vérifiez votre email pour réinitialiser votre mot de passe' },
  { id: 'auth.noAccountYet', text: 'Vous n\'avez pas encore de compte ?' },
  { id: 'auth.passwordMinLength', text: 'Le mot de passe doit contenir au moins 8 caractères' },
  { id: 'auth.passwordsDoNotMatch', text: 'Les mots de passe ne correspondent pas' },
  { id: 'auth.createAccount', text: 'Créez votre compte pour rejoindre la communauté' },
  { id: 'auth.alreadyHaveAccount', text: 'Vous avez déjà un compte ?' },
];

// Centralization de tous les textes par catégorie
export const TEXTS: Record<TextCategory, TextEntry[]> = {
  common: commonTexts,
  auth: authTexts,
  agenda: [], // À compléter
  trombinoscope: [], // À compléter
  annonces: [], // À compléter
  permanences: [], // À compléter
  votes: [], // À compléter
  projects: [], // À compléter
  messages: [], // À compléter
  infos: [], // À compléter
};

// Dictionnaire des textes pour un accès rapide avec recherche O(1)
let textCache: Record<string, string> = {};

// Dictionnaire des textes de secours pour les messages d'erreur courants
const fallbackTexts: Record<string, string> = {
  // Messages d'erreur de formulaire
  'errors.required': 'Ce champ est requis',
  'errors.invalid': 'Ce champ est invalide',
  'errors.email': 'Adresse email invalide',
  'errors.min': 'Valeur trop petite',
  'errors.max': 'Valeur trop grande',
  'errors.minLength': 'Texte trop court',
  'errors.maxLength': 'Texte trop long',
  'errors.pattern': 'Format invalide',
  
  // Authentification
  'auth.login': 'Connexion',
  'auth.register': 'Inscription',
  'auth.logout': 'Déconnexion',
  'auth.forgotPassword': 'Mot de passe oublié',
  'auth.resetPassword': 'Réinitialiser le mot de passe',
  'auth.email': 'Adresse email',
  'auth.password': 'Mot de passe',
  'auth.confirmPassword': 'Confirmer le mot de passe',
  'auth.firstname': 'Prénom',
  'auth.lastname': 'Nom',
  'auth.passwordMinLength': 'Le mot de passe doit contenir au moins 8 caractères',
  'auth.passwordsDoNotMatch': 'Les mots de passe ne correspondent pas',
  'auth.noAccountYet': 'Vous n\'avez pas encore de compte ?',
  'auth.createAccount': 'Créez votre compte',
  'auth.alreadyHaveAccount': 'Vous avez déjà un compte ?',
  
  // Messages génériques
  'common.processing': 'Traitement en cours...',
  'common.loading': 'Chargement...',
  'common.success': 'Opération réussie',
  'common.error': 'Une erreur est survenue',
  'common.submit': 'Envoyer',
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.view': 'Voir',
  'common.back': 'Retour',
  'common.confirmation': 'Êtes-vous sûr ?'
};

// Remplir le cache des textes
function buildTextCache() {
  textCache = {};
  Object.values(TEXTS).forEach(categoryTexts => {
    categoryTexts.forEach(entry => {
      textCache[entry.id] = entry.text;
    });
  });
}

// Initialiser le cache au démarrage
buildTextCache();

/**
 * Récupère un texte par son ID et remplace les variables
 * @param textId Identifiant du texte (format: "category.id")
 * @param variables Variables à remplacer dans le texte (optionnel)
 * @returns Le texte avec les variables remplacées ou une clé d'erreur si non trouvé
 */
export function getText(textId: string, variables?: Record<string, string>): string {
  // Vérifier si l'ID est au format correct
  if (!textId || !textId.includes('.')) {
    console.warn(`TextBank: Invalid text ID format or category (${textId})`);
    return textId || 'Invalid ID';
  }
  
  // Recherche directe dans le cache
  const text = textCache[textId];
  
  // Si non trouvé dans le cache principal, rechercher dans les textes de secours
  if (!text) {
    const fallbackText = fallbackTexts[textId];
    
    if (fallbackText) {
      return processFinalText(fallbackText, variables);
    }
    
    // Log discret en dev, plus visible en production
    console.warn(`TextBank: Text not found (${textId})`);
    
    // Retourner au moins l'ID sans le préfixe de catégorie
    return textId.split('.').pop() || textId;
  }
  
  return processFinalText(text, variables);
}

/**
 * Remplace les variables dans un texte
 */
function processFinalText(text: string, variables?: Record<string, string>): string {
  // Commencer avec le texte original
  let finalText = text;
  
  // D'abord les variables globales de l'application
  Object.entries(APP_VARIABLES).forEach(([key, value]) => {
    finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  // Puis les variables spécifiques passées en paramètre
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
  }
  
  return finalText;
}

// Mise à jour du cache des textes après chargement depuis CSV
export function updateTextCache() {
  buildTextCache();
}

// Alias plus court pour getText
export const t = getText; 