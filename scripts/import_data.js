// Script pour importer les données dans la nouvelle base Supabase
// À exécuter après avoir exporté les données de l'ancienne base

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Nouvelle connexion Supabase
const supabaseUrl = 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI';

// Créer un client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Dossier contenant les données exportées
const dataDir = path.join(__dirname, '..', 'data_export');

// Mapping des anciennes tables vers les nouvelles
const tableMapping = {
  'evs_profiles': 'evscatala_profiles',
  'evs_events': 'evscatala_events',
  'evs_announcements': 'evscatala_announcements',
  'evs_announcement_reads': 'evscatala_announcement_reads',
  'evs_permanences': 'evscatala_permanences',
  'evs_permanence_participants': 'evscatala_permanence_participants'
};

// Fonction pour importer les données d'une table
async function importTable(oldTableName, newTableName) {
  try {
    console.log(`Importation des données de ${oldTableName} vers ${newTableName}...`);
    
    // Vérifier si le fichier d'export existe
    const dataFile = path.join(dataDir, `${oldTableName}.json`);
    if (!fs.existsSync(dataFile)) {
      console.warn(`⚠️ Fichier d'export introuvable pour ${oldTableName}. Import ignoré.`);
      return;
    }
    
    // Lire les données depuis le fichier JSON
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    if (!data || data.length === 0) {
      console.log(`ℹ️ Aucune donnée à importer pour ${oldTableName}.`);
      return;
    }
    
    // Adapter les données selon la table (ajustements spécifiques)
    let adaptedData = data;
    
    // Ajustements spécifiques pour chaque table
    if (oldTableName === 'evs_profiles') {
      // Exemple: Adapter les champs de profil
      adaptedData = data.map(profile => ({
        ...profile,
        // Si l'ID était un champ spécifique qui a changé
        // Adaptez selon votre structure
      }));
    }
    
    // Importer les données dans la nouvelle table
    const { error } = await supabase
      .from(newTableName)
      .insert(adaptedData);
    
    if (error) {
      console.error(`❌ Erreur lors de l'importation dans ${newTableName}:`, error);
      return;
    }
    
    console.log(`✅ Table ${oldTableName} importée avec succès vers ${newTableName} - ${data.length} enregistrements.`);
  } catch (err) {
    console.error(`❌ Erreur lors de l'importation de ${oldTableName}:`, err);
  }
}

// Fonction principale
async function importAllData() {
  console.log('Début de l\'importation des données...');
  
  // Vérifier si le dossier d'export existe
  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Dossier d'export introuvable: ${dataDir}`);
    return;
  }
  
  // Importer chaque table
  for (const [oldTable, newTable] of Object.entries(tableMapping)) {
    await importTable(oldTable, newTable);
  }
  
  console.log('\nImportation terminée.');
}

// Lancer l'importation
importAllData(); 