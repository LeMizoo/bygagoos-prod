const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const SITE_URL = 'https://bygagoos-ink.vercel.app';

async function scrapeSite() {
  console.log('Ì¥ç D√©but du scraping...');
  
  try {
    // R√©cup√©rer le HTML
    const { data } = await axios.get(SITE_URL);
    const $ = cheerio.load(data);
    
    // Extraire les donn√©es
    const extractedData = {
      url: SITE_URL,
      timestamp: new Date().toISOString(),
      title: $('title').text(),
      h1: $('h1').map((i, el) => $(el).text()).get(),
      h2: $('h2').map((i, el) => $(el).text()).get(),
      paragraphs: $('p').map((i, el) => $(el).text()).get().slice(0, 20),
      buttons: $('button, .btn, a[class*="btn"]').map((i, el) => $(el).text()).get(),
      metaDescription: $('meta[name="description"]').attr('content') || '',
    };
    
    // Sauvegarder dans un fichier JSON
    fs.writeFileSync('scraped-content.json', JSON.stringify(extractedData, null, 2));
    
    console.log('‚úÖ Scraping termin√© !');
    console.log('Ì≥Å Fichier cr√©√© : scraped-content.json');
    console.log(`Ì≥ä Donn√©es extraites :`);
    console.log(`- Titre : ${extractedData.title}`);
    console.log(`- H1 : ${extractedData.h1.length} trouv√©s`);
    console.log(`- Paragraphes : ${extractedData.paragraphs.length} extraits`);
    
  } catch (error) {
    console.error('‚ùå Erreur :', error.message);
  }
}

scrapeSite();
