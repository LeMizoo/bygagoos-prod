import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import { limiter } from './middlewares/rateLimit.middleware';
import { env } from './config/env';
import logger from './core/utils/logger';

// Import des routes existantes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import staffRoutes from './modules/staff/staff.routes';
import clientRoutes from './modules/clients/client.routes';
import designRoutes from './modules/designs/design.routes';
import orderRoutes from './modules/orders/order.routes';

// Import des nouvelles routes dashboard
import dashboardRoutes from './modules/dashboard/dashboard.routes';

// Import des middlewares
import { apiResponse } from './core/utils/apiResponse';
import { HTTP_STATUS } from './core/constants/httpStatus';

const app: Application = express();

// ==================== CONFIG EXPRESS ====================
// Supprime header X-Powered-By (sécurité)
app.disable('x-powered-by');

// ==================== MIDDLEWARES ====================

// Sécurité Helmet renforcée
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);

// CORS configuré pour Render et Vercel
app.use(
  cors({
    origin: (origin, callback) => {
      // En développement, tout autoriser
      if (env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // En production, vérifier l'origine
      const allowedOrigins = env.ALLOWED_ORIGINS;
      
      // Si pas d'origine (requête même origine) ou origine autorisée
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Origine CORS refusée: ${origin}`);
        callback(new Error('Non autorisé par CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  })
);

// Rate limiting global
app.use(limiter);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(
    morgan('dev', {
      stream: { write: (message) => logger.http(message.trim()) }
    })
  );
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    })
  );
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (OBLIGATOIRE pour refresh token)
app.use(cookieParser());

// Sanitisation MongoDB (prévention injection NoSQL)
app.use(mongoSanitize());

// ==================== ROUTES ====================

// Health check
app.get('/health', (req: Request, res: Response) => {
  apiResponse.success(
    res,
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    'Serveur opérationnel'
  );
});

// Routes API principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route racine
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'ByGagoos-Ink API',
    version: '2.0.0',
    environment: env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      staff: '/api/staff',
      clients: '/api/clients',
      designs: '/api/designs',
      orders: '/api/orders',
      dashboard: '/api/dashboard'
    },
    documentation: '/api-docs'
  });
});

// ==================== GESTION DES ERREURS ====================

// 404
app.use('*', (req: Request, res: Response) => {
  apiResponse.error(
    res,
    `Route ${req.originalUrl} non trouvée`,
    HTTP_STATUS.NOT_FOUND
  );
});

// Middleware global d'erreurs
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('❌ Erreur non gérée:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return apiResponse.error(
      res,
      'Erreur de validation',
      HTTP_STATUS.BAD_REQUEST,
      errors
    );
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return apiResponse.error(
      res,
      `${field} déjà utilisé`,
      HTTP_STATUS.CONFLICT
    );
  }

  if (err.name === 'CastError') {
    return apiResponse.error(
      res,
      `ID invalide: ${err.value}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return apiResponse.error(
      res,
      'Token invalide',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.name === 'TokenExpiredError') {
    return apiResponse.error(
      res,
      'Token expiré',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.message === 'Non autorisé par CORS') {
    return apiResponse.error(
      res,
      'Origine non autorisée',
      HTTP_STATUS.FORBIDDEN
    );
  }

  if (err.statusCode) {
    return apiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.errors
    );
  }

  // En production on ne renvoie jamais stack trace
  if (env.NODE_ENV === 'production') {
    return apiResponse.error(
      res,
      'Erreur interne du serveur',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // En dev seulement
  apiResponse.error(
    res,
    err.message || 'Erreur interne du serveur',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    err.stack
  );
});

export default app;