import { Types } from 'mongoose';
import RestaurantTable from './table.model';
import Reservation from './reservation.model';
import MenuItem from './menu.model';
import StockItem from './stock.model';
import logger from '../../core/utils/logger';

export class RestaurantService {
  /**
   * Get all tables with their status
   */
  async getAllTables() {
    try {
      const tables = await RestaurantTable.find().sort({ tableNumber: 1 });
      const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
      const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
      const reservedTables = tables.filter((t) => t.status === 'RESERVED').length;

      return {
        tables,
        summary: {
          total: tables.length,
          occupied: occupiedTables,
          available: availableTables,
          reserved: reservedTables,
          occupancyRate: Math.round((occupiedTables / tables.length) * 100)
        }
      };
    } catch (error) {
      logger.error('Error fetching tables:', error);
      throw error;
    }
  }

  /**
   * Get all reservations
   */
  async getAllReservations(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const reservations = await Reservation.find()
        .populate('table')
        .skip(skip)
        .limit(limit)
        .sort({ reservationDate: -1 });

      const total = await Reservation.countDocuments();

      return {
        reservations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching reservations:', error);
      throw error;
    }
  }

  /**
   * Get today's reservations
   */
  async getTodayReservations() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const reservations = await Reservation.find({
        reservationDate: {
          $gte: today,
          $lt: tomorrow
        }
      })
        .populate('table')
        .sort({ reservationTime: 1 });

      return reservations;
    } catch (error) {
      logger.error('Error fetching today reservations:', error);
      throw error;
    }
  }

  /**
   * Get featured menu items
   */
  async getFeaturedMenu() {
    try {
      const menuItems = await MenuItem.find({
        isAvailable: true,
        isFeatured: true
      }).sort({ createdAt: -1 });

      return menuItems;
    } catch (error) {
      logger.error('Error fetching featured menu:', error);
      throw error;
    }
  }

  /**
   * Get all menu items by category
   */
  async getMenuByCategory(category?: string) {
    try {
      const query: any = { isAvailable: true };
      if (category) {
        query.category = category;
      }

      const menuItems = await MenuItem.find(query).sort({ name: 1 });
      return menuItems;
    } catch (error) {
      logger.error('Error fetching menu:', error);
      throw error;
    }
  }

  /**
   * Get stock alerts
   */
  async getStockAlerts() {
    try {
      const criticalItems = await StockItem.find({
        alertLevel: 'CRITICAL'
      });

      const lowItems = await StockItem.find({
        alertLevel: 'LOW'
      });

      const expiringSoon = await StockItem.find({
        expiryDate: {
          $gte: new Date(),
          $lte: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return {
        critical: criticalItems,
        low: lowItems,
        expiringSoon: expiringSoon,
        totalAlerts: criticalItems.length + lowItems.length + expiringSoon.length
      };
    } catch (error) {
      logger.error('Error fetching stock alerts:', error);
      throw error;
    }
  }

  /**
   * Get restaurant statistics
   */
  async getRestaurantStats() {
    try {
      const allTables = await RestaurantTable.find();
      const occupiedTables = allTables.filter((t) => t.status === 'OCCUPIED').length;
      const availableTables = allTables.filter((t) => t.status === 'AVAILABLE').length;

      const todayReservations = await Reservation.countDocuments({
        reservationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });

      const pendingReservations = await Reservation.countDocuments({
        status: 'PENDING'
      });

      const stockAlerts = await StockItem.countDocuments({
        alertLevel: { $in: ['CRITICAL', 'LOW'] }
      });

      return {
        totalTables: allTables.length,
        occupiedTables,
        availableTables,
        occupancyRate: Math.round((occupiedTables / allTables.length) * 100),
        todayReservations,
        pendingReservations,
        stockAlerts
      };
    } catch (error) {
      logger.error('Error fetching restaurant stats:', error);
      throw error;
    }
  }

  /**
   * Create a reservation
   */
  async createReservation(data: any) {
    try {
      const reservation = new Reservation(data);
      await reservation.save();
      await reservation.populate('table');
      return reservation;
    } catch (error) {
      logger.error('Error creating reservation:', error);
      throw error;
    }
  }

  /**
   * Update table status
   */
  async updateTableStatus(tableId: string, status: string, occupiedBy?: any) {
    try {
      const table = await RestaurantTable.findByIdAndUpdate(
        tableId,
        {
          status,
          ...(occupiedBy && { occupiedBy })
        },
        { new: true }
      );

      return table;
    } catch (error) {
      logger.error('Error updating table status:', error);
      throw error;
    }
  }
}
