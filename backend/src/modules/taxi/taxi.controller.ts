import { Request, Response } from 'express';
import { TaxiService } from './taxi.service';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';

const taxiService = new TaxiService();

export class TaxiController {
  /**
   * GET /api/taxi/vehicles
   */
  async getVehicles(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await taxiService.getAllVehicles(Number(page), Number(limit));
      res.json(data);
    } catch (error) {
      logger.error('Error in getVehicles:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch vehicles'
      });
    }
  }

  /**
   * GET /api/taxi/vehicles/:id
   */
  async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await taxiService.getVehicleById(id);
      res.json(data);
    } catch (error) {
      logger.error('Error in getVehicleById:', error);
      res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Vehicle not found'
      });
    }
  }

  /**
   * GET /api/taxi/trips/today
   */
  async getTodayTrips(req: Request, res: Response) {
    try {
      const trips = await taxiService.getTodayTrips();
      res.json({ trips });
    } catch (error) {
      logger.error('Error in getTodayTrips:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch today trips'
      });
    }
  }

  /**
   * GET /api/taxi/maintenance/due-soon
   */
  async getMaintenanceDueSoon(req: Request, res: Response) {
    try {
      const { days = 7 } = req.query;
      const maintenance = await taxiService.getMaintenanceDueSoon(Number(days));
      res.json({ maintenance });
    } catch (error) {
      logger.error('Error in getMaintenanceDueSoon:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch maintenance'
      });
    }
  }

  /**
   * GET /api/taxi/stats
   */
  async getFleetStats(req: Request, res: Response) {
    try {
      const stats = await taxiService.getFleetStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error in getFleetStats:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch fleet statistics'
      });
    }
  }

  /**
   * POST /api/taxi/vehicles
   */
  async createVehicle(req: Request, res: Response) {
    try {
      const vehicle = await taxiService.createVehicle(req.body);
      res.status(HTTP_STATUS.CREATED).json(vehicle);
    } catch (error) {
      logger.error('Error in createVehicle:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create vehicle'
      });
    }
  }

  /**
   * POST /api/taxi/trips
   */
  async createTrip(req: Request, res: Response) {
    try {
      const trip = await taxiService.createTrip(req.body);
      res.status(HTTP_STATUS.CREATED).json(trip);
    } catch (error) {
      logger.error('Error in createTrip:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create trip'
      });
    }
  }

  /**
   * PATCH /api/taxi/trips/:id/status
   */
  async updateTripStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Status is required'
        });
      }

      const trip = await taxiService.updateTripStatus(id, status);
      res.json(trip);
    } catch (error) {
      logger.error('Error in updateTripStatus:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update trip'
      });
    }
  }
}

export const taxiController = new TaxiController();
