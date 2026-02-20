import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model';
import { apiResponse } from '../core/utils/apiResponse';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import { env } from '../config/env';
import { UserRole } from '../core/types/userRoles';
import logger from '../core/utils/logger';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return apiResponse.error(res, 'Non autorisé - Token manquant', HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return apiResponse.error(res, 'Utilisateur non trouvé', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      return apiResponse.error(res, 'Compte désactivé', HTTP_STATUS.FORBIDDEN);
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error: any) {
    logger.error('Erreur auth middleware:', error);

    if (error.name === 'TokenExpiredError') {
      return apiResponse.error(res, 'Token expiré', HTTP_STATUS.UNAUTHORIZED);
    }

    return apiResponse.error(res, 'Token invalide', HTTP_STATUS.UNAUTHORIZED);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return apiResponse.error(res, 'Non autorisé', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return apiResponse.error(res, 'Accès interdit', HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};
