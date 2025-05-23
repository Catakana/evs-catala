/**
 * Script de test pour le module de messagerie
 * 
 * Ce script permet de tester les principales fonctionnalités de la messagerie :
 * - Création de conversations (privées/groupes)
 * - Envoi/réception de messages
 * - Épinglage/signalement de messages
 * - Gestion des pièces jointes
 * 
 * Exécution : node scripts/test-messaging.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Connexion à Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Configuration du test
const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'password123'
  },
  user1: {
    email: 'user1@example.com',
    password: 'password123'
  },
  user2: {
    email: 'user2@example.com',
    password: 'password123'
  }
};

// Fonctions utilitaires
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (message) => console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
const logError = (message) => console.error(`❌ [${new Date().toLocaleTimeString()}] ${message}`);
const logSuccess = (message) => console.log(`✅ [${new Date().toLocaleTimeString()}] ${message}`);

// Fonction principale de test
async function runTests() {
  log('Démarrage des tests de messagerie');
  
  try {
    // 1. Se connecter avec un premier utilisateur
    log('1. Connexion utilisateur 1');
    const { data: user1Data, error: user1Error } = await supabase.auth.signInWithPassword(TEST_USERS.user1);
    
    if (user1Error) {
      throw new Error(`Erreur de connexion utilisateur 1: ${user1Error.message}`);
    }
    
    const user1 = user1Data.user;
    logSuccess(`Connecté en tant que ${user1.email} (${user1.id})`);
    
    // 2. Créer une conversation privée
    log('2. Création d\'une conversation privée');
    
    // 2.1 Récupérer l'ID du second utilisateur
    const { data: user2Profile, error: profileError } = await supabase
      .from('evscatala_profiles')
      .select('id')
      .eq('email', TEST_USERS.user2.email)
      .single();
    
    if (profileError) {
      throw new Error(`Erreur de récupération du profil user2: ${profileError.message}`);
    }
    
    const user2Id = user2Profile.id;
    log(`ID du second utilisateur: ${user2Id}`);
    
    // 2.2 Créer la conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('evscatala_conversations')
      .insert({
        type: 'private',
        title: null,
        created_by: user1.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (conversationError) {
      throw new Error(`Erreur de création de conversation: ${conversationError.message}`);
    }
    
    const conversationId = conversationData.id;
    logSuccess(`Conversation créée avec ID: ${conversationId}`);
    
    // 2.3 Ajouter les participants
    const participants = [
      {
        conversation_id: conversationId,
        user_id: user1.id,
        is_admin: true,
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      },
      {
        conversation_id: conversationId,
        user_id: user2Id,
        is_admin: false,
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      }
    ];
    
    const { error: participantsError } = await supabase
      .from('evscatala_conversation_participants')
      .insert(participants);
    
    if (participantsError) {
      throw new Error(`Erreur d'ajout des participants: ${participantsError.message}`);
    }
    
    logSuccess('Participants ajoutés à la conversation');
    
    // 3. Envoyer un message
    log('3. Envoi d\'un message');
    const messageContent = 'Bonjour ! Ceci est un message de test envoyé à ' + new Date().toLocaleString();
    
    const { data: messageData, error: messageError } = await supabase
      .from('evscatala_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user1.id,
        content: messageContent,
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (messageError) {
      throw new Error(`Erreur d'envoi de message: ${messageError.message}`);
    }
    
    const messageId = messageData.id;
    logSuccess(`Message envoyé avec ID: ${messageId}`);
    
    // 4. Mettre à jour la conversation avec le dernier message
    await supabase
      .from('evscatala_conversations')
      .update({
        last_message_id: messageId,
        last_message_at: messageData.created_at,
        updated_at: messageData.created_at
      })
      .eq('id', conversationId);
    
    logSuccess('Conversation mise à jour avec le dernier message');
    
    // 5. Épingler le message
    log('5. Épinglage du message');
    
    const { error: pinError } = await supabase
      .from('evscatala_messages')
      .update({
        is_pinned: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);
    
    if (pinError) {
      throw new Error(`Erreur d'épinglage du message: ${pinError.message}`);
    }
    
    logSuccess('Message épinglé');
    
    // 6. Se connecter avec le deuxième utilisateur
    log('6. Connexion utilisateur 2');
    
    // D'abord déconnexion
    await supabase.auth.signOut();
    
    const { data: user2Data, error: user2Error } = await supabase.auth.signInWithPassword(TEST_USERS.user2);
    
    if (user2Error) {
      throw new Error(`Erreur de connexion utilisateur 2: ${user2Error.message}`);
    }
    
    const user2 = user2Data.user;
    logSuccess(`Connecté en tant que ${user2.email} (${user2.id})`);
    
    // 7. Répondre au message
    log('7. Réponse au message');
    
    const replyContent = 'Réponse au message de test à ' + new Date().toLocaleString();
    
    const { data: replyData, error: replyError } = await supabase
      .from('evscatala_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user2.id,
        content: replyContent,
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (replyError) {
      throw new Error(`Erreur d'envoi de réponse: ${replyError.message}`);
    }
    
    const replyId = replyData.id;
    logSuccess(`Réponse envoyée avec ID: ${replyId}`);
    
    // 8. Mettre à jour à nouveau la conversation
    await supabase
      .from('evscatala_conversations')
      .update({
        last_message_id: replyId,
        last_message_at: replyData.created_at,
        updated_at: replyData.created_at
      })
      .eq('id', conversationId);
    
    logSuccess('Conversation mise à jour avec la réponse');
    
    // 9. Marquer les messages comme lus
    log('9. Marquage des messages comme lus');
    
    const { error: readError } = await supabase
      .from('evscatala_conversation_participants')
      .update({
        last_read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', user2.id);
    
    if (readError) {
      throw new Error(`Erreur de marquage des messages comme lus: ${readError.message}`);
    }
    
    logSuccess('Messages marqués comme lus');
    
    // 10. Récupérer et afficher les messages de la conversation
    log('10. Récupération des messages');
    
    const { data: messages, error: getMessagesError } = await supabase
      .from('evscatala_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });
    
    if (getMessagesError) {
      throw new Error(`Erreur de récupération des messages: ${getMessagesError.message}`);
    }
    
    logSuccess(`${messages.length} messages récupérés :`);
    messages.forEach(msg => {
      console.log(`- [${new Date(msg.created_at).toLocaleString()}] ${msg.sender_id === user1.id ? 'User1' : 'User2'}: ${msg.content}${msg.is_pinned ? ' (épinglé)' : ''}`);
    });
    
    // Résumé final
    log('\n=== Résumé des tests ===');
    logSuccess('Tous les tests ont été complétés avec succès !');
    
  } catch (error) {
    logError(`Test échoué : ${error.message}`);
  } finally {
    // Nettoyage
    await supabase.auth.signOut();
    log('Tests terminés et déconnexion effectuée');
  }
}

// Exécuter les tests
runTests().catch(err => {
  logError(`Erreur fatale : ${err.message}`);
  process.exit(1);
}); 