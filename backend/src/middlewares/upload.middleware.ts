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

// ✅ CORRIGÉ : Accepter 'files' ET 'images' comme nom de champ
export const uploadMultiple = upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'images', maxCount: 10 }
]);

// Gestion erreurs
export const handleMulterError = (
  err: unknown,
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

// Middleware pour l'upload de plusieurs fichiers
export const uploadMultipleFiles = (req: Request, res: Response, next: NextFunction) => {
  uploadMultiple(req, res, (err: unknown) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    // Fusionner les fichiers des deux champs en un seul tableau
    const files: Express.Multer.File[] = [];
    if (req.files) {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (filesObj.files) files.push(...filesObj.files);
      if (filesObj.images) files.push(...filesObj.images);
    }
    req.files = files;
    next();
  });
};