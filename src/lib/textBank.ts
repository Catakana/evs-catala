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
  { id: 'auth.verifyEmailTitle', text: 'Vérification de votre email' },
  { id: 'auth.verifyEmailDescription', text: 'Un email de confirmation a été envoyé à votre adresse' },
  { id: 'auth.verifyEmailInstructions', text: 'Veuillez cliquer sur le lien dans cet email pour activer votre compte' },
  { id: 'auth.checkInbox', text: 'Vérifiez votre boîte de réception' },
  { id: 'auth.checkSpam', text: 'Pensez à vérifier vos spams si vous ne trouvez pas l\'email' },
  { id: 'auth.accountVerified', text: 'Compte vérifié avec succès !' },
  { id: 'auth.accountActivated', text: 'Votre compte a été activé. Vous pouvez maintenant vous connecter.' },
  { id: 'auth.verificationFailed', text: 'Échec de la vérification' },
  { id: 'auth.invalidLink', text: 'Lien de vérification invalide ou expiré' },
  { id: 'auth.contactSupport', text: 'Besoin d\'aide ? Contactez-nous' },
];

// Textes de navigation
const navTexts: TextEntry[] = [
  { id: 'nav.home', text: 'Accueil' },
  { id: 'nav.agenda', text: 'Agenda' },
  { id: 'nav.announcements', text: 'Annonces' },
  { id: 'nav.trombinoscope', text: 'Trombinoscope' },
  { id: 'nav.permanences', text: 'Permanences' },
  { id: 'nav.votes', text: 'Votes' },
  { id: 'nav.messages', text: 'Messages' },
  { id: 'nav.infos', text: 'Infos' },
  { id: 'nav.organisation', text: 'Organisation' },
];

// Textes pour le profil
const profileTexts: TextEntry[] = [
  { id: 'profile.title', text: 'Mon profil' },
  { id: 'profile.settings', text: 'Paramètres' },
  { id: 'profile.personalInfo', text: 'Informations personnelles' },
  { id: 'profile.security', text: 'Sécurité' },
  { id: 'profile.preferences', text: 'Préférences' },
  { id: 'profile.updatePersonalInfo', text: 'Mettez à jour vos informations personnelles' },
  { id: 'profile.securitySettings', text: 'Gérez vos paramètres de sécurité' },
  { id: 'profile.preferencesSettings', text: 'Configurez vos préférences d\'affichage et de notification' },
  { id: 'profile.changeAvatar', text: 'Changer la photo' },
  { id: 'profile.saveChanges', text: 'Enregistrer les modifications' },
  { id: 'profile.phone', text: 'Téléphone' },
  { id: 'profile.changePassword', text: 'Changer de mot de passe' },
  { id: 'profile.updateSuccess', text: 'Profil mis à jour' },
  { id: 'profile.updateSuccessMessage', text: 'Vos informations ont été mises à jour avec succès' },
  { id: 'profile.preferencesComingSoon', text: 'Les préférences seront disponibles prochainement' },
];

// Textes pour l'application
const appTexts: TextEntry[] = [
  { id: 'app.footer', text: '© 2024 EVS CATALA. Tous droits réservés.' },
];

