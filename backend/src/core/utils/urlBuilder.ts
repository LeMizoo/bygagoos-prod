// backend/src/core/utils/urlBuilder.ts

import { env } from '../../config/env';
import logger from './logger';

/**
 * Construit l'URL complète pour une ressource (avatar, upload, etc.)
 * @param resourcePath - Le chemin relatif (ex: "/uploads/avatars/file.jpg")
 * @returns L'URL complète
 */
export const buildResourceUrl = (resourcePath: string | undefined): string | null => {
  if (!resourcePath) return null;
  
  // Si c'est déjà une URL complète, la retourner
  if (resourcePath.startsWith('http://') || resourcePath.startsWith('https://')) {
    return resourcePath;
  }

  // Récupérer l'URL de base
  let baseUrl = env.API_URL;
  
  // En production, vérifier que ce n'est pas localhost
  if (env.NODE_ENV === 'production') {
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      logger.warn(
        '⚠️ WARNING: API_URL is using localhost in production! ' +
        'Set the API_URL environment variable to your actual backend URL. ' +
        'Current value: ' + baseUrl
      );
    }
  }

  // Construire l'URL complète
  const normalizedPath = resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Construit l'URL pour un avatar
 */
export const buildAvatarUrl = (avatarPath: string | undefined): string | null => {
  return buildResourceUrl(avatarPath);
};
