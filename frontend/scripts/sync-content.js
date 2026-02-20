// frontend/scripts/sync-content.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

console.log('🚀 Synchronisation du contenu depuis Vercel...');

async function syncContent() {
  try {
    // Créer le dossier content
    const contentDir = join(process.cwd(), 'src', 'content');
    mkdirSync(contentDir, { recursive: true });
    
    // Télécharger la page d'accueil
    const { data } = await axios.get('https://bygagoos-ink.vercel.app');
    const $ = cheerio.load(data);
    
    // Extraire le contenu principal
    const content = {
      hero: {
        title: $('h1').first().text().trim() || 'ByGagoos-Ink',
        subtitle: $('h2, .subtitle, .hero p').first().text().trim() || 'Atelier artisanal familial'
      },
      sections: []
    };
    
    // Extraire les sections
    $('section, .section, main > div').each((i, el) => {
      const title = $(el).find('h2, h3').first().text().trim();
      const text = $(el).text().trim().substring(0, 300);
      
      if (title && text.length > 20) {
        content.sections.push({ title, text });
      }
    });
    
    // Sauvegarder
    writeFileSync(
      join(contentDir, 'home.json'),
      JSON.stringify(content, null, 2)
    );
    
    console.log(`✅ Contenu synchronisé: ${content.sections.length} sections`);
    console.log('📍 Fichier: src/content/home.json');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('📝 Utilisation du contenu par défaut...');
    
    // Contenu par défaut
    const defaultContent = {
      hero: {
        title: "ByGagoos-Ink",
        subtitle: "Atelier artisanal familial de sérigraphie malgache"
      },
      sections: [
        {
          title: "Notre Histoire",
          text: "Un atelier familial dédié à l'art de la sérigraphie et du tatouage traditionnel malgache."
        },
        {
          title: "Nos Créations",
          text: "Des designs uniques inspirés de la culture malgache, créés avec passion et expertise."
        }
      ]
    };
    
    const contentDir = join(process.cwd(), 'src', 'content');
    mkdirSync(contentDir, { recursive: true });
    writeFileSync(
      join(contentDir, 'home.json'),
      JSON.stringify(defaultContent, null, 2)
    );
  }
}

syncContent();