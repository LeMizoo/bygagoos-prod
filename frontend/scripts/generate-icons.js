// frontend/scripts/generate-icons.js
import { writeFileSync } from 'fs';
import { createCanvas } from 'canvas';

console.log('🎨 Génération des icônes PWA...');

const sizes = [192, 512];
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fond bleu ByGagoos
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(0, 0, size, size);
  
  // Cercle blanc
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // Lettre B
  ctx.fillStyle = '#1e40af';
  ctx.font = `bold ${size * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size/2, size/2);
  
  // Sauvegarder
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(`public/icon-${size}.png`, buffer);
  console.log(`✅ Icône ${size}x${size} générée`);
});

console.log('✨ Toutes les icônes PWA générées !');