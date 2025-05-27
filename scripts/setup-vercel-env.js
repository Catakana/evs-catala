/**
 * Script pour configurer les variables d'environnement sur Vercel
 * Usage: node scripts/setup-vercel-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration des variables d\'environnement pour Vercel...');

// Lire le fichier .env.production
const envProductionPath = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envProductionPath)) {
  console.error('❌ Fichier .env.production non trouvé');
  process.exit(1);
}

const envContent = fs.readFileSync(envProductionPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

console.log('📋 Variables trouvées dans .env.production:');
envLines.forEach(line => {
  const [key] = line.split('=');
  console.log(`  - ${key}`);
});

console.log('\n🚀 Commandes Vercel CLI à exécuter:');
console.log('   (Assurez-vous d\'avoir installé Vercel CLI: npm i -g vercel)');
console.log('');

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  console.log(`vercel env add ${key} production`);
  console.log(`# Valeur: ${value}`);
  console.log('');
});

console.log('📝 Ou utilisez le dashboard Vercel:');
console.log('   1. Allez sur https://vercel.com/dashboard');
console.log('   2. Sélectionnez votre projet');
console.log('   3. Allez dans Settings > Environment Variables');
console.log('   4. Ajoutez les variables suivantes:');
console.log('');

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  console.log(`   ${key} = ${value}`);
});

console.log('\n✅ Configuration terminée'); 