// Textes pour les annonces
const announcementsTexts: TextEntry[] = [
  // Page principale
  { id: 'announcements.title', text: 'Annonces' },
  { id: 'announcements.create', text: 'Créer une annonce' },
  { id: 'announcements.search', text: 'Rechercher dans les annonces...' },
  { id: 'announcements.filters', text: 'Filtres' },
  { id: 'announcements.noResults', text: 'Aucune annonce trouvée' },
  { id: 'announcements.createFirst', text: 'Créez la première annonce !' },
  { id: 'announcements.loading', text: 'Chargement des annonces...' },
  
  // Catégories
  { id: 'announcements.category.info', text: 'Information' },
  { id: 'announcements.category.urgent', text: 'Urgent' },
  { id: 'announcements.category.event', text: 'Événement' },
  { id: 'announcements.category.project', text: 'Projet' },
  
  // Formulaire
  { id: 'announcements.form.title', text: 'Titre' },
  { id: 'announcements.form.titlePlaceholder', text: 'Titre de l\'annonce' },
  { id: 'announcements.form.content', text: 'Contenu' },
  { id: 'announcements.form.contentPlaceholder', text: 'Contenu de l\'annonce' },
  { id: 'announcements.form.category', text: 'Catégorie' },
  { id: 'announcements.form.recipients', text: 'Destinataires' },
  { id: 'announcements.form.publishDate', text: 'Date de publication' },
  { id: 'announcements.form.expireDate', text: 'Date d\'expiration (optionnel)' },
  { id: 'announcements.form.pin', text: 'Épingler l\'annonce' },
  { id: 'announcements.form.pinDescription', text: 'L\'annonce apparaîtra en haut de la liste' },
  { id: 'announcements.form.priority', text: 'Priorité (0-100)' },
  { id: 'announcements.form.attachments', text: 'Pièces jointes' },
  { id: 'announcements.form.addFiles', text: 'Cliquez pour ajouter des fichiers' },
  { id: 'announcements.form.advancedOptions', text: 'Options avancées' },
  
  // Actions
  { id: 'announcements.actions.edit', text: 'Modifier' },
  { id: 'announcements.actions.archive', text: 'Archiver' },
  { id: 'announcements.actions.delete', text: 'Supprimer' },
  { id: 'announcements.actions.save', text: 'Enregistrer' },
  { id: 'announcements.actions.cancel', text: 'Annuler' },
  { id: 'announcements.actions.create', text: 'Créer l\'annonce' },
  { id: 'announcements.actions.update', text: 'Mettre à jour' },
  
  // Messages
  { id: 'announcements.messages.created', text: 'Annonce créée avec succès' },
  { id: 'announcements.messages.updated', text: 'Annonce mise à jour avec succès' },
  { id: 'announcements.messages.deleted', text: 'Annonce supprimée avec succès' },
  { id: 'announcements.messages.archived', text: 'Annonce archivée avec succès' },
  { id: 'announcements.messages.confirmDelete', text: 'Êtes-vous sûr de vouloir supprimer cette annonce ?' },
  { id: 'announcements.messages.confirmArchive', text: 'Êtes-vous sûr de vouloir archiver cette annonce ?' },
  
  // Validation
  { id: 'announcements.validation.titleRequired', text: 'Le titre est requis' },
  { id: 'announcements.validation.titleTooLong', text: 'Le titre ne peut pas dépasser 255 caractères' },
  { id: 'announcements.validation.contentRequired', text: 'Le contenu est requis' },
  { id: 'announcements.validation.contentTooLong', text: 'Le contenu ne peut pas dépasser 5000 caractères' },
  { id: 'announcements.validation.expireDateInvalid', text: 'La date d\'expiration doit être postérieure à la date de publication' },
  { id: 'announcements.validation.priorityRange', text: 'La priorité doit être entre 0 et 100' },
  
  // Statuts
  { id: 'announcements.status.pinned', text: 'Épinglé' },
  { id: 'announcements.status.attachments', text: 'pièce(s) jointe(s)' },
  { id: 'announcements.status.by', text: 'Par' },
  { id: 'announcements.status.saving', text: 'Enregistrement...' },
];

