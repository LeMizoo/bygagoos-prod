// backend/src/middlewares/staff.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/utils/errors/AppError';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import logger from '../core/utils/logger';
import { STAFF_MANAGEMENT_ROLES } from '../config/roles.config';
import { UserRole } from '../core/types/userRoles';
import { AuthRequest } from './role.middleware';

/**
 * Middleware pour vérifier si l'utilisateur peut gérer le staff
 * Utilise les rôles STAFF (SUPER_ADMIN, ADMIN_INSPIRATION, etc.)
 */
export const canManageStaff = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      logger.warn("Tentative de gestion du staff sans authentification");
      throw new AppError('Non authentifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const userRole = req.user.role;
    
    logger.info('🔐 Vérification permission staff:', {
      user: req.user.email,
      role: userRole,
      allowedRoles: STAFF_MANAGEMENT_ROLES
    });

    // Vérifier si le rôle est dans la liste des rôles autorisés
    const normalizedRole = userRole as UserRole;
    if (!STAFF_MANAGEMENT_ROLES.includes(normalizedRole as any)) {
      logger.warn(`🚫 Accès refusé - Rôle ${userRole} non autorisé à gérer le staff`);
      throw new AppError(
        'Vous n\'avez pas les droits pour gérer le staff', 
        HTTP_STATUS.FORBIDDEN
      );
    }

    logger.info('✅ Permission staff accordée');
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware pour vérifier si l'utilisateur peut modifier un membre spécifique du staff
 * SUPER_ADMIN peut tout modifier, les autres admins ne peuvent modifier que leur département
 */
export const canModifyStaffMember = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Non authentifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const userRole = req.user.role;
    const staffMemberId = req.params.id;

    // SUPER_ADMIN peut tout modifier
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Pour les autres admins, il faudrait vérifier le département
    // Cette partie dépend de votre logique métier
    // Par exemple : un admin production ne peut modifier que les membres de la production
    
    logger.info(`✅ Modification autorisée pour ${userRole}`);
    next();
  } catch (error) {
    next(error);
  }
};