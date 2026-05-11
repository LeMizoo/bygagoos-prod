// backend/src/config/env.ts

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FALLBACK_PORT: parseInt(process.env.FALLBACK_PORT || '5001', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  // Ajout pour la gestion des avatars
  API_URL: process.env.API_URL || 'http://localhost:5000',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/?appName=Cluster0',
  USE_MONGODB: process.env.USE_MONGODB === 'true',

  // JWT
  JWT_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default-secret',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRE || '7d',
  
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRE || '7d',

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_TLS: process.env.REDIS_TLS === 'true',
  REDIS_CACHE_ENABLED: process.env.REDIS_CACHE_ENABLED !== 'false',
  REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX || 'bygagoos:',
  REDIS_CACHE_TTL: parseInt(process.env.REDIS_CACHE_TTL || '300', 10),
  REDIS_REFRESH_TOKEN_TTL: parseInt(process.env.REDIS_REFRESH_TOKEN_TTL || '604800', 10),

  // Refresh Token
  REFRESH_TOKEN_ROTATION: process.env.REFRESH_TOKEN_ROTATION !== 'false',
  REFRESH_TOKEN_BLACKLIST: process.env.REFRESH_TOKEN_BLACKLIST !== 'false',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Google Auth
  GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || '',
  GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || '',
  GMAIL_REDIRECT_URI: process.env.GMAIL_REDIRECT_URI || '',
  GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI || '',
  GOOGLE_SUPER_ADMIN_EMAIL: process.env.GOOGLE_SUPER_ADMIN_EMAIL || 'tovoniaina.rahendrison@gmail.com',

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  FRONTEND_URL_DEV: process.env.FRONTEND_URL_DEV || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : process.env.NODE_ENV === 'production'
      ? ['https://bygagoos-prod.vercel.app']
      : ['http://localhost:3000', 'http://localhost:5173'],

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_DIR: process.env.LOG_DIR || 'logs',

  // Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png']
};

export default env;