// Textes pour les votes et sondages
const votesTexts: TextEntry[] = [
  // Textes de la page principale
  { id: 'votes.page_title', text: 'Votes et sondages' },
  { id: 'votes.filter.label', text: 'Filtrer' },
  { id: 'votes.filter.all', text: 'Tous' },
  { id: 'votes.filter.active', text: 'En cours' },
  { id: 'votes.filter.closed', text: 'Terminés' },
  { id: 'votes.tabs.official', text: 'Votes officiels' },
  { id: 'votes.tabs.surveys', text: 'Sondages' },
  { id: 'votes.actions.create', text: 'Nouveau vote' },
  { id: 'votes.actions.delete', text: 'Supprimer' },
  { id: 'votes.actions.edit', text: 'Modifier' },
  { id: 'votes.no_votes_found', text: 'Aucun vote trouvé' },
  { id: 'votes.create_new', text: 'Créer un nouveau vote' },
  { id: 'votes.participants', text: 'participants' },
  { id: 'votes.view_results', text: 'Voir les résultats' },

  // Formulaire de vote
  { id: 'votes.create_title', text: 'Créer un nouveau vote' },
  { id: 'votes.create_description', text: 'Configurez les paramètres de votre vote' },
  { id: 'votes.edit_title', text: 'Modifier le vote' },
  { id: 'votes.edit_description', text: 'Modifiez les paramètres du vote' },
  { id: 'votes.form.title', text: 'Titre' },
  { id: 'votes.form.title_placeholder', text: 'Entrez le titre du vote' },
  { id: 'votes.form.description', text: 'Description' },
  { id: 'votes.form.description_placeholder', text: 'Décrivez le contexte et l\'objectif du vote' },
  { id: 'votes.form.type', text: 'Type de vote' },
  { id: 'votes.form.options', text: 'Options de réponse' },
  { id: 'votes.form.add_option', text: 'Ajouter une option' },
  { id: 'votes.form.option', text: 'Option' },
  { id: 'votes.form.period', text: 'Période de vote' },
  { id: 'votes.form.start_date', text: 'Date de début' },
  { id: 'votes.form.end_date', text: 'Date de fin' },
  { id: 'votes.form.settings', text: 'Paramètres avancés' },
  { id: 'votes.form.status', text: 'Statut' },
  { id: 'votes.form.select_status', text: 'Choisir un statut' },
  { id: 'votes.form.visibility', text: 'Visibilité' },
  { id: 'votes.form.select_visibility', text: 'Choisir la visibilité' },
  { id: 'votes.form.result_visibility', text: 'Affichage des résultats' },
  { id: 'votes.form.select_result_visibility', text: 'Quand afficher les résultats' },
  { id: 'votes.form.create', text: 'Créer le vote' },
  { id: 'votes.form.update', text: 'Mettre à jour le vote' },

  // Types de vote
  { id: 'votes.type.binary', text: 'Vote Oui/Non' },
  { id: 'votes.type.binary_description', text: 'Un simple vote avec deux options : Oui ou Non.' },
  { id: 'votes.type.multiple', text: 'Choix multiples' },
  { id: 'votes.type.multiple_description', text: 'Permet de voter pour une option parmi plusieurs choix proposés.' },
  { id: 'votes.type.survey', text: 'Sondage' },
  { id: 'votes.type.survey_description', text: 'Permet de recueillir des opinions multiples sans caractère décisionnel.' },

  // Options par défaut
  { id: 'votes.option.yes', text: 'Oui' },
  { id: 'votes.option.no', text: 'Non' },

  // Statuts
  { id: 'votes.status.draft', text: 'Brouillon' },
  { id: 'votes.status.draft_description', text: 'Le vote est en préparation et n\'est pas encore visible.' },
  { id: 'votes.status.active', text: 'En cours' },
  { id: 'votes.status.closed', text: 'Terminé' },

  // Visibilité
  { id: 'votes.visibility.public', text: 'Public' },
  { id: 'votes.visibility.private', text: 'Restreint' },
  { id: 'votes.visibility.anonymous', text: 'Anonyme' },

  // Visibilité des résultats
  { id: 'votes.result_visibility.immediate', text: 'Immédiatement' },
  { id: 'votes.result_visibility.after_vote', text: 'Après avoir voté' },
  { id: 'votes.result_visibility.after_close', text: 'Après la clôture' },

  // Périodes
  { id: 'votes.period.ends', text: 'Se termine {{date}}' },
  { id: 'votes.period.starts', text: 'Commence {{date}}' },
  { id: 'votes.period.ended', text: 'Terminé {{date}}' },

  // Résultats de vote
  { id: 'votes.results.title', text: 'Résultats' },
  { id: 'votes.results.no_votes_yet', text: 'Aucun vote n\'a encore été enregistré' },
  { id: 'votes.results.hidden_title', text: 'Résultats masqués' },
  { id: 'votes.results.visible_after_vote', text: 'Les résultats seront visibles après avoir voté' },
  { id: 'votes.results.visible_after_close', text: 'Les résultats seront visibles après la clôture du vote' },
  { id: 'votes.results.not_available', text: 'Les résultats ne sont pas disponibles pour le moment' },
  { id: 'votes.results.vote_count', text: 'votes' },
  { id: 'votes.results.winning_option', text: 'Option gagnante' },

  // Messages d'erreur
  { id: 'votes.errors.title_required', text: 'Le titre est requis' },
  { id: 'votes.errors.description_required', text: 'La description est requise' },
  { id: 'votes.errors.options_required', text: 'Toutes les options doivent être remplies' },
  { id: 'votes.errors.start_date_required', text: 'La date de début est requise' },
  { id: 'votes.errors.end_date_required', text: 'La date de fin est requise' },
  { id: 'votes.errors.end_date_after_start', text: 'La date de fin doit être postérieure à la date de début' },
  { id: 'votes.errors.submit_error', text: 'Erreur lors de la soumission du vote' },
  { id: 'votes.errors.fetch_error', text: 'Erreur lors de la récupération des votes' },

  // Dialogues de suppression
  { id: 'votes.delete.title', text: 'Supprimer le vote' },
  { id: 'votes.delete.description', text: 'Êtes-vous sûr de vouloir supprimer ce vote ? Cette action est irréversible.' },
  { id: 'votes.delete.confirm', text: 'Oui, supprimer' },

  // Notifications toast
  { id: 'votes.toast.created_title', text: 'Vote créé' },
  { id: 'votes.toast.created_description', text: 'Le vote a été créé avec succès.' },
  { id: 'votes.toast.updated_title', text: 'Vote mis à jour' },
  { id: 'votes.toast.updated_description', text: 'Le vote a été mis à jour avec succès.' },
  { id: 'votes.toast.deleted_title', text: 'Vote supprimé' },
  { id: 'votes.toast.deleted_description', text: 'Le vote a été supprimé avec succès.' },
  { id: 'votes.toast.error_title', text: 'Erreur' },
  { id: 'votes.toast.delete_error_description', text: 'Impossible de supprimer le vote.' },
  { id: 'votes.toast.vote_success', text: 'Vote enregistré' },
  { id: 'votes.toast.vote_error', text: 'Erreur lors de l\'enregistrement du vote' },

  // Page de détail du vote
  { id: 'votes.errors.not_found', text: 'Ce vote n\'a pas été trouvé' },
  { id: 'votes.actions.back_to_votes', text: 'Retour à la liste des votes' },
  { id: 'votes.actions.activate', text: 'Activer le vote' },
  { id: 'votes.actions.close', text: 'Clôturer le vote' },
  { id: 'votes.actions.submit_vote', text: 'Envoyer mon vote' },
  
  // Formulaire de vote sur la page de détail
  { id: 'votes.vote_form.title', text: 'Votez maintenant' },
  { id: 'votes.vote_form.description', text: 'Sélectionnez une option ci-dessous pour voter' },
  
  // États de vote (utilisateur déjà voté, vote non actif, etc.)
  { id: 'votes.already_voted.title', text: 'Vous avez déjà voté' },
  { id: 'votes.already_voted.description', text: 'Merci pour votre participation ! Vous pouvez consulter les résultats.' },
  { id: 'votes.not_active.title', text: 'Vote en préparation' },
  { id: 'votes.not_active.description', text: 'Ce vote n\'est pas encore actif. Veuillez patienter.' },
  { id: 'votes.closed.title', text: 'Vote terminé' },
  { id: 'votes.closed.description', text: 'Ce vote est maintenant clôturé. Vous pouvez consulter les résultats.' },
  { id: 'votes.cannot_vote.title', text: 'Vote indisponible' },
  { id: 'votes.cannot_vote.description', text: 'Vous ne pouvez pas participer à ce vote pour le moment.' },
  
  // Dialogues d'activation/clôture
  { id: 'votes.activate.title', text: 'Activer le vote' },
  { id: 'votes.activate.description', text: 'Une fois activé, le vote sera visible et accessible aux membres concernés.' },
  { id: 'votes.activate.confirm', text: 'Activer' },
  { id: 'votes.close.title', text: 'Clôturer le vote' },
  { id: 'votes.close.description', text: 'Une fois clôturé, aucun nouveau vote ne sera accepté et les résultats seront visibles à tous.' },
  { id: 'votes.close.confirm', text: 'Clôturer' },
  
  // Notifications toast pour les statuts
  { id: 'votes.toast.activated_title', text: 'Vote activé' },
  { id: 'votes.toast.activated_description', text: 'Le vote est maintenant actif et visible.' },
  { id: 'votes.toast.closed_title', text: 'Vote clôturé' },
  { id: 'votes.toast.closed_description', text: 'Le vote est maintenant clôturé.' },
  { id: 'votes.toast.status_error', text: 'Erreur lors de la mise à jour du statut' },
  { id: 'votes.toast.vote_success_description', text: 'Votre vote a été enregistré avec succès.' },
];

