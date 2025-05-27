const fs = require('fs');

console.log('Variables d\'environnement pour Vercel:');
console.log('');

try {
  const envContent = fs.readFileSync('.env.production', 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    console.log(`${key} = ${value}`);
  });
} catch (error) {
  console.error('Erreur:', error.message);
} 