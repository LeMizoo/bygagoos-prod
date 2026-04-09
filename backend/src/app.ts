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

app.use(
  cors({
    origin: (origin, callback) => {
      if (env.NODE_ENV === 'development' || !origin) return callback(null, true);
      const allowedOrigins = env.ALLOWED_ORIGINS;
      if (allowedOrigins.includes(origin)) {
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

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

app.use('*', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
});

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    ...(env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString()
  });
});

export default app;