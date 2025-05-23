// Script pour créer des comptes de démonstration dans Supabase
// Ce script doit être exécuté manuellement pour configurer les comptes de test

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Récupérer les variables d'environnement
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Vérifier que la clé de service est définie
if (!supabaseServiceKey) {
  console.error('⚠️ SUPABASE_SERVICE_KEY non définie. Ajoutez-la à votre fichier .env');
  console.error('La clé de service est différente de la clé anonyme et dispose de privilèges administratifs.');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service (privilèges admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comptes de démonstration à créer
const demoAccounts = [
  {
    email: 'demo-member@evscatala.fr',
    password: 'demo-member-2024',
    firstname: 'Membre',
    lastname: 'Démo',
    role: 'member',
    status: 'active'
  },
  {
    email: 'demo-staff@evscatala.fr',
    password: 'demo-staff-2024',
    firstname: 'Staff',
    lastname: 'Démo',
    role: 'staff',
    status: 'active'
  },
  {
    email: 'demo-admin@evscatala.fr',
    password: 'demo-admin-2024',
    firstname: 'Admin',
    lastname: 'Démo',
    role: 'admin',
    status: 'active'
  }
];

// Fonction pour créer un compte de démonstration
async function createDemoAccount(account) {
  try {
    console.log(`Création du compte ${account.email}...`);
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabase
      .from('evscatala_profiles')
      .select('*')
      .eq('email', account.email);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log(`⚠️ Le compte ${account.email} existe déjà, mise à jour des informations...`);
      
      // Mettre à jour le profil existant
      const { error: updateError } = await supabase
        .from('evscatala_profiles')
        .update({
          firstname: account.firstname,
          lastname: account.lastname,
          role: account.role,
          status: account.status,
          updated_at: new Date().toISOString()
        })
        .eq('email', account.email);
      
      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du profil: ${updateError.message}`);
      }
      
      console.log(`✅ Profil ${account.email} mis à jour avec succès`);
      return;
    }
    
    // Créer un nouvel utilisateur avec la Auth API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // Email déjà confirmé
      user_metadata: {
        firstname: account.firstname,
        lastname: account.lastname,
        role: account.role
      }
    });
    
    if (userError) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${userError.message}`);
    }
    
    const userId = userData.user.id;
    
    // Créer le profil utilisateur
    const { error: profileError } = await supabase
      .from('evscatala_profiles')
      .insert({
        user_id: userId,
        email: account.email,
        firstname: account.firstname,
        lastname: account.lastname,
        role: account.role,
        status: account.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
    }
    
    console.log(`✅ Compte démo ${account.email} (${account.role}) créé avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de la création du compte ${account.email}:`, error.message);
  }
}

// Fonction principale
async function createAllDemoAccounts() {
  console.log('🚀 Création des comptes de démonstration...');
  
  for (const account of demoAccounts) {
    await createDemoAccount(account);
  }
  
  console.log('\n✨ Processus terminé');
  console.log('\nComptes de démonstration disponibles:');
  demoAccounts.forEach(account => {
    console.log(`- ${account.email} / ${account.password} (${account.role})`);
  });
}

// Exécuter le script
createAllDemoAccounts()
  .catch(error => {
    console.error('Erreur générale:', error);
  }); 