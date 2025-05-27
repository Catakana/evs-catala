// Script pour vérifier et corriger les textes du profil dans la TextBank
// Ce script peut être exécuté pour diagnostiquer les problèmes de TextBank

console.log('🔍 Vérification des textes du profil...');

// Liste des textes requis pour le profil
const requiredProfileTexts = [
  'profile.title',
  'profile.personalInfo',
  'profile.security',
  'profile.preferences',
  'profile.updatePersonalInfo',
  'profile.securitySettings',
  'profile.preferencesSettings',
  'profile.changeAvatar',
  'profile.saveChanges',
  'profile.phone',
  'profile.changePassword',
  'profile.updateSuccess',
  'profile.updateSuccessMessage',
  'profile.preferencesComingSoon'
];

// Vérifier si nous sommes dans un environnement Node.js ou navigateur
if (typeof window !== 'undefined') {
  // Environnement navigateur
  console.log('📱 Environnement navigateur détecté');
  
  // Vérifier si la fonction getText est disponible
  if (typeof window.getText === 'function') {
    console.log('✅ Fonction getText disponible');
    
    // Tester chaque texte requis
    requiredProfileTexts.forEach(textId => {
      const text = window.getText(textId);
      if (text === textId || text.includes('not found')) {
        console.error(`❌ Texte manquant: ${textId}`);
      } else {
        console.log(`✅ Texte trouvé: ${textId} = "${text}"`);
      }
    });
  } else {
    console.error('❌ Fonction getText non disponible dans window');
  }
} else {
  // Environnement Node.js
  console.log('🖥️ Environnement Node.js détecté');
  console.log('ℹ️ Ce script est conçu pour être exécuté dans le navigateur');
  console.log('ℹ️ Ouvrez la console du navigateur et collez ce script pour le tester');
}

// Instructions pour l'utilisateur
console.log(`
📋 Instructions de diagnostic :

1. Ouvrez la console du navigateur (F12)
2. Naviguez vers la page de profil
3. Collez ce script dans la console
4. Vérifiez les résultats

Si des textes sont manquants :
- Vérifiez que le fichier public/data/texts.fr.csv contient les textes
- Vérifiez que src/lib/textBank.ts contient les textes de fallback
- Rechargez la page avec Ctrl+F5 pour vider le cache

Textes requis pour le profil :
${requiredProfileTexts.map(id => `- ${id}`).join('\n')}
`);

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    requiredProfileTexts,
    checkProfileTexts: function(getTextFunction) {
      const results = {};
      requiredProfileTexts.forEach(textId => {
        const text = getTextFunction(textId);
        results[textId] = {
          found: text !== textId && !text.includes('not found'),
          value: text
        };
      });
      return results;
    }
  };
} 