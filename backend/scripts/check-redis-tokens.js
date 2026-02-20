// backend/scripts/check-redis-tokens.js
const redis = require('../src/config/redis').default;

async function checkTokens() {
  console.log('\nÌ¥ç V√âRIFICATION DES TOKENS DANS REDIS');
  console.log('=====================================\n');
  
  try {
    // Tester la connexion
    console.log('Ì≥° Test de connexion Redis...');
    await redis.ping();
    console.log('‚úÖ Redis connect√© avec succ√®s\n');
    
    // R√©cup√©rer toutes les cl√©s
    console.log('Ì≥ä Analyse des cl√©s Redis...');
    const keys = await redis.keys('*');
    console.log(`   Total cl√©s: ${keys.length}\n`);
    
    // Filtrer les refresh tokens
    const refreshKeys = keys.filter(k => k.includes('refresh_token:'));
    const blacklistKeys = keys.filter(k => k.includes('blacklist:'));
    
    console.log('Ì¥ë REFRESH TOKENS:');
    console.log('------------------');
    
    if (refreshKeys.length === 0) {
      console.log('‚ùå Aucun refresh token trouv√© dans Redis !');
      console.log('Ì±â Personne n\'est connect√© actuellement');
      console.log('Ì±â Ou les tokens ont expir√© (7 jours)\n');
    } else {
      console.log(`‚úÖ ${refreshKeys.length} refresh tokens trouv√©s :\n`);
      
      for (const key of refreshKeys) {
        const ttl = await redis.ttl(key);
        const data = await redis.get(key);
        
        try {
          const tokenData = JSON.parse(data);
          const tokenShort = key.substring(14, 34) + '...';
          
          console.log(`   Ì≥å Token: ${tokenShort}`);
          console.log(`      Ì±§ User ID: ${tokenData.userId}`);
          console.log(`      ‚è∞ Expire dans: ${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m`);
          console.log(`      ‚úÖ Valide: ${tokenData.isValid ? 'Oui' : 'Non'}`);
          console.log(`      Ì≥Ö Cr√©√© le: ${new Date(tokenData.createdAt).toLocaleString()}`);
          
          if (tokenData.lastUsedAt) {
            console.log(`      Ì¥Ñ Derni√®re utilisation: ${new Date(tokenData.lastUsedAt).toLocaleString()}`);
          }
          
          console.log('');
        } catch (e) {
          // Ancien format (simple string)
          console.log(`   Ì≥å Token (ancien format): ${key.substring(14, 34)}...`);
          console.log(`      Ì±§ User ID: ${data}`);
          console.log(`      ‚è∞ Expire dans: ${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m`);
          console.log('');
        }
      }
    }
    
    // Afficher les tokens blacklist√©s
    if (blacklistKeys.length > 0) {
      console.log('‚ö†Ô∏è TOKENS BLACKLIST√âS:');
      console.log('---------------------');
      console.log(`   ${blacklistKeys.length} tokens r√©voqu√©s\n`);
    }
    
    // Statistiques
    console.log('Ì≥à STATISTIQUES:');
    console.log('---------------');
    console.log(`   ‚Ä¢ Tokens actifs: ${refreshKeys.length}`);
    console.log(`   ‚Ä¢ Tokens r√©voqu√©s: ${blacklistKeys.length}`);
    console.log(`   ‚Ä¢ Total en m√©moire: ${keys.length} cl√©s\n`);
    
  } catch (error) {
    console.error('‚ùå Erreur Redis:', error);
  } finally {
    await redis.quit();
    console.log('Ì±ã V√©rification termin√©e\n');
  }
}

checkTokens();
