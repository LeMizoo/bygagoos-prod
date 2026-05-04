import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/utils/errors/AppError';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import { env } from '../config/env';

// Stockage en mémoire (nécessaire pour Cloudinary)
const storage = multer.memoryStorage();

// Filtre fichiers
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Type non supporté: ${file.mimetype}. Utilisez JPEG, PNG, GIF ou WEBP.`,
        HTTP_STATUS.BAD_REQUEST
      )
    );
  }
};

// Multer config
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB par défaut
    files: 10,
  },
});

export const uploadMultiple = upload.array('images', 10);

// Gestion erreurs
export const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Fichier trop volumineux. Maximum 10MB.', HTTP_STATUS.BAD_REQUEST));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Trop de fichiers. Maximum 10 images.', HTTP_STATUS.BAD_REQUEST));
    }
    return next(new AppError(err.message, HTTP_STATUS.BAD_REQUEST));
  }
  next(err);
};

// Middleware pour l'upload de plusieurs fichiers (compatible avec l'ancienne signature)
export const uploadMultipleFiles = (req: Request, res: Response, next: NextFunction) => {
  uploadMultiple(req, res, (err: any) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    // Assure que req.files est un tableau
    if (req.files && !Array.isArray(req.files)) {
      req.files = Object.values(req.files).flat();
    }
    next();
  });
};