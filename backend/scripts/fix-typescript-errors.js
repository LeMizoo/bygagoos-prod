const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const BACKUP_DIR = path.join(__dirname, '../backup-typescript');

// Fonction pour sauvegarder un fichier
function backupFile(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  
  if (!fs.existsSync(path.dirname(backupPath))) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`✅ Backup: ${relativePath}`);
}

// Fonction pour corriger les erreurs d'import
function fixImportErrors(content) {
  // Remplacer les imports incorrects
  content = content.replace(
    /import\s*{\s*HTTP_STATUS\s*}\s*from\s*['"]\.\.\/\.\.\/core\/constants\/http\.constants['"]/g,
    'import { HTTP_STATUS } from \'../../core/constants/httpStatus\''
  );
  
  content = content.replace(
    /import\s*{\s*HTTP_STATUS\s*}\s*from\s*['"]\.\.\/core\/constants\/http\.constants['"]/g,
    'import { HTTP_STATUS } from \'../core/constants/httpStatus\''
  );
  
  return content;
}

// Fonction pour corriger les appels AppError
function fixAppErrorCalls(content) {
  // Remplacer les appels AppError avec 3 paramètres
  const appErrorRegex = /new\s+AppError\s*\(\s*['"]([^'"]+)['"]\s*,\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  content = content.replace(appErrorRegex, 'new AppError(\'$1\', $2)');
  
  return content;
}

// Fonction pour ajouter des annotations any temporaires
function addAnyAnnotations(content) {
  // Ajouter : any aux paramètres de constructeur dans les DTOs
  const constructorRegex = /constructor\s*\(\s*(\w+)\s*\)\s*{/g;
  content = content.replace(constructorRegex, 'constructor($1: any) {');
  
  return content;
}

// Fonction pour corriger les problèmes avec lean()
function fixLeanIssues(content) {
  // Ajouter un cast any après lean()
  const leanRegex = /\.lean\(\)(\.|;|\n)/g;
  content = content.replace(leanRegex, '.lean() as any$1');
  
  return content;
}

// Parcourir tous les fichiers TypeScript
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Appliquer les corrections
        content = fixImportErrors(content);
        content = fixAppErrorCalls(content);
        content = addAnyAnnotations(content);
        content = fixLeanIssues(content);
        
        // Sauvegarder si modifié
        if (content !== originalContent) {
          backupFile(filePath);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed: ${path.relative(SRC_DIR, filePath)}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  }
}

// Fonction principale
async function main() {
  console.log('🔧 Correction des erreurs TypeScript...\n');
  
  // Créer le dossier de backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Parcourir les fichiers
  walkDir(SRC_DIR);
  
  console.log('\n📦 Installation des types manquants...');
  try {
    execSync('npm install --save-dev @types/node @types/express @types/multer @types/bcrypt @types/jsonwebtoken @types/cors @types/helmet', 
      { stdio: 'inherit' }
    );
    console.log('✅ Types installés');
  } catch (error) {
    console.error('❌ Erreur installation types:', error.message);
  }
  
  console.log('\n🔍 Vérification TypeScript...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ Aucune erreur TypeScript détectée');
  } catch (error) {
    console.log('⚠️  Des erreurs persistent. Vérifiez manuellement.');
  }
  
  console.log('\n✨ Correction terminée!');
  console.log(`📁 Backup sauvegardé dans: ${BACKUP_DIR}`);
}

main().catch(console.error);