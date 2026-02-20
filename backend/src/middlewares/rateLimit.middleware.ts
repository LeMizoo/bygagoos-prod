import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { HTTP_STATUS } from '../core/constants/httpStatus';

export const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ne pas limiter les routes de santé
    return req.path === '/health';
  }
});

// Limiteur plus strict pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Ne pas compter les tentatives réussies
});