const { exec } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}[Redis]${colors.reset} ${message}`);
}

function stopRedisNative() {
  if (isWindows) {
    log('🪟 Arrêt de Memurai...', colors.cyan);
    exec('net stop Memurai', (error) => {
      if (error) {
        log(`ℹ️  Memurai peut déjà être arrêté: ${error.message}`, colors.yellow);
      } else {
        log('✅ Memurai arrêté avec succès', colors.green);
      }
    });
  } else if (isMac) {
    log('🍏 Arrêt de Redis (Homebrew)...', colors.cyan);
    exec('brew services stop redis', (error) => {
      if (error) {
        log(`ℹ️  Redis peut déjà être arrêté: ${error.message}`, colors.yellow);
      } else {
        log('✅ Redis arrêté avec succès', colors.green);
      }
    });
  } else if (isLinux) {
    log('🐧 Arrêt de Redis (systemd)...', colors.cyan);
    exec('sudo service redis-server stop', (error) => {
      if (error) {
        exec('sudo systemctl stop redis', (error) => {
          if (error) {
            log(`ℹ️  Redis peut déjà être arrêté: ${error.message}`, colors.yellow);
          } else {
            log('✅ Redis arrêté avec succès', colors.green);
          }
        });
      } else {
        log('✅ Redis arrêté avec succès', colors.green);
      }
    });
  }
}

function stopRedisDocker() {
  log('🐳 Arrêt du conteneur Docker...', colors.cyan);
  exec('docker stop redis-bygagoos', (error) => {
    if (error) {
      log(`ℹ️  Conteneur Redis peut déjà être arrêté: ${error.message}`, colors.yellow);
    } else {
      log('✅ Conteneur Redis arrêté avec succès', colors.green);
    }
  });
}

function main() {
  log('🛑 Arrêt de Redis...', colors.yellow);
  
  // Arrêter les deux possibilités
  stopRedisNative();
  stopRedisDocker();
  
  log('✅ Commande d\'arrêt exécutée', colors.green);
}

main();