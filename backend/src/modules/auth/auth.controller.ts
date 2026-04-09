// backend/src/modules/auth/auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { env } from '../../config/env';
import logger from '../../core/utils/logger';
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { AppError } from '../../core/utils/errors/AppError';

const authService = new AuthService();

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
};

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const userData: RegisterDto = req.body;
    const result = await authService.register(userData);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    return apiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      'Inscription réussie',
      HTTP_STATUS.CREATED
    );
  } catch (error: unknown) {
    logger.error('Erreur register:', error);
    
    if (error instanceof AppError) {
      return apiResponse.error(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    const err = error as Error;
    return apiResponse.error(
      res, 
      err.message || 'Erreur lors de l\'inscription', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const credentials: LoginDto = req.body;
    const result = await authService.login(credentials);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    return apiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      'Connexion réussie'
    );
  } catch (error: unknown) {
    logger.error('Erreur login:', error);
    
    if (error instanceof AppError) {
      return apiResponse.error(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    const err = error as Error;
    return apiResponse.error(
      res, 
      err.message || 'Erreur lors de la connexion', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const refreshTokenCookie = req.cookies.refreshToken;

    const tokenToUse = token || refreshTokenCookie;

    if (!tokenToUse) {
      return apiResponse.error(
        res, 
        'Refresh token manquant', 
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const tokens = await authService.refreshToken(tokenToUse);

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    return apiResponse.success(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }, 'Token rafraîchi avec succès');
  } catch (error: unknown) {
    logger.error('Erreur refresh token:', error);
    
    if (error instanceof AppError) {
      return apiResponse.error(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    const err = error as Error;
    return apiResponse.error(
      res, 
      err.message || 'Erreur lors du rafraîchissement du token', 
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion utilisateur
 * @access  Public/Souple
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // On essaie de récupérer l'ID (si le middleware protect a réussi à passer avant)
    // ou si l'utilisateur est passé par une route publique mais a ses infos.
    const userId = req.user?.id;
    const rToken = req.body.refreshToken || req.cookies.refreshToken;

    // On tente d'invalider le token côté serveur si on a les infos nécessaires
    if (userId && rToken) {
      try {
        await authService.logout(userId, rToken);
      } catch (serviceErr) {
        // On logue l'erreur service mais on ne bloque pas le client
        logger.warn('Service logout erreur (ignorée):', serviceErr);
      }
    }

    // Effacement systématique du cookie
    res.clearCookie('refreshToken', {
      ...cookieOptions,
      maxAge: 0
    });

    return apiResponse.success(res, null, 'Déconnexion réussie');
  } catch (error: unknown) {
    // En cas d'erreur critique, on essaie quand même de vider le cookie
    res.clearCookie('refreshToken');
    logger.error('Erreur logout critique:', error);
    return apiResponse.success(res, null, 'Déconnexion forcée');
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Privé
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await authService.getMe(userId);

    return apiResponse.success(res, {
      user
    }, 'Informations utilisateur récupérées');
  } catch (error: unknown) {
    logger.error('Erreur getMe:', error);
    
    if (error instanceof AppError) {
      return apiResponse.error(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    const err = error as Error;
    return apiResponse.error(
      res, 
      err.message || 'Erreur lors de la récupération des informations', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour le profil utilisateur
 * @access  Privé
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const updateData: UpdateProfileDto = req.body;
    const updatedUser = await authService.updateProfile(userId, updateData);

    return apiResponse.success(res, {
      user: updatedUser
    }, 'Profil mis à jour avec succès');
  } catch (error: unknown) {
    logger.error('Erreur updateProfile:', error);
    
    if (error instanceof AppError) {
      return apiResponse.error(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    const err = error as Error;
    return apiResponse.error(
      res, 
      err.message || 'Erreur lors de la mise à jour du profil', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Changer le mot de passe
 * @access  Privé
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const { currentPassword, newPassword, confirmPassword }: ChangePasswordDto = req.body;
    
    await authService.changePassword(userId, currentPassword, newPassword, confirmPassword);

    return apiResponse.success(res, null, 'Mot de passe changé avec succès');
  } catch (error: unknown) {
    logger.error('Erreur changePassword:', error);
    
    if (error instanceof AppError) {
      return apiResponse.error(
        res, 
        error.message, 
        error.statusCode
      );
    }
    
    const err = error as Error;
    return apiResponse.error(
      res, 
      err.message || 'Erreur lors du changement de mot de passe', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};