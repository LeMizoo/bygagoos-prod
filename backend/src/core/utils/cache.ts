import { env } from '../../config/env';
import logger from './logger';
import redisClient from '../config/redis.config';

/**
 * Objet simple de cache autour du client Redis (ou fallback interne).
 * Fournit des fonctions get/set/del avec sérialisation JSON et TTL par défaut.
 */

interface CacheOptions {
  ttl?: number; // en secondes
}

export const setCache = async <T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> => {
  if (!env.REDIS_CACHE_ENABLED) return;

  try {
    const payload = JSON.stringify(value);
    const ttl = options.ttl ?? env.REDIS_CACHE_TTL;

    // la méthode `set` du client avancé gère TTL si on le fournit
    await redisClient.set(key, payload, { ttl });
    logger.debug(`🧠 Cache set for key=${key} ttl=${ttl}s`);
  } catch (err) {
    logger.error(`❌ Error setting cache for ${key}:`, err);
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!env.REDIS_CACHE_ENABLED) return null;

  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    logger.debug(`🧠 Cache hit for key=${key}`);
    return JSON.parse(data);
  } catch (err) {
    logger.error(`❌ Error getting cache for ${key}:`, err);
    return null;
  }
};

export const delCache = async (key: string): Promise<void> => {
  if (!env.REDIS_CACHE_ENABLED) return;

  try {
    await redisClient.del(key);
    logger.debug(`🧠 Cache deleted for key=${key}`);
  } catch (err) {
    logger.error(`❌ Error deleting cache for ${key}:`, err);
  }
};