// Textes pour le module de Messagerie
export const messagesTexts: TextEntry[] = [
  { id: 'messages.title', text: 'Messagerie' },
  { id: 'messages.new_message', text: 'Nouveau message' },
  { id: 'messages.new_group', text: 'Nouveau groupe' },
  { id: 'messages.search', text: 'Rechercher...' },
  { id: 'messages.no_conversation', text: 'Aucune conversation' },
  { id: 'messages.start_new', text: 'Commencez une nouvelle discussion en cliquant sur "Nouveau message"' },
  { id: 'messages.select_conversation', text: 'Sélectionnez une conversation pour afficher les messages' },
  { id: 'messages.loading', text: 'Chargement...' },
  { id: 'messages.loading_conversations', text: 'Chargement des conversations...' },
  { id: 'messages.loading_messages', text: 'Chargement des messages...' },
  { id: 'messages.no_messages', text: 'Aucun message dans cette conversation' },
  { id: 'messages.you', text: 'Vous' },
  { id: 'messages.pin', text: 'Épingler' },
  { id: 'messages.unpin', text: 'Désépingler' },
  { id: 'messages.delete', text: 'Supprimer' },
  { id: 'messages.report', text: 'Signaler' },
  { id: 'messages.delete_confirm', text: 'Êtes-vous sûr de vouloir supprimer ce message ?' },
  { id: 'messages.report_confirm', text: 'Signaler ce message ?' },
  { id: 'messages.write', text: 'Écrivez votre message...' },
  { id: 'messages.send', text: 'Envoyer' },
  { id: 'messages.attach', text: 'Joindre des fichiers' },
  { id: 'messages.private_chat', text: 'Conversation privée' },
  { id: 'messages.group_chat', text: 'Groupe sans nom' },
  { id: 'messages.no_more_attachments', text: 'Vous ne pouvez pas ajouter plus de {{count}} pièces jointes.' },
  { id: 'messages.file_too_large', text: 'Certains fichiers dépassent la taille limite de 10 Mo: {{files}}' },
  
  // Modal de nouvelle conversation
  { id: 'messages.new_conversation', text: 'Nouvelle conversation' },
  { id: 'messages.new_conversation_description', text: 'Créez une nouvelle conversation privée ou de groupe.' },
  { id: 'messages.private', text: 'Privée' },
  { id: 'messages.group', text: 'Groupe' },
  { id: 'messages.group_name', text: 'Nom du groupe' },
  { id: 'messages.group_name_placeholder', text: 'Entrez un nom pour le groupe' },
  { id: 'messages.participants', text: 'Participants ({{count}})' },
  { id: 'messages.search_members', text: 'Rechercher des membres...' },
  { id: 'messages.no_results', text: 'Aucun résultat' },
  { id: 'messages.cancel', text: 'Annuler' },
  { id: 'messages.create', text: 'Créer la conversation' },
  { id: 'messages.creating', text: 'Création...' },
  { id: 'messages.select_participant', text: 'Veuillez sélectionner au moins un participant.' },
  { id: 'messages.enter_group_title', text: 'Veuillez donner un titre à votre conversation de groupe.' },
  
  // Formats de date
  { id: 'messages.today', text: "Aujourd'hui" },
  { id: 'messages.yesterday', text: 'Hier' },
];

// Centralization de tous les textes par catégorie
export const TEXTS: Record<TextCategory, TextEntry[]> = {
  common: commonTexts,
  auth: authTexts,
  agenda: [], // À compléter
  trombinoscope: [], // À compléter
  annonces: announcementsTexts,
  permanences: [], // À compléter
  votes: votesTexts,
  projects: [], // À compléter
  messages: messagesTexts,
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
  'auth.verifyEmailTitle': 'Vérification de votre email',
  'auth.verifyEmailDescription': 'Un email de confirmation a été envoyé',
  'auth.checkInbox': 'Vérifiez votre boîte de réception',
  'auth.accountVerified': 'Compte vérifié avec succès !',
  'auth.invalidLink': 'Lien de vérification invalide',
  
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
  'common.confirmation': 'Êtes-vous sûr ?',
  
  // Navigation
  'nav.home': 'Accueil',
  'nav.agenda': 'Agenda',
  'nav.announcements': 'Annonces',
  'nav.trombinoscope': 'Trombinoscope',
  'nav.permanences': 'Permanences',
  'nav.votes': 'Votes',
  'nav.messages': 'Messages',
  'nav.infos': 'Infos',
  'nav.organisation': 'Organisation',
  
  // Profil
  'profile.title': 'Mon profil',
  'profile.settings': 'Paramètres',
  'profile.personalInfo': 'Informations personnelles',
  'profile.security': 'Sécurité',
  'profile.preferences': 'Préférences',
  'profile.updatePersonalInfo': 'Mettez à jour vos informations personnelles',
  'profile.securitySettings': 'Gérez vos paramètres de sécurité',
  'profile.preferencesSettings': 'Configurez vos préférences d\'affichage et de notification',
  'profile.changeAvatar': 'Changer la photo',
  'profile.saveChanges': 'Enregistrer les modifications',
  'profile.phone': 'Téléphone',
  'profile.changePassword': 'Changer de mot de passe',
  'profile.updateSuccess': 'Profil mis à jour',
  'profile.updateSuccessMessage': 'Vos informations ont été mises à jour avec succès',
  'profile.preferencesComingSoon': 'Les préférences seront disponibles prochainement',
  
  // App
  'app.footer': '© 2024 EVS CATALA. Tous droits réservés.',
  
  // Annonces
  'announcements.title': 'Annonces',
  'announcements.create': 'Créer une annonce',
  'announcements.search': 'Rechercher dans les annonces...',
  'announcements.filters': 'Filtres',
  'announcements.noResults': 'Aucune annonce trouvée',
  'announcements.loading': 'Chargement des annonces...',
  'announcements.category.info': 'Information',
  'announcements.category.urgent': 'Urgent',
  'announcements.category.event': 'Événement',
  'announcements.category.project': 'Projet',
  'announcements.form.title': 'Titre',
  'announcements.form.content': 'Contenu',
  'announcements.actions.edit': 'Modifier',
  'announcements.actions.delete': 'Supprimer',
  'announcements.actions.save': 'Enregistrer',
  'announcements.actions.cancel': 'Annuler'
};

// Remplir le cache des textes
function buildTextCache() {
  textCache = {};
  // Ajouter les textes du système principal
  Object.values(TEXTS).forEach(categoryTexts => {
    categoryTexts.forEach(entry => {
      textCache[entry.id] = entry.text;
    });
  });
  
  // Ajouter les textes de navigation
  navTexts.forEach(entry => {
    textCache[entry.id] = entry.text;
  });
  
  // Ajouter les textes de profil
  profileTexts.forEach(entry => {
    textCache[entry.id] = entry.text;
  });
  
  // Ajouter les textes d'application
  appTexts.forEach(entry => {
    textCache[entry.id] = entry.text;
  });
  
  // Ajouter les textes d'annonces
  announcementsTexts.forEach(entry => {
    textCache[entry.id] = entry.text;
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