// analyze-project.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 ANALYSE COMPLÈTE DU PROJET BYGAGOOS PROD\n');

// 1. Structure des dossiers
console.log('📁 STRUCTURE DU PROJET:');
const structure = [
  'backend/src/modules/',
  'frontend/src/pages/',
  'frontend/src/components/',
  'frontend/src/api/',
  'frontend/src/types/'
];
structure.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    console.log(`  ${dir}: ${files.length} éléments`);
  }
});

// 2. Comptage des fichiers
console.log('\n📄 STATISTIQUES:');
const counts = {
  backend: fs.readdirSync('backend/src', { recursive: true }).filter(f => f.endsWith('.ts')).length,
  frontend: fs.readdirSync('frontend/src', { recursive: true }).filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).length,
  models: fs.readdirSync('backend/src/modules', { recursive: true }).filter(f => f.includes('.model.')).length,
  routes: fs.readdirSync('backend/src/modules', { recursive: true }).filter(f => f.includes('.routes.')).length,
};
console.log(`  Fichiers backend: ${counts.backend}`);
console.log(`  Fichiers frontend: ${counts.frontend}`);
console.log(`  Modèles Mongoose: ${counts.models}`);
console.log(`  Routes API: ${counts.routes}`);

// 3. Modules et endpoints
console.log('\n🌐 MODULES DÉTECTÉS:');
const modules = ['auth', 'users', 'staff', 'clients', 'designs', 'orders', 'dashboard', 'upload', 'taxi', 'restaurant', 'forms', 'settings'];
modules.forEach(mod => {
  const modPath = `backend/src/modules/${mod}`;
  if (fs.existsSync(modPath)) {
    console.log(`  ✅ ${mod}`);
  } else {
    console.log(`  ❌ ${mod} (manquant)`);
  }
});

console.log('\n✅ Analyse terminée');