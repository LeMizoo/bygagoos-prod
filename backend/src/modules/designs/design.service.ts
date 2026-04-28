import { Types } from 'mongoose';
import Design from './design.model';
import Client from '../clients/client.model';
import { CreateDesignDto, UpdateDesignDto, QueryDesignDto, DesignResponseDTO } from './dto';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

export class DesignService {

  async findAll(userId: string, query: QueryDesignDto) {
    const { page = 1, limit = 10 } = query;

    const filter = { user: new Types.ObjectId(userId) };

    const [designs, total] = await Promise.all([
      Design.find(filter).skip((page - 1) * limit).limit(limit).lean(),
      Design.countDocuments(filter),
    ]);

    return {
      designs: designs.map(d => new DesignResponseDTO(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID invalide', HTTP_STATUS.BAD_REQUEST);
    }

    const design = await Design.findOne({
      _id: id,
      user: new Types.ObjectId(userId),
    }).lean();

    if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);

    return new DesignResponseDTO(design);
  }

  async create(userId: string, data: CreateDesignDto, createdBy: string) {
    if (data.clientId) {
      const client = await Client.findById(data.clientId);
      if (!client) throw new AppError('Client non trouvé', HTTP_STATUS.NOT_FOUND);
    }

    const design = await Design.create({
      ...data,
      user: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(createdBy),
      tags: data.tags || [],
    });

    return new DesignResponseDTO(design.toObject());
  }

  async update(id: string, userId: string, data: UpdateDesignDto) {
    const design = await Design.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: data },
      { new: true }
    );

    if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);

    return new DesignResponseDTO(design.toObject());
  }

  async delete(id: string, userId: string) {
    const design = await Design.findOne({ _id: id, user: userId });

    if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);

    design.isActive = false;
    await design.save();
  }

  // 🔥 UPLOAD FILES FIX
  async addFiles(id: string, userId: string, files: Express.Multer.File[]) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID invalide', HTTP_STATUS.BAD_REQUEST);
    }

    const design = await Design.findOne({ _id: id, user: userId });

    if (!design) {
      throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, 'designs');

        return {
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
        };
      })
    );

    design.files.push(...uploadedFiles);

    if (!design.thumbnail && uploadedFiles.length > 0) {
      design.thumbnail = uploadedFiles[0].url;
    }

    await design.save();

    return new DesignResponseDTO(design.toObject());
  }

  async removeFile(id: string, userId: string, fileId: string) {
    const design = await Design.findOne({ _id: id, user: userId });

    if (!design) throw new AppError('Design non trouvé', HTTP_STATUS.NOT_FOUND);

    const file = design.files.find(f => f._id?.toString() === fileId);

    if (!file) throw new AppError('Fichier non trouvé', HTTP_STATUS.NOT_FOUND);

    await deleteFromCloudinary(file.publicId);

    design.files = design.files.filter(f => f._id?.toString() !== fileId);

    await design.save();

    return new DesignResponseDTO(design.toObject());
  }
}