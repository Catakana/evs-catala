// Exécuter les migrations SQL
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuration des chemins pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Créer le client Supabase avec la clé d'API de service
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Important: cette clé doit être une clé de service, pas la clé anon

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error(`  VITE_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.error(`  SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`);
  console.error('Ajoutez ces variables dans le fichier .env');
  console.error('La clé de service (service_role) peut être obtenue dans les paramètres de votre projet Supabase.');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service (nécessaire pour les migrations)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction pour exécuter une migration SQL
async function runMigration(sqlFilePath) {
  try {
    // Lire le fichier SQL
    console.log(`📄 Lecture du fichier de migration: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Exécuter le SQL
    console.log(`🔄 Exécution de la migration...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Erreur lors de l'exécution de la migration:`);
      console.error(error);
      return false;
    }
    
    console.log(`✅ Migration exécutée avec succès: ${path.basename(sqlFilePath)}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception lors de l'exécution de la migration:`);
    console.error(err);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du processus de migration Supabase');
  
  // Obtenir la liste des fichiers de migration
  const migrationsDir = path.join(__dirname);
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Trier par ordre alphabétique
  
  console.log(`📋 ${migrationFiles.length} fichiers de migration trouvés`);
  
  // Exécuter chaque migration
  let successCount = 0;
  let failCount = 0;
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`\n📦 Traitement de ${file}...`);
    
    const success = await runMigration(filePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  // Afficher le résumé
  console.log('\n===== RÉSUMÉ DES MIGRATIONS =====');
  console.log(`✅ ${successCount} migrations réussies`);
  console.log(`❌ ${failCount} migrations échouées`);
  console.log('==================================');
  
  if (failCount > 0) {
    process.exit(1);
  }
}

// Exécuter le script
main().catch(err => {
  console.error('❌ Erreur fatale:');
  console.error(err);
  process.exit(1);
}); 