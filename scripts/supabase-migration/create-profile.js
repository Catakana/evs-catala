// Script pour créer le profil de l'utilisateur existant
import { createClient } from '@supabase/supabase-js';

// Utiliser les variables d'environnement directement dans le code
const supabaseUrl = 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// ID de l'utilisateur existant et informations du profil
const userId = '1cf4d0ea-1f4c-4812-bf77-6524080621ba';
const userProfile = {
  user_id: userId,
  email: 'nguyenvanjean@gmail.com',
  firstname: 'Jean',
  lastname: 'NGUYEN',
  role: 'member',
  status: 'active'
};

async function createProfile() {
  try {
    console.log('🔍 Vérification si le profil existe déjà...');
    
    // Vérifier si le profil existe déjà
    const { data: existingProfile, error: checkError } = await supabase
      .from('evscatala_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Erreur lors de la vérification du profil:');
      console.error(checkError);
      return;
    }
    
    if (existingProfile) {
      console.log('⚠️ Le profil existe déjà:');
      console.log(existingProfile);
      return;
    }
    
    console.log('🔨 Création du profil utilisateur...');
    
    // Insérer le profil
    const { data, error } = await supabase
      .from('evscatala_profiles')
      .insert(userProfile)
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de la création du profil:');
      console.error(error);
      return;
    }
    
    console.log('✅ Profil créé avec succès!');
    console.log('📊 Données du profil:', data);
  } catch (err) {
    console.error('❌ Exception lors de la création du profil:');
    console.error(err);
  }
}

// Exécuter la fonction
createProfile(); 