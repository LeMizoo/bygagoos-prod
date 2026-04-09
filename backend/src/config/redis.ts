// backend/src/config/redis.ts

// Ce module existait avant l'introduction du client Redis avancé.
// Nous le conservons pour compatibilité, mais il redirige désormais vers le
// singleton `RedisClient` défini dans `core/config/redis.config`.

import redisClient from '../core/config/redis.config';
import logger from '../core/utils/logger';

// NOTE: le client avancé gère déjà ses propres événements et la logique de
// reconnexion/fallback. Nous exposons simplement deux fonctions utilitaires
// par souci de rétrocompatibilité (utilisées auparavant dans `index.ts`).

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('✅ connectRedis (wrapper) a démarré le client Redis avancé');
  } catch (error) {
    logger.error('❌ connectRedis erreur:', error);
    // on ne throw pas : l'app continue en mode dégradé si nécessaire
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.disconnect();
    logger.info('✅ disconnectRedis (wrapper) a fermé le client Redis');
  } catch (error) {
    logger.error('❌ disconnectRedis erreur:', error);
  }
};

export default redisClient;
