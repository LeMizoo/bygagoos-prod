// backend/src/config/multer.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// S'assurer que les dossiers existent
const createFolders = () => {
  const folders = [
    'uploads',
    'uploads/previews',
    'uploads/designs',
    'uploads/avatars',
    'uploads/temp'
  ];
  
  folders.forEach(folder => {
    const folderPath = path.join(__dirname, '../../', folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  });
};

createFolders();

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = 'uploads/temp';
    
    // Déterminer le dossier selon le type
    if (req.body.folder === 'previews') {
      uploadPath = 'uploads/previews';
    } else if (req.body.folder === 'designs') {
      uploadPath = 'uploads/designs';
    } else if (req.body.folder === 'avatars') {
      uploadPath = 'uploads/avatars';
    }
    
    cb(null, path.join(__dirname, '../../', uploadPath));
  },
  
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Générer un nom unique
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .substring(0, 50);
    
    cb(null, `${Date.now()}-${uniqueId}-${sanitizedName}${ext}`);
  }
});

// Filtre des fichiers
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/illustrator', // .ai
    'application/postscript',  // .eps
    'application/octet-stream' // fichiers vectoriels
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.ai', '.eps', '.svg'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé') as any, false);
    }
  }
};

// Configuration Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Max 5 fichiers par requête
  }
});

// Middleware pour gérer les erreurs Multer
export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Maximum 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Maximum 5'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Erreur lors de l\'upload'
    });
  }
  
  next();
};