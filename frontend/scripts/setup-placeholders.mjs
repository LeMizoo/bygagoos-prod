// frontend/scripts/setup-placeholders.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = [
  'public/placeholders/ink',
  'public/placeholders/trans',
  'public/placeholders/cda',
  'public/placeholders/home'
];

// Créer les dossiers
folders.forEach(folder => {
  const fullPath = path.join(__dirname, '..', folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Créé: ${folder}`);
  }
});

// Créer un fichier README pour guider l'admin
const readmeContent = `# 📸 Guide des images

## Comment remplacer les images

1. Placez vos images réelles dans les dossiers correspondants
2. Respectez les noms de fichiers indiqués ci-dessous
3. Formats acceptés: JPG, PNG, WebP
4. Taille recommandée: 1200x800px minimum

## Structure des images

### ByGagoos Ink (/ink/)
- service1.jpg - Service Sérigraphie
- service2.jpg - Service Design
- service3.jpg - Service Packaging
- gallery1.jpg à gallery6.jpg - Galerie

### ByGagoos Trans (/trans/)
- gallery1.jpg à gallery6.jpg - Galerie flotte
- excursion-bg.jpg - Bannière excursions

### ByGagoos CDA (/cda/)
- plat1.jpg à plat5.jpg - Photos des plats
- chef-bg.jpg - Bannière Chef d'un jour

### Page d'accueil (/home/)
- ink-card.jpg - Carte ByGagoos Ink
- trans-card.jpg - Carte ByGagoos Trans
- cda-card.jpg - Carte ByGagoos CDA
- gallery1.jpg à gallery3.jpg - Galerie univers

## Utilisation en production

Après avoir placé vos images, déployez normalement. Les placeholders seront automatiquement remplacés.
`;

const readmePath = path.join(__dirname, '..', 'public/placeholders', 'README.md');
fs.writeFileSync(readmePath, readmeContent);
console.log('✅ README créé dans public/placeholders/');

// Créer des fichiers .gitkeep pour garder les dossiers vides
folders.forEach(folder => {
  const gitkeepPath = path.join(__dirname, '..', folder, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
});
console.log('✅ Dossiers prêts. Placez vos images dans les dossiers correspondants.');