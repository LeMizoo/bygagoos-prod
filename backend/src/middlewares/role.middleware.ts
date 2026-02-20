import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/utils/errors/AppError';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import logger from '../core/utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware de vérification des rôles
 * @param allowedRoles - Tableau des rôles autorisés
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        logger.warn("Tentative d'accès sans authentification");
        throw new AppError('Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      }

      const userRole = req.user.role;
      
      logger.debug(`Vérification rôle - Utilisateur: ${userRole}, Rôles autorisés: ${allowedRoles.join(', ')}`);

      // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Accès refusé - Rôle ${userRole} non autorisé`);
        throw new AppError('Accès non autorisé - Rôle insuffisant', HTTP_STATUS.FORBIDDEN);
      }

      logger.debug('✅ Vérification rôle réussie');
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est Super Admin
 */
export const isSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  return roleMiddleware(['SUPER_ADMIN'])(req, res, next);
};

/**
 * Middleware pour vérifier si l'utilisateur est Admin ou Super Admin
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  return roleMiddleware(['ADMIN', 'SUPER_ADMIN'])(req, res, next);
};

/**
 * Middleware pour vérifier si l'utilisateur a accès à ses propres ressources
 * @param getResourceUserId - Fonction pour extraire l'ID utilisateur de la ressource
 */
export const isOwner = (getResourceUserId: (req: Request) => string | null) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      }

      const resourceUserId = getResourceUserId(req);
      
      if (!resourceUserId) {
        throw new AppError('Ressource non trouvée', HTTP_STATUS.NOT_FOUND);
      }

      // Super Admin peut tout faire
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (req.user.id !== resourceUserId) {
        logger.warn(`Accès refusé - Utilisateur ${req.user.id} tente d'accéder à la ressource de ${resourceUserId}`);
        throw new AppError('Accès non autorisé', HTTP_STATUS.FORBIDDEN);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};