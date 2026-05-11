import { Request, Response } from 'express';
import { RestaurantService } from './restaurant.service';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';

const restaurantService = new RestaurantService();

export class RestaurantController {
  /**
   * GET /api/restaurant/tables
   */
  async getTables(req: Request, res: Response) {
    try {
      const data = await restaurantService.getAllTables();
      res.json(data);
    } catch (error) {
      logger.error('Error in getTables:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch tables'
      });
    }
  }

  /**
   * GET /api/restaurant/reservations
   */
  async getReservations(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const data = await restaurantService.getAllReservations(Number(page), Number(limit));
      res.json(data);
    } catch (error) {
      logger.error('Error in getReservations:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch reservations'
      });
    }
  }

  /**
   * GET /api/restaurant/reservations/today
   */
  async getTodayReservations(req: Request, res: Response) {
    try {
      const reservations = await restaurantService.getTodayReservations();
      res.json({ reservations });
    } catch (error) {
      logger.error('Error in getTodayReservations:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch today reservations'
      });
    }
  }

  /**
   * GET /api/restaurant/menu/featured
   */
  async getFeaturedMenu(req: Request, res: Response) {
    try {
      const menuItems = await restaurantService.getFeaturedMenu();
      res.json({ menuItems });
    } catch (error) {
      logger.error('Error in getFeaturedMenu:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch featured menu'
      });
    }
  }

  /**
   * GET /api/restaurant/menu
   */
  async getMenu(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const menuItems = await restaurantService.getMenuByCategory(category as string);
      res.json({ menuItems });
    } catch (error) {
      logger.error('Error in getMenu:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch menu'
      });
    }
  }

  /**
   * GET /api/restaurant/stock/alerts
   */
  async getStockAlerts(req: Request, res: Response) {
    try {
      const alerts = await restaurantService.getStockAlerts();
      res.json(alerts);
    } catch (error) {
      logger.error('Error in getStockAlerts:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch stock alerts'
      });
    }
  }

  /**
   * GET /api/restaurant/stats
   */
  async getRestaurantStats(req: Request, res: Response) {
    try {
      const stats = await restaurantService.getRestaurantStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error in getRestaurantStats:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch restaurant statistics'
      });
    }
  }

  /**
   * POST /api/restaurant/reservations
   */
  async createReservation(req: Request, res: Response) {
    try {
      const reservation = await restaurantService.createReservation(req.body);
      res.status(HTTP_STATUS.CREATED).json(reservation);
    } catch (error) {
      logger.error('Error in createReservation:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create reservation'
      });
    }
  }

  /**
   * PATCH /api/restaurant/tables/:id/status
   */
  async updateTableStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, occupiedBy } = req.body;

      if (!status) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Status is required'
        });
      }

      const table = await restaurantService.updateTableStatus(id, status, occupiedBy);
      res.json(table);
    } catch (error) {
      logger.error('Error in updateTableStatus:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to update table'
      });
    }
  }
}

export const restaurantController = new RestaurantController();
