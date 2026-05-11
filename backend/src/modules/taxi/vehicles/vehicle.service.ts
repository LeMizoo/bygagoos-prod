import { Types } from 'mongoose';
import TaxiVehicle, { TaxiVehicleStatus } from './vehicle.model';
import { CreateTaxiVehicleDto, QueryTaxiVehicleDto, TaxiVehicleResponseDTO, UpdateTaxiVehicleDto } from './dto';
import { AppError } from '../../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../../core/constants/httpStatus';
import logger from '../../../core/utils/logger';
import { UserRole } from '../../../core/types/userRoles';

interface VehicleFilter {
  user?: Types.ObjectId;
  status?: TaxiVehicleStatus;
  isActive?: boolean;
  $or?: Array<Record<string, unknown>>;
}

interface SortOptions {
  [key: string]: 1 | -1;
}

const canAccessAllVehicles = (role?: UserRole): boolean => role !== UserRole.CLIENT;

const buildVehicleScope = (userId: string, role?: UserRole): Pick<VehicleFilter, 'user'> | Record<string, never> => {
  if (canAccessAllVehicles(role)) {
    return {};
  }

  return { user: new Types.ObjectId(userId) };
};

export class TaxiVehicleService {
  async findAll(userId: string, query: QueryTaxiVehicleDto, role?: UserRole): Promise<{
    vehicles: TaxiVehicleResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status } = query;
      const skip = (page - 1) * limit;

      const filter: VehicleFilter = {
        ...buildVehicleScope(userId, role),
        isActive: true,
      };

      if (status) {
        filter.status = status as TaxiVehicleStatus;
      }

      if (search) {
        filter.$or = [
          { plateNumber: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
        ];
      }

      const sort: SortOptions = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [vehicles, total] = await Promise.all([
        TaxiVehicle.find(filter)
          .populate('createdBy', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        TaxiVehicle.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        vehicles: vehicles.map((vehicle) => new TaxiVehicleResponseDTO(vehicle)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Erreur dans findAll taxi vehicles:', error);
      throw new AppError('Erreur lors de la récupération des véhicules', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string, userId: string, role?: UserRole): Promise<TaxiVehicleResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de véhicule invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const vehicle = await TaxiVehicle.findOne({
        _id: id,
        ...buildVehicleScope(userId, role),
      })
        .populate('createdBy', 'firstName lastName email')
        .lean();

      if (!vehicle) {
        throw new AppError('Véhicule non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      return new TaxiVehicleResponseDTO(vehicle);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans findById taxi vehicle:', error);
      throw new AppError('Erreur lors de la récupération du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async create(userId: string, data: CreateTaxiVehicleDto, createdBy: string | Types.ObjectId): Promise<TaxiVehicleResponseDTO> {
    try {
      const { model, ...rest } = data;

      const vehicle = await TaxiVehicle.create({
        ...rest,
        vehicleModel: model,
        plateNumber: data.plateNumber.trim().toUpperCase(),
        user: new Types.ObjectId(userId),
        createdBy: new Types.ObjectId(createdBy),
      });

      logger.info(`Nouveau véhicule taxi créé: ${vehicle.plateNumber} par utilisateur ${userId}`);

      const populatedVehicle = await TaxiVehicle.findById(vehicle._id)
        .populate('createdBy', 'firstName lastName email')
        .lean();

      return new TaxiVehicleResponseDTO(populatedVehicle);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans create taxi vehicle:', error);
      throw new AppError('Erreur lors de la création du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, userId: string, data: UpdateTaxiVehicleDto, role?: UserRole): Promise<TaxiVehicleResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de véhicule invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const existing = await TaxiVehicle.findOne({
        _id: id,
        ...buildVehicleScope(userId, role),
      });

      if (!existing) {
        throw new AppError('Véhicule non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      const updateData: Record<string, unknown> = {};
      if (data.plateNumber !== undefined) updateData.plateNumber = data.plateNumber.trim().toUpperCase();
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.model !== undefined) updateData.vehicleModel = data.model;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.currentMileage !== undefined) updateData.currentMileage = data.currentMileage;
      if (data.lastMaintenanceAt !== undefined) updateData.lastMaintenanceAt = data.lastMaintenanceAt;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const vehicle = await TaxiVehicle.findOneAndUpdate(
        {
          _id: id,
          ...buildVehicleScope(userId, role),
        },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('createdBy', 'firstName lastName email')
        .lean();

      if (!vehicle) {
        throw new AppError('Véhicule non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      return new TaxiVehicleResponseDTO(vehicle);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans update taxi vehicle:', error);
      throw new AppError('Erreur lors de la mise à jour du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string, userId: string, role?: UserRole): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de véhicule invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const vehicle = await TaxiVehicle.findOne({
        _id: id,
        ...buildVehicleScope(userId, role),
      });

      if (!vehicle) {
        throw new AppError('Véhicule non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      vehicle.isActive = false;
      await vehicle.save();

      logger.info(`Véhicule taxi désactivé: ${vehicle.plateNumber}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans delete taxi vehicle:', error);
      throw new AppError('Erreur lors de la suppression du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getStats(userId: string, role?: UserRole): Promise<{
    total: number;
    byStatus: Record<string, number>;
    recent: number;
  }> {
    try {
      const scope = buildVehicleScope(userId, role);
      const now = new Date();

      const [total, byStatus, recent] = await Promise.all([
        TaxiVehicle.countDocuments({ ...scope, isActive: true }),
        TaxiVehicle.aggregate([
          { $match: { ...scope, isActive: true } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        TaxiVehicle.countDocuments({
          ...scope,
          isActive: true,
          createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) },
        }),
      ]);

      const statusStats: Record<string, number> = {};
      byStatus.forEach((item: { _id: string; count: number }) => {
        statusStats[item._id] = item.count;
      });

      return {
        total,
        byStatus: statusStats,
        recent,
      };
    } catch (error) {
      logger.error('Erreur dans getStats taxi vehicle:', error);
      throw new AppError('Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

export const taxiVehicleService = new TaxiVehicleService();
