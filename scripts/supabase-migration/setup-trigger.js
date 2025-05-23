// Script pour activer le trigger de création automatique de profils
import { createClient } from '@supabase/supabase-js';

// Utiliser les variables d'environnement directement dans le code
const supabaseUrl = 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL pour créer la fonction et le trigger
const triggerSQL = `
-- Trigger pour créer un profil automatiquement lors de la création d'un utilisateur dans auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.evscatala_profiles (user_id, email, firstname, lastname, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstname', 
    NEW.raw_user_meta_data->>'lastname',
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'pending')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ajouter le trigger aux nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
`;

async function setupTrigger() {
  try {
    console.log('🔧 Configuration du trigger pour la création automatique de profils...');
    
    // Exécuter le SQL (nécessite une clé de service pour accéder à la fonction rpc)
    // Note: si cette approche ne fonctionne pas, utiliser l'interface SQL de Supabase directement
    const { error } = await supabase.rpc('exec_sql', { sql_query: triggerSQL });
    
    if (error) {
      console.error('❌ Erreur lors de la configuration du trigger:');
      console.error(error);
      console.error('\n⚠️ Vous devrez probablement configurer ce trigger manuellement dans l\'interface SQL de Supabase.');
      console.error('Copiez-collez le SQL suivant dans l\'éditeur SQL de Supabase:');
      console.error('\n', triggerSQL);
      return;
    }
    
    console.log('✅ Trigger configuré avec succès!');
  } catch (err) {
    console.error('❌ Exception lors de la configuration du trigger:');
    console.error(err);
    console.error('\n⚠️ Vous devrez probablement configurer ce trigger manuellement dans l\'interface SQL de Supabase.');
    console.error('Copiez-collez le SQL suivant dans l\'éditeur SQL de Supabase:');
    console.error('\n', triggerSQL);
  }
}

// Exécuter la fonction
setupTrigger(); 