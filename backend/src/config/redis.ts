// backend/src/config/redis.ts

import { createClient } from 'redis';
import logger from '../core/utils/logger';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

// =============================
// EVENTS
// =============================

redisClient.on('error', (err) => {
  logger.error('❌ Erreur Redis:', err);
});

redisClient.on('connect', () => {
  logger.info('🔌 Connexion Redis en cours...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis prêt');
});

redisClient.on('end', () => {
  logger.warn('⚠️ Connexion Redis fermée');
});

// =============================
// CONNEXION
// =============================

export const connectRedis = async (): Promise<void> => {
  try {
    // Évite l’erreur "The client is closed"
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('✅ Redis connecté avec succès');
    }
  } catch (error) {
    logger.error('❌ Erreur connexion Redis:', error);
    // Redis est optionnel → on continue sans crash
  }
};

// =============================
// DECONNEXION
// =============================

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit(); // plus propre que disconnect()
      logger.info('✅ Redis déconnecté proprement');
    }
  } catch (error) {
    logger.error('❌ Erreur déconnexion Redis:', error);
  }
};

export default redisClient;
