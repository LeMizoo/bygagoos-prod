// backend/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model';
import { apiResponse } from '../core/utils/apiResponse';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import { env } from '../config/env';
import { UserRole, normalizeRole, hasPermission as checkPermission } from '../core/types/userRoles';
import logger from '../core/utils/logger';
import { Types } from 'mongoose';

// Interface pour le contenu du JWT
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Type pour l'utilisateur dans la requête (sans 'any')
export type RequestUser = {
  id: string;
  _id: Types.ObjectId | string;
  email: string;
  role: UserRole;
  name?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  clientId?: string;
};

// Interface pour AuthRequest
export interface AuthRequest extends Request {
  user?: RequestUser;
  token?: string;
}

// Extension de l'interface Request pour inclure user et token
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      token?: string;
    }
  }
}

/**
 * Middleware de protection des routes (Authentification)
 * Alias 'verifyToken' pour correspondre aux imports des fichiers de routes
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      apiResponse.error(res, 'Non autorisé - Token manquant', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      apiResponse.error(res, 'Utilisateur non trouvé', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!user.isActive) {
      apiResponse.error(res, 'Compte désactivé', HTTP_STATUS.FORBIDDEN);
      return;
    }

    const normalizedRole = normalizeRole(user.role);

    // Injection des données dans req.user
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      role: normalizedRole,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };
    req.token = token;

    logger.debug(`✅ Utilisateur authentifié: ${user.email} (${normalizedRole})`);
    next();
  } catch (error) {
    const err = error as Error;
    logger.error('❌ Erreur auth middleware:', err.message);

    if (err.name === 'TokenExpiredError') {
      apiResponse.error(res, 'Token expiré', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    apiResponse.error(res, 'Token invalide', HTTP_STATUS.UNAUTHORIZED);
  }
};

// Alias pour la compatibilité
export const verifyToken = protect;
export const auth = protect; // Alias pour upload.routes.ts

/**
 * Middleware d'autorisation par Rôle
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn("🚫 Tentative d'accès sans utilisateur authentifié");
        apiResponse.error(res, 'Non autorisé', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        logger.warn(`🚫 Accès refusé pour ${req.user.email} - Rôle ${userRole} non autorisé`);
        apiResponse.error(res, 'Accès interdit - Rôle insuffisant', HTTP_STATUS.FORBIDDEN);
        return;
      }

      next();
    } catch (error) {
      logger.error('❌ Erreur dans authorize:', error);
      apiResponse.error(res, "Erreur d'autorisation", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

/**
 * Middleware de vérification des permissions fines
 */
export const hasPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        apiResponse.error(res, 'Non autorisé', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      if (!checkPermission(req.user.role, permission)) {
        logger.warn(`🚫 Permission refusée pour ${req.user.email}: ${permission}`);
        apiResponse.error(res, 'Permission insuffisante', HTTP_STATUS.FORBIDDEN);
        return;
      }

      next();
    } catch (error) {
      logger.error('❌ Erreur dans hasPermission:', error);
      apiResponse.error(res, 'Erreur de permission', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

export const verifyPermissions = hasPermission;

/**
 * Middleware optionnel - vérifie le token si présent mais ne bloque pas
 */
export const optionalToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          const normalizedRole = normalizeRole(user.role);
          req.user = {
            id: user._id.toString(),
            _id: user._id,
            email: user.email,
            role: normalizedRole,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
          };
          req.token = token;
        }
      } catch (_error) {
        // Ignorer les erreurs de token - variable préfixée avec _
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Note: Pas d'export default, seulement des exports nommés