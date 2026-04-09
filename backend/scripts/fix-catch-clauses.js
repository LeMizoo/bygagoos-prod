// scripts/fix-catch-clauses.js

const fs = require('fs');
const path = require('path');

function fixCatchClauses(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Remplacer catch((error: Error) -> catch((error: unknown)
  content = content.replace(/catch\(\(error: Error\)/g, 'catch((error: unknown)');
  
  // Remplacer catch((err: Error) -> catch((err: unknown)
  content = content.replace(/catch\(\(err: Error\)/g, 'catch((err: unknown)');
  
  // Remplacer catch (error: Error) -> catch (error: unknown)
  content = content.replace(/catch \(error: Error\)/g, 'catch (error: unknown)');
  content = content.replace(/catch\(error: Error\)/g, 'catch(error: unknown)');
  
  // Ajouter la vérification instanceof si elle n'existe pas
  const lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('catch (error: unknown)') || lines[i].includes('catch((error: unknown)')) {
      // Vérifier si la ligne suivante a la vérification instanceof
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      
      if (j < lines.length && !lines[j].includes('instanceof Error')) {
        // Ajouter la vérification
        lines.splice(j, 0, '    if (error instanceof Error) {');
        lines.splice(j + 1, 0, '      return sendError(res, 500, error.message);');
        lines.splice(j + 2, 0, '    }');
        lines.splice(j + 3, 0, '    return sendError(res, 500, "Erreur inconnue");');
        modified = true;
        i = j + 4;
      }
    }
  }
  
  if (modified) {
    content = lines.join('\n');
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigé: ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('dist')) {
      fixedCount += walkDir(filePath);
    } else if (file.endsWith('.ts') && file.includes('controller')) {
      if (fixCatchClauses(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

console.log('🔧 Correction des catch clauses...');
const srcDir = path.join(__dirname, '../src');
const fixed = walkDir(srcDir);
console.log(`\n✅ ${fixed} fichiers corrigés.`);