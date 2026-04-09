const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du processus de correction...\n');

// Étape 1: Installer le plugin Prettier manquant
console.log('📦 Installation du plugin Prettier...');
try {
  execSync('npm install --save-dev eslint-plugin-prettier', { stdio: 'inherit' });
  console.log('✅ Plugin Prettier installé\n');
} catch (e) {
  console.log('⚠️  Erreur lors de l\'installation du plugin Prettier\n');
}

// Étape 2: Exécuter le script de correction
console.log('🔧 Exécution du script de correction...');
try {
  require('./fix-all-warnings.js');
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// Étape 3: Lancer ESLint pour voir les erreurs restantes
console.log('\n🔍 Analyse des problèmes restants...');
try {
  const output = execSync('npx eslint src --ext .ts', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log(output);
} catch (error) {
  // ESLint retourne un code d'erreur s'il y a des problèmes
  if (error.stdout) {
    console.log(error.stdout);
  } else {
    console.log(error.message);
  }
}

// Étape 4: Suggestions pour les corrections manuelles
console.log('\n📝 Prochaines étapes:');
console.log('1. Corrigez manuellement les 2 erreurs:');
console.log('   - src/modules/clients/client.controller.ts: ligne 9 (prettier/prettier)');
console.log('   - src/modules/users/user.model.ts: ligne 29 (no-empty-object-type)');
console.log('\n2. Pour la première erreur, exécutez:');
console.log('   npx prettier --write src/modules/clients/client.controller.ts');
console.log('\n3. Pour la seconde erreur, éditez le fichier et remplacez:');
console.log('   "interface IUser extends Document, {} {"');
console.log('   par:');
console.log('   "interface IUser extends Document {"');