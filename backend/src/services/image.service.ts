// backend/src/services/image.service.ts

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export class ImageService {
  /**
   * Optimise et sauvegarde une image
   */
  static async optimizeAndSave(
    inputPath: string,
    outputDir: string,
    filename: string
  ): Promise<{ thumbnail: string; optimized: string }> {
    try {
      const baseName = path.parse(filename).name;
      const thumbnailPath = path.join(outputDir, `${baseName}-thumb.webp`);
      const optimizedPath = path.join(outputDir, `${baseName}-optimized.webp`);

      // Optimiser l'image
      await sharp(inputPath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(optimizedPath);

      // Générer la miniature
      await sharp(inputPath)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 70 })
        .toFile(thumbnailPath);

      return {
        thumbnail: path.basename(thumbnailPath),
        optimized: path.basename(optimizedPath)
      };
    } catch (error) {
      console.error('Erreur lors de l\'optimisation de l\'image:', error);
      throw error;
    }
  }

  /**
   * Redimensionne une image
   */
  static async resize(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
  ): Promise<void> {
    await sharp(inputPath)
      .resize(width, height, { fit: 'cover' })
      .toFile(outputPath);
  }

  /**
   * Convertit une image en WebP
   */
  static async convertToWebP(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
  }

  /**
   * Compresse une image
   */
  static async compress(
    inputPath: string,
    outputPath: string,
    quality: number = 80
  ): Promise<void> {
    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
  }
}