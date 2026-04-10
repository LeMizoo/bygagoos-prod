import { createClient, RedisClientType } from 'redis';
import env from '../../config/env';
import logger from '../utils/logger';

interface RedisConfig {
  url: string;
  password?: string;
  socket?: {
    tls: true;
    rejectUnauthorized?: boolean;
    connectTimeout?: number;
  };
  database?: number;
}

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private useFallback: boolean = false;
  private fallbackStore: Map<string, { value: string; expiry?: number }> = new Map();
  
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly RECONNECT_DELAY = 1000;

  private constructor() {
    // Toujours essayer de se connecter à Redis, mais permettre le fallback
    this.initializeClient();
    this.setupEventHandlers();
  }

  private initializeClient(): void {
    const config: RedisConfig = {
      url: env.REDIS_URL || 'redis://localhost:6379',
      password: env.REDIS_PASSWORD || undefined
    };

    const useTLS = process.env.REDIS_TLS === 'true' || env.REDIS_TLS === true;
    
    if (useTLS) {
      config.socket = {
        tls: true,
        rejectUnauthorized: false,
        connectTimeout: 10000
      };
    }

    this.client = createClient(config);
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('error', (err) => {
      logger.error('❌ Redis Client Error:', err);
      this.isConnected = false;
      
      // Passer en mode fallback après échec de reconnexion
      if (!this.useFallback) {
        logger.warn('⚠️ Passage en mode fallback (stockage en mémoire)');
        this.useFallback = true;
        this.reconnectAttempts = 0; // Reset attempts
      }
    });

    this.client.on('connect', () => {
      logger.info('🔄 Redis Client Connecting...');
    });

    this.client.on('ready', () => {
      logger.info('✅ Redis Client Connected and Ready');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.useFallback = false;
    });

    this.client.on('end', () => {
      logger.warn('🔌 Redis Client Disconnected');
      this.isConnected = false;
    });

    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  private async attemptReconnect(): Promise<void> {
    if (this.useFallback) {
      logger.info('🔄 Redis en mode fallback - pas de reconnexion');
      return;
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      logger.error('❌ Max reconnection attempts reached for Redis - passage en fallback');
      this.useFallback = true;
      return;
    }

    this.reconnectAttempts++;
    logger.info(`🔄 Redis reconnection attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('❌ Redis reconnection failed:', error);
      }
    }, this.RECONNECT_DELAY * this.reconnectAttempts);
  }

  public async connect(): Promise<void> {
    if (this.useFallback) {
      logger.info('ℹ️ Mode fallback actif, connexion Redis ignorée');
      return;
    }

    if (this.isConnected) return;

    try {
      if (!this.client) {
        this.initializeClient();
        this.setupEventHandlers();
      }
      
      await this.client!.connect();
      logger.info('✅ Redis connected successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis:', error);
      
      if (process.env.REDIS_REQUIRED !== 'true') {
        logger.warn('⚠️ Passage en mode fallback (stockage en mémoire)');
        this.useFallback = true;
      } else {
        this.attemptReconnect();
        throw error;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('🔌 Redis client disconnected');
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('\n🛑 Shutting down Redis client...');
    await this.disconnect();
  }

  public getClient(): RedisClientType | null {
    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected;
  }

  public isUsingFallback(): boolean {
    return this.useFallback;
  }

  public async set(key: string, value: string, options?: { ttl?: number }): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    
    // Mode fallback
    if (this.useFallback || !this.isConnected) {
      this.fallbackStore.set(prefixedKey, {
        value,
        expiry: options?.ttl ? Date.now() + (options.ttl * 1000) : undefined
      });
      logger.debug(`💾 (Fallback) SET ${prefixedKey}`);
      return;
    }

    try {
      if (options?.ttl) {
        await this.client!.setEx(prefixedKey, options.ttl, value);
      } else {
        await this.client!.set(prefixedKey, value);
      }
      logger.debug(`✅ Redis SET ${prefixedKey}`);
    } catch (error) {
      logger.error(`❌ Redis SET error for key ${prefixedKey}:`, error);
      
      // Fallback en cas d'erreur
      this.fallbackStore.set(prefixedKey, {
        value,
        expiry: options?.ttl ? Date.now() + (options.ttl * 1000) : undefined
      });
    }
  }

  public async get(key: string): Promise<string | null> {
    const prefixedKey = this.getPrefixedKey(key);
    
    // Mode fallback
    if (this.useFallback || !this.isConnected) {
      const item = this.fallbackStore.get(prefixedKey);
      if (!item) return null;
      
      // Vérifier l'expiration
      if (item.expiry && item.expiry < Date.now()) {
        this.fallbackStore.delete(prefixedKey);
        return null;
      }
      
      logger.debug(`💾 (Fallback) GET ${prefixedKey}`);
      return item.value;
    }

    try {
      const value = await this.client!.get(prefixedKey);
      logger.debug(`✅ Redis GET ${prefixedKey}`);
      return value;
    } catch (error) {
      logger.error(`❌ Redis GET error for key ${prefixedKey}:`, error);
      
      // Fallback en cas d'erreur
      const item = this.fallbackStore.get(prefixedKey);
      return item?.value || null;
    }
  }

  public async del(key: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    
    // Mode fallback
    if (this.useFallback || !this.isConnected) {
      const deleted = this.fallbackStore.delete(prefixedKey) ? 1 : 0;
      logger.debug(`💾 (Fallback) DEL ${prefixedKey}: ${deleted}`);
      return deleted;
    }

    try {
      const result = await this.client!.del(prefixedKey);
      logger.debug(`✅ Redis DEL ${prefixedKey}: ${result}`);
      return result;
    } catch (error) {
      logger.error(`❌ Redis DEL error for key ${prefixedKey}:`, error);
      return 0;
    }
  }

  public async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    
    // Mode fallback
    if (this.useFallback || !this.isConnected) {
      const exists = this.fallbackStore.has(prefixedKey);
      logger.debug(`💾 (Fallback) EXISTS ${prefixedKey}: ${exists}`);
      return exists;
    }

    try {
      const result = await this.client!.exists(prefixedKey);
      return result === 1;
    } catch (error) {
      logger.error(`❌ Redis EXISTS error for key ${prefixedKey}:`, error);
      return this.fallbackStore.has(prefixedKey);
    }
  }

  public async ping(): Promise<string> {
    if (this.useFallback || !this.isConnected || !this.client) {
      return 'FALLBACK';
    }

    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('❌ Redis PING error:', error);
      return 'ERROR';
    }
  }

  public async flushFallback(): Promise<void> {
    this.fallbackStore.clear();
    logger.info('🧹 Fallback store cleared');
  }

  private getPrefixedKey(key: string): string {
    const prefix = env.REDIS_KEY_PREFIX || 'bygagoos:';
    return key.startsWith(prefix) ? key : `${prefix}${key}`;
  }
}

const redisClient = RedisClient.getInstance();

// Connexion automatique seulement si Redis est explicitement activé
const shouldConnect = process.env.REDIS_ENABLED === 'true' || 
                     (process.env.REDIS_URL && 
                      process.env.REDIS_URL !== 'redis://localhost:6379' &&
                      process.env.NODE_ENV === 'production');

if (shouldConnect) {
  (async () => {
    try {
      await redisClient.connect();
    } catch (error) {
      logger.error('❌ Redis initialization failed:', error);
      if (process.env.REDIS_REQUIRED === 'true') {
        process.exit(1);
      }
    }
  })();
} else {
  logger.info('ℹ️ Redis désactivé, utilisation du mode fallback');
}

export default redisClient;