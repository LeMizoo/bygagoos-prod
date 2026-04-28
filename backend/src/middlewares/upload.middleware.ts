import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/utils/errors/AppError';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import { env } from '../config/env';

// Stockage en mémoire (nécessaire pour Cloudinary)
const storage = multer.memoryStorage();

// Filtre fichiers
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (env.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Type non supporté: ${file.mimetype}`,
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
    fileSize: env.MAX_FILE_SIZE,
    files: 5,
  },
});

export const uploadMultiple = upload.array('files', 5);

// Gestion erreurs
export const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    return next(new AppError(err.message, HTTP_STATUS.BAD_REQUEST));
  }
  next(err);
};