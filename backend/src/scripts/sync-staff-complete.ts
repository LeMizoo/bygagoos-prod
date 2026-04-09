// backend/src/scripts/find-paths.ts
import fs from 'fs';
import path from 'path';

function findFiles(pattern: string, baseDir: string): string[] {
  const results: string[] = [];
  
  function search(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        search(fullPath);
      } else if (file.match(pattern)) {
        results.push(fullPath);
      }
    }
  }
  
  search(baseDir);
  return results;
}

const backendDir = path.join(__dirname, '..');

console.log('🔍 Recherche des fichiers de modèles User...');
const userFiles = findFiles('user.*model.*\.ts', backendDir);
userFiles.forEach(file => {
  console.log(`📄 ${file}`);
  // Lire le contenu pour voir les exports
  const content = fs.readFileSync(file, 'utf8');
  const exportLines = content.match(/export (default )?(\w+)/g);
  if (exportLines) {
    console.log('   Exports:', exportLines.join(', '));
  }
});

console.log('\n🔍 Recherche des fichiers de rôles...');
const roleFiles = findFiles('.*role.*\.ts', backendDir);
roleFiles.forEach(file => {
  console.log(`📄 ${file}`);
});