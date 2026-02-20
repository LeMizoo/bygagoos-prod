const { exec } = require('child_process');
const os = require('os');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getRedisVersion() {
  return new Promise((resolve) => {
    exec('redis-server --version', (error, stdout) => {
      if (error) {
        resolve(null);
      } else {
        const match = stdout.match(/v=(\d+\.\d+\.\d+)/);
        resolve(match ? match[1] : 'inconnue');
      }
    });
  });
}

function getDockerInfo() {
  return new Promise((resolve) => {
    exec('docker ps --filter "name=redis-bygagoos" --format "{{.Status}}"', (error, stdout) => {
      if (error || !stdout) {
        resolve(null);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function checkRedisConnection() {
  return new Promise((resolve) => {
    exec('redis-cli ping', (error, stdout) => {
      resolve(!error && stdout && stdout.trim() === 'PONG');
    });
  });
}

async function main() {
  log('\n🔍 === INFORMATIONS REDIS ===', colors.magenta);
  
  // Informations système
  log(`\n📌 Système: ${os.platform()} ${os.release()}`, colors.cyan);
  log(`📌 Architecture: ${os.arch()}`, colors.cyan);
  
  // Version Redis
  const version = await getRedisVersion();
  if (version) {
    log(`\n📦 Redis version: ${version}`, colors.green);
  } else {
    log(`\n📦 Redis: Non installé localement`, colors.yellow);
  }
  
  // Connexion Redis
  const isConnected = await checkRedisConnection();
  if (isConnected) {
    log(`🔌 Connexion: ${isConnected ? '✅ Active' : '❌ Inactive'}`, colors.green);
    
    // Obtenir plus d'infos
    exec('redis-cli INFO server | grep -E "redis_version|uptime_in_seconds|connected_clients"', (error, stdout) => {
      if (!error && stdout) {
        log('\n📊 Statistiques:', colors.cyan);
        stdout.split('\n').forEach(line => {
          if (line.trim()) {
            log(`  ${line}`, colors.reset);
          }
        });
      }
    });
  } else {
    log(`🔌 Connexion: ❌ Aucune connexion Redis`, colors.red);
  }
  
  // Info Docker
  const dockerStatus = await getDockerInfo();
  if (dockerStatus) {
    log(`\n🐳 Docker: ${dockerStatus}`, colors.green);
  }
  
  // Commandes utiles
  log('\n💡 Commandes utiles:', colors.yellow);
  log('  npm run redis:start   - Démarrer Redis', colors.reset);
  log('  npm run redis:stop    - Arrêter Redis', colors.reset);
  log('  npm run redis:status  - Voir le statut', colors.reset);
  log('  npm run redis:monitor - Monitorer Redis', colors.reset);
  log('  npm run dev:with-redis - Démarrer avec Redis', colors.green);
  
  log('\n✅ === FIN ===\n', colors.magenta);
}

main();