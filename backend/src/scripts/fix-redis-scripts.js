const fs = require('fs');
const path = require('path');

const scriptsDir = __dirname;
const files = fs.readdirSync(scriptsDir);

files.forEach(file => {
  if (file.endsWith('.ts') && file !== 'fix-redis-scripts.js') {
    const tsPath = path.join(scriptsDir, file);
    const jsPath = path.join(scriptsDir, file.replace('.ts', '.js'));
    
    // Lire le contenu
    let content = fs.readFileSync(tsPath, 'utf8');
    
    // Remplacer les imports TypeScript par des requires
    content = content.replace(
      /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g,
      'const $1 = require(\'$2\');'
    );
    
    // Ajouter le try/catch pour les imports
    content = `try {
  ${content}
} catch (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}`;
    
    // Écrire le fichier JS
    fs.writeFileSync(jsPath, content);
    console.log(`✅ Converti: ${file} → ${file.replace('.ts', '.js')}`);
    
    // Optionnel: renommer le fichier TS en backup
    fs.renameSync(tsPath, tsPath.replace('.ts', '.ts.backup'));
  }
});

console.log('\n🎯 Conversion terminée!');
console.log('📁 Les fichiers .ts ont été convertis en .js et sauvegardés en .ts.backup');