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
  { id: 'app.name', text: APP_VARIABLES.APP_NAME },
  { id: 'app.association', text: APP_VARIABLES.ASSOCIATION_NAME },
  { id: 'app.slogan', text: 'Le portail communautaire de {{ASSOCIATION_SHORT_NAME}}' },
  { id: 'app.footer', text: '© {{CURRENT_YEAR}} {{ASSOCIATION_NAME}} - Tous droits réservés' },
  { id: 'nav.home', text: 'Accueil' },
  { id: 'nav.agenda', text: 'Agenda' },
  { id: 'nav.announcements', text: 'Annonces' },
  { id: 'nav.trombinoscope', text: 'Trombinoscope' },
  { id: 'nav.permanences', text: 'Permanences' },
  { id: 'nav.votes', text: 'Votes' },
  { id: 'nav.projects', text: 'Projets' },
  { id: 'nav.messages', text: 'Messagerie' },
  { id: 'nav.infos', text: 'Infos générales' },
  { id: 'actions.save', text: 'Enregistrer' },
  { id: 'actions.cancel', text: 'Annuler' },
  { id: 'actions.delete', text: 'Supprimer' },
  { id: 'actions.edit', text: 'Modifier' },
  { id: 'actions.view', text: 'Voir' },
  { id: 'actions.back', text: 'Retour' },
  { id: 'actions.next', text: 'Suivant' },
  { id: 'actions.previous', text: 'Précédent' },
  { id: 'actions.confirm', text: 'Confirmer' },
  { id: 'errors.required', text: 'Ce champ est requis' },
  { id: 'errors.invalid', text: 'Ce champ est invalide' },
  { id: 'errors.generic', text: 'Une erreur est survenue' },
  { id: 'errors.notFound', text: 'Page non trouvée' },
  { id: 'errors.unauthorized', text: 'Accès non autorisé' },
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

/**
 * Récupère un texte par son ID et remplace les variables
 * @param textId Identifiant du texte (format: "category.id")
 * @param variables Variables à remplacer dans le texte (optionnel)
 * @returns Le texte avec les variables remplacées ou une clé d'erreur si non trouvé
 */
export function getText(textId: string, variables?: Record<string, string>): string {
  const [category, id] = textId.split('.');
  
  if (!category || !id || !Object.keys(TEXTS).includes(category as TextCategory)) {
    console.warn(`TextBank: Invalid text ID format or category (${textId})`);
    return `[Missing text: ${textId}]`;
  }
  
  const categoryTexts = TEXTS[category as TextCategory];
  const textEntry = categoryTexts.find(entry => entry.id === textId);
  
  if (!textEntry) {
    console.warn(`TextBank: Text not found (${textId})`);
    return `[Missing text: ${textId}]`;
  }
  
  // Remplacer les variables
  let finalText = textEntry.text;
  
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

// Alias plus court pour getText
export const t = getText; 