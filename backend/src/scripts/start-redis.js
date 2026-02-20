const { exec } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

function startRedis() {
  console.log('🚀 Démarrage de Redis...');

  if (isWindows) {
    // Windows - essayer Memurai d'abord, puis Docker
    exec('redis-cli ping', (error) => {
      if (!error) {
        console.log('✅ Redis (Memurai) déjà en cours d\'exécution');
        return;
      }

      console.log('🔄 Tentative de démarrage de Memurai...');
      exec('net start Memurai', (error) => {
        if (error) {
          console.log('❌ Memurai non installé, tentative avec Docker...');
          startRedisWithDocker();
        } else {
          console.log('✅ Memurai démarré');
        }
      });
    });
  } else {
    // Linux/Mac
    exec('redis-cli ping', (error) => {
      if (!error) {
        console.log('✅ Redis déjà en cours d\'exécution');
        return;
      }

      console.log('🔄 Tentative de démarrage de Redis...');
      exec('sudo service redis-server start', (error) => {
        if (error) {
          console.log('❌ Service Redis non disponible, tentative avec Docker...');
          startRedisWithDocker();
        } else {
          console.log('✅ Redis démarré');
        }
      });
    });
  }
}

function startRedisWithDocker() {
  exec('docker ps -a --format "{{.Names}}" | findstr redis-bygagoos', (error, stdout) => {
    if (stdout.includes('redis-bygagoos')) {
      console.log('🔄 Conteneur Redis existant trouvé, redémarrage...');
      exec('docker start redis-bygagoos', (error) => {
        if (error) {
          console.error('❌ Erreur au redémarrage du conteneur:', error.message);
        } else {
          console.log('✅ Conteneur Redis redémarré');
        }
      });
    } else {
      console.log('🐳 Création d\'un nouveau conteneur Redis...');
      exec('docker run -d --name redis-bygagoos -p 6379:6379 redis:alpine', (error) => {
        if (error) {
          console.error('❌ Erreur à la création du conteneur:', error.message);
          console.log('⚠️ Démarrage sans Redis (mode dégradé)');
        } else {
          console.log('✅ Conteneur Redis créé et démarré');
        }
      });
    }
  });
}

// Vérifier si Docker est installé
exec('docker --version', (error) => {
  if (error) {
    console.log('⚠️ Docker non installé, mode dégradé uniquement');
    console.log('ℹ️ Les fonctionnalités Redis ne seront pas disponibles');
  } else {
    startRedis();
  }
});