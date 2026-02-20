declare module '../src/core/config/redis.config' {
  const redisClient: {
    getClient(): any;
    ping(): Promise<string>;
    set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<boolean>;
    isUsingFallback(): boolean;
  };
  export default redisClient;
}

declare module '../src/core/utils/logger' {
  const logger: any;
  export default logger;
}