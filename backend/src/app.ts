// backend/src/app.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import path from 'path';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { env } from './config/env';
import logger from './core/utils/logger';

// Import des routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import staffRoutes from './modules/staff/staff.routes';
import clientRoutes from './modules/clients/client.routes';
import designRoutes from './modules/designs/design.routes';
import orderRoutes from './modules/orders/order.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import uploadRoutes from './modules/upload/upload.routes';
// Nouvelle route pour les formulaires dynamiques
import formRoutes from './modules/forms/form.routes';
// Route pour les paramètres et templates
import settingsRoutes from './modules/settings/settings.routes';

// Import des utilitaires et types
import { HTTP_STATUS } from './core/constants/httpStatus';
import morgan from 'morgan';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
  stack?: string;
}

const app: Application = express();

app.disable('x-powered-by');

// ==================== MIDDLEWARES ====================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);

// ==================== CONFIGURATION CORS AMÉLIORÉE ====================
// Liste des origines autorisées
const allowedOrigins = [
  'https://bygagoos-prod.vercel.app',
  'https://bygagoos-prod.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  ...(env.ALLOWED_ORIGINS || [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origine (comme Postman, apps mobiles)
      if (!origin) {
        return callback(null, true);
      }
      
      // En développement, autoriser toutes les origines localhost
      if (env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      // Vérifier si l'origine est autorisée
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`❌ Origine CORS refusée: ${origin}`);
        logger.info(`Origines autorisées: ${allowedOrigins.join(', ')}`);
        callback(new Error(`Non autorisé par CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400 // 24 heures en cache pour les requêtes preflight
  })
);

// Middleware supplémentaire pour s'assurer que les headers CORS sont présents
app.use((req: Request, res: Response, next: NextFunction) => {
  // Ajouter les headers CORS manuellement en complément
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Authorization');
  }
  
  // Répondre immédiatement aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', {
    stream: { write: (msg: string) => logger.info(msg.trim()) }
  })
);

app.use(apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// ==================== DOSSIERS STATIQUES ====================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== ROUTES API ====================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
// Enregistrement du nouveau module
app.use('/api/forms', formRoutes);
// Routes des paramètres et templates modifiables
app.use('/api/settings', settingsRoutes);

// Route de santé améliorée avec infos CORS
app.get('/health', (_req, res) => {
  res.json({ 
    success: true, 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins
    }
  });
});

// Route pour tester CORS (utile pour le débogage)
app.options('/test-cors', cors());
app.get('/test-cors', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
});

// Middleware global de gestion d'erreurs
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  
  // Log l'erreur complète en développement
  if (env.NODE_ENV === 'development') {
    logger.error('❌ Erreur:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: statusCode
    });
  } else {
    logger.error(`❌ Erreur: ${err.message} - Status: ${statusCode}`);
  }
  
  // Ne pas exposer les erreurs CORS en production
  const isCorsError = err.message && err.message.includes('CORS');
  const errorMessage = isCorsError && env.NODE_ENV === 'production'
    ? 'Erreur de configuration CORS'
    : err.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    ...(env.NODE_ENV === 'development' && !isCorsError && err.stack ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString()
  });
});

export default app;