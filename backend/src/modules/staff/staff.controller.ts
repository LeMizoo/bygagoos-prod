// backend/src/modules/staff/staff.controller.ts

import { Request, Response, NextFunction } from 'express';
import { StaffService } from './staff.service';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { logger } from '../../core/utils/logger';

export class StaffController {
  private staffService = new StaffService();

  async getStaffById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const staff = await this.staffService.findById(id);
      
      if (!staff) {
        return next(new AppError('Membre du personnel non trouvé', HTTP_STATUS.NOT_FOUND));
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await this.staffService.findAll();
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        count: staff.length,
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }

  async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await this.staffService.create(req.body);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const staff = await this.staffService.update(id, req.body);
      
      if (!staff) {
        return next(new AppError('Membre du personnel non trouvé', HTTP_STATUS.NOT_FOUND));
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const deleted = await this.staffService.delete(id);
      
      if (!deleted) {
        return next(new AppError('Membre du personnel non trouvé', HTTP_STATUS.NOT_FOUND));
      }

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔥 Upload d'avatar - Reçoit l'URL Cloudinary du frontend
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        return next(new AppError('URL de l\'avatar manquante', HTTP_STATUS.BAD_REQUEST));
      }

      logger.info(`📸 Mise à jour de l'avatar pour le staff ${id}`);

      // Mettre à jour le staff avec l'URL Cloudinary
      const updatedStaff = await this.staffService.update(id, { avatar: avatarUrl });

      if (!updatedStaff) {
        return next(new AppError('Membre du personnel non trouvé', HTTP_STATUS.NOT_FOUND));
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          avatarUrl: updatedStaff.avatar
        },
        message: 'Avatar mis à jour avec succès'
      });
    } catch (error) {
      logger.error('❌ Erreur upload avatar:', error);
      next(error);
    }
  }
}