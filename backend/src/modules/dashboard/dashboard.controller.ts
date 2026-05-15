import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import DashboardService from './dashboard.service';
import { getCache, setCache } from '../../core/utils/cache';
import { env } from '../../config/env';

/**
 * Récupérer les statistiques pour Super Admin
 */
export const getSuperAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    logger.info('📊 Récupération des stats Super Admin');

    const cacheKey = 'dashboard:super-admin-stats';
    let stats: any;
    if (env.REDIS_CACHE_ENABLED) {
      stats = await getCache(cacheKey);
      if (stats) {
        return apiResponse.success(res, stats, 'Stats Super Admin récupérées (cache)');
      }
    }

    stats = await DashboardService.getSuperAdminStats();

    if (env.REDIS_CACHE_ENABLED) {
      await setCache(cacheKey, stats);
    }

    apiResponse.success(res, stats, 'Stats Super Admin récupérées');
  } catch (error: any) {
    logger.error('❌ Erreur stats Super Admin:', error);
    apiResponse.error(
      res, 
      error.message || 'Erreur lors de la récupération des stats Super Admin', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Récupérer les statistiques pour Admin
 */
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    logger.info('📊 Récupération des stats Admin');

    const cacheKey = 'dashboard:admin-stats';
    let stats: any;
    if (env.REDIS_CACHE_ENABLED) {
      stats = await getCache(cacheKey);
      if (stats) {
        return apiResponse.success(res, stats, 'Stats Admin récupérées (cache)');
      }
    }

    stats = await DashboardService.getAdminStats();

    if (env.REDIS_CACHE_ENABLED) {
      await setCache(cacheKey, stats);
    }

    apiResponse.success(res, stats, 'Stats Admin récupérées');
  } catch (error: any) {
    logger.error('❌ Erreur stats Admin:', error);
    apiResponse.error(
      res, 
      error.message || 'Erreur lors de la récupération des stats Admin', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Récupérer les statistiques pour User
 */
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return apiResponse.error(
        res,
        'Utilisateur non authentifié',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    
    logger.info(`📊 Récupération des stats User: ${userId}`);
    
    const stats = await DashboardService.getUserStats(userId);
    
    apiResponse.success(res, stats, 'Stats User récupérées');
  } catch (error: any) {
    logger.error('❌ Erreur stats User:', error);
    apiResponse.error(
      res, 
      error.message || 'Erreur lors de la récupération des stats User', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};