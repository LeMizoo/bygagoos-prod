// frontend/scripts/generate-icons-simple.js
import { writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🎨 Création des icônes PWA simples...');

// Créer une icône SVG simple pour PWA
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#1e40af"/>
  <circle cx="96" cy="96" r="60" fill="#ffffff"/>
  <text x="96" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#1e40af">B</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1e40af"/>
  <circle cx="256" cy="256" r="160" fill="#ffffff"/>
  <text x="256" y="290" text-anchor="middle" font-family="Arial, sans-serif" font-size="140" font-weight="bold" fill="#1e40af">B</text>
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#1e40af"/>
  <circle cx="16" cy="16" r="10" fill="#ffffff"/>
  <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e40af">B</text>
</svg>`;

// Sauvegarder les fichiers
writeFileSync('public/icon-192.svg', svg192);
writeFileSync('public/icon-512.svg', svg512);
writeFileSync('public/favicon.svg', favicon);

// Créer un logo simple si besoin
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1e40af"/>
  <circle cx="100" cy="100" r="65" fill="#ffffff"/>
  <text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#1e40af">B</text>
</svg>`;

writeFileSync('public/logo.svg', logo);

console.log('✅ Icônes SVG générées !');
console.log('📁 Fichiers créés:');
console.log('   - public/icon-192.svg');
console.log('   - public/icon-512.svg');
console.log('   - public/favicon.svg');
console.log('   - public/logo.svg');