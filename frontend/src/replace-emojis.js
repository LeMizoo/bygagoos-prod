const fs = require('fs');
const path = require('path');

// Remplacements pour les emojis courants
const replacements = {
    'Ìæ®': '<Palette className="h-5 w-5" />',
    'Ì±®‚ÄçÌ±©‚ÄçÌ±ß‚ÄçÌ±¶': '<Users className="h-5 w-5" />',
    'Ìº±': '<Sprout className="h-5 w-5" />',
    'Ì≥¶': '<Package className="h-5 w-5" />',
    '‚öôÔ∏è': '<Settings className="h-5 w-5" />',
    'ÌæØ': '<Target className="h-5 w-5" />',
    'Ì∫Ä': '<Rocket className="h-5 w-5" />',
    '‚ú®': '<Sparkles className="h-5 w-5" />',
    '‚úì': '<Check className="h-5 w-5" />',
    '‚Üí': '<ArrowRight className="h-5 w-5" />',
    'Ì≥û': '<Phone className="h-5 w-5" />',
    'Ì≥ß': '<Mail className="h-5 w-5" />',
    'Ì≥ç': '<MapPin className="h-5 w-5" />'
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
                console.log(`   Remplac√© ${emoji} dans ${path.basename(filePath)}`);
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

// Ex√©cuter
console.log('Ì¥ç Recherche des emojis dans les fichiers...');
walkDir('.');

let count = 0;
for (const file of files) {
    if (replaceInFile(file)) {
        count++;
    }
}

console.log(`\n‚úÖ ${count} fichiers modifi√©s sur ${files.length}`);
