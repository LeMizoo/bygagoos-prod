// backend/src/modules/staff/staff.service.ts

import StaffModel from './staff.model';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { env } from '../../config/env';
import logger from '../../core/utils/logger';
import { Document } from 'mongoose';

export class StaffService {
  /**
   * Formate la réponse en utilisant Record<string, unknown> au lieu de any
   */
  private formatResponse(staff: Document) {
    if (!staff) return null;
    
    const staffObj = staff.toObject() as Record<string, unknown>;
    const avatarPath = staffObj.avatar as string | undefined;
    
    if (avatarPath && !avatarPath.startsWith('http')) {
      const baseUrl = env.API_URL;
      staffObj.avatar = `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
    }
    
    return staffObj;
  }

  async findAll() {
    try {
      const staffList = await StaffModel.find().sort({ lastName: 1, firstName: 1 });
      return staffList.map(s => this.formatResponse(s));
    } catch (error) {
      logger.error('StaffService findAll error:', error);
      throw new AppError('Erreur lors de la récupération des membres', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Format d\'ID invalide', HTTP_STATUS.BAD_REQUEST);
    }

    const staff = await StaffModel.findById(id);
    if (!staff) throw new AppError('Membre non trouvé', HTTP_STATUS.NOT_FOUND);
    
    return this.formatResponse(staff);
  }

  async create(data: Record<string, unknown>) {
    if (data.email && typeof data.email === 'string') {
      const existingStaff = await StaffModel.findOne({ email: data.email.toLowerCase() });
      if (existingStaff) {
        throw new AppError('Un membre avec cet email existe déjà', HTTP_STATUS.CONFLICT);
      }
    }

    const staff = await StaffModel.create(data);
    return this.formatResponse(staff);
  }

  async update(id: string, data: Record<string, unknown>) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Format d\'ID invalide', HTTP_STATUS.BAD_REQUEST);
    }

    if (data.email && typeof data.email === 'string') {
      const existingStaff = await StaffModel.findOne({ 
        email: data.email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingStaff) {
        throw new AppError('Un autre membre avec cet email existe déjà', HTTP_STATUS.CONFLICT);
      }
    }

    const staff = await StaffModel.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    );
    
    if (!staff) throw new AppError('Membre non trouvé', HTTP_STATUS.NOT_FOUND);
    return this.formatResponse(staff);
  }

  async delete(id: string) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Format d\'ID invalide', HTTP_STATUS.BAD_REQUEST);
    }

    const deleted = await StaffModel.findByIdAndDelete(id);
    return deleted ? this.formatResponse(deleted) : null;
  }

  async toggleStatus(id: string) {
    const staff = await StaffModel.findById(id);
    if (!staff) throw new AppError('Membre non trouvé', HTTP_STATUS.NOT_FOUND);

    const staffObj = staff as unknown as Record<string, unknown>;
    staff.isActive = !staff.isActive;
    
    if ('active' in staffObj) {
      staffObj.active = staff.isActive;
    }
    
    await staff.save();
    return this.formatResponse(staff);
  }

  async findByDepartment(department: string) {
    const staff = await StaffModel.find({ department });
    return staff.map(s => this.formatResponse(s));
  }

  async findByRole(role: string) {
    const staff = await StaffModel.find({ role });
    return staff.map(s => this.formatResponse(s));
  }

  async findActive() {
    const staff = await StaffModel.find({ isActive: true });
    return staff.map(s => this.formatResponse(s));
  }
}

export default new StaffService();