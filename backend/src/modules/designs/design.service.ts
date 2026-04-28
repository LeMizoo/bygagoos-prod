import { Types } from 'mongoose';
import Design, { DesignStatus, DesignType } from './design.model';
import Client from '../clients/client.model';
import { CreateDesignDto, UpdateDesignDto, QueryDesignDto, DesignResponseDTO } from './dto';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

type DesignFilter = {
  user?: Types.ObjectId;
  isActive?: boolean;
  status?: DesignStatus;
  type?: DesignType;
  client?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  tags?: { $in: string[] };
  $or?: Array<Record<string, unknown>>;
};

type PublicDesignFilter = Omit<DesignFilter, 'user'>;

type SortOptions = { [key: string]: 1 | -1 };

export class DesignService {
  async findAll(userId: string, query: QueryDesignDto) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, type, clientId, assignedTo, isActive, tags } = query;
      const skip = (page - 1) * limit;

      const filter: DesignFilter = { user: new Types.ObjectId(userId) };
      if (isActive !== undefined) filter.isActive = isActive;
      if (status) filter.status = status as DesignStatus;
      if (type) filter.type = type as DesignType;
      if (clientId) filter.client = new Types.ObjectId(clientId);
      if (assignedTo) filter.assignedTo = new Types.ObjectId(assignedTo);
      if (tags?.length) filter.tags = { $in: tags };
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      const sort: SortOptions = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [designs, total] = await Promise.all([
        Design.find(filter)
          .populate('client', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName email')
          .populate('assignedTo', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Design.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        data: designs.map(design => new DesignResponseDTO(design)),
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      logger.error('Erreur dans findAll designs:', error);
      throw new AppError('Erreur lors de la récupération des designs', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllPublic(query: QueryDesignDto) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, type, tags } = query;
      const skip = (page - 1) * limit;

      const filter: PublicDesignFilter = { isActive: true };
      if (status) filter.status = status as DesignStatus;
      if (type) filter.type = type as DesignType;
      if (tags?.length) filter.tags = { $in: tags };
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      const sort: SortOptions = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [designs, total] = await Promise.all([
        Design.find(filter)
          .populate('client', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName email')
          .populate('assignedTo', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Design.countDocuments(filter)
      ]);

      logger.info(`📦 [Public] ${designs.length} designs actifs trouvés`);

      const totalPages = Math.ceil(total / limit);
      return {
        data: designs.map(design => new DesignResponseDTO(design)),
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      logger.error('Erreur dans findAllPublic designs:', error);
      throw new AppError('Erreur lors de la récupération des designs publics', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      }
      const design = await Design.findOne({ _id: id, user: new Types.ObjectId(userId) })
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();
      if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      return new DesignResponseDTO(design);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans findById design:', error);
      throw new AppError('Erreur lors de la récupération du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async create(userId: string, data: CreateDesignDto, createdBy: string | Types.ObjectId) {
    try {
      if (data.clientId) {
        const client = await Client.findOne({ _id: data.clientId, user: new Types.ObjectId(userId) });
        if (!client) throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
      }
      const design = await Design.create({
        ...data,
        user: new Types.ObjectId(userId),
        client: data.clientId ? new Types.ObjectId(data.clientId) : undefined,
        createdBy: typeof createdBy === 'string' ? new Types.ObjectId(createdBy) : createdBy,
        assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined,
        tags: data.tags || []
      });
      logger.info(`Nouveau design créé: ${design.title} par utilisateur ${userId}`);
      const populatedDesign = await Design.findById(design._id)
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();
      return new DesignResponseDTO(populatedDesign);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans create design:', error);
      throw new AppError('Erreur lors de la création du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, userId: string, data: UpdateDesignDto) {
    try {
      if (!Types.ObjectId.isValid(id)) throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      if (data.clientId) {
        const client = await Client.findOne({ _id: data.clientId, user: new Types.ObjectId(userId) });
        if (!client) throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
      }
      const updateData: any = { ...data };
      if (data.addTags || data.removeTags) {
        const design = await Design.findOne({ _id: id, user: userId });
        if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
        let currentTags = design.tags || [];
        if (data.addTags) currentTags = [...new Set([...currentTags, ...data.addTags])];
        if (data.removeTags) currentTags = currentTags.filter(tag => !data.removeTags?.includes(tag));
        updateData.tags = currentTags;
      }
      delete updateData.addTags;
      delete updateData.removeTags;
      if (data.status === DesignStatus.COMPLETED && !updateData.completedAt) updateData.completedAt = new Date();
      const design = await Design.findOneAndUpdate(
        { _id: id, user: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();
      if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      logger.info(`Design mis à jour: ${design.title}`);
      return new DesignResponseDTO(design);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans update design:', error);
      throw new AppError('Erreur lors de la mise à jour du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async addFiles(id: string, userId: string, files: Express.Multer.File[]) {
    try {
      if (!Types.ObjectId.isValid(id)) throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      const design = await Design.findOne({ _id: id, user: userId });
      if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer, 'designs') as any;
          return {
            url: result.url,
            publicId: result.public_id,
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: new Date()
          };
        })
      );
      
      design.files.push(...uploadedFiles);
      if (!design.thumbnail && uploadedFiles.length > 0) design.thumbnail = uploadedFiles[0]?.url;
      await design.save();
      logger.info(`${uploadedFiles.length} fichier(s) ajouté(s) au design ${design.title}`);
      
      const populatedDesign = await Design.findById(design._id)
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();
      return new DesignResponseDTO(populatedDesign);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans addFiles design:', error);
      throw new AppError('Erreur lors de l\'ajout des fichiers', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async removeFile(id: string, userId: string, fileId: string) {
    try {
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(fileId)) throw new AppError('ID invalide', HTTP_STATUS.BAD_REQUEST);
      const design = await Design.findOne({ _id: id, user: userId });
      if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      const file = design.files.find((f: any) => (f as any)._id?.toString() === fileId);
      if (!file) throw new AppError('Fichier non trouvé', HTTP_STATUS.NOT_FOUND);
      await deleteFromCloudinary(file.publicId);
      design.files = design.files.filter((f: any) => (f as any)._id?.toString() !== fileId);
      if (design.thumbnail === file.url) design.thumbnail = design.files.length > 0 ? design.files[0]?.url : undefined;
      await design.save();
      logger.info(`Fichier supprimé du design ${design.title}`);
      const populatedDesign = await Design.findById(design._id)
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();
      return new DesignResponseDTO(populatedDesign);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans removeFile design:', error);
      throw new AppError('Erreur lors de la suppression du fichier', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(id)) throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      const design = await Design.findOne({ _id: id, user: userId });
      if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      design.isActive = false;
      await design.save();
      logger.info(`Design désactivé: ${design.title}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans delete design:', error);
      throw new AppError('Erreur lors de la suppression du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getStats(userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const now = new Date();
      const [total, byStatus, byType, recent, overdue] = await Promise.all([
        Design.countDocuments({ user: userObjectId, isActive: true }),
        Design.aggregate([{ $match: { user: userObjectId, isActive: true } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
        Design.aggregate([{ $match: { user: userObjectId, isActive: true } }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
        Design.countDocuments({ user: userObjectId, isActive: true, createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }),
        Design.countDocuments({ user: userObjectId, isActive: true, status: { $nin: [DesignStatus.COMPLETED, DesignStatus.ARCHIVED] }, dueDate: { $lt: new Date() } })
      ]);
      const statusStats: Record<string, number> = {};
      byStatus.forEach((item: any) => { statusStats[item._id] = item.count; });
      const typeStats: Record<string, number> = {};
      byType.forEach((item: any) => { typeStats[item._id] = item.count; });
      return { total, byStatus: statusStats, byType: typeStats, recent, overdue };
    } catch (error) {
      logger.error('Erreur dans getStats designs:', error);
      throw new AppError('Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}