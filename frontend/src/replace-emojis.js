const fs = require('fs');
const path = require('path');

// Remplacements pour les emojis courants
const replacements = {
    '���': '<Palette className="h-5 w-5" />',
    '���‍���‍���‍���': '<Users className="h-5 w-5" />',
    '���': '<Sprout className="h-5 w-5" />',
    '���': '<Package className="h-5 w-5" />',
    '⚙️': '<Settings className="h-5 w-5" />',
    '���': '<Target className="h-5 w-5" />',
    '���': '<Rocket className="h-5 w-5" />',
    '✨': '<Sparkles className="h-5 w-5" />',
    '✓': '<Check className="h-5 w-5" />',
    '→': '<ArrowRight className="h-5 w-5" />',
    '���': '<Phone className="h-5 w-5" />',
    '���': '<Mail className="h-5 w-5" />',
    '���': '<MapPin className="h-5 w-5" />'
};

// Fonction pour remplacer dans un fichier
function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const [emoji, replacement] of Object.entries(replacements)) {
            if (content.includes(emoji)) {
                    content = content.replace(new RegExp(emoji, 'g'), replacement);
                    modified = true;
                    // Use dev-style logging only in scripts: keep console here but mark ESLint
                    console.log(`   Remplacé ${emoji} dans ${path.basename(filePath)}`);
                }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
    } catch (error) {
        console.error(`Erreur avec ${filePath}:`, error.message);
    }
    return false;
}

// Parcourir les fichiers .tsx et .ts
const files = [];
function walkDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
}

// Exécuter
/* eslint-disable no-console */
console.log('��� Recherche des emojis dans les fichiers...');
walkDir('.');

let count = 0;
for (const file of files) {
    if (replaceInFile(file)) {
        count++;
    }
}

console.log(`\n✅ ${count} fichiers modifiés sur ${files.length}`);
