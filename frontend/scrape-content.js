// Script pour extraire le contenu du site Vercel
// Vous pouvez l'exécuter avec Node.js
const axios = require('axios');
const cheerio = require('cheerio');

const SITE_URL = 'https://bygagoos-ink.vercel.app';

async function scrapeSite() {
  try {
    const { data } = await axios.get(SITE_URL);
    const $ = cheerio.load(data);
    
    // Exemple: extraire le texte
    const pageTitle = $('h1').text();
    const paragraphs = [];
    
    $('p').each((i, el) => {
      paragraphs.push($(el).text());
    });
    
    console.log('Titre:', pageTitle);
    console.log('Paragraphes:', paragraphs.slice(0, 5));
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

scrapeSite();
