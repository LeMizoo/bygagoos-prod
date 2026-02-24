// backend/src/config/redis.ts

import { createClient } from 'redis';
import logger from '../core/utils/logger';

// =============================
// CONFIGURATION REDIS
// =============================

// À CHANGER : Utilise process.env pour l'URL (plus sécurisé)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const useTLS = process.env.REDIS_TLS === 'true' || redisUrl.startsWith('rediss://');

const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: useTLS,
    rejectUnauthorized: false, // utile pour les certificats Upstash
  },
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
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('✅ Redis connecté avec succès');
    }
  } catch (error) {
    logger.error('❌ Erreur connexion Redis:', error);
    // IMPORTANT : On ne relance pas l'erreur pour permettre au serveur de démarrer
    logger.warn('⚠️ Le serveur continue sans Redis (mode dégradé)');
  }
};

// =============================
// DECONNEXION
// =============================
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('✅ Redis déconnecté proprement');
    }
  } catch (error) {
    logger.error('❌ Erreur déconnexion Redis:', error);
  }
};

export default redisClient;