// Script pour vérifier la connexion à Supabase et afficher les tables
import { createClient } from '@supabase/supabase-js';

// Utiliser les variables d'environnement directement dans le code
const supabaseUrl = 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    console.log('🔍 Vérification de la connexion Supabase...');
    
    // Test simple pour vérifier la connexion
    const { data, error } = await supabase
      .from('evscatala_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:');
      console.error(error);
      return;
    }
    
    console.log('✅ Connexion à Supabase réussie!');
    console.log('📊 Exemple de données:', data);
    
    // Récupérer la liste des tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_tables');
    
    if (tablesError) {
      console.error('❌ Erreur lors de la récupération des tables:');
      console.error(tablesError);
      return;
    }
    
    console.log('📋 Tables disponibles:', tables);
  } catch (err) {
    console.error('❌ Exception lors de la vérification de la connexion:');
    console.error(err);
  }
}

// Exécuter la fonction
checkConnection(); 