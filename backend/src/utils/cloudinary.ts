import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../core/utils/errors/AppError';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import logger from '../core/utils/logger';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export interface UploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface DeleteResult {
  result: 'ok' | 'not found';
}

/**
 * Upload d'un buffer vers Cloudinary
 * @param buffer - Buffer du fichier
 * @param folder - Dossier de destination
 * @param options - Options supplémentaires
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'uploads',
  options: {
    public_id?: string;
    transformation?: object;
    tags?: string[];
  } = {}
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Erreur Cloudinary:', error);
          reject(new AppError('Erreur lors de l\'upload du fichier', HTTP_STATUS.INTERNAL_SERVER_ERROR));
        } else if (result) {
          resolve({
            public_id: result.public_id,
            url: result.url,
            secure_url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
          });
        } else {
          reject(new AppError('Résultat inattendu de Cloudinary', HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
      }
    );
    stream.end(buffer);
  });
};

/**
 * Upload multiple de fichiers
 * @param buffers - Tableau de buffers
 * @param folder - Dossier de destination
 */
export const uploadMultipleToCloudinary = async (
  buffers: Buffer[],
  folder: string = 'uploads'
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = buffers.map(buffer => uploadToCloudinary(buffer, folder));
    const results = await Promise.all(uploadPromises);
    logger.info(`${results.length} fichiers uploadés avec succès`);
    return results;
  } catch (error) {
    logger.error('Erreur lors de l\'upload multiple:', error);
    throw new AppError('Erreur lors de l\'upload des fichiers', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Supprime un fichier de Cloudinary
 * @param publicId - ID public du fichier
 */
export const deleteFromCloudinary = async (publicId: string): Promise<DeleteResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      logger.info(`Fichier supprimé avec succès: ${publicId}`);
    } else {
      logger.warn(`Fichier non trouvé: ${publicId}`);
    }
    return result as DeleteResult;
  } catch (error) {
    logger.error('Erreur lors de la suppression du fichier:', error);
    throw new AppError('Erreur lors de la suppression du fichier', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Supprime multiple fichiers
 * @param publicIds - Tableau d'IDs publics
 */
export const deleteMultipleFromCloudinary = async (publicIds: string[]): Promise<DeleteResult[]> => {
  try {
    const deletePromises = publicIds.map(id => deleteFromCloudinary(id));
    const results = await Promise.all(deletePromises);
    logger.info(`${results.length} fichiers supprimés avec succès`);
    return results;
  } catch (error) {
    logger.error('Erreur lors de la suppression multiple:', error);
    throw new AppError('Erreur lors de la suppression des fichiers', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Génère une URL optimisée pour une image
 * @param publicId - ID public du fichier
 * @param options - Options de transformation
 */
export const getOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}
): string => {
  const transformation: string[] = [];
  if (options.width) transformation.push(`w_${options.width}`);
  if (options.height) transformation.push(`h_${options.height}`);
  if (options.crop) transformation.push(`c_${options.crop}`);
  if (options.quality) transformation.push(`q_${options.quality}`);
  if (options.format) transformation.push(`f_${options.format}`);
  const transformationString = transformation.length > 0 ? transformation.join(',') + '/' : '';
  return cloudinary.url(publicId, { secure: true, transformation: transformationString });
};

export default cloudinary;