import { Types } from 'mongoose';
import Vehicle from './vehicle.model';
import Trip from './trip.model';
import Maintenance from './maintenance.model';
import FleetChecklist from './checklist.model';
import logger from '../../core/utils/logger';

export class TaxiService {
  /**
   * Get all vehicles with their current status
   */
  async getAllVehicles(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const vehicles = await Vehicle.find()
        .populate('driver', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Vehicle.countDocuments();

      return {
        vehicles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Get vehicle by ID with all related data
   */
  async getVehicleById(vehicleId: string) {
    try {
      const vehicle = await Vehicle.findById(vehicleId).populate('driver', 'name email');
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const trips = await Trip.find({ vehicle: vehicleId }).sort({ createdAt: -1 }).limit(5);
      const maintenance = await Maintenance.findOne({ vehicle: vehicleId }).sort({ date: -1 });
      const checklists = await FleetChecklist.find({ vehicle: vehicleId }).sort({ checklistDate: -1 }).limit(3);

      return {
        vehicle,
        recentTrips: trips,
        lastMaintenance: maintenance,
        recentChecklists: checklists
      };
    } catch (error) {
      logger.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  /**
   * Get today's trips
   */
  async getTodayTrips() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const trips = await Trip.find({
        startTime: {
          $gte: today,
          $lt: tomorrow
        }
      })
        .populate('vehicle', 'registrationNumber type')
        .populate('driver', 'name email')
        .sort({ startTime: -1 });

      return trips;
    } catch (error) {
      logger.error('Error fetching today trips:', error);
      throw error;
    }
  }

  /**
   * Get maintenance due soon
   */
  async getMaintenanceDueSoon(daysAhead = 7) {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const maintenance = await Maintenance.find({
        nextDueDate: {
          $gte: today,
          $lte: futureDate
        }
      })
        .populate('vehicle', 'registrationNumber type')
        .sort({ nextDueDate: 1 });

      return maintenance;
    } catch (error) {
      logger.error('Error fetching maintenance due soon:', error);
      throw error;
    }
  }

  /**
   * Get fleet statistics
   */
  async getFleetStats() {
    try {
      const totalVehicles = await Vehicle.countDocuments();
      const activeVehicles = await Vehicle.countDocuments({ currentStatus: 'ACTIVE' });
      const vehiclesInMaintenance = await Vehicle.countDocuments({ currentStatus: 'MAINTENANCE' });

      const todayTrips = await Trip.countDocuments({
        startTime: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });

      const completedTrips = await Trip.countDocuments({ status: 'COMPLETED' });

      return {
        totalVehicles,
        activeVehicles,
        vehiclesInMaintenance,
        inactiveVehicles: totalVehicles - activeVehicles - vehiclesInMaintenance,
        todayTrips,
        completedTrips
      };
    } catch (error) {
      logger.error('Error fetching fleet stats:', error);
      throw error;
    }
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(data: any) {
    try {
      logger.info('📝 Création véhicule avec données:', JSON.stringify(data, null, 2));
      const vehicle = new Vehicle(data);
      await vehicle.save();
      logger.info(`✅ Véhicule créé avec ID: ${vehicle._id}`);
      return vehicle;
    } catch (error) {
      logger.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Update an existing vehicle
   */
  async updateVehicle(id: string, updateData: any) {
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, { new: true });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      return vehicle;
    } catch (error) {
      logger.error('Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * Delete a vehicle (soft delete - mark as inactive)
   */
  async deleteVehicle(id: string) {
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(
        id,
        { isActive: false, currentStatus: 'INACTIVE' },
        { new: true }
      );
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      return vehicle;
    } catch (error) {
      logger.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  /**
   * Create a trip
   */
  async createTrip(data: any) {
    try {
      const trip = new Trip(data);
      await trip.save();
      await trip.populate(['vehicle', 'driver']);
      return trip;
    } catch (error) {
      logger.error('Error creating trip:', error);
      throw error;
    }
  }

  /**
   * Update trip status
   */
  async updateTripStatus(tripId: string, status: string) {
    try {
      const trip = await Trip.findByIdAndUpdate(
        tripId,
        {
          status,
          ...(status === 'COMPLETED' && { endTime: new Date() })
        },
        { new: true }
      ).populate(['vehicle', 'driver']);

      return trip;
    } catch (error) {
      logger.error('Error updating trip status:', error);
      throw error;
    }
  }
}