const fs = require('fs');
const path = require('path');

// Patterns spécifiques à corriger
const replacements = [
  // 1. Corriger les retours de type Promise<any> dans les contrôleurs
  {
    pattern: /Promise<any>/g,
    replacement: 'Promise<Response>'
  },
  
  // 2. Corriger les paramètres de type any dans les fonctions middleware
  {
    pattern: /err: any/g,
    replacement: 'err: Error'
  },
  {
    pattern: /error: any/g,
    replacement: 'error: Error'
  },
  {
    pattern: /req: any/g,
    replacement: 'req: Request'
  },
  {
    pattern: /res: any/g,
    replacement: 'res: Response'
  },
  
  // 3. Corriger les déclarations de variables avec any
  {
    pattern: /: any =/g,
    replacement: ': unknown ='
  },
  {
    pattern: /: any\)/g,
    replacement: ': unknown)'
  },
  {
    pattern: /: any,/g,
    replacement: ': unknown,'
  },
  {
    pattern: /: any;/g,
    replacement: ': unknown;'
  },
  
  // 4. Corriger les paramètres de catch
  {
    pattern: /\.catch\(\((err|error)\) =>/g,
    replacement: '.catch(($1: Error) =>'
  },
  
  // 5. Ajouter des imports manquants
  {
    pattern: /^((?!import.*Response).)*$/,
    isImportRule: true,
    checkFile: (content) => {
      return content.includes('Promise<Response>') && 
             !content.includes('import { Response }') && 
             !content.includes('from \'express\'');
    },
    transform: (content) => {
      return `import { Response } from 'express';\n${content}`;
    }
  },
  {
    pattern: /^((?!import.*Request).)*$/,
    isImportRule: true,
    checkFile: (content) => {
      return content.includes('req: Request') && 
             !content.includes('import { Request }') && 
             !content.includes('from \'express\'');
    },
    transform: (content) => {
      return `import { Request } from 'express';\n${content}`;
    }
  }
];

// Traitement spécial pour les fichiers spécifiques
const specialFixes = {
  // Correction pour user.model.ts - ligne 29 ({} vide)
  'src/modules/users/user.model.ts': (content) => {
    return content.replace(
      /interface IUser extends Document, \{\} \{/,
      'interface IUser extends Document {'
    );
  },
  
  // Correction pour cloudinary.ts
  'src/utils/cloudinary.ts': (content) => {
    // Remplacer les types any par des types plus spécifiques
    content = content.replace(
      /transformation\?: Array<any>/g,
      'transformation?: Array<Record<string, unknown>>'
    );
    content = content.replace(
      /transformations\?: Record<string, any>/g,
      'transformations?: Record<string, unknown>'
    );
    return content;
  },
  
  // Correction pour les fichiers .d.ts
  'src/types/express.d.ts': (content) => {
    return content.replace(/user\?: any;/g, 'user?: unknown;');
  },
  
  'src/types/redis.d.ts': (content) => {
    content = content.replace(/get: any;/g, 'get: (key: string) => Promise<string | null>;');
    content = content.replace(/set: any;/g, 'set: (key: string, value: string, mode?: string, duration?: number) => Promise<unknown>;');
    return content;
  }
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let modified = false;
  
  // Appliquer les remplacements standards
  for (const rule of replacements) {
    if (rule.isImportRule) {
      if (rule.checkFile(content)) {
        content = rule.transform(content);
        modified = true;
        console.log(`  ➕ Ajout d'import dans ${path.basename(filePath)}`);
      }
    } else {
      const newContent = content.replace(rule.pattern, rule.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`  🔧 Correction dans ${path.basename(filePath)}: ${rule.pattern.source}`);
      }
    }
  }
  
  // Appliquer les corrections spéciales
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (specialFixes[relativePath]) {
    const newContent = specialFixes[relativePath](content);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      console.log(`  ⚡ Correction spéciale pour ${path.basename(filePath)}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
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
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    } else if (file.endsWith('.d.ts')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

// Commencer depuis le dossier src
const srcDir = path.join(__dirname, '../src');
console.log('🔍 Recherche des fichiers TypeScript à corriger...');
console.log('📂 Dossier:', srcDir);

try {
  const fixed = walkDir(srcDir);
  console.log(`\n✅ ${fixed} fichiers ont été corrigés.`);
  
  if (fixed === 0) {
    console.log('⚠️  Aucun fichier n\'a été modifié.');
    console.log('   Les patterns de recherche ne correspondent peut-être pas exactement.');
    console.log('   Vérifiez manuellement les fichiers suivants:');
    console.log('   - src/modules/users/user.model.ts (ligne 29)');
    console.log('   - src/utils/cloudinary.ts (lignes 17, 86)');
    console.log('   - src/types/express.d.ts (ligne 17)');
    console.log('   - src/types/redis.d.ts (lignes 3, 15)');
  }
} catch (error) {
  console.error('❌ Erreur:', error.message);
}