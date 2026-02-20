import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../core/utils/errors/AppError';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import { env } from '../config/env';

// Configuration du stockage en mémoire
const storage = multer.memoryStorage();

// Filtre pour les types de fichiers acceptés
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (env.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(
      `Type de fichier non supporté. Types acceptés: ${env.ALLOWED_FILE_TYPES.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    ));
  }
};

// Configuration de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // Taille max depuis .env
    files: 5 // Maximum 5 fichiers par requête
  }
});

// Middleware pour gérer les erreurs multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(
        `Fichier trop volumineux. Taille max: ${env.MAX_FILE_SIZE / 1024 / 1024}MB`,
        HTTP_STATUS.BAD_REQUEST
      ));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Trop de fichiers (max 5)', HTTP_STATUS.BAD_REQUEST));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Champ de fichier inattendu', HTTP_STATUS.BAD_REQUEST));
    }
    return next(new AppError(`Erreur upload: ${err.message}`, HTTP_STATUS.BAD_REQUEST));
  }
  next(err);
};

// Types pour les fichiers uploadés
export interface UploadedFile extends Express.Multer.File {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5);
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 4 }
]);