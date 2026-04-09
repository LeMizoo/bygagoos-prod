// backend/src/scripts/check-paths.ts
import fs from 'fs';
import path from 'path';

const pathsToCheck = [
  '../modules/users/user.model',
  '../core/constants/userRoles',
  '../modules/staff/staff.model'
];

function checkPath(relativePath: string) {
  const absolutePath = path.resolve(__dirname, relativePath);
  const possibleExtensions = ['.ts', '.js', '.d.ts', ''];
  
  for (const ext of possibleExtensions) {
    const fullPath = absolutePath + ext;
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${relativePath}${ext} existe`);
      
      // Lire le fichier pour voir les exports
      if (ext === '.ts') {
        const content = fs.readFileSync(fullPath, 'utf8');
        const exports = content.match(/export (?:class|interface|type|const|let|function|enum) (\w+)/g);
        if (exports) {
          console.log('   Exports trouvés:');
          exports.forEach(e => console.log(`   - ${e}`));
        }
      }
      return true;
    }
  }
  
  console.log(`❌ ${relativePath} introuvable`);
  return false;
}

console.log('🔍 Vérification des chemins d\'import...\n');
pathsToCheck.forEach(checkPath);