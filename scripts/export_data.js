// Script pour exporter les données de l'ancienne base Supabase
// Utilisez-le pour copier les données avant migration

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ancienne connexion Supabase (à remplacer par vos valeurs)
const supabaseUrl = 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI';

// Créer un client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Dossier de sortie pour les fichiers JSON
const outputDir = path.join(__dirname, '..', 'data_export');

// Tables à exporter
const tables = [
  'evs_profiles',
  'evs_events',
  'evs_announcements',
  'evs_announcement_reads',
  'evs_permanences',
  'evs_permanence_participants'
];

// Créer le dossier d'export s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fonction pour exporter une table
async function exportTable(tableName) {
  try {
    console.log(`Exportation de la table ${tableName}...`);
    
    // Récupérer toutes les données de la table
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Erreur lors de l'exportation de ${tableName}:`, error);
      return;
    }
    
    // Chemin du fichier de sortie
    const outputFile = path.join(outputDir, `${tableName}.json`);
    
    // Écrire les données dans un fichier JSON
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Table ${tableName} exportée avec succès - ${data.length} enregistrements.`);
  } catch (err) {
    console.error(`❌ Erreur lors de l'exportation de ${tableName}:`, err);
  }
}

// Fonction principale
async function exportAllData() {
  console.log('Début de l\'exportation des données...');
  
  // Exporter chaque table
  for (const table of tables) {
    await exportTable(table);
  }
  
  console.log(`\nExportation terminée. Les fichiers ont été sauvegardés dans: ${outputDir}`);
}

// Lancer l'exportation
exportAllData(); 