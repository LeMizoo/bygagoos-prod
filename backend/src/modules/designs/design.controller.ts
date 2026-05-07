import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { DesignService } from './design.service';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { validateData } from '../../core/middlewares/validate';
import { createDesignSchema, updateDesignSchema, queryDesignSchema, QueryDesignDto } from './dto';
import logger from '../../core/utils/logger';

const designService = new DesignService();

/**
 * Récupère tous les designs (authentifié)
 */
export const getDesigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const query = validateData(queryDesignSchema, req.query) as QueryDesignDto;
    const designs = await designService.findAll(userId, query);

    apiResponse.success(res, designs, 'Designs récupérés avec succès');
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur getDesigns:', err);
    apiResponse.error(res, err.message || 'Erreur lors de la récupération des designs', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Récupère les designs publics (sans authentification)
 */
export const getPublicDesigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = validateData(queryDesignSchema, req.query) as QueryDesignDto;
    const result = await designService.findAllPublic(query);
    
    apiResponse.success(res, result, 'Designs publics récupérés avec succès');
  } catch (error) {
    const err = error as Error;
    logger.error('❌ Erreur getPublicDesigns:', err);
    const message = err.message || 'Erreur lors de la récupération des designs publics';
    apiResponse.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Récupère un design par son ID (authentifié)
 */
export const getDesignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID design requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const design = await designService.findById(id, userId);

    apiResponse.success(res, design, 'Design récupéré avec succès');
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur getDesignById:', err);
    
    if (err.message === 'Design non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de design invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la récupération du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Crée un nouveau design
 */
export const createDesign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const createdBy = req.user?._id;
    
    if (!userId || !createdBy) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const data = validateData(createDesignSchema, req.body);
    const design = await designService.create(userId, data, createdBy);

    apiResponse.success(res, design, 'Design créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur createDesign:', err);
    
    if (err.message === 'Client non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la création du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Met à jour un design
 */
export const updateDesign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID design requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validateData(updateDesignSchema, req.body);

    if (Object.keys(data).length === 0) {
      apiResponse.error(res, 'Aucune donnée fournie pour la mise à jour', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const design = await designService.update(id, userId, data);
    apiResponse.success(res, design, 'Design mis à jour avec succès');
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur updateDesign:', err);
    
    if (err.message === 'Design non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'Client non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de design invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la mise à jour du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Ajoute des fichiers à un design
 */
export const addDesignFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;    
    if (!id) {
      apiResponse.error(res, 'ID design requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    
    // ✅ Récupérer les fichiers (déjà fusionnés par uploadMultipleFiles)
    let files = req.files as Express.Multer.File[];
    
    // Fallback: si ce n'est pas un tableau (cas où on utilise directement upload.array)
    if (files && !Array.isArray(files) && typeof files === 'object') {
      const filesObj = files as { [fieldname: string]: Express.Multer.File[] };
      files = [];
      if (filesObj.files) files.push(...filesObj.files);
      if (filesObj.images) files.push(...filesObj.images);
    }

    if (!files || files.length === 0) {
      apiResponse.error(res, 'Aucun fichier fourni', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    logger.info(`📤 Upload de ${files.length} fichier(s) pour le design ${id}`);
    logger.info(`📁 Fichiers reçus:`, files.map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype })));

    const design = await designService.addFiles(id, userId, files);
    apiResponse.success(res, design, `${files.length} fichier(s) ajouté(s) avec succès`);
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur addDesignFiles:', err);
    
    if (err.message === 'Design non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de design invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de l\'ajout des fichiers', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Supprime un fichier d'un design
 */
export const removeDesignFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id, fileId } = req.params;
    if (!id || !fileId) {
      apiResponse.error(res, 'ID design et ID fichier requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const design = await designService.removeFile(id, userId, fileId);

    apiResponse.success(res, design, 'Fichier supprimé avec succès');
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur removeDesignFile:', err);
    
    if (err.message === 'Design non trouvé' || err.message === 'Fichier non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la suppression du fichier', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Supprime un design (soft delete)
 */
export const deleteDesign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID design requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    await designService.delete(id, userId);

    apiResponse.success(res, null, 'Design supprimé avec succès');
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur deleteDesign:', err);
    
    if (err.message === 'Design non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de design invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la suppression du design', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Récupère les statistiques des designs
 */
export const getDesignStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const stats = await designService.getStats(userId);
    apiResponse.success(res, stats, 'Statistiques récupérées');
  } catch (error) {
    const err = error as Error;
    logger.error('Erreur getDesignStats:', err);
    apiResponse.error(res, err.message || 'Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};