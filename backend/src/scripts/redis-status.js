const { exec } = require('child_process');
const os = require('os');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkRedisWithCli() {
  return new Promise((resolve) => {
    exec('redis-cli ping', (error, stdout) => {
      if (!error && stdout && stdout.trim() === 'PONG') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

function getRedisInfo() {
  return new Promise((resolve) => {
    exec('redis-cli INFO all', (error, stdout) => {
      if (error) {
        resolve(null);
      } else {
        const info = {};
        stdout.split('\n').forEach(line => {
          if (line.includes(':')) {
            const [key, value] = line.split(':');
            info[key] = value;
          }
        });
        resolve(info);
      }
    });
  });
}

function checkDockerContainer() {
  return new Promise((resolve) => {
    exec('docker ps -a --filter "name=redis-bygagoos" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', (error, stdout) => {
      if (error || !stdout.includes('redis-bygagoos')) {
        resolve(null);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function main() {
  log('\n📊 === STATUT REDIS ===', colors.magenta);
  
  // Vérifier Redis natif
  const isRunning = await checkRedisWithCli();
  
  if (isRunning) {
    log('✅ Redis natif: EN COURS', colors.green);
    
    const info = await getRedisInfo();
    if (info) {
      log(`   Version: ${info.redis_version || 'N/A'}`, colors.cyan);
      log(`   Uptime: ${info.uptime_in_seconds || '0'} secondes`, colors.cyan);
      log(`   Connections: ${info.connected_clients || '0'}`, colors.cyan);
      log(`   Mémoire utilisée: ${info.used_memory_human || 'N/A'}`, colors.cyan);
    }
  } else {
    log('❌ Redis natif: ARRÊTÉ', colors.red);
  }
  
  // Vérifier Docker
  const dockerStatus = await checkDockerContainer();
  if (dockerStatus) {
    log('\n🐳 Docker:', colors.magenta);
    log(dockerStatus, colors.cyan);
  } else {
    log('\n🐳 Docker: Aucun conteneur Redis trouvé', colors.yellow);
  }
  
  log('\n📝 Commandes utiles:', colors.magenta);
  log('   npm run redis:start   - Démarrer Redis', colors.reset);
  log('   npm run redis:stop    - Arrêter Redis', colors.reset);
  log('   npm run dev:with-redis - Démarrer le backend avec Redis', colors.green);
}

main();