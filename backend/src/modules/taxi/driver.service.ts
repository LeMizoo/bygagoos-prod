import Driver, { IDriver } from './driver.model';
import logger from '../../core/utils/logger';

export class DriverService {
  /**
   * Récupérer tous les conducteurs avec pagination et filtres
   */
  async getAllDrivers(page = 1, limit = 10, filters?: {
    status?: string;
    search?: string;
    isActive?: boolean;
  }) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (filters?.status) query.status = filters.status;
      if (filters?.isActive !== undefined) query.isActive = filters.isActive;

      if (filters?.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } },
          { licenseNumber: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const drivers = await Driver.find(query)
        .populate('vehicleId', 'licensePlate model registrationNumber')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Driver.countDocuments(query);

      return {
        drivers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching drivers:', error);
      throw error;
    }
  }

  /**
   * Récupérer un conducteur par ID
   */
  async getDriverById(id: string) {
    try {
      const driver = await Driver.findById(id).populate('vehicleId', 'licensePlate model registrationNumber');
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      logger.error('Error fetching driver:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau conducteur
   */
  async createDriver(data: Partial<IDriver>) {
    try {
      const driver = new Driver(data);
      await driver.save();
      return driver;
    } catch (error) {
      logger.error('Error creating driver:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un conducteur
   */
  async updateDriver(id: string, data: Partial<IDriver>) {
    try {
      const driver = await Driver.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      logger.error('Error updating driver:', error);
      throw error;
    }
  }

  /**
   * Supprimer un conducteur (soft delete)
   */
  async deleteDriver(id: string) {
    try {
      const driver = await Driver.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      logger.error('Error deleting driver:', error);
      throw error;
    }
  }

  /**
   * Assigner un véhicule à un conducteur
   */
  async assignVehicle(driverId: string, vehicleId: string) {
    try {
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        { vehicleId, status: 'ON_DUTY' },
        { new: true }
      ).populate('vehicleId', 'licensePlate model');
      
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      logger.error('Error assigning vehicle to driver:', error);
      throw error;
    }
  }

  /**
   * Désassigner le véhicule d'un conducteur
   */
  async unassignVehicle(driverId: string) {
    try {
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        { vehicleId: null, status: 'AVAILABLE' },
        { new: true }
      );
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      logger.error('Error unassigning vehicle from driver:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un conducteur
   */
  async updateDriverStatus(driverId: string, status: string) {
    try {
      const driver = await Driver.findByIdAndUpdate(
        driverId,
        { status },
        { new: true }
      );
      if (!driver) {
        throw new Error('Driver not found');
      }
      return driver;
    } catch (error) {
      logger.error('Error updating driver status:', error);
      throw error;
    }
  }

  /**
   * Incrémenter le nombre de courses d'un conducteur et mettre à jour sa note
   */
  async incrementTrips(driverId: string, rating?: number) {
    try {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        throw new Error('Driver not found');
      }

      driver.totalTrips += 1;
      
      if (rating !== undefined) {
        // Mise à jour de la note moyenne
        const totalRating = driver.rating * (driver.totalTrips - 1) + rating;
        driver.rating = totalRating / driver.totalTrips;
      }

      await driver.save();
      return driver;
    } catch (error) {
      logger.error('Error incrementing driver trips:', error);
      throw error;
    }
  }

  /**
   * Statistiques des conducteurs
   */
  async getDriverStats() {
    try {
      const total = await Driver.countDocuments({ isActive: true });
      const available = await Driver.countDocuments({ status: 'AVAILABLE', isActive: true });
      const onDuty = await Driver.countDocuments({ status: 'ON_DUTY', isActive: true });
      const offDuty = await Driver.countDocuments({ status: 'OFF_DUTY', isActive: true });
      const suspended = await Driver.countDocuments({ status: 'SUSPENDED', isActive: true });

      const avgRatingResult = await Driver.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]);
      const avgRating = avgRatingResult[0]?.avg || 0;

      const topDrivers = await Driver.find({ isActive: true, totalTrips: { $gt: 0 } })
        .sort({ totalTrips: -1 })
        .limit(5)
        .select('firstName lastName totalTrips rating');

      return {
        total,
        available,
        onDuty,
        offDuty,
        suspended,
        avgRating: Math.round(avgRating * 10) / 10,
        topDrivers
      };
    } catch (error) {
      logger.error('Error fetching driver stats:', error);
      throw error;
    }
  }
}