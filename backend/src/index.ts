import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import logger from './core/utils/logger';
import http from 'http';

const PORT = env.PORT;
let server: http.Server;
let redisConnected = false; // Variable pour suivre l'état Redis

const startServer = async () => {
  try {
    // Connexion MongoDB
    await connectDatabase();
    
    // Connexion Redis (non bloquante en dev si Redis n'est pas disponible)
    try {
      await connectRedis();
      redisConnected = true; // Redis connecté avec succès
      logger.info('✅ Redis connecté avec succès');
    } catch (redisError) {
      redisConnected = false; // Redis non connecté
      logger.warn('⚠️ Redis non disponible, fonctionnement en mode dégradé:', redisError);
    }
    
    // Création serveur HTTP explicite
    server = http.createServer(app);
    
    server.listen(PORT, () => {
      logger.info(`
🚀 Serveur démarré avec succès !
================================
📡 Port: ${PORT}
🌍 Environnement: ${env.NODE_ENV}
🔗 URL: http://localhost:${PORT}
📦 MongoDB: Connecté
🧠 Redis: ${redisConnected ? 'Connecté' : 'Non connecté (mode dégradé)'}
🔐 JWT: ${env.JWT_ACCESS_EXPIRES_IN} / ${env.JWT_REFRESH_EXPIRES_IN}
📤 Upload: ${env.MAX_FILE_SIZE / 1024 / 1024}MB max
================================
      `);
    });

    // Gestion des erreurs du serveur
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} déjà utilisé`);
        process.exit(1);
      } else {
        logger.error('❌ Erreur serveur:', error);
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
};

// ==================== SHUTDOWN PROPRE ====================
const gracefulShutdown = async (signal: string) => {
  logger.info(`👋 ${signal} reçu, arrêt gracieux en cours...`);
  
  // Timeout de sécurité
  const forceExit = setTimeout(() => {
    logger.error('⏰ Arrêt forcé après délai');
    process.exit(1);
  }, 10000);

  if (server) {
    server.close(async () => {
      logger.info('🛑 Serveur HTTP fermé');
      
      try {
        await disconnectRedis();
        logger.info('🧠 Redis déconnecté');
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

// Gestion des signaux
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Gestion des exceptions non capturées
process.on('uncaughtException', (error) => {
  logger.error('❌ Exception non capturée:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Rejet non géré:', reason);
  gracefulShutdown('unhandledRejection');
});

// ==================== START ====================
startServer();