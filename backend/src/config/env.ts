import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'), // Render utilise PORT
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bygagoos-ink',
  USE_MONGODB: process.env.USE_MONGODB === 'true',

  // JWT - AJOUT DES ALIAS POUR COMPATIBILITÉ
  JWT_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default-secret',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Alias pour compatibilité avec l'ancien code
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRE || '7d',

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_TLS: process.env.REDIS_TLS === 'true',
  REDIS_CACHE_ENABLED: process.env.REDIS_CACHE_ENABLED !== 'false',
  REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX || 'bygagoos:',
  REDIS_REFRESH_TOKEN_TTL: parseInt(process.env.REDIS_REFRESH_TOKEN_TTL || '604800'),

  // Refresh Token
  REFRESH_TOKEN_ROTATION: process.env.REFRESH_TOKEN_ROTATION !== 'false',
  REFRESH_TOKEN_BLACKLIST: process.env.REFRESH_TOKEN_BLACKLIST !== 'false',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Frontend
  FRONTEND_URL_DEV: process.env.FRONTEND_URL_DEV || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_DIR: process.env.LOG_DIR || 'logs',

  // Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png']
};

export default env;