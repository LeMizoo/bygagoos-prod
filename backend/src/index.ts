import dns from 'dns';
import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import redisClient from './core/config/redis.config';
import logger from './core/utils/logger';
import { AddressInfo } from 'net';

// Forcer les DNS publics
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Gestion des alertes de dépréciation
process.on('warning', (warning: Error) => {
  const warn = warning as Error & { code?: string };
  if (warn.name === 'DeprecationWarning' && warn.code === 'DEP0169') return;
  console.warn(warning);
});

const PORT = env.PORT;
let server: http.Server;
let redisConnected = false;

const startServer = async () => {
  try {
    await connectDatabase();
    
    try {
      await redisClient.connect();
      redisConnected = redisClient.isReady();
      logger.info('✅ Redis client avancé initialisé');
    } catch (redisError) {
      redisConnected = false;
      logger.warn('⚠️ Redis non disponible, mode dégradé activé:', redisError);
    }
    
    server = http.createServer(app);

    const desiredPort = Number(PORT);
    const fallbackPort = Number(env.FALLBACK_PORT) || desiredPort + 1;

    const listenOn = (port: number) =>
      new Promise<void>((resolve, reject) => {
        const onError = (err: Error) => {
          server.removeListener('listening', onListening);
          reject(err);
        };
        const onListening = () => {
          server.removeListener('error', onError);
          resolve();
        };
        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port);
      });

    try {
      await listenOn(desiredPort);
      logger.info(`🚀 Écoute sur le port ${desiredPort}`);
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      if (error.code === 'EADDRINUSE') {
        logger.warn(`⚠️ Port ${desiredPort} déjà utilisé, tentative sur ${fallbackPort}...`);
        await listenOn(fallbackPort);
        logger.info(`🚀 Écoute sur le port ${fallbackPort}`);
      } else {
        throw error;
      }
    }

    // Correction ESLint : Utilisation de AddressInfo au lieu de any
    const addr = server.address() as AddressInfo;
    const activePort = addr ? addr.port : desiredPort;

    logger.info(`
  🚀 Serveur démarré avec succès !
  ================================
  📡 Port: ${activePort}
  🌍 Environnement: ${env.NODE_ENV}
  🔗 URL: http://localhost:${activePort}
  📦 MongoDB: Connecté
  🧠 Redis: ${redisConnected ? 'Connecté' : 'Non connecté'}
  🎯 Design Listeners: Activés
  ================================
    `);

  } catch (error) {
    logger.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`👋 ${signal} reçu, arrêt en cours...`);
  
  const forceExit = setTimeout(() => {
    process.exit(1);
  }, 10000);

  if (server) {
    server.close(async () => {
      try {
        await redisClient.disconnect();
      } catch (err) {
        logger.error('Erreur fermeture Redis:', err);
      }
      clearTimeout(forceExit);
      process.exit(0);
    });
  } else {
    clearTimeout(forceExit);
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  logger.error('❌ Exception non capturée:', error);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error('❌ Rejet non géré:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();