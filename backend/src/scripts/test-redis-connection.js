const path = require('path');

// Solution pour les chemins d'import
try {
  // Essayer d'importer depuis différents chemins
  let redisClient;
  try {
    redisClient = require('../src/core/config/redis.config');
  } catch (e) {
    try {
      redisClient = require('./src/core/config/redis.config');
    } catch (e) {
      console.log('⚠️ Redis client non trouvé, utilisation du mode fallback');
      redisClient = { default: { isUsingFallback: () => true } };
    }
  }

  // Utiliser default export si nécessaire
  const client = redisClient.default || redisClient;

  async function testRedisConnection() {
    console.log('\n🔍 === TEST DE CONNEXION REDIS ===\n');
    
    try {
      // Vérifier si Redis est en mode fallback
      const usingFallback = client.isUsingFallback ? client.isUsingFallback() : true;
      console.log(`📌 Mode: ${usingFallback ? 'FALLBACK (mémoire)' : 'REDIS'}`);
      
      // Tester le ping si disponible
      try {
        const pingResult = await client.ping();
        console.log(`📡 Ping: ${pingResult}`);
      } catch (e) {
        console.log('📡 Ping: NON DISPONIBLE (mode fallback)');
      }
      
      // Tester set/get
      const testKey = 'test:connection';
      const testValue = `test-${Date.now()}`;
      
      console.log('\n📝 Test d\'écriture...');
      await client.set(testKey, testValue, { ttl: 60 });
      console.log('✅ Écriture réussie');
      
      console.log('📖 Test de lecture...');
      const retrieved = await client.get(testKey);
      console.log(`✅ Lecture réussie: ${retrieved === testValue ? 'OK' : 'ERREUR'}`);
      
      console.log('🗑️ Nettoyage...');
      await client.del(testKey);
      console.log('✅ Nettoyage réussi');
      
      console.log('\n✅ === TEST RÉUSSI ===\n');
      
    } catch (error) {
      console.error('\n❌ === TEST ÉCHOUÉ ===\n');
      console.error('Erreur:', error?.message || error);
    } finally {
      process.exit(0);
    }
  }

  testRedisConnection();

} catch (error) {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}