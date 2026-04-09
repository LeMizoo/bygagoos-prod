// backend/src/middlewares/index.ts

// Exporter les types (avec 'export type' pour éviter les conflits)
export type { AuthRequest, RequestUser } from './auth.middleware';
export type { AuthRequest as RoleAuthRequest } from './role.middleware';

// Exporter les fonctions d'auth (sans les types)
export { 
  protect, 
  auth, 
  verifyToken, 
  authorize, 
  hasPermission, 
  verifyPermissions, 
  optionalToken 
} from './auth.middleware';

// Exporter les fonctions de rôle
export { 
  roleMiddleware, 
  isSuperAdmin, 
  isAdmin, 
  isManager, 
  isDesigner, 
  isStaff, 
  isClient, 
  isOwner 
} from './role.middleware';

// Exporter les rate limiters
export { 
  limiter, 
  authLimiter, 
  apiLimiter, 
  strictLimiter, 
  uploadLimiter 
} from './rateLimit.middleware';

// Exporter les validateurs
export { validate } from './validate.middleware';

// Exporter l'upload
export { upload } from './upload.middleware';