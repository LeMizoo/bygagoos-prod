import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { env } from '../../config/env';
import logger from '../../core/utils/logger';

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
    const result = await authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    apiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken
      },
      'Inscription réussie',
      HTTP_STATUS.CREATED
    );
  } catch (error: any) {
    logger.error('Erreur register:', error);
    return apiResponse.error(
      res, 
      error.message || 'Erreur lors de l\'inscription', 
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
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
    const result = await authService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    apiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken
      },
      'Connexion réussie'
    );
  } catch (error: any) {
    logger.error('Erreur login:', error);
    return apiResponse.error(
      res, 
      error.message || 'Erreur lors de la connexion', 
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
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
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      return apiResponse.error(
        res, 
        'Refresh token manquant', 
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const tokens = await authService.refreshToken(refreshTokenCookie);

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    apiResponse.success(res, {
      accessToken: tokens.accessToken
    }, 'Token rafraîchi avec succès');
  } catch (error: any) {
    logger.error('Erreur refresh token:', error);
    return apiResponse.error(
      res, 
      error.message || 'Erreur lors du rafraîchissement du token', 
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion utilisateur
 * @access  Privé
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const refreshToken = req.cookies.refreshToken;

    if (userId && refreshToken) {
      await authService.logout(userId, refreshToken);
    }

    res.clearCookie('refreshToken');

    apiResponse.success(res, null, 'Déconnexion réussie');
  } catch (error: any) {
    logger.error('Erreur logout:', error);
    return apiResponse.error(
      res, 
      error.message || 'Erreur lors de la déconnexion', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
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

    apiResponse.success(res, {
      user
    }, 'Informations utilisateur récupérées');
  } catch (error: any) {
    logger.error('Erreur getMe:', error);
    return apiResponse.error(
      res, 
      error.message || 'Erreur lors de la récupération des informations', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};