// Script pour mettre à jour les fichiers d'environnement
import fs from 'fs';
import path from 'path';

// Nouvelles valeurs Supabase
const SUPABASE_URL = 'https://oybpmjjtbmlesvhlgabn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnBtamp0Ym1sZXN2aGxnYWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDY4MDIsImV4cCI6MjA2MzUyMjgwMn0.0rhAdkCJSwAg8RDfgbX8A_jdRBwPaaXkpb8yXWPOxRI';

// Fichiers d'environnement à mettre à jour
const envFiles = [
  '.env',
  '.env.production',
  '.env.new'
];

// Contenu de base pour les fichiers d'environnement
const baseEnvContent = `# Supabase
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
`;

// Fonction pour mettre à jour un fichier d'environnement
function updateEnvFile(filePath) {
  try {
    // Vérifier si le fichier existe
    if (fs.existsSync(filePath)) {
      console.log(`📄 Mise à jour du fichier existant: ${filePath}`);
      
      // Lire le contenu actuel du fichier
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Remplacer ou ajouter les variables Supabase
      let newContent = content;
      
      // Remplacer l'URL Supabase si elle existe
      const urlRegex = /VITE_SUPABASE_URL=.*/g;
      if (urlRegex.test(newContent)) {
        newContent = newContent.replace(urlRegex, `VITE_SUPABASE_URL=${SUPABASE_URL}`);
      } else {
        // Ajouter l'URL si elle n'existe pas
        newContent += `\nVITE_SUPABASE_URL=${SUPABASE_URL}`;
      }
      
      // Remplacer la clé Supabase si elle existe
      const keyRegex = /VITE_SUPABASE_ANON_KEY=.*/g;
      if (keyRegex.test(newContent)) {
        newContent = newContent.replace(keyRegex, `VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`);
      } else {
        // Ajouter la clé si elle n'existe pas
        newContent += `\nVITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`;
      }
      
      // Enregistrer les modifications
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fichier mis à jour avec succès: ${filePath}`);
    } else {
      console.log(`📝 Création du fichier: ${filePath}`);
      
      // Créer un nouveau fichier avec les variables Supabase
      fs.writeFileSync(filePath, baseEnvContent);
      console.log(`✅ Fichier créé avec succès: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Erreur lors de la mise à jour du fichier ${filePath}:`, err);
  }
}

// Mettre à jour tous les fichiers d'environnement
console.log('🚀 Début de la mise à jour des fichiers d\'environnement');

envFiles.forEach(envFile => {
  updateEnvFile(envFile);
});

console.log('✨ Mise à jour des fichiers d\'environnement terminée');

// Afficher un résumé des modifications
console.log('\n===== Résumé =====');
console.log(`URL Supabase: ${SUPABASE_URL}`);
console.log(`Clé anonyme: ${SUPABASE_ANON_KEY.substring(0, 10)}...${SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 10)}`);
console.log('================='); 