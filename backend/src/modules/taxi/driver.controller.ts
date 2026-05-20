import { Request, Response } from 'express';
import { DriverService } from './driver.service';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';

const driverService = new DriverService();

export class DriverController {
  /**
   * GET /api/taxi/drivers - Liste des conducteurs
   */
  async getDrivers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, search, isActive } = req.query;
      
      const data = await driverService.getAllDrivers(
        Number(page),
        Number(limit),
        {
          status: status as string,
          search: search as string,
          isActive: isActive === 'true'
        }
      );
      
      res.json(data);
    } catch (error) {
      logger.error('Error in getDrivers:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch drivers'
      });
    }
  }

  /**
   * GET /api/taxi/drivers/stats - Statistiques des conducteurs
   */
  async getDriverStats(req: Request, res: Response) {
    try {
      const stats = await driverService.getDriverStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error in getDriverStats:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch driver statistics'
      });
    }
  }

  /**
   * GET /api/taxi/drivers/:id - Détail d'un conducteur
   */
  async getDriverById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await driverService.getDriverById(id);
      res.json(driver);
    } catch (error) {
      logger.error('Error in getDriverById:', error);
      res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Driver not found'
      });
    }
  }

  /**
   * POST /api/taxi/drivers - Créer un conducteur
   */
  async createDriver(req: Request, res: Response) {
    try {
      const driver = await driverService.createDriver(req.body);
      res.status(HTTP_STATUS.CREATED).json(driver);
    } catch (error) {
      logger.error('Error in createDriver:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create driver',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/taxi/drivers/:id - Mettre à jour un conducteur
   */
  async updateDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await driverService.updateDriver(id, req.body);
      res.json(driver);
    } catch (error) {
      logger.error('Error in updateDriver:', error);
      if ((error as Error).message === 'Driver not found') {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Driver not found'
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: 'Failed to update driver'
        });
      }
    }
  }

  /**
   * DELETE /api/taxi/drivers/:id - Supprimer un conducteur
   */
  async deleteDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await driverService.deleteDriver(id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error in deleteDriver:', error);
      if ((error as Error).message === 'Driver not found') {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Driver not found'
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: 'Failed to delete driver'
        });
      }
    }
  }

  /**
   * POST /api/taxi/drivers/:id/assign-vehicle - Assigner un véhicule
   */
  async assignVehicle(req: Request, res: Response) {
    try {
      const { driverId, vehicleId } = req.body;
      
      if (!driverId || !vehicleId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'driverId and vehicleId are required'
        });
      }
      
      const driver = await driverService.assignVehicle(driverId, vehicleId);
      res.json(driver);
    } catch (error) {
      logger.error('Error in assignVehicle:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to assign vehicle'
      });
    }
  }

  /**
   * POST /api/taxi/drivers/:id/unassign-vehicle - Désassigner le véhicule
   */
  async unassignVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await driverService.unassignVehicle(id);
      res.json(driver);
    } catch (error) {
      logger.error('Error in unassignVehicle:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to unassign vehicle'
      });
    }
  }

  /**
   * PATCH /api/taxi/drivers/:id/status - Mettre à jour le statut
   */
  async updateDriverStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Status is required'
        });
      }
      
      const driver = await driverService.updateDriverStatus(id, status);
      res.json(driver);
    } catch (error) {
      logger.error('Error in updateDriverStatus:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update driver status'
      });
    }
  }
}

export const driverController = new DriverController();