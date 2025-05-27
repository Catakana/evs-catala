const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans les variables d\'environnement');
  console.log('💡 Ajoutez votre clé de service dans le fichier .env :');
  console.log('SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Lecture du fichier: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`🔄 Exécution du script SQL...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Erreur lors de l'exécution de ${filePath}:`, error);
      return false;
    }
    
    console.log(`✅ Script ${path.basename(filePath)} exécuté avec succès`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur lors de la lecture de ${filePath}:`, err.message);
    return false;
  }
}

async function executeSQL(sql, description) {
  try {
    console.log(`🔄 ${description}...`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Erreur lors de ${description}:`, error);
      return false;
    }
    
    console.log(`✅ ${description} réussi`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur lors de ${description}:`, err.message);
    return false;
  }
}

async function checkTables() {
  const checkSQL = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'evscatala_%'
    ORDER BY table_name;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: checkSQL });
    
    if (error) {
      console.error('❌ Erreur lors de la vérification des tables:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('❌ Erreur lors de la vérification des tables:', err.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Démarrage du setup de la base de données EVS-Catala');
  console.log('🔗 URL Supabase:', supabaseUrl);
  
  // Vérifier les tables existantes
  console.log('\n📋 Vérification des tables existantes...');
  const existingTables = await checkTables();
  
  if (existingTables.length > 0) {
    console.log('📊 Tables existantes trouvées:');
    existingTables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
  } else {
    console.log('📭 Aucune table EVS-Catala trouvée');
  }
  
  // Exécuter le script de setup principal
  console.log('\n🔧 Exécution du script de setup principal...');
  const setupPath = path.join(__dirname, 'setup_database.sql');
  
  if (!fs.existsSync(setupPath)) {
    console.error(`❌ Fichier ${setupPath} introuvable`);
    process.exit(1);
  }
  
  const success = await executeSQLFile(setupPath);
  
  if (!success) {
    console.error('❌ Échec du setup de la base de données');
    process.exit(1);
  }
  
  // Vérifier les tables après setup
  console.log('\n🔍 Vérification des tables après setup...');
  const finalTables = await checkTables();
  
  if (finalTables.length > 0) {
    console.log('✅ Tables créées avec succès:');
    finalTables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
  }
  
  console.log('\n🎉 Setup de la base de données terminé avec succès !');
}

// Exécuter le script
main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});