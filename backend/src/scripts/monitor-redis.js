const redisClient = require('../src/core/config/redis.config').default;

async function monitorRedis() {
  console.log('\n📊 === MONITORING REDIS ===\n');
  
  try {
    const client = redisClient.getClient?.() || null;
    
    if (!client) {
      console.log('ℹ️ Redis en mode fallback ou non connecté');
      return;
    }
    
    const info = await client.info('all');
    const stats = {};
    
    info.split('\n').forEach((line) => {
      if (line.startsWith('redis_version:')) stats.version = line.split(':')[1];
      if (line.startsWith('uptime_in_seconds:')) stats.uptime = parseInt(line.split(':')[1] || '0');
      if (line.startsWith('connected_clients:')) stats.connectedClients = parseInt(line.split(':')[1] || '0');
      if (line.startsWith('used_memory_human:')) stats.usedMemory = line.split(':')[1];
      if (line.startsWith('total_commands_processed:')) stats.totalCommands = parseInt(line.split(':')[1] || '0');
    });
    
    console.log('📌 Informations Redis:\n');
    console.log(`  Version: ${stats.version || 'N/A'}`);
    console.log(`  Uptime: ${stats.uptime || 0} secondes`);
    console.log(`  Clients connectés: ${stats.connectedClients || 0}`);
    console.log(`  Mémoire utilisée: ${stats.usedMemory || 'N/A'}`);
    
    const keys = await client.keys(`${process.env.REDIS_KEY_PREFIX || 'bygagoos:'}*`);
    console.log(`\n🔑 Total clés: ${keys.length}`);
    
  } catch (error) {
    console.error('❌ Erreur de monitoring:', error.message || error);
  } finally {
    console.log('\n📊 === FIN MONITORING ===\n');
  }
}

monitorRedis();