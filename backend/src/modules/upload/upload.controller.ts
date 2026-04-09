// backend/src/modules/upload/upload.controller.ts

import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AppError } from '../../core/utils/errors/AppError';
import { catchAsync } from '../../core/utils/catchAsync';
import { ImageService } from '../../services/image.service';
import logger from '../../core/utils/logger';

// Upload d'un seul fichier
export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Aucun fichier fourni', 400);
  }

  const file = req.file;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const folder = req.params.folder || req.body.folder || 'temp';
  
  // Construire l'URL du fichier
  const fileUrl = `${baseUrl}/uploads/${folder}/${file.filename}`;

  // Si c'est une image, générer une miniature
  let thumbnailUrl;
  if (file.mimetype.startsWith('image/')) {
    try {
      const optimized = await ImageService.optimizeAndSave(
        file.path,
        path.join(process.cwd(), 'uploads', folder),
        file.filename
      );
      thumbnailUrl = `${baseUrl}/uploads/${folder}/${optimized.thumbnail}`;
    } catch (error) {
      // Utilisation de logger au lieu de console.error
      logger.error('Erreur optimisation image:', error);
    }
  }

  res.status(201).json({
    success: true,
    data: {
      url: fileUrl,
      thumbnail: thumbnailUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder
    }
  });
});

// Upload de plusieurs fichiers
export const uploadMultiple = catchAsync(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError('Aucun fichier fourni', 400);
  }

  const files = req.files as Express.Multer.File[];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const folder = req.params.folder || req.body.folder || 'temp';
  
  const uploadedFiles = await Promise.all(files.map(async (file) => {
    const fileUrl = `${baseUrl}/uploads/${folder}/${file.filename}`;
    
    let thumbnailUrl;
    if (file.mimetype.startsWith('image/')) {
      try {
        const optimized = await ImageService.optimizeAndSave(
          file.path,
          path.join(process.cwd(), 'uploads', folder),
          file.filename
        );
        thumbnailUrl = `${baseUrl}/uploads/${folder}/${optimized.thumbnail}`;
      } catch (error) {
        // Utilisation de logger au lieu de console.error
        logger.error('Erreur optimisation image:', error);
      }
    }

    return {
      url: fileUrl,
      thumbnail: thumbnailUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }));

  res.status(201).json({
    success: true,
    data: uploadedFiles
  });
});

// Supprimer un fichier
export const deleteFile = catchAsync(async (req: Request, res: Response) => {
  const { filename } = req.params;
  const { folder = 'temp' } = req.query;

  const filePath = path.join(process.cwd(), 'uploads', folder as string, filename);
  
  // Chemins pour les versions optimisées (si elles existent)
  const baseName = path.parse(filename).name;
  const thumbnailPath = path.join(process.cwd(), 'uploads', folder as string, `${baseName}-thumb.webp`);
  const optimizedPath = path.join(process.cwd(), 'uploads', folder as string, `${baseName}-optimized.webp`);

  // Supprimer les fichiers
  const pathsToDelete = [filePath];
  
  try {
    if (fs.existsSync(thumbnailPath)) {
      pathsToDelete.push(thumbnailPath);
    }
    if (fs.existsSync(optimizedPath)) {
      pathsToDelete.push(optimizedPath);
    }
  } catch (_error) {
    // Ignorer les erreurs de vérification - variable préfixée avec _
    logger.debug('Erreur lors de la vérification des fichiers optimisés');
  }

  for (const p of pathsToDelete) {
    try {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        logger.debug(`Fichier supprimé: ${p}`);
      }
    } catch (error) {
      logger.error(`Erreur lors de la suppression du fichier ${p}:`, error);
    }
  }

  res.json({
    success: true,
    message: 'Fichier supprimé avec succès'
  });
});