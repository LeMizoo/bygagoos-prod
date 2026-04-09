// backend/src/modules/upload/upload.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { uploadLimiter } from '../../middlewares/rateLimit.middleware';
import { uploadFile, uploadMultiple, deleteFile } from './upload.controller';

const router = Router();

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let folder = 'temp';
    
    if (req.params.folder) {
      folder = req.params.folder;
    } else if (req.body.folder) {
      folder = req.body.folder;
    } else if (req.baseUrl.includes('avatar') || req.url.includes('avatar')) {
      folder = 'avatars';
    } else if (req.baseUrl.includes('design') || req.url.includes('design')) {
      folder = 'designs';
    } else if (req.baseUrl.includes('preview') || req.url.includes('preview')) {
      folder = 'previews';
    }

    const uploadPath = path.join(process.cwd(), 'uploads', folder);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (
  _req: Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/illustrator', 'application/postscript',
    'application/octet-stream'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Routes d'upload
router.post(
  '/single/:folder?',
  auth,
  uploadLimiter,
  upload.single('file'),
  uploadFile
);

router.post(
  '/multiple/:folder?',
  auth,
  uploadLimiter,
  upload.array('files', 10),
  uploadMultiple
);

router.delete(
  '/:filename',
  auth,
  authorize(['ADMIN', 'MANAGER']),
  deleteFile
);

// Routes spécifiques
router.post(
  '/avatar',
  auth,
  uploadLimiter,
  upload.single('avatar'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.params.folder = 'avatars';
    next();
  },
  uploadFile
);

router.post(
  '/design',
  auth,
  uploadLimiter,
  upload.single('image'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.params.folder = 'designs';
    next();
  },
  uploadFile
);

router.post(
  '/preview',
  auth,
  uploadLimiter,
  upload.single('preview'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.params.folder = 'previews';
    next();
  },
  uploadFile
);

export default router;