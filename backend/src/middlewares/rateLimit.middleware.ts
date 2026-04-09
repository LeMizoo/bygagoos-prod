// backend/src/middlewares/rateLimit.middleware.ts

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}

/**
 * Rate limiter simple pour limiter le nombre de requêtes
 */
const rateLimit = (options: RateLimitOptions) => {
  const store = new Map();
  const defaultOptions = {
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    statusCode: 429,
    keyGenerator: (req: Request) => req.ip || req.socket.remoteAddress || 'unknown',
    skipSuccessfulRequests: false,
    ...options
  };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = defaultOptions.keyGenerator(req);
      const now = Date.now();
      // const _windowStart = now - defaultOptions.windowMs; // Commenté car non utilisé - préfixé avec _

      // Nettoyer les entrées expirées
      store.forEach((value, k) => {
        if (value.resetTime < now) {
          store.delete(k);
        }
      });

      let info = store.get(key);

      if (!info || info.resetTime < now) {
        // Nouvelle fenêtre
        info = {
          count: 1,
          resetTime: now + defaultOptions.windowMs
        };
        store.set(key, info);
      } else {
        // Incrémenter le compteur
        info.count++;

        if (info.count > defaultOptions.max) {
          // Rate limit dépassé
          res.setHeader('X-RateLimit-Limit', defaultOptions.max);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime / 1000));

          return res.status(defaultOptions.statusCode).json({
            success: false,
            message: defaultOptions.message
          });
        }
      }

      // Ajouter les headers
      res.setHeader('X-RateLimit-Limit', defaultOptions.max);
      res.setHeader('X-RateLimit-Remaining', defaultOptions.max - info.count);
      res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime / 1000));

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiters préconfigurés
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes'
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Trop de requêtes, réessayez dans une minute'
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: 'Limite de requêtes atteinte, réessayez dans une heure'
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20,
  message: 'Limite d\'upload atteinte, réessayez dans une heure'
});

export const limiter = apiLimiter;