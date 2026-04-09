import { Types } from 'mongoose';
import Design, { IDesign, DesignStatus } from './design.model';
import Client from '../clients/client.model';
import { CreateDesignDto, UpdateDesignDto, QueryDesignDto, DesignResponseDTO } from './dto';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

export class DesignService {
  /**
   * Récupère tous les designs
   */
  async findAll(userId: string, query: QueryDesignDto): Promise<{
    designs: DesignResponseDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, type, clientId, assignedTo, isActive, tags } = query;
      const skip = (page - 1) * limit;

      // Construction du filtre
      const filter: any = { user: new Types.ObjectId(userId) };
      
      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      if (status) {
        filter.status = status;
      }

      if (type) {
        filter.type = type;
      }

      if (clientId) {
        filter.client = new Types.ObjectId(clientId);
      }

      if (assignedTo) {
        filter.assignedTo = new Types.ObjectId(assignedTo);
      }

      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Construction du tri
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Exécution des requêtes avec population
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
        designs: designs.map(design => new DesignResponseDTO(design)),
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

  /**
   * Récupère un design par son ID
   */
  async findById(id: string, userId: string): Promise<DesignResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const design = await Design.findOne({ 
        _id: id, 
        user: new Types.ObjectId(userId) 
      })
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();

      if (!design) {
        throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      return new DesignResponseDTO(design);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans findById design:', error);
      throw new AppError('Erreur lors de la récupération du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Crée un nouveau design
   */
  async create(userId: string, data: CreateDesignDto, createdBy: string): Promise<DesignResponseDTO> {
    try {
      // Vérifier si le client existe (si fourni)
      if (data.clientId) {
        const client = await Client.findOne({
          _id: data.clientId,
          user: new Types.ObjectId(userId)
        });

        if (!client) {
          throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
        }
      }

      // Créer le design
      const design = await Design.create({
        ...data,
        user: new Types.ObjectId(userId),
        client: data.clientId ? new Types.ObjectId(data.clientId) : undefined,
        createdBy: new Types.ObjectId(createdBy),
        assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined,
        tags: data.tags || []
      });

      logger.info(`Nouveau design créé: ${design.title} par utilisateur ${userId}`);

      // Récupérer avec les populations
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

  /**
   * Met à jour un design
   */
  async update(id: string, userId: string, data: UpdateDesignDto): Promise<DesignResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      }

      // Vérifier si le client existe (si fourni)
      if (data.clientId) {
        const client = await Client.findOne({
          _id: data.clientId,
          user: new Types.ObjectId(userId)
        });

        if (!client) {
          throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
        }
      }

      // Préparer les données de mise à jour
      const updateData: any = { ...data };
      
      // Gérer les tags
      if (data.addTags || data.removeTags) {
        const design = await Design.findOne({ _id: id, user: userId });
        if (!design) {
          throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
        }

        let currentTags = design.tags || [];
        
        if (data.addTags) {
          currentTags = [...new Set([...currentTags, ...data.addTags])];
        }
        
        if (data.removeTags) {
          currentTags = currentTags.filter(tag => !data.removeTags?.includes(tag));
        }
        
        updateData.tags = currentTags;
      }

      // Supprimer les propriétés temporaires
      delete updateData.addTags;
      delete updateData.removeTags;

      // Mettre à jour le statut et la date de complétion si nécessaire
      if (data.status === DesignStatus.COMPLETED && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }

      // Mettre à jour le design
      const design = await Design.findOneAndUpdate(
        { _id: id, user: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('client', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .lean();

      if (!design) {
        throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      logger.info(`Design mis à jour: ${design.title}`);

      return new DesignResponseDTO(design);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans update design:', error);
      throw new AppError('Erreur lors de la mise à jour du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Ajoute des fichiers à un design
   */
  async addFiles(id: string, userId: string, files: Express.Multer.File[]): Promise<DesignResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const design = await Design.findOne({ _id: id, user: userId });
      if (!design) {
        throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      // Uploader les fichiers vers Cloudinary
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const result = await uploadToCloudinary(file as any, 'designs');
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

      // Ajouter les fichiers au design
      design.files.push(...uploadedFiles);
      
      // Définir la première image comme thumbnail si pas déjà défini
      if (!design.thumbnail && uploadedFiles.length > 0) {
        design.thumbnail = uploadedFiles[0]?.url;
      }

      await design.save();

      logger.info(`${uploadedFiles.length} fichier(s) ajouté(s) au design ${design.title}`);

      // Récupérer avec les populations
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

  /**
   * Supprime un fichier d'un design
   */
  async removeFile(id: string, userId: string, fileId: string): Promise<DesignResponseDTO> {
    try {
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(fileId)) {
        throw new AppError('ID invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const design = await Design.findOne({ _id: id, user: userId });
      if (!design) {
        throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      // Trouver le fichier
      const file = design.files.find((f: any) => (f as any)._id?.toString() === fileId);
      if (!file) {
        throw new AppError('Fichier non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      // Supprimer de Cloudinary
      await deleteFromCloudinary(file.publicId);

      // Supprimer du design
      design.files = design.files.filter((f: any) => (f as any)._id?.toString() !== fileId);
      
      // Mettre à jour le thumbnail si nécessaire
      if (design.thumbnail === file.url) {
        design.thumbnail = design.files.length > 0 ? design.files[0]?.url : undefined;
      }

      await design.save();

      logger.info(`Fichier supprimé du design ${design.title}`);

      // Récupérer avec les populations
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

  /**
   * Supprime un design (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('ID de design invalide', HTTP_STATUS.BAD_REQUEST);
      }

      const design = await Design.findOne({ _id: id, user: userId });
      
      if (!design) {
        throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      // Soft delete
      design.isActive = false;
      await design.save();

      logger.info(`Design désactivé: ${design.title}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erreur dans delete design:', error);
      throw new AppError('Erreur lors de la suppression du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Récupère les statistiques des designs
   */
  async getStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recent: number;
    overdue: number;
  }> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const now = new Date();

      const [total, byStatus, byType, recent, overdue] = await Promise.all([
        Design.countDocuments({ user: userObjectId, isActive: true }),
        Design.aggregate([
          { $match: { user: userObjectId, isActive: true } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Design.aggregate([
          { $match: { user: userObjectId, isActive: true } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Design.countDocuments({
          user: userObjectId,
          isActive: true,
          createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) }
        }),
        Design.countDocuments({
          user: userObjectId,
          isActive: true,
          status: { $nin: [DesignStatus.COMPLETED, DesignStatus.ARCHIVED] },
          dueDate: { $lt: new Date() }
        })
      ]);

      const statusStats: Record<string, number> = {};
      byStatus.forEach((item: any) => {
        statusStats[item._id] = item.count;
      });

      const typeStats: Record<string, number> = {};
      byType.forEach((item: any) => {
        typeStats[item._id] = item.count;
      });

      return {
        total,
        byStatus: statusStats,
        byType: typeStats,
        recent,
        overdue
      };
    } catch (error) {
      logger.error('Erreur dans getStats designs:', error);
      throw new AppError('Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}