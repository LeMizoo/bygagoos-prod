const fs = require('fs');
const path = require('path');

// Lire le contenu scrap√©
const scrapedData = JSON.parse(fs.readFileSync('scraped-content.json', 'utf8'));

console.log('Ì¥Ñ D√©but du remplacement de contenu...');

// 1. HomePage.tsx
console.log('Ì≥Ñ Mise √† jour de HomePage.tsx...');
try {
  const homePagePath = path.join('src', 'pages', 'HomePage.tsx');
  let homeContent = fs.readFileSync(homePagePath, 'utf8');
  
  // Remplacer le titre (exemple)
  if (scrapedData.h1[0]) {
    homeContent = homeContent.replace(
      /<h1 className="[^"]*">[^<]*<\/h1>/,
      `<h1 className="text-5xl font-bold text-gray-900 mb-6">${scrapedData.h1[0]}</h1>`
    );
  }
  
  fs.writeFileSync(homePagePath, homeContent);
  console.log('‚úÖ HomePage.tsx mis √† jour');
} catch (error) {
  console.log('‚ö†Ô∏è  HomePage.tsx non trouv√© ou erreur');
}

// 2. AboutPage.tsx
console.log('Ì≥Ñ Mise √† jour de AboutPage.tsx...');
try {
  const aboutPagePath = path.join('src', 'pages', 'AboutPage.tsx');
  let aboutContent = fs.readFileSync(aboutPagePath, 'utf8');
  
  // Ajouter le titre scrap√©
  if (scrapedData.h2[0]) {
    aboutContent = aboutContent.replace(
      /Notre Histoire Familiale/,
      scrapedData.h2[0]
    );
  }
  
  fs.writeFileSync(aboutPagePath, aboutContent);
  console.log('‚úÖ AboutPage.tsx mis √† jour');
} catch (error) {
  console.log('‚ö†Ô∏è  AboutPage.tsx non trouv√© ou erreur');
}

console.log('Ìæâ Remplacement termin√© !');
console.log('Ì≤° Conseil : V√©rifiez manuellement les fichiers pour les ajustements finaux.');